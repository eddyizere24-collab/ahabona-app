'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  listPublicJobs,
  getPublicJob,
  normalizeJobFilters
} = require('../server/opportunities-public.cjs');

class FakePool {
  constructor(responses = []) {
    this.responses = responses;
    this.calls = [];
  }

  async query(sql, values) {
    this.calls.push({ sql, values });
    return { rows: this.responses.shift() || [] };
  }
}

test('public job filters validate enums and clamp pagination', () => {
  const params = new URLSearchParams({
    q: 'driver',
    employment_type: 'not-real',
    work_arrangement: 'remote',
    limit: '500',
    offset: '-2'
  });
  const filters = normalizeJobFilters(params);

  assert.equal(filters.q, 'driver');
  assert.equal(filters.employmentType, '');
  assert.equal(filters.workArrangement, 'remote');
  assert.equal(filters.limit, 50);
  assert.equal(filters.offset, 0);
});

test('public list filters to approved and unexpired jobs using bound parameters', async () => {
  const pool = new FakePool([[{ id: 'job-1', title: 'Driver' }]]);
  const params = new URLSearchParams({
    q: 'driver',
    district: 'Gasabo',
    employment_type: 'full_time',
    limit: '20'
  });
  const result = await listPublicJobs(pool, params);

  assert.equal(result.jobs.length, 1);
  assert.match(pool.calls[0].sql, /j\.status = 'approved'/);
  assert.match(pool.calls[0].sql, /j\.deadline_at IS NULL OR j\.deadline_at > now\(\)/);
  assert.match(pool.calls[0].sql, /ILIKE/);
  assert.deepEqual(pool.calls[0].values, ['%driver%', '%driver%', 'Gasabo', 'full_time', 20, 0]);
});

test('public detail rejects invalid ids without querying the database', async () => {
  const pool = new FakePool();
  const result = await getPublicJob(pool, 'not-a-uuid');

  assert.equal(result, null);
  assert.equal(pool.calls.length, 0);
});

test('public detail returns only active approved jobs plus public skills/questions', async () => {
  const jobId = 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13';
  const pool = new FakePool([
    [{ id: jobId, title: 'Driver', salary_min: null, application_method: 'in_platform' }],
    [{ skill: 'Driving', requirement_level: 'required' }],
    [{ id: 'question-1', prompt: 'When can you start?' }]
  ]);

  const result = await getPublicJob(pool, jobId);

  assert.equal(result.job.id, jobId);
  assert.equal(result.skills[0].skill, 'Driving');
  assert.equal(result.applicationQuestions[0].prompt, 'When can you start?');
  assert.match(pool.calls[0].sql, /j\.status = 'approved'/);
  assert.match(pool.calls[0].sql, /j\.deadline_at IS NULL OR j\.deadline_at > now\(\)/);
  assert.deepEqual(pool.calls[0].values, [jobId]);
  assert.equal(pool.calls.length, 3);
});

test('public detail hides salaries and contact channels according to posting settings', async () => {
  const jobId = 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13';
  const pool = new FakePool([[{ id: jobId }], [], []]);
  await getPublicJob(pool, jobId);

  const sql = pool.calls[0].sql;
  assert.match(sql, /CASE WHEN j\.salary_visible THEN j\.salary_min/);
  assert.match(sql, /CASE WHEN j\.application_method = 'external_url'/);
  assert.match(sql, /CASE WHEN j\.application_method = 'employer_contact'/);
});
