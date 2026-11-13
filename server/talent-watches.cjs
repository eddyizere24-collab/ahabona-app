'use strict';

const { withTransaction } = require('./postgres.cjs');
const { ensureLegacyIdentity } = require('./jobs-employer.cjs');
const { PROVINCES } = require('./job-preferences.cjs');

class TalentWatchError extends Error {
  constructor(status, code, field) {
    super(code);
    this.name = 'TalentWatchError';
    this.status = status;
    this.code = code;
    this.field = field || null;
  }
}

const DISTRICT_TO_PROVINCE = new Map(
  Object.entries(PROVINCES).flatMap(([province, districts]) => districts.map(district => [district, province]))
);

function listValues(value, maximum) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maximum).filter(item => typeof item === 'string').map(item => item.trim());
}

function normalizeTalentWatch(raw, validCapabilityIds = []) {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const valid = new Set(validCapabilityIds.map(Number).filter(id => Number.isSafeInteger(id) && id > 0));
  const rawIds = Array.isArray(input.capability_ids) ? input.capability_ids : [];
  if (rawIds.length > 20) throw new TalentWatchError(400, 'TOO_MANY_CAPABILITIES', 'capability_ids');
  const capabilityIds = [...new Set(rawIds.map(Number))];
  if (!capabilityIds.length || capabilityIds.some(id => !Number.isSafeInteger(id) || !valid.has(id))) {
    throw new TalentWatchError(400, 'INVALID_CAPABILITY_SELECTION', 'capability_ids');
  }

  const provinceSet = new Set(Object.keys(PROVINCES));
  const districtSet = new Set(Object.values(PROVINCES).flat());
  const provinces = [...new Set(listValues(input.provinces, 5))];
  const districts = [...new Set(listValues(input.districts, 30))];
  if (provinces.some(value => !provinceSet.has(value))) throw new TalentWatchError(400, 'INVALID_PROVINCE', 'provinces');
  if (districts.some(value => !districtSet.has(value))) throw new TalentWatchError(400, 'INVALID_DISTRICT', 'districts');

  const name = typeof input.name === 'string' ? input.name.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 100) : '';
  if (name.length < 2) throw new TalentWatchError(400, 'INVALID_WATCH_NAME', 'name');

  return { name, criteria: { capability_ids: capabilityIds, provinces, districts } };
}

function calculateTalentWatchMatch(criteria, candidate) {
  const requested = new Set(Array.isArray(criteria?.capability_ids) ? criteria.capability_ids.map(Number) : []);
  const candidateSkills = new Set(Array.isArray(candidate?.caps)
    ? candidate.caps.map(Number)
    : (typeof candidate?.caps === 'string' ? safeJson(candidate.caps).map(Number) : []));
  const overlap = [...requested].filter(id => candidateSkills.has(id));
  if (!overlap.length) return null;

  const districts = Array.isArray(criteria?.districts) ? criteria.districts : [];
  const provinces = Array.isArray(criteria?.provinces) ? criteria.provinces : [];
  const candidateDistricts = new Set([candidate?.district, ...jsonValues(candidate?.preferred_districts)].filter(Boolean));
  const candidateProvinces = new Set(jsonValues(candidate?.preferred_provinces));
  const districtMatch = districts.length > 0 && districts.some(value => candidateDistricts.has(value));
  const provinceMatch = provinces.length > 0 && (
    provinces.some(value => candidateProvinces.has(value)) ||
    (candidate?.district && provinces.includes(DISTRICT_TO_PROVINCE.get(candidate.district)))
  );
  if ((districts.length || provinces.length) && !districtMatch && !provinceMatch) return null;

  const reasons = ['Ubuhanga bw’umuntu buhuye n’ubwo umukoresha akeneye'];
  if (districtMatch) reasons.push('Aho umukandida atuye cyangwa yifuza gukorera harahuye n’aho hakenewe');
  else if (provinceMatch) reasons.push('Intara umukandida yemeye gukoreramo irahuye');
  const score = Math.min(1, 0.8 + (districtMatch ? 0.2 : provinceMatch ? 0.15 : 0));
  return { score: Math.round(score * 1000) / 1000, reasons, matchedCapabilityIds: overlap };
}

function safeJson(value) {
  try { const result = JSON.parse(value); return Array.isArray(result) ? result : []; } catch { return []; }
}

function jsonValues(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return safeJson(value);
  return [];
}

function requireActor(actor) {
  const userId = Number(actor && actor.id);
  if (!Number.isSafeInteger(userId) || userId < 1 || actor.status !== 'active') {
    throw new TalentWatchError(401, 'AUTH_REQUIRED');
  }
  return userId;
}

async function createEmployerTalentWatch(pool, actor, rawInput, validCapabilityIds = []) {
  const userId = requireActor(actor);
  const input = normalizeTalentWatch(rawInput, validCapabilityIds);
  return withTransaction(pool, async client => {
    await ensureLegacyIdentity(client, actor);
    const result = await client.query(
      'INSERT INTO public.employer_talent_watches (created_by_user_id, name, criteria) ' +
      'VALUES ($1,$2,$3::jsonb) RETURNING id,name,criteria,active,created_at',
      [userId, input.name, JSON.stringify(input.criteria)]
    );
    return { watch: result.rows?.[0] || null };
  });
}

async function listEmployerTalentWatches(pool, actor) {
  const userId = requireActor(actor);
  const result = await pool.query(
    'SELECT w.id,w.name,w.criteria,w.active,w.created_at,w.updated_at,' +
    '(SELECT COUNT(*)::integer FROM public.talent_discovery_matches m WHERE m.watch_id=w.id AND m.state IN (\'matched\',\'notified\',\'viewed\')) AS match_count ' +
    'FROM public.employer_talent_watches w WHERE w.created_by_user_id=$1 ORDER BY w.created_at DESC LIMIT 100',
    [userId]
  );
  return { watches: result.rows || [] };
}

async function listEmployerTalentMatches(pool, actor, watchId) {
  const userId = requireActor(actor);
  const result = await pool.query(
    'SELECT w.id AS watch_id,w.name AS watch_name,m.id AS match_id,m.match_score,m.match_reasons,m.state,m.calculated_at,' +
    'p.pid,p.name,p.district,p.intro,p.experience,p.languages,p.availability,p.edu_level,' +
    'COALESCE((SELECT jsonb_agg(c.name ORDER BY c.sort_order,c.name) ' +
    'FROM jsonb_array_elements_text(p.caps) skill_id JOIN public.capabilities c ON c.id=skill_id.value::bigint),' +
    '\'[]\'::jsonb) AS capabilities ' +
    'FROM public.employer_talent_watches w ' +
    'JOIN public.talent_discovery_matches m ON m.watch_id=w.id ' +
    'JOIN public.profiles p ON p.user_id=m.candidate_user_id AND p.suspended=false ' +
    'JOIN public.users u ON u.id=p.user_id AND u.status=\'active\' ' +
    'JOIN public.candidate_job_preferences cp ON cp.user_id=p.user_id AND cp.seeking_work=true AND cp.reverse_discovery_enabled=true ' +
    'WHERE w.id=$1 AND w.created_by_user_id=$2 AND w.active=true AND m.state<>' + "'dismissed' " +
    'ORDER BY m.match_score DESC,m.calculated_at DESC LIMIT 100',
    [watchId, userId]
  );
  return { matches: result.rows || [] };
}

async function matchCandidatesForTalentWatch(pool, actor, watchId) {
  const employerId = requireActor(actor);
  const id = String(watchId || '');
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new TalentWatchError(404, 'WATCH_NOT_FOUND');

  return withTransaction(pool, async client => {
    const watchResult = await client.query(
      'SELECT id,created_by_user_id,name,criteria FROM public.employer_talent_watches ' +
      'WHERE id=$1 AND created_by_user_id=$2 AND active=true FOR SHARE',
      [id, employerId]
    );
    const watch = watchResult.rows?.[0];
    if (!watch) throw new TalentWatchError(404, 'WATCH_NOT_FOUND');
    const criteria = typeof watch.criteria === 'string' ? safeJsonObject(watch.criteria) : (watch.criteria || {});
    const candidates = await client.query(
      'SELECT p.user_id,p.district,p.caps,cp.preferred_districts,cp.preferred_provinces ' +
      'FROM public.profiles p ' +
      'JOIN public.users u ON u.id=p.user_id AND u.status='active' ' +
      'JOIN public.candidate_job_preferences cp ON cp.user_id=p.user_id ' +
      'WHERE p.suspended=false AND cp.seeking_work=true AND cp.reverse_discovery_enabled=true ' +
      'AND p.user_id<>$1 ORDER BY cp.updated_at DESC LIMIT 2000',
      [employerId]
    );
    let matched = 0;
    let notified = 0;
    for (const candidate of candidates.rows || []) {
      const result = calculateTalentWatchMatch(criteria, candidate);
      if (!result) continue;
      const inserted = await client.query(
        "INSERT INTO public.talent_discovery_matches (watch_id,candidate_user_id,match_score,match_reasons,state) " +
        "VALUES ($1,$2,$3,$4::jsonb,'matched') ON CONFLICT (watch_id,candidate_user_id) DO NOTHING RETURNING id",
        [watch.id, candidate.user_id, result.score, JSON.stringify(result.reasons)]
      );
      if (!inserted.rows?.length) continue;
      matched += 1;
      const preference = await client.query(
        'SELECT in_app_enabled FROM public.notification_preferences WHERE user_id=$1',
        [employerId]
      );
      if (preference.rows?.[0]?.in_app_enabled === false) continue;
      await client.query(
        'INSERT INTO public.notifications (user_id,kind,title,body,link,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [
          employerId,
          'talent_match',
          'Abantu bahuye n’ibyo ukeneye',
          'Habonetse umukandida wemeye kugaragara ku bakoresha kandi ufite ubuhanga bujyanye na "' + String(watch.name || 'Talent Watch').slice(0, 100) + '".',
          '/opportunities',
          Date.now()
        ]
      );
      await client.query(
        "UPDATE public.talent_discovery_matches SET state='notified' WHERE watch_id=$1 AND candidate_user_id=$2",
        [watch.id, candidate.user_id]
      );
      notified += 1;
    }
    return { checked: (candidates.rows || []).length, matched, notified };
  });
}

async function matchTalentWatchesForCandidate(pool, candidateUserId) {
  const userId = Number(candidateUserId);
  if (!Number.isSafeInteger(userId) || userId < 1) throw new TypeError('A valid candidate user ID is required.');
  return withTransaction(pool, async client => {
    const candidateResult = await client.query(
      'SELECT p.user_id,p.district,p.caps,cp.preferred_districts,cp.preferred_provinces ' +
      'FROM public.profiles p ' +
      'JOIN public.users u ON u.id=p.user_id AND u.status=\'active\' ' +
      'JOIN public.candidate_job_preferences cp ON cp.user_id=p.user_id ' +
      'WHERE p.user_id=$1 AND p.suspended=false AND cp.seeking_work=true AND cp.reverse_discovery_enabled=true',
      [userId]
    );
    const candidate = candidateResult.rows?.[0];
    if (!candidate) return { checked: 0, matched: 0, notified: 0, skipped: 'CANDIDATE_NOT_OPTED_IN' };

    const watchResult = await client.query(
      'SELECT id,created_by_user_id,name,criteria FROM public.employer_talent_watches WHERE active=true AND created_by_user_id<>$1 ORDER BY created_at DESC LIMIT 500',
      [userId]
    );
    let matched = 0;
    let notified = 0;
    for (const watch of watchResult.rows || []) {
      const criteria = typeof watch.criteria === 'string' ? safeJsonObject(watch.criteria) : (watch.criteria || {});
      const result = calculateTalentWatchMatch(criteria, candidate);
      if (!result) continue;

      const inserted = await client.query(
        "INSERT INTO public.talent_discovery_matches (watch_id,candidate_user_id,match_score,match_reasons,state) " +
        "VALUES ($1,$2,$3,$4::jsonb,'matched') ON CONFLICT (watch_id,candidate_user_id) DO NOTHING RETURNING id",
        [watch.id, userId, result.score, JSON.stringify(result.reasons)]
      );
      if (!inserted.rows?.length) continue;
      matched += 1;

      const prefs = await client.query(
        'SELECT in_app_enabled FROM public.notification_preferences WHERE user_id=$1',
        [watch.created_by_user_id]
      );
      if (prefs.rows?.[0]?.in_app_enabled === false) continue;

      await client.query(
        'INSERT INTO public.notifications (user_id,kind,title,body,link,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [
          watch.created_by_user_id,
          'talent_match',
          'Umukandida mushya ushobora kugufasha',
          'Habonetse umuntu wahisemo kugaragara ku bakoresha, ufite ubuhanga buhuye n’icyo ushaka: ' + String(watch.name || 'Talent Watch').slice(0, 100),
          '/opportunities',
          Date.now()
        ]
      );
      await client.query(
        "UPDATE public.talent_discovery_matches SET state='notified' WHERE watch_id=$1 AND candidate_user_id=$2",
        [watch.id, userId]
      );
      notified += 1;
    }
    return { checked: (watchResult.rows || []).length, matched, notified };
  });
}

function safeJsonObject(value) {
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

module.exports = {
  TalentWatchError,
  normalizeTalentWatch,
  calculateTalentWatchMatch,
  createEmployerTalentWatch,
  listEmployerTalentWatches,
  listEmployerTalentMatches,
  matchCandidatesForTalentWatch,
  matchTalentWatchesForCandidate
};
