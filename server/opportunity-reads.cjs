'use strict';

const crypto = require('node:crypto');
const { UUID_RE } = require('./opportunities-public.cjs');

const DEVICE_RE = /^[A-Za-z0-9-]{16,64}$/;
const HASH_RE = /^[a-f0-9]{64}$/;

function createJobReaderKey(identity) {
  const value = identity && typeof identity === 'object' ? identity : {};
  const userId = Number(value.userId);
  let subject = '';

  if (Number.isSafeInteger(userId) && userId > 0) {
    subject = 'user:' + userId;
  } else {
    const deviceId = String(value.deviceId || '');
    if (!DEVICE_RE.test(deviceId)) return null;
    subject = 'device:' + deviceId;
  }

  return crypto.createHash('sha256')
    .update('ahabona:job-post-reader:v1:' + subject, 'utf8')
    .digest('hex');
}

function requireReaderKey(value) {
  const key = String(value || '');
  if (!HASH_RE.test(key)) throw new TypeError('A SHA-256 reader key is required.');
  return key;
}

async function getUnreadPublicJobCount(pool, rawReaderKey) {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('PostgreSQL pool is required.');
  }
  const readerKey = requireReaderKey(rawReaderKey);
  const result = await pool.query([
    'SELECT COUNT(*)::integer AS unread',
    'FROM public.job_posts j',
    'WHERE j.status = \'approved\'',
    'AND (j.deadline_at IS NULL OR j.deadline_at > now())',
    'AND NOT EXISTS (',
    '  SELECT 1 FROM public.job_post_reads r',
    '  WHERE r.job_post_id = j.id AND r.reader_key = $1',
    ')'
  ].join('\n'), [readerKey]);

  return Math.max(0, Number(result.rows?.[0]?.unread) || 0);
}

async function markPublicJobRead(pool, rawReaderKey, rawJobId) {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('PostgreSQL pool is required.');
  }
  const readerKey = requireReaderKey(rawReaderKey);
  const jobId = String(rawJobId || '');
  if (!UUID_RE.test(jobId)) return { marked: false };

  const result = await pool.query([
    'INSERT INTO public.job_post_reads (reader_key, job_post_id)',
    'SELECT $1, j.id',
    'FROM public.job_posts j',
    'WHERE j.id = $2',
    "AND j.status = 'approved'",
    'AND (j.deadline_at IS NULL OR j.deadline_at > now())',
    'ON CONFLICT (reader_key, job_post_id)',
    'DO UPDATE SET last_viewed_at = now()',
    'RETURNING job_post_id'
  ].join('\n'), [readerKey, jobId]);

  return { marked: !!result.rows?.length };
}

module.exports = {
  createJobReaderKey,
  getUnreadPublicJobCount,
  markPublicJobRead
};
