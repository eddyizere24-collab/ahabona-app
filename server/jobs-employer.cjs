'use strict';

const { withTransaction } = require('./postgres.cjs');

const EMPLOYMENT_TYPES = new Set([
  'full_time', 'part_time', 'contract', 'temporary', 'casual', 'internship', 'volunteer'
]);
const WORK_ARRANGEMENTS = new Set(['on_site', 'hybrid', 'remote']);
const APPLICATION_METHODS = new Set(['in_platform', 'employer_contact', 'external_url']);
const SALARY_PERIODS = new Set(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'one_off']);
const QUESTION_TYPES = new Set(['short_text', 'long_text', 'yes_no', 'single_choice', 'multiple_choice']);

const RW_DISTRICTS = {
  'Umujyi wa Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Amajyepfo': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Amajyaruguru': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Iburasirazuba': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Iburengerazuba': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
};

class JobInputError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'JobInputError';
    this.field = field;
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function requiredText(value, field, min, max) {
  const result = cleanText(value, max);
  if (result.length < min) throw new JobInputError(field, 'This field is required.');
  return result;
}

function optionalNumber(value, field, min, max) {
  if (value === undefined || value === null || value === '') return null;
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) {
    throw new JobInputError(field, 'Enter a valid number.');
  }
  return result;
}

function validEmail(value) {
  const email = cleanText(value, 254).toLowerCase();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new JobInputError('employer_public_email', 'Enter a valid public employer email.');
  }
  return email;
}

function validPhone(value) {
  const phone = cleanText(value, 30);
  if (!phone) return '';
  if (!/^\+?[0-9 ()-]{7,25}$/.test(phone)) {
    throw new JobInputError('employer_public_phone', 'Enter a valid public employer phone number.');
  }
  return phone;
}

function parseDeadline(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
    throw new JobInputError('deadline_at', 'The application deadline must be a valid future date.');
  }
  return date.toISOString();
}

function validateDistrict(province, district) {
  if (!district) return { province: province || null, district: null };
  for (const [prov, districts] of Object.entries(RW_DISTRICTS)) {
    if (districts.some(item => item.toLowerCase() === district.toLowerCase())) {
      if (province && province.toLowerCase() !== prov.toLowerCase()) {
        throw new JobInputError('province', 'The selected district does not belong to this province.');
      }
      return { province: prov, district: districts.find(item => item.toLowerCase() === district.toLowerCase()) };
    }
  }
  throw new JobInputError('district', 'Select a valid Rwanda district.');
}

function normalizeTextArray(value, field, maxItems, maxLength) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new JobInputError(field, 'Too many items were supplied.');
  }
  return value.map(item => requiredText(item, field, 2, maxLength));
}

function normalizeSkills(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 30) {
    throw new JobInputError('skills', 'Add up to 30 required or preferred skills.');
  }
  return value.map(item => {
    const data = item && typeof item === 'object' ? item : {};
    const rawId = data.capability_id;
    const capabilityId = rawId === undefined || rawId === null || rawId === '' ? null : Number(rawId);
    if (capabilityId !== null && (!Number.isSafeInteger(capabilityId) || capabilityId < 1)) {
      throw new JobInputError('skills', 'A selected skill is invalid.');
    }
    const label = cleanText(data.skill_label, 120) || null;
    if (capabilityId === null && (!label || label.length < 2)) {
      throw new JobInputError('skills', 'Each skill must have a selected capability or a name.');
    }
    const level = data.requirement_level === 'preferred' ? 'preferred' : 'required';
    return {
      capabilityId,
      label,
      level,
      experience: optionalNumber(data.years_experience, 'skills', 0, 80)
    };
  });
}

function normalizeQuestions(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 10) {
    throw new JobInputError('application_questions', 'Add up to 10 application questions.');
  }
  return value.map((item, index) => {
    const data = item && typeof item === 'object' ? item : {};
    const prompt = requiredText(data.prompt, 'application_questions', 2, 1000);
    const inputType = cleanText(data.input_type, 24);
    if (!QUESTION_TYPES.has(inputType)) {
      throw new JobInputError('application_questions', 'Select a valid question type.');
    }
    const options = normalizeTextArray(data.options, 'application_questions', 20, 200);
    if (['single_choice', 'multiple_choice'].includes(inputType) && options.length < 2) {
      throw new JobInputError('application_questions', 'Choice questions need at least two options.');
    }
    return {
      prompt,
      inputType,
      options,
      required: data.required === true,
      sortOrder: index
    };
  });
}

function normalizeEmployerJobInput(raw) {
  const data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const title = requiredText(data.title, 'title', 3, 180);
  const description = requiredText(data.description, 'description', 20, 20000);
  const employerName = requiredText(data.employer_name, 'employer_name', 2, 120);

  const employmentType = cleanText(data.employment_type, 24);
  if (!EMPLOYMENT_TYPES.has(employmentType)) {
    throw new JobInputError('employment_type', 'Select a valid employment type.');
  }

  const workArrangement = cleanText(data.work_arrangement || 'on_site', 16);
  if (!WORK_ARRANGEMENTS.has(workArrangement)) {
    throw new JobInputError('work_arrangement', 'Select a valid work arrangement.');
  }

  const applicationMethod = cleanText(data.application_method || 'in_platform', 24);
  if (!APPLICATION_METHODS.has(applicationMethod)) {
    throw new JobInputError('application_method', 'Select a valid application method.');
  }

  const rawProvince = cleanText(data.province, 80);
  const rawDistrict = cleanText(data.district, 80);
  const location = validateDistrict(rawProvince, rawDistrict);
  const locationText = cleanText(data.location_text, 180);
  if (workArrangement !== 'remote' && !location.district && !locationText) {
    throw new JobInputError('district', 'Choose a district or describe the work location.');
  }

  const vacancies = data.vacancies === undefined ? 1 : Number(data.vacancies);
  if (!Number.isInteger(vacancies) || vacancies < 1 || vacancies > 10000) {
    throw new JobInputError('vacancies', 'Enter a valid number of vacancies.');
  }

  const salaryMin = optionalNumber(data.salary_min, 'salary_min', 0, 1000000000000);
  const salaryMax = optionalNumber(data.salary_max, 'salary_max', 0, 1000000000000);
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
    throw new JobInputError('salary_max', 'Maximum salary cannot be lower than minimum salary.');
  }

  const salaryCurrency = cleanText(data.salary_currency || 'RWF', 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(salaryCurrency)) {
    throw new JobInputError('salary_currency', 'Enter a valid three-letter currency code.');
  }

  const salaryPeriod = cleanText(data.salary_period, 16) || null;
  if (salaryPeriod && !SALARY_PERIODS.has(salaryPeriod)) {
    throw new JobInputError('salary_period', 'Select a valid salary period.');
  }

  const publicEmail = validEmail(data.employer_public_email);
  const publicPhone = validPhone(data.employer_public_phone);
  const employerDescription = cleanText(data.employer_description, 2000) || null;
  let websiteUrl = cleanText(data.employer_website, 500) || null;
  if (websiteUrl) {
    try {
      const parsed = new URL(websiteUrl);
      if (parsed.protocol !== 'https:' || !parsed.hostname) throw new Error();
      websiteUrl = parsed.toString();
    } catch {
      throw new JobInputError('employer_website', 'Use a valid HTTPS website address.');
    }
  }

  if (applicationMethod === 'employer_contact' && !publicEmail && !publicPhone) {
    throw new JobInputError('application_method', 'Add a public employer email or phone for employer-contact applications.');
  }

  let externalUrl = null;
  if (applicationMethod === 'external_url') {
    externalUrl = cleanText(data.external_application_url, 1000);
    try {
      const parsed = new URL(externalUrl);
      if (parsed.protocol !== 'https:' || !parsed.hostname) throw new Error();
      externalUrl = parsed.toString();
    } catch {
      throw new JobInputError('external_application_url', 'Use a valid HTTPS application link.');
    }
  }

  const primaryCapabilityId = data.primary_capability_id === undefined || data.primary_capability_id === null || data.primary_capability_id === ''
    ? null
    : Number(data.primary_capability_id);
  if (primaryCapabilityId !== null && (!Number.isSafeInteger(primaryCapabilityId) || primaryCapabilityId < 1)) {
    throw new JobInputError('primary_capability_id', 'Select a valid capability.');
  }

  return {
    title,
    description,
    employerName,
    employerDescription,
    publicEmail,
    publicPhone,
    websiteUrl,
    category: cleanText(data.category, 100) || null,
    primaryCapabilityId,
    employmentType,
    workArrangement,
    province: location.province,
    district: location.district,
    locationText: locationText || null,
    vacancies,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    salaryVisible: data.salary_visible !== false,
    experienceMinYears: optionalNumber(data.experience_min_years, 'experience_min_years', 0, 80),
    educationLevel: cleanText(data.education_level, 80) || null,
    requirements: normalizeTextArray(data.requirements, 'requirements', 30, 500),
    responsibilities: normalizeTextArray(data.responsibilities, 'responsibilities', 30, 500),
    applicationMethod,
    applicationInstructions: cleanText(data.application_instructions, 2000) || null,
    externalUrl,
    deadlineAt: parseDeadline(data.deadline_at),
    skills: normalizeSkills(data.skills),
    questions: normalizeQuestions(data.application_questions),
    draft: data.save_draft === true
  };
}

async function ensureLegacyIdentity(client, actor) {
  const id = Number(actor?.id);
  if (!Number.isSafeInteger(id) || id < 1 || actor.status !== 'active') {
    throw new Error('An active AHABONA session is required.');
  }
  const createdAt = Number.isFinite(Number(actor.created_at)) ? Number(actor.created_at) : Date.now();

  const result = await client.query(
    'INSERT INTO public.users (id, role, status, created_at, identity_source) ' +
    "VALUES ($1, 'user', 'active', $2, 'legacy_sqlite') " +
    'ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status ' +
    "WHERE public.users.identity_source IN ('legacy_sqlite','imported') RETURNING id",
    [id, createdAt]
  );
  if (!result.rows?.length) {
    throw new Error('AHABONA identity is already linked to another authentication source.');
  }

  await client.query(
    "SELECT setval(pg_get_serial_sequence('public.users', 'id'), " +
    'GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.users), 1), true)'
  );
  return id;
}

async function createJobPost(pool, actor, rawInput) {
  const input = normalizeEmployerJobInput(rawInput);
  const status = input.draft ? 'draft' : 'pending_review';

  return withTransaction(pool, async client => {
    const userId = await ensureLegacyIdentity(client, actor);

    await client.query(
      'INSERT INTO public.employer_profiles AS ep ' +
      '(user_id, display_name, description, public_email, public_phone, website_url, verification_status) ' +
      "VALUES ($1, $2, $3, $4, $5, $6, 'unverified') " +
      'ON CONFLICT (user_id) DO UPDATE SET ' +
      'display_name = EXCLUDED.display_name, ' +
      'description = COALESCE(EXCLUDED.description, ep.description), ' +
      'public_email = COALESCE(EXCLUDED.public_email, ep.public_email), ' +
      'public_phone = COALESCE(EXCLUDED.public_phone, ep.public_phone), ' +
      'website_url = COALESCE(EXCLUDED.website_url, ep.website_url), ' +
      'updated_at = now()',
      [
        userId,
        input.employerName,
        input.employerDescription,
        input.publicEmail || null,
        input.publicPhone || null,
        input.websiteUrl
      ]
    );

    const inserted = await client.query(
      'INSERT INTO public.job_posts (' +
      'created_by_user_id, employer_user_id, organization_id, title, description, category, primary_capability_id, ' +
      'employment_type, work_arrangement, province, district, location_text, vacancies, salary_min, salary_max, ' +
      'salary_currency, salary_period, salary_visible, experience_min_years, education_level, requirements, ' +
      'responsibilities, application_method, application_instructions, external_application_url, deadline_at, status' +
      ') VALUES (' +
      '$1, $1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, ' +
      '$19::jsonb, $20::jsonb, $21, $22, $23, $24, $25' +
      ') RETURNING id, title, status, created_at, deadline_at',
      [
        userId, input.title, input.description, input.category, input.primaryCapabilityId,
        input.employmentType, input.workArrangement, input.province, input.district, input.locationText,
        input.vacancies, input.salaryMin, input.salaryMax, input.salaryCurrency, input.salaryPeriod,
        input.salaryVisible, input.experienceMinYears, input.educationLevel,
        JSON.stringify(input.requirements), JSON.stringify(input.responsibilities),
        input.applicationMethod, input.applicationInstructions, input.externalUrl,
        input.deadlineAt, status
      ]
    );

    const job = inserted.rows?.[0];
    if (!job) throw new Error('Job post insert returned no record.');

    for (const skill of input.skills) {
      await client.query(
        'INSERT INTO public.job_post_skills ' +
        '(job_post_id, capability_id, skill_label, requirement_level, years_experience) ' +
        'VALUES ($1, $2, $3, $4, $5)',
        [job.id, skill.capabilityId, skill.label, skill.level, skill.experience]
      );
    }

    for (const question of input.questions) {
      await client.query(
        'INSERT INTO public.job_application_questions ' +
        '(job_post_id, prompt, input_type, options, required, sort_order) ' +
        'VALUES ($1, $2, $3, $4::jsonb, $5, $6)',
        [job.id, question.prompt, question.inputType, JSON.stringify(question.options), question.required, question.sortOrder]
      );
    }

    await client.query(
      'INSERT INTO public.job_moderation_events (job_post_id, actor_user_id, action, note) ' +
      'VALUES ($1, $2, $3, $4)',
      [job.id, userId, input.draft ? 'draft_saved' : 'submitted', input.draft ? 'Employer saved a draft.' : 'Employer submitted job post for moderation.']
    );

    return {
      job,
      employer: { display_name: input.employerName, verification_status: 'unverified' },
      next_step: input.draft ? 'edit_and_submit' : 'awaiting_moderation'
    };
  });
}

async function listEmployerJobs(pool, actor) {
  const userId = Number(actor?.id);
  if (!Number.isSafeInteger(userId) || userId < 1 || actor.status !== 'active') {
    throw new Error('An active AHABONA session is required.');
  }
  const result = await pool.query(
    'SELECT j.id, j.title, j.status, j.vacancies, j.deadline_at, ' +
    'j.created_at, j.updated_at, j.published_at, COUNT(a.id)::integer AS application_count ' +
    'FROM public.job_posts j ' +
    'LEFT JOIN public.job_applications a ON a.job_post_id = j.id ' +
    'WHERE j.created_by_user_id = $1 ' +
    'GROUP BY j.id ORDER BY j.created_at DESC LIMIT 100',
    [userId]
  );
  return { jobs: result.rows || [] };
}

module.exports = {
  createJobPost,
  listEmployerJobs,
  normalizeEmployerJobInput,
  ensureLegacyIdentity,
  JobInputError
};
