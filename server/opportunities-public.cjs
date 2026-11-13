'use strict';

const EMPLOYMENT_TYPES = new Set([
  'full_time', 'part_time', 'contract', 'temporary', 'casual', 'internship', 'volunteer'
]);
const WORK_ARRANGEMENTS = new Set(['on_site', 'hybrid', 'remote']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function textParam(params, key, maxLength) {
  const value = String(params?.get(key) || '').trim();
  return value.slice(0, maxLength);
}

function intParam(value, fallback, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

function normalizeJobFilters(params) {
  const employmentType = textParam(params, 'employment_type', 24);
  const workArrangement = textParam(params, 'work_arrangement', 16);
  return {
    q: textParam(params, 'q', 100),
    province: textParam(params, 'province', 80),
    district: textParam(params, 'district', 80),
    category: textParam(params, 'category', 80),
    employmentType: EMPLOYMENT_TYPES.has(employmentType) ? employmentType : '',
    workArrangement: WORK_ARRANGEMENTS.has(workArrangement) ? workArrangement : '',
    limit: intParam(params?.get('limit'), 20, 50) || 20,
    offset: intParam(params?.get('offset'), 0, 10000)
  };
}

function publicJobSelect(detail) {
  const description = detail ? 'j.description' : 'left(j.description, 320) AS summary';
  return [
    'j.id',
    'j.title',
    description,
    'j.category',
    'j.employment_type',
    'j.work_arrangement',
    'j.province',
    'j.district',
    'j.vacancies',
    'CASE WHEN j.salary_visible THEN j.salary_min::text ELSE NULL END AS salary_min',
    'CASE WHEN j.salary_visible THEN j.salary_max::text ELSE NULL END AS salary_max',
    'CASE WHEN j.salary_visible THEN j.salary_currency ELSE NULL END AS salary_currency',
    'CASE WHEN j.salary_visible THEN j.salary_period ELSE NULL END AS salary_period',
    'j.experience_min_years',
    'j.education_level',
    'j.requirements',
    'j.responsibilities',
    'j.application_method',
    'j.application_instructions',
    "CASE WHEN j.application_method = 'external_url' THEN j.external_application_url ELSE NULL END AS external_application_url",
    "CASE WHEN j.application_method = 'employer_contact' THEN COALESCE(j.application_email, o.public_email, ep.public_email) ELSE NULL END AS application_email",
    "CASE WHEN j.application_method = 'employer_contact' THEN COALESCE(o.public_phone, ep.public_phone) ELSE NULL END AS application_phone",
    'j.deadline_at',
    'j.published_at',
    'COALESCE(o.name, ep.display_name, p.name, u.display_name) AS employer_name',
    "CASE WHEN j.organization_id IS NOT NULL THEN COALESCE(o.verification_status = 'verified', false) ELSE COALESCE(ep.verification_status = 'verified', false) END AS employer_verified"
  ].join(', ');
}

const PUBLIC_JOINS = [
  'FROM public.job_posts j',
  'LEFT JOIN public.organizations o ON o.id = j.organization_id',
  'LEFT JOIN public.employer_profiles ep ON ep.user_id = j.employer_user_id',
  'LEFT JOIN public.profiles p ON p.user_id = j.employer_user_id',
  'LEFT JOIN public.users u ON u.id = j.employer_user_id'
].join('\n');

async function listPublicJobs(pool, searchParams) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('PostgreSQL pool is required.');

  const filters = normalizeJobFilters(searchParams);
  const where = [
    "j.status = 'approved'",
    '(j.deadline_at IS NULL OR j.deadline_at > now())'
  ];
  const values = [];
  const add = (expression, value) => {
    values.push(value);
    where.push(expression.replace('?', '$' + values.length));
  };

  if (filters.q) {
    values.push('%' + filters.q + '%');
    const q1 = '$' + values.length;
    values.push('%' + filters.q + '%');
    const q2 = '$' + values.length;
    where.push('(j.title ILIKE ' + q1 + ' OR j.description ILIKE ' + q2 + ')');
  }
  if (filters.province) add('lower(j.province) = lower(?)', filters.province);
  if (filters.district) add('lower(j.district) = lower(?)', filters.district);
  if (filters.category) add('lower(j.category) = lower(?)', filters.category);
  if (filters.employmentType) add('j.employment_type = ?', filters.employmentType);
  if (filters.workArrangement) add('j.work_arrangement = ?', filters.workArrangement);

  values.push(filters.limit);
  const limitPlaceholder = '$' + values.length;
  values.push(filters.offset);
  const offsetPlaceholder = '$' + values.length;

  const sql = [
    'SELECT ' + publicJobSelect(false),
    PUBLIC_JOINS,
    'WHERE ' + where.join(' AND '),
    'ORDER BY j.published_at DESC NULLS LAST, j.created_at DESC',
    'LIMIT ' + limitPlaceholder + ' OFFSET ' + offsetPlaceholder
  ].join('\n');
  const result = await pool.query(sql, values);
  return {
    jobs: result.rows || [],
    pagination: { limit: filters.limit, offset: filters.offset }
  };
}

async function getPublicJob(pool, rawId) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('PostgreSQL pool is required.');
  const id = String(rawId || '');
  if (!UUID_RE.test(id)) return null;

  const result = await pool.query([
    'SELECT ' + publicJobSelect(true),
    PUBLIC_JOINS,
    'WHERE j.id = $1',
    "AND j.status = 'approved'",
    'AND (j.deadline_at IS NULL OR j.deadline_at > now())',
    'LIMIT 1'
  ].join('\n'), [id]);
  const job = result.rows?.[0];
  if (!job) return null;

  const [skillsResult, questionsResult] = await Promise.all([
    pool.query([
      'SELECT COALESCE(c.name, s.skill_label) AS skill,',
      '       s.requirement_level, s.years_experience',
      'FROM public.job_post_skills s',
      'LEFT JOIN public.capabilities c ON c.id = s.capability_id',
      'WHERE s.job_post_id = $1',
      'ORDER BY s.requirement_level, skill'
    ].join('\n'), [id]),
    pool.query([
      'SELECT id, prompt, input_type, options, required, sort_order',
      'FROM public.job_application_questions',
      'WHERE job_post_id = $1',
      'ORDER BY sort_order, created_at'
    ].join('\n'), [id])
  ]);

  return {
    job,
    skills: skillsResult.rows || [],
    applicationQuestions: questionsResult.rows || []
  };
}

module.exports = {
  listPublicJobs,
  getPublicJob,
  normalizeJobFilters,
  UUID_RE
};
