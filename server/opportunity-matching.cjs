'use strict';

const { withTransaction } = require('./postgres.cjs');

function jsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
}

function ids(value) {
  return new Set(jsonArray(value).map(Number).filter(id => Number.isSafeInteger(id) && id > 0));
}

function calculateMatchScore(job, candidate) {
  const jobSkills = new Set([
    Number(job.primary_capability_id),
    ...jsonArray(job.skill_capability_ids).map(Number)
  ].filter(id => Number.isSafeInteger(id) && id > 0));
  const candidateSkills = ids(candidate.profile_caps);
  for (const id of ids(candidate.preferred_capability_ids)) candidateSkills.add(id);
  if (!jobSkills.size || ![...jobSkills].some(id => candidateSkills.has(id))) return null;

  const reasons = ['Ubuhanga bwatoranyijwe burahuye'];
  const remote = job.work_arrangement === 'remote';
  const preferredDistricts = jsonArray(candidate.preferred_districts);
  const preferredProvinces = jsonArray(candidate.preferred_provinces);
  let location = 0.5;
  if (remote) {
    location = 1;
    reasons.push('Akazi gashobora gukorwa uri aho uri');
  } else if (preferredDistricts.length || preferredProvinces.length) {
    const districtMatch = preferredDistricts.includes(job.district);
    const provinceMatch = preferredProvinces.includes(job.province);
    location = districtMatch || provinceMatch ? 1 : 0;
    if (location) reasons.push('Aho akazi kari hahuye n’aho wifuza gukorera');
  } else if (candidate.profile_district && job.district && candidate.profile_district === job.district) {
    location = 1;
    reasons.push('Akazi kari mu karere utuyemo');
  }

  const preferredEmployment = jsonArray(candidate.employment_types);
  const employment = preferredEmployment.length ? (preferredEmployment.includes(job.employment_type) ? 1 : 0) : 0.5;
  if (employment === 1) reasons.push('Ubwoko bw’akazi urashaka burahuye');

  let salary = 0.5;
  const minimum = candidate.min_salary === null || candidate.min_salary === undefined ? null : Number(candidate.min_salary);
  const jobMax = job.salary_max === null || job.salary_max === undefined ? null : Number(job.salary_max);
  const jobMin = job.salary_min === null || job.salary_min === undefined ? null : Number(job.salary_min);
  if (minimum !== null && (jobMax !== null || jobMin !== null)) {
    salary = (jobMax !== null ? jobMax : jobMin) >= minimum ? 1 : 0;
    if (salary === 1) reasons.push('Umushahara watangajwe ugera ku wo wifuza');
  }

  const score = (0.65 * 1) + (0.20 * location) + (0.10 * employment) + (0.05 * salary);
  return { score: Math.round(score * 1000) / 1000, reasons };
}

async function matchApprovedJob(pool, jobId, options = {}) {
  const candidateUserId = options.candidateUserId ? Number(options.candidateUserId) : null;
  return withTransaction(pool, async client => {
    const jobResult = await client.query(
      "SELECT id,title,employer_user_id,primary_capability_id,employment_type,work_arrangement,province,district,salary_min,salary_max " +
      "FROM public.job_posts WHERE id=$1 AND status='approved' AND (deadline_at IS NULL OR deadline_at>now()) FOR SHARE",
      [jobId]
    );
    const job = jobResult.rows?.[0];
    if (!job) return { jobId, matched: 0, notified: 0, skipped: 'JOB_NOT_PUBLIC' };

    const skillsResult = await client.query(
      'SELECT capability_id FROM public.job_post_skills WHERE job_post_id=$1 AND capability_id IS NOT NULL',
      [jobId]
    );
    job.skill_capability_ids = (skillsResult.rows || []).map(row => Number(row.capability_id));
    if (!job.primary_capability_id && !job.skill_capability_ids.length) {
      return { jobId, matched: 0, notified: 0, skipped: 'JOB_HAS_NO_STRUCTURED_SKILLS' };
    }

    const values = [job.employer_user_id, candidateUserId];
    const candidates = await client.query(
      'SELECT p.user_id,p.district AS profile_district,p.caps AS profile_caps,' +
      'cp.preferred_capability_ids,cp.preferred_provinces,cp.preferred_districts,cp.employment_types,cp.min_salary,' +
      'COALESCE(np.in_app_enabled,true) AS in_app_enabled ' +
      'FROM public.candidate_job_preferences cp ' +
      'JOIN public.profiles p ON p.user_id=cp.user_id ' +
      'JOIN public.users u ON u.id=cp.user_id AND u.status=\'active\' ' +
      'LEFT JOIN public.notification_preferences np ON np.user_id=cp.user_id ' +
      'WHERE cp.seeking_work=true AND cp.matching_enabled=true AND p.suspended=false ' +
      'AND cp.user_id<>COALESCE($1,0) AND ($2::bigint IS NULL OR cp.user_id=$2) ' +
      'AND NOT EXISTS (SELECT 1 FROM public.job_applications a WHERE a.job_post_id=$3 AND a.candidate_user_id=cp.user_id) ' +
      'ORDER BY cp.updated_at DESC LIMIT 2000',
      [job.employer_user_id, candidateUserId, jobId]
    );

    let matched = 0;
    let notified = 0;
    for (const candidate of candidates.rows || []) {
      const result = calculateMatchScore(job, candidate);
      if (!result || result.score < 0.70) continue;

      const inserted = await client.query(
        "INSERT INTO public.job_matches (job_post_id,candidate_user_id,match_score,match_reasons,state) " +
        "VALUES ($1,$2,$3,$4::jsonb,'matched') ON CONFLICT (job_post_id,candidate_user_id) DO NOTHING RETURNING id",
        [jobId, candidate.user_id, result.score, JSON.stringify(result.reasons)]
      );
      if (!inserted.rows?.length) continue;
      matched += 1;

      if (candidate.in_app_enabled !== false) {
        await client.query(
          'INSERT INTO public.notifications (user_id,kind,title,body,link,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
          [
            candidate.user_id,
            'job_match',
            'Amahirwe y’akazi aguhuje n’ubushobozi bwawe',
            'Itangazo "' + String(job.title || 'Akazi').slice(0, 140) + '" rihuye n’ubushobozi cyangwa ibyifuzo byawe.',
            '/opportunities?job=' + encodeURIComponent(jobId),
            Date.now()
          ]
        );
        await client.query(
          "UPDATE public.job_matches SET state='notified' WHERE job_post_id=$1 AND candidate_user_id=$2",
          [jobId, candidate.user_id]
        );
        notified += 1;
      }
    }
    return { jobId, matched, notified };
  });
}

async function matchApprovedJobsForCandidate(pool, candidateUserId, limit = 100) {
  const userId = Number(candidateUserId);
  if (!Number.isSafeInteger(userId) || userId < 1) throw new TypeError('A valid candidate user ID is required.');
  const jobs = await pool.query(
    "SELECT id FROM public.job_posts WHERE status='approved' AND (deadline_at IS NULL OR deadline_at>now()) " +
    'AND primary_capability_id IS NOT NULL ORDER BY published_at DESC NULLS LAST LIMIT $1',
    [Math.max(1, Math.min(200, Number(limit) || 100))]
  );
  const summaries = [];
  for (const row of jobs.rows || []) {
    summaries.push(await matchApprovedJob(pool, row.id, { candidateUserId: userId }));
  }
  return { checked: summaries.length, matched: summaries.reduce((sum, x) => sum + x.matched, 0), notified: summaries.reduce((sum, x) => sum + x.notified, 0) };
}

module.exports = { calculateMatchScore, matchApprovedJob, matchApprovedJobsForCandidate };
