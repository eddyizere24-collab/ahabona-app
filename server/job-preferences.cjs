'use strict';

const { withTransaction } = require('./postgres.cjs');
const { ensureLegacyIdentity } = require('./jobs-employer.cjs');

const EMPLOYMENT_TYPES = new Set(['full_time','part_time','contract','temporary','casual','internship','volunteer']);
const PROVINCES = {
  'Umujyi wa Kigali':['Gasabo','Kicukiro','Nyarugenge'],
  'Amajyepfo':['Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango'],
  'Amajyaruguru':['Burera','Gakenke','Gicumbi','Musanze','Rulindo'],
  'Iburasirazuba':['Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana'],
  'Iburengerazuba':['Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro']
};

class JobPreferenceError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'JobPreferenceError';
    this.field = field;
  }
}

function normalizeStringList(value, allowed, field, maxItems) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > maxItems) throw new JobPreferenceError(field, 'Select a valid number of options.');
  const output = [];
  for (const item of value) {
    if (typeof item !== 'string' || !allowed.has(item)) throw new JobPreferenceError(field, 'One or more selected options are invalid.');
    if (!output.includes(item)) output.push(item);
  }
  return output;
}

function normalizeIdList(value, allowedIds, field) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 20) throw new JobPreferenceError(field, 'Select up to 20 skills.');
  const output = [];
  for (const raw of value) {
    const id = Number(raw);
    if (!Number.isSafeInteger(id) || id < 1 || !allowedIds.has(id)) {
      throw new JobPreferenceError(field, 'One or more selected skills are invalid.');
    }
    if (!output.includes(id)) output.push(id);
  }
  return output;
}

function normalizeCandidateJobPreferences(raw, validCapabilityIds = []) {
  const data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const allowedIds = new Set(validCapabilityIds.map(Number).filter(id => Number.isSafeInteger(id) && id > 0));
  const districts = new Set(Object.values(PROVINCES).flat());
  const provinces = new Set(Object.keys(PROVINCES));
  const employment = normalizeStringList(data.employment_types, EMPLOYMENT_TYPES, 'employment_types', 7);
  const preferredProvinces = normalizeStringList(data.preferred_provinces, provinces, 'preferred_provinces', 5);
  const preferredDistricts = normalizeStringList(data.preferred_districts, districts, 'preferred_districts', 30);
  const preferredCapabilities = normalizeIdList(data.preferred_capability_ids, allowedIds, 'preferred_capability_ids');
  const seekingWork = data.seeking_work === true;
  const matchingEnabled = seekingWork && data.matching_enabled === true;
  const reverseDiscoveryEnabled = seekingWork && data.reverse_discovery_enabled === true;
  let minSalary = null;
  if (data.min_salary !== undefined && data.min_salary !== null && data.min_salary !== '') {
    minSalary = Number(data.min_salary);
    if (!Number.isFinite(minSalary) || minSalary < 0 || minSalary > 1000000000) {
      throw new JobPreferenceError('min_salary', 'Enter a valid minimum salary in RWF.');
    }
  }
  return {
    seeking_work: seekingWork,
    matching_enabled: matchingEnabled,
    reverse_discovery_enabled: reverseDiscoveryEnabled,
    preferred_capability_ids: preferredCapabilities,
    preferred_provinces: preferredProvinces,
    preferred_districts: preferredDistricts,
    employment_types: employment,
    min_salary: minSalary,
    salary_currency: 'RWF',
    in_app_enabled: data.in_app_enabled !== false
  };
}

async function getCandidateJobPreferences(pool, actor) {
  const userId = Number(actor && actor.id);
  if (!Number.isSafeInteger(userId) || userId < 1 || actor.status !== 'active') {
    throw new JobPreferenceError('auth', 'An active AHABONA session is required.');
  }
  const [candidate, notification] = await Promise.all([
    pool.query('SELECT * FROM public.candidate_job_preferences WHERE user_id = $1', [userId]),
    pool.query('SELECT in_app_enabled FROM public.notification_preferences WHERE user_id = $1', [userId])
  ]);
  const row = candidate.rows?.[0] || {};
  return {
    preferences: {
      seeking_work: row.seeking_work === true,
      matching_enabled: row.matching_enabled === true,
      reverse_discovery_enabled: row.reverse_discovery_enabled === true,
      preferred_capability_ids: Array.isArray(row.preferred_capability_ids) ? row.preferred_capability_ids.map(Number) : [],
      preferred_provinces: Array.isArray(row.preferred_provinces) ? row.preferred_provinces : [],
      preferred_districts: Array.isArray(row.preferred_districts) ? row.preferred_districts : [],
      employment_types: Array.isArray(row.employment_types) ? row.employment_types : [],
      min_salary: row.min_salary === null || row.min_salary === undefined ? null : Number(row.min_salary),
      salary_currency: row.salary_currency || 'RWF',
      in_app_enabled: notification.rows?.[0]?.in_app_enabled !== false
    }
  };
}

async function saveCandidateJobPreferences(pool, actor, raw, validCapabilityIds = []) {
  const userId = Number(actor && actor.id);
  if (!Number.isSafeInteger(userId) || userId < 1 || actor.status !== 'active') {
    throw new JobPreferenceError('auth', 'An active AHABONA session is required.');
  }
  const input = normalizeCandidateJobPreferences(raw, validCapabilityIds);
  return withTransaction(pool, async client => {
    await ensureLegacyIdentity(client, actor);
    await client.query(
      'INSERT INTO public.candidate_job_preferences ' +
      '(user_id, seeking_work, matching_enabled, reverse_discovery_enabled, preferred_capability_ids, preferred_provinces, preferred_districts, employment_types, min_salary, salary_currency, updated_at) ' +
      'VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb,$9,$10,now()) ' +
      'ON CONFLICT (user_id) DO UPDATE SET seeking_work=EXCLUDED.seeking_work, matching_enabled=EXCLUDED.matching_enabled, ' +
      'reverse_discovery_enabled=EXCLUDED.reverse_discovery_enabled, preferred_capability_ids=EXCLUDED.preferred_capability_ids, ' +
      'preferred_provinces=EXCLUDED.preferred_provinces, preferred_districts=EXCLUDED.preferred_districts, ' +
      'employment_types=EXCLUDED.employment_types, min_salary=EXCLUDED.min_salary, salary_currency=EXCLUDED.salary_currency, updated_at=now()',
      [
        userId, input.seeking_work, input.matching_enabled, input.reverse_discovery_enabled,
        JSON.stringify(input.preferred_capability_ids), JSON.stringify(input.preferred_provinces),
        JSON.stringify(input.preferred_districts), JSON.stringify(input.employment_types),
        input.min_salary, input.salary_currency
      ]
    );
    await client.query(
      'INSERT INTO public.notification_preferences (user_id, in_app_enabled, updated_at) VALUES ($1,$2,now()) ' +
      'ON CONFLICT (user_id) DO UPDATE SET in_app_enabled=EXCLUDED.in_app_enabled, updated_at=now()',
      [userId, input.in_app_enabled]
    );
    return { preferences: input };
  });
}

module.exports = {
  JobPreferenceError,
  normalizeCandidateJobPreferences,
  getCandidateJobPreferences,
  saveCandidateJobPreferences,
  PROVINCES,
  EMPLOYMENT_TYPES
};
