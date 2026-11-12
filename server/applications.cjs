'use strict';

const { withTransaction } = require('./postgres.cjs');
const { ensureLegacyIdentity } = require('./jobs-employer.cjs');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_LIST = 100;
const APPLICATION_STATUSES = new Set([
  'submitted', 'viewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'
]);
const EMPLOYER_TRANSITIONS = {
  submitted: new Set(['viewed', 'shortlisted', 'interview', 'rejected']),
  viewed: new Set(['shortlisted', 'interview', 'rejected']),
  shortlisted: new Set(['interview', 'offered', 'rejected']),
  interview: new Set(['offered', 'hired', 'rejected']),
  offered: new Set(['hired', 'rejected']),
  hired: new Set(),
  rejected: new Set(),
  withdrawn: new Set()
};

class ApplicationError extends Error {
  constructor(status, code, field) {
    super(code);
    this.name = 'ApplicationError';
    this.status = status;
    this.code = code;
    this.field = field || null;
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeAnswers(rawAnswers, questions) {
  const answers = asObject(rawAnswers);
  const questionMap = new Map((questions || []).map(question => [String(question.id), question]));
  const output = {};

  for (const key of Object.keys(answers)) {
    if (!questionMap.has(key)) throw new ApplicationError(400, 'UNKNOWN_APPLICATION_QUESTION', 'answers');
  }

  for (const question of questions || []) {
    const id = String(question.id);
    const hasValue = Object.prototype.hasOwnProperty.call(answers, id);
    const value = hasValue ? answers[id] : undefined;
    const required = question.required === true;
    const type = String(question.input_type || '');
    const options = Array.isArray(question.options) ? question.options.map(item => String(item)) : [];

    if (!hasValue || value === null || value === undefined || value === '') {
      if (required) throw new ApplicationError(400, 'REQUIRED_ANSWER_MISSING', 'answers');
      continue;
    }

    if (type === 'short_text' || type === 'long_text') {
      const maximum = type === 'short_text' ? 500 : 4000;
      const answer = cleanText(value, maximum);
      if (!answer && required) throw new ApplicationError(400, 'REQUIRED_ANSWER_MISSING', 'answers');
      if (answer) output[id] = answer;
      continue;
    }

    if (type === 'yes_no') {
      if (value === true || value === 'yes') output[id] = true;
      else if (value === false || value === 'no') output[id] = false;
      else throw new ApplicationError(400, 'INVALID_YES_NO_ANSWER', 'answers');
      continue;
    }

    if (type === 'single_choice') {
      const answer = String(value);
      if (!options.includes(answer)) throw new ApplicationError(400, 'INVALID_CHOICE_ANSWER', 'answers');
      output[id] = answer;
      continue;
    }

    if (type === 'multiple_choice') {
      if (!Array.isArray(value) || value.length > options.length) {
        throw new ApplicationError(400, 'INVALID_CHOICE_ANSWER', 'answers');
      }
      const selected = [...new Set(value.map(item => String(item)))];
      if (selected.some(item => !options.includes(item))) {
        throw new ApplicationError(400, 'INVALID_CHOICE_ANSWER', 'answers');
      }
      if (required && selected.length === 0) {
        throw new ApplicationError(400, 'REQUIRED_ANSWER_MISSING', 'answers');
      }
      output[id] = selected;
      continue;
    }

    throw new ApplicationError(400, 'UNSUPPORTED_APPLICATION_QUESTION', 'answers');
  }

  return output;
}

function redactContactText(value, maxLength) {
  return cleanText(value, maxLength)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[contact hidden]')
    .replace(/(?:\\+?25\\d[\\s().-]*)?(?:\\d[\\s().-]*){8,13}/g, '[contact hidden]');
}

function safeProfileList(value, maxItems) {
  const forbidden = /phone|email|contact|national|birth|gender|address|social|password|secret|token|document|identity|user_id|profile_id|whatsapp|\\bwa\\b/i;
  const clean = (item, depth) => {
    if (depth > 3 || item === null || item === undefined) return undefined;
    if (typeof item === 'string') return redactContactText(item, 1000);
    if (typeof item === 'number' || typeof item === 'boolean') return item;
    if (Array.isArray(item)) return item.slice(0, 20).map(value => clean(value, depth + 1)).filter(value => value !== undefined);
    if (typeof item === 'object') {
      const out = {};
      for (const [key, value] of Object.entries(item).slice(0, 24)) {
        if (forbidden.test(key)) continue;
        const safeValue = clean(value, depth + 1);
        if (safeValue !== undefined) out[key.slice(0, 40)] = safeValue;
      }
      return out;
    }
    return undefined;
  };
  return Array.isArray(value) ? value.slice(0, maxItems).map(item => clean(item, 0)).filter(item => item !== undefined) : [];
}

function buildProfileSnapshot(profile, actor) {
  const source = profile || {};
  return {
    display_name: cleanText(source.name || actor?.display_name || actor?.name || 'AHABONA member', 120),
    district: cleanText(source.district, 80) || null,
    capabilities: safeProfileList(source.caps, 40),
    other_skills: redactContactText(source.other_text, 2000) || null,
    introduction: redactContactText(source.intro, 3000) || null,
    education: redactContactText(source.edu || source.edu_level, 500) || null,
    experience: safeProfileList(source.experience, 30),
    languages: safeProfileList(source.languages, 20),
    availability: safeProfileList(source.availability, 20)
  };
}

function requireActor(actor) {
  const id = Number(actor?.id);
  if (!Number.isSafeInteger(id) || id < 1 || actor.status !== 'active') {
    throw new ApplicationError(401, 'AUTH_REQUIRED');
  }
  return id;
}

function parseLimit(value, fallback = 30) {
  const number = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, MAX_LIST);
}

async function createJobApplication(pool, actor, rawJobId, rawInput) {
  const userId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new ApplicationError(404, 'JOB_NOT_FOUND');

  const input = asObject(rawInput);
  const coverMessage = cleanText(input.cover_message, 4000) || null;

  try {
    return await withTransaction(pool, async client => {
      await ensureLegacyIdentity(client, actor);

      const jobResult = await client.query(
        'SELECT id, title, employer_user_id, organization_id, application_method ' +
        'FROM public.job_posts ' +
        "WHERE id = $1 AND status = 'approved' " +
        'AND (deadline_at IS NULL OR deadline_at > now()) ' +
        'FOR UPDATE',
        [jobId]
      );
      const job = jobResult.rows?.[0];
      if (!job) throw new ApplicationError(404, 'JOB_NOT_AVAILABLE');
      if (Number(job.employer_user_id) === userId) {
        throw new ApplicationError(403, 'CANNOT_APPLY_TO_OWN_JOB');
      }
      if (job.application_method !== 'in_platform') {
        throw new ApplicationError(409, 'APPLICATION_NOT_HOSTED_HERE');
      }

      const profileResult = await client.query(
        'SELECT name, district, caps, other_text, intro, edu, edu_level, experience, languages, availability, suspended ' +
        'FROM public.profiles WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      const profile = profileResult.rows?.[0] || null;
      if (profile?.suspended) throw new ApplicationError(403, 'PROFILE_NOT_AVAILABLE');

      const questionResult = await client.query(
        'SELECT id, prompt, input_type, options, required, sort_order ' +
        'FROM public.job_application_questions WHERE job_post_id = $1 ' +
        'ORDER BY sort_order, created_at',
        [jobId]
      );
      const answers = normalizeAnswers(input.answers, questionResult.rows || []);
      const snapshot = buildProfileSnapshot(profile, actor);

      let inserted;
      try {
        inserted = await client.query(
          'INSERT INTO public.job_applications ' +
          '(job_post_id, candidate_user_id, profile_snapshot, cover_message, answers, status) ' +
          "VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, 'submitted') " +
          'RETURNING id, job_post_id, status, submitted_at',
          [jobId, userId, JSON.stringify(snapshot), coverMessage, JSON.stringify(answers)]
        );
      } catch (error) {
        if (error?.code === '23505') throw new ApplicationError(409, 'ALREADY_APPLIED');
        throw error;
      }

      const application = inserted.rows?.[0];
      if (!application) throw new Error('Application insert returned no record.');

      await client.query(
        'INSERT INTO public.application_status_events ' +
        '(application_id, actor_user_id, from_status, to_status, note) ' +
        "VALUES ($1, $2, NULL, 'submitted', 'Candidate submitted an application.')",
        [application.id, userId]
      );

      if (job.employer_user_id) {
        await client.query(
          'INSERT INTO public.notifications (user_id, kind, title, body, link, created_at) ' +
          'VALUES ($1, $2, $3, $4, $5, $6)',
          [
            job.employer_user_id,
            'job_application',
            'Application nshya',
            'Hari umuntu mushya wasabye akazi: ' + cleanText(job.title, 180),
            '/employer/jobs/' + jobId + '/applications',
            Date.now()
          ]
        );
      }

      return {
        application,
        next_step: 'track_application'
      };
    });
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    if (error?.code === '23505') throw new ApplicationError(409, 'ALREADY_APPLIED');
    throw error;
  }
}

async function listMyApplications(pool, actor, options = {}) {
  const userId = requireActor(actor);
  const limit = parseLimit(options.limit, 30);
  const result = await pool.query(
    'SELECT a.id, a.job_post_id, a.status, a.submitted_at, a.updated_at, ' +
    'j.title AS job_title, j.province, j.district, j.deadline_at, ' +
    'COALESCE(o.name, ep.display_name) AS employer_name ' +
    'FROM public.job_applications a ' +
    'JOIN public.job_posts j ON j.id = a.job_post_id ' +
    'LEFT JOIN public.organizations o ON o.id = j.organization_id ' +
    'LEFT JOIN public.employer_profiles ep ON ep.user_id = j.employer_user_id ' +
    'WHERE a.candidate_user_id = $1 ' +
    'ORDER BY a.submitted_at DESC LIMIT $2',
    [userId, limit]
  );
  return { applications: result.rows || [] };
}

async function listEmployerApplications(pool, actor, rawJobId, options = {}) {
  const userId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new ApplicationError(404, 'JOB_NOT_FOUND');
  const limit = parseLimit(options.limit, 50);

  const ownership = await pool.query(
    'SELECT id, title FROM public.job_posts WHERE id = $1 AND created_by_user_id = $2 LIMIT 1',
    [jobId, userId]
  );
  const job = ownership.rows?.[0];
  if (!job) throw new ApplicationError(404, 'JOB_NOT_FOUND');

  const result = await pool.query(
    'SELECT a.id, a.status, a.submitted_at, a.updated_at, a.cover_message, ' +
    'a.profile_snapshot, a.answers ' +
    'FROM public.job_applications a ' +
    'WHERE a.job_post_id = $1 ' +
    'ORDER BY a.submitted_at DESC LIMIT $2',
    [jobId, limit]
  );
  return { job, applications: result.rows || [] };
}

const APPLICATION_STATUS_LABELS = {
  viewed: 'yarebwe',
  shortlisted: 'yatoranyijwe ku rutonde rugufi',
  interview: 'yatumiwe mu kiganiro',
  offered: 'yahawe amahirwe',
  hired: 'yahawe akazi',
  rejected: 'ntiyatoranyijwe'
};

async function updateEmployerApplicationStatus(pool, actor, rawApplicationId, rawInput) {
  const userId = requireActor(actor);
  const applicationId = String(rawApplicationId || '');
  if (!UUID_RE.test(applicationId)) throw new ApplicationError(404, 'APPLICATION_NOT_FOUND');

  const input = asObject(rawInput);
  const nextStatus = cleanText(input.status, 24);
  const note = cleanText(input.note, 500) || null;
  if (!EMPLOYER_TRANSITIONS[nextStatus] && nextStatus !== 'hired' && nextStatus !== 'rejected') {
    throw new ApplicationError(400, 'INVALID_APPLICATION_STATUS', 'status');
  }

  return withTransaction(pool, async client => {
    const result = await client.query(
      'SELECT a.id, a.job_post_id, a.candidate_user_id, a.status, j.title ' +
      'FROM public.job_applications a ' +
      'JOIN public.job_posts j ON j.id = a.job_post_id ' +
      'WHERE a.id = $1 AND j.created_by_user_id = $2 ' +
      'FOR UPDATE OF a',
      [applicationId, userId]
    );
    const current = result.rows?.[0];
    if (!current) throw new ApplicationError(404, 'APPLICATION_NOT_FOUND');

    const allowed = EMPLOYER_TRANSITIONS[current.status];
    if (!allowed || !allowed.has(nextStatus)) {
      throw new ApplicationError(409, 'INVALID_STATUS_TRANSITION', 'status');
    }

    const updated = await client.query(
      'UPDATE public.job_applications SET status = $1, updated_at = now() ' +
      'WHERE id = $2 RETURNING id, job_post_id, status, updated_at',
      [nextStatus, applicationId]
    );

    await client.query(
      'INSERT INTO public.application_status_events ' +
      '(application_id, actor_user_id, from_status, to_status, note) ' +
      'VALUES ($1, $2, $3, $4, $5)',
      [applicationId, userId, current.status, nextStatus, note]
    );

    await client.query(
      'INSERT INTO public.notifications (user_id, kind, title, body, link, created_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6)',
      [
        current.candidate_user_id,
        'application_status',
        'Uko gusaba akazi byavuguruwe',
        'Application yawe ku kazi "' + cleanText(current.title, 180) + '" ubu iri kuri: ' + nextStatus,
        '/me/applications',
        Date.now()
      ]
    );

    return { application: updated.rows?.[0] || null };
  });
}

module.exports = {
  ApplicationError,
  normalizeAnswers,
  buildProfileSnapshot,
  createJobApplication,
  listMyApplications,
  listEmployerApplications,
  updateEmployerApplicationStatus,
  EMPLOYER_TRANSITIONS
};
