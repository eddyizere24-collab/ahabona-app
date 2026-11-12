'use strict';

const { withTransaction } = require('./postgres.cjs');
const { ensureLegacyIdentity, normalizeEmployerJobInput } = require('./jobs-employer.cjs');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QUEUE_LIMIT = 100;
const REVIEW_ACTIONS = new Set(['approved', 'rejected', 'changes_requested']);
const EMPLOYER_EDITABLE_STATES = new Set(['draft', 'changes_requested', 'rejected']);
const EMPLOYER_CLOSABLE_STATES = new Set(['draft', 'changes_requested', 'pending_review', 'approved']);

class JobWorkflowError extends Error {
  constructor(status, code, field) {
    super(code);
    this.name = 'JobWorkflowError';
    this.status = status;
    this.code = code;
    this.field = field || null;
  }
}

function requireActor(actor) {
  const id = Number(actor?.id);
  if (!Number.isSafeInteger(id) || id < 1 || actor.status !== 'active') {
    throw new JobWorkflowError(401, 'AUTH_REQUIRED');
  }
  return id;
}

function safeLimit(value, fallback = 30) {
  const number = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, QUEUE_LIMIT);
}

function mergeJobForm(existing, employer, skills, questions, patch) {
  const base = {
    title: existing.title,
    description: existing.description,
    employer_name: employer?.display_name || 'Employer',
    employer_description: employer?.description || '',
    employer_public_email: employer?.public_email || '',
    employer_public_phone: employer?.public_phone || '',
    employer_website: employer?.website_url || '',
    category: existing.category || '',
    primary_capability_id: existing.primary_capability_id || '',
    employment_type: existing.employment_type,
    work_arrangement: existing.work_arrangement,
    province: existing.province || '',
    district: existing.district || '',
    location_text: existing.location_text || '',
    vacancies: existing.vacancies,
    salary_min: existing.salary_min === null ? '' : String(existing.salary_min),
    salary_max: existing.salary_max === null ? '' : String(existing.salary_max),
    salary_currency: existing.salary_currency,
    salary_period: existing.salary_period || '',
    salary_visible: existing.salary_visible,
    experience_min_years: existing.experience_min_years === null ? '' : String(existing.experience_min_years),
    education_level: existing.education_level || '',
    requirements: existing.requirements || [],
    responsibilities: existing.responsibilities || [],
    application_method: existing.application_method,
    application_instructions: existing.application_instructions || '',
    external_application_url: existing.external_application_url || '',
    deadline_at: existing.deadline_at || '',
    skills: (skills || []).map(item => ({
      capability_id: item.capability_id || '',
      skill_label: item.skill_label || '',
      requirement_level: item.requirement_level,
      years_experience: item.years_experience === null ? '' : item.years_experience
    })),
    application_questions: (questions || []).map(item => ({
      prompt: item.prompt,
      input_type: item.input_type,
      options: item.options || [],
      required: item.required
    }))
  };
  return { ...base, ...(patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {}) };
}

async function updateEmployerJobDraft(pool, actor, rawJobId, rawInput) {
  const userId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');

  return withTransaction(pool, async client => {
    const found = await client.query(
      'SELECT j.* FROM public.job_posts j ' +
      'WHERE j.id = $1 AND j.created_by_user_id = $2 FOR UPDATE',
      [jobId, userId]
    );
    const existing = found.rows?.[0];
    if (!existing) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');
    if (!EMPLOYER_EDITABLE_STATES.has(existing.status)) {
      throw new JobWorkflowError(409, 'JOB_NOT_EDITABLE');
    }

    const [employerResult, skillsResult, questionsResult] = await Promise.all([
      client.query('SELECT * FROM public.employer_profiles WHERE user_id = $1 LIMIT 1', [userId]),
      client.query(
        'SELECT capability_id, skill_label, requirement_level, years_experience ' +
        'FROM public.job_post_skills WHERE job_post_id = $1 ORDER BY id',
        [jobId]
      ),
      client.query(
        'SELECT prompt, input_type, options, required FROM public.job_application_questions ' +
        'WHERE job_post_id = $1 ORDER BY sort_order, created_at',
        [jobId]
      )
    ]);

    const input = normalizeEmployerJobInput(mergeJobForm(
      existing, employerResult.rows?.[0], skillsResult.rows, questionsResult.rows, rawInput
    ));

    await client.query(
      'UPDATE public.employer_profiles SET display_name = $2, description = $3, ' +
      'public_email = $4, public_phone = $5, website_url = $6, updated_at = now() ' +
      'WHERE user_id = $1',
      [userId, input.employerName, input.employerDescription, input.publicEmail || null, input.publicPhone || null, input.websiteUrl]
    );

    const updated = await client.query(
      'UPDATE public.job_posts SET title = $1, description = $2, category = $3, primary_capability_id = $4, ' +
      'employment_type = $5, work_arrangement = $6, province = $7, district = $8, location_text = $9, ' +
      'vacancies = $10, salary_min = $11, salary_max = $12, salary_currency = $13, salary_period = $14, ' +
      'salary_visible = $15, experience_min_years = $16, education_level = $17, requirements = $18::jsonb, ' +
      'responsibilities = $19::jsonb, application_method = $20, application_instructions = $21, ' +
      'external_application_url = $22, deadline_at = $23, status = $24, moderation_note = NULL, ' +
      'updated_at = now() WHERE id = $25 AND created_by_user_id = $26 ' +
      'RETURNING id, title, status, updated_at, deadline_at',
      [
        input.title, input.description, input.category, input.primaryCapabilityId,
        input.employmentType, input.workArrangement, input.province, input.district, input.locationText,
        input.vacancies, input.salaryMin, input.salaryMax, input.salaryCurrency, input.salaryPeriod,
        input.salaryVisible, input.experienceMinYears, input.educationLevel,
        JSON.stringify(input.requirements), JSON.stringify(input.responsibilities),
        input.applicationMethod, input.applicationInstructions, input.externalUrl,
        input.deadlineAt, 'draft', jobId, userId
      ]
    );

    await client.query('DELETE FROM public.job_post_skills WHERE job_post_id = $1', [jobId]);
    for (const skill of input.skills) {
      await client.query(
        'INSERT INTO public.job_post_skills (job_post_id, capability_id, skill_label, requirement_level, years_experience) ' +
        'VALUES ($1, $2, $3, $4, $5)',
        [jobId, skill.capabilityId, skill.label, skill.level, skill.experience]
      );
    }

    await client.query('DELETE FROM public.job_application_questions WHERE job_post_id = $1', [jobId]);
    for (const question of input.questions) {
      await client.query(
        'INSERT INTO public.job_application_questions (job_post_id, prompt, input_type, options, required, sort_order) ' +
        'VALUES ($1, $2, $3, $4::jsonb, $5, $6)',
        [jobId, question.prompt, question.inputType, JSON.stringify(question.options), question.required, question.sortOrder]
      );
    }

    await client.query(
      'INSERT INTO public.job_moderation_events (job_post_id, actor_user_id, action, note) ' +
      "VALUES ($1, $2, 'draft_saved', 'Employer updated a job draft.')",
      [jobId, userId]
    );

    return { job: updated.rows?.[0] || null, next_step: 'edit_and_submit' };
  });
}

async function submitEmployerJobForReview(pool, actor, rawJobId) {
  const userId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');

  return withTransaction(pool, async client => {
    const found = await client.query(
      'SELECT id, status, deadline_at FROM public.job_posts ' +
      'WHERE id = $1 AND created_by_user_id = $2 FOR UPDATE',
      [jobId, userId]
    );
    const job = found.rows?.[0];
    if (!job) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');
    if (!['draft', 'changes_requested'].includes(job.status)) {
      throw new JobWorkflowError(409, 'JOB_NOT_SUBMITTABLE');
    }
    if (job.deadline_at && new Date(job.deadline_at).getTime() <= Date.now()) {
      throw new JobWorkflowError(400, 'DEADLINE_MUST_BE_FUTURE', 'deadline_at');
    }

    const updated = await client.query(
      "UPDATE public.job_posts SET status = 'pending_review', moderation_note = NULL, updated_at = now() " +
      'WHERE id = $1 RETURNING id, title, status, updated_at',
      [jobId]
    );
    await client.query(
      'INSERT INTO public.job_moderation_events (job_post_id, actor_user_id, action, note) ' +
      "VALUES ($1, $2, 'submitted', 'Employer submitted the job for moderation.')",
      [jobId, userId]
    );
    return { job: updated.rows?.[0] || null, next_step: 'awaiting_moderation' };
  });
}

async function closeEmployerJob(pool, actor, rawJobId) {
  const userId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');

  return withTransaction(pool, async client => {
    const found = await client.query(
      'SELECT id, status FROM public.job_posts WHERE id = $1 AND created_by_user_id = $2 FOR UPDATE',
      [jobId, userId]
    );
    const job = found.rows?.[0];
    if (!job) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');
    if (!EMPLOYER_CLOSABLE_STATES.has(job.status)) throw new JobWorkflowError(409, 'JOB_NOT_CLOSABLE');

    const updated = await client.query(
      "UPDATE public.job_posts SET status = 'closed', updated_at = now() WHERE id = $1 " +
      'RETURNING id, title, status, updated_at',
      [jobId]
    );
    await client.query(
      'INSERT INTO public.job_moderation_events (job_post_id, actor_user_id, action, note) ' +
      "VALUES ($1, $2, 'closed', 'Employer closed the job post.')",
      [jobId, userId]
    );
    return { job: updated.rows?.[0] || null };
  });
}

async function listModerationQueue(pool, options = {}) {
  const limit = safeLimit(options.limit, 30);
  const result = await pool.query(
    'SELECT j.id, j.title, j.description, j.category, j.employment_type, j.work_arrangement, ' +
    'j.province, j.district, j.location_text, j.vacancies, j.salary_min, j.salary_max, ' +
    'j.salary_currency, j.salary_period, j.deadline_at, j.status, j.created_at, ' +
    'j.employer_user_id, j.organization_id, ' +
    'COALESCE(o.name, ep.display_name) AS employer_name, ' +
    'COALESCE(o.verification_status, ep.verification_status, \\'unverified\\') AS employer_verification_status ' +
    'FROM public.job_posts j ' +
    'LEFT JOIN public.organizations o ON o.id = j.organization_id ' +
    'LEFT JOIN public.employer_profiles ep ON ep.user_id = j.employer_user_id ' +
    "WHERE j.status = 'pending_review' ORDER BY j.created_at ASC LIMIT $1",
    [limit]
  );
  return { jobs: result.rows || [] };
}

async function reviewEmployerJob(pool, actor, rawJobId, rawInput) {
  const reviewerId = requireActor(actor);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');

  const input = rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput) ? rawInput : {};
  const action = String(input.action || '');
  if (!REVIEW_ACTIONS.has(action)) throw new JobWorkflowError(400, 'INVALID_REVIEW_ACTION', 'action');
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 1000) : '';
  if (action !== 'approved' && note.length < 5) {
    throw new JobWorkflowError(400, 'MODERATION_NOTE_REQUIRED', 'note');
  }

  return withTransaction(pool, async client => {
    const found = await client.query(
      'SELECT id, title, status, employer_user_id FROM public.job_posts WHERE id = $1 FOR UPDATE',
      [jobId]
    );
    const job = found.rows?.[0];
    if (!job) throw new JobWorkflowError(404, 'JOB_NOT_FOUND');
    if (job.status !== 'pending_review') throw new JobWorkflowError(409, 'JOB_NOT_PENDING_REVIEW');

    const updated = await client.query(
      'UPDATE public.job_posts SET status = $1, moderation_note = $2, reviewed_by_user_id = $3, ' +
      'reviewed_at = now(), published_at = CASE WHEN $1 = \\'approved\\' THEN now() ELSE published_at END, ' +
      'updated_at = now() WHERE id = $4 RETURNING id, title, status, moderation_note, reviewed_at, published_at',
      [action, note || null, reviewerId, jobId]
    );

    await client.query(
      'INSERT INTO public.job_moderation_events (job_post_id, actor_user_id, action, note) ' +
      'VALUES ($1, $2, $3, $4)',
      [jobId, reviewerId, action, note || 'Approved for publication.']
    );

    if (job.employer_user_id) {
      const messages = {
        approved: 'Itangazo ryawe ryemejwe kandi ryashyizwe ku rubuga.',
        rejected: 'Itangazo ryawe ntiryemejwe. Soma impamvu, hanyuma uvugurure.',
        changes_requested: 'Hari ibikosorwa bisabwa ku itangazo ryawe mbere yo kuritangaza.'
      };
      await client.query(
        'INSERT INTO public.notifications (user_id, kind, title, body, link, created_at) ' +
        'VALUES ($1, $2, $3, $4, $5, $6)',
        [
          job.employer_user_id,
          'job_moderation',
          'Igenzura ry’itangazo ry’akazi',
          messages[action] + (note ? ' ' + note : ''),
          '/me/jobs',
          Date.now()
        ]
      );
    }

    return { job: updated.rows?.[0] || null };
  });
}

module.exports = {
  JobWorkflowError,
  updateEmployerJobDraft,
  submitEmployerJobForReview,
  closeEmployerJob,
  listModerationQueue,
  reviewEmployerJob,
  REVIEW_ACTIONS
};
