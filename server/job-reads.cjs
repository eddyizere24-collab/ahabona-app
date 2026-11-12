'use strict';

const crypto = require('node:crypto');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class JobReadError extends Error {
  constructor(status, code) {
    super(code);
    this.name = 'JobReadError';
    this.status = status;
    this.code = code;
  }
}

function getReaderKey(req, actor) {
  const userId = Number(actor?.id);
  let identity;
  if (Number.isSafeInteger(userId) && userId > 0 && actor?.status === 'active') {
    identity = 'user:' + userId;
  } else {
    const rawDevice = req?.headers?.['x-device'];
    const device = typeof rawDevice === 'string' ? rawDevice.trim() : '';
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(device)) return null;
    identity = 'device:' + device;
  }
  return crypto.createHash('sha256')
    .update('ahabona-job-reader-v1:' + identity, 'utf8')
    .digest('hex');
}

async function getUnreadJobCount(pool, readerKey) {
  if (!/^[0-9a-f]{64}$/.test(String(readerKey || ''))) {
    throw new JobReadError(400, 'READER_KEY_REQUIRED');
  }
  const result = await pool.query(
    'SELECT COUNT(*)::integer AS unread_count ' +
    'FROM public.job_posts j ' +
    'LEFT JOIN public.job_post_reads r ON r.job_post_id = j.id AND r.reader_key = $1 ' +
    "WHERE j.status = 'approved' " +
    'AND (j.deadline_at IS NULL OR j.deadline_at > now()) ' +
    'AND r.job_post_id IS NULL',
    [readerKey]
  );
  const count = Number(result.rows?.[0]?.unread_count || 0);
  return { unread_count: Number.isFinite(count) ? Math.max(0, count) : 0 };
}

async function markJobRead(pool, readerKey, rawJobId) {
  if (!/^[0-9a-f]{64}$/.test(String(readerKey || ''))) {
    throw new JobReadError(400, 'READER_KEY_REQUIRED');
  }
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) throw new JobReadError(404, 'JOB_NOT_FOUND');

  const result = await pool.query(
    'INSERT INTO public.job_post_reads (reader_key, job_post_id) ' +
    'SELECT $1, j.id FROM public.job_posts j ' +
    "WHERE j.id = $2 AND j.status = 'approved' " +
    'AND (j.deadline_at IS NULL OR j.deadline_at > now()) ' +
    'ON CONFLICT (reader_key, job_post_id) DO UPDATE SET last_viewed_at = now() ' +
    'RETURNING job_post_id, first_viewed_at, last_viewed_at',
    [readerKey, jobId]
  );
  const read = result.rows?.[0];
  if (!read) throw new JobReadError(404, 'JOB_NOT_AVAILABLE');
  return { read };
}

module.exports = {
  JobReadError,
  getReaderKey,
  getUnreadJobCount,
  markJobRead
};
