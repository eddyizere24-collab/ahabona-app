'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createJobReaderKey,
  getUnreadPublicJobCount,
  markPublicJobRead
} = require('../server/opportunity-reads.cjs');

const DEVICE_A = '0123456789abcdef01234567';
const JOB_ID = 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13';

class FakePool {
  constructor(rows = []) {
    this.rows = rows;
    this.calls = [];
  }

  async query(sql, values) {
    this.calls.push({ sql, values });
    return { rows: this.rows };
  }
}

test('reader keys are stable, opaque and domain-separated', () => {
  const first = createJobReaderKey({ deviceId: DEVICE_A });
  assert.equal(first, createJobReaderKey({ deviceId: DEVICE_A }));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, createJobReaderKey({ userId: 7 }));
  assert.notEqual(first, createJobReaderKey({ deviceId: 'abcdef0123456789' }));
});

test('reader key prefers a signed-in user over a browser device', () => {
  const a = createJobReaderKey({ userId: 7, deviceId: DEVICE_A });
  const b = createJobReaderKey({ userId: 7, deviceId: 'abcdef0123456789' });
  assert.equal(a, b);
});

test('invalid anonymous device identifiers do not create reader keys', () => {
  assert.equal(createJobReaderKey({ deviceId: 'short' }), null);
  assert.equal(createJobReaderKey({}), null);
});

test('unread count only queries active, approved, unexpired jobs not read by this reader', async () => {
  const key = createJobReaderKey({ deviceId: DEVICE_A });
  const pool = new FakePool([{ unread: 5 }]);
  const count = await getUnreadPublicJobCount(pool, key);

  assert.equal(count, 5);
  assert.match(pool.calls[0].sql, /j\.status = 'approved'/);
  assert.match(pool.calls[0].sql, /j\.deadline_at IS NULL OR j\.deadline_at > now\(\)/);
  assert.match(pool.calls[0].sql, /NOT EXISTS/);
  assert.deepEqual(pool.calls[0].values, [key]);
});

test('unread count safely treats a missing result as zero', async () => {
  const key = createJobReaderKey({ userId: 9 });
  assert.equal(await getUnreadPublicJobCount(new FakePool([]), key), 0);
});

test('invalid job ids never reach SQL when marking as read', async () => {
  const key = createJobReaderKey({ deviceId: DEVICE_A });
  const pool = new FakePool();
  const result = await markPublicJobRead(pool, key, 'not-a-uuid');

  assert.deepEqual(result, { marked: false });
  assert.equal(pool.calls.length, 0);
});

test('marking a public job read upserts a per-reader record and ignores non-public jobs', async () => {
  const key = createJobReaderKey({ deviceId: DEVICE_A });
  const pool = new FakePool([{ job_post_id: JOB_ID }]);
  const result = await markPublicJobRead(pool, key, JOB_ID);

  assert.deepEqual(result, { marked: true });
  assert.match(pool.calls[0].sql, /INSERT INTO public\.job_post_reads/);
  assert.match(pool.calls[0].sql, /j\.status = 'approved'/);
  assert.match(pool.calls[0].sql, /j\.deadline_at IS NULL OR j\.deadline_at > now\(\)/);
  assert.match(pool.calls[0].sql, /ON CONFLICT/);
  assert.deepEqual(pool.calls[0].values, [key, JOB_ID]);
});

test('reader key and pool inputs are validated', async () => {
  const pool = new FakePool();
  await assert.rejects(() => getUnreadPublicJobCount(pool, 'raw-device-id'), /SHA-256/);
  await assert.rejects(() => markPublicJobRead(pool, 'bad', JOB_ID), /SHA-256/);
  await assert.rejects(() => getUnreadPublicJobCount(null, 'a'.repeat(64)), /PostgreSQL pool/);
});
