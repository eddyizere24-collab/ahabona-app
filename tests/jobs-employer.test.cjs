'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createJobPost,
  listEmployerJobs,
  normalizeEmployerJobInput,
  JobInputError
} = require('../server/jobs-employer.cjs');

const validInput = {
  title: 'Abashoferi barakenewe',
  description: 'Dukeneye abashoferi bafite uruhushya rwo gutwara ibinyabiziga n uburambe.',
  employer_name: 'Ikigo cy’Ubwikorezi',
  employment_type: 'full_time',
  work_arrangement: 'on_site',
  province: 'Umujyi wa Kigali',
  district: 'Gasabo',
  vacancies: 5,
  requirements: ['Driving licence', 'Two years of experience'],
  skills: [{ skill_label: 'Professional driving', requirement_level: 'required' }],
  application_method: 'in_platform',
  application_questions: [
    { prompt: 'Waba watangira ryari?', input_type: 'short_text', required: true }
  ]
};

class FakeClient {
  constructor(options = {}) {
    this.calls = [];
    this.options = options;
    this.released = false;
  }

  async query(sql, values = []) {
    this.calls.push({ sql, values });
    if (this.options.failOn && sql.includes(this.options.failOn)) {
      const error = new Error('simulated database failure');
      error.code = 'XX000';
      throw error;
    }
    if (sql.includes('RETURNING id, title, status')) {
      return {
        rows: [{
          id: 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13',
          title: 'Abashoferi barakenewe',
          status: values[values.length - 1],
          created_at: '2026-11-12T18:00:00Z',
          deadline_at: null
        }]
      };
    }
    if (sql.includes('RETURNING id') && sql.includes('INSERT INTO public.users')) {
      return { rows: [{ id: 41 }] };
    }
    return { rows: [] };
  }

  release() {
    this.released = true;
  }
}

class FakePool {
  constructor(options = {}) {
    this.client = new FakeClient(options);
    this.connectCalls = 0;
    this.queries = [];
  }

  async connect() {
    this.connectCalls += 1;
    return this.client;
  }

  async query(sql, values) {
    this.queries.push({ sql, values });
    return { rows: [{ id: 'job-1', title: 'Driver', status: 'pending_review', application_count: 0 }] };
  }
}

test('normalizes a valid Rwanda job and preserves the matched province', () => {
  const input = normalizeEmployerJobInput(validInput);
  assert.equal(input.district, 'Gasabo');
  assert.equal(input.province, 'Umujyi wa Kigali');
  assert.equal(input.vacancies, 5);
  assert.equal(input.draft, false);
  assert.equal(input.applicationMethod, 'in_platform');
});

test('rejects a district that does not belong to the selected province', () => {
  assert.throws(
    () => normalizeEmployerJobInput({
      ...validInput,
      province: 'Amajyepfo',
      district: 'Gasabo'
    }),
    error => error instanceof JobInputError && error.field === 'province'
  );
});

test('requires explicit public contact details for employer-contact applications', () => {
  assert.throws(
    () => normalizeEmployerJobInput({
      ...validInput,
      application_method: 'employer_contact'
    }),
    error => error instanceof JobInputError && error.field === 'application_method'
  );
});

test('only accepts HTTPS application links', () => {
  assert.throws(
    () => normalizeEmployerJobInput({
      ...validInput,
      application_method: 'external_url',
      external_application_url: 'http://unsafe.example.test/apply'
    }),
    error => error instanceof JobInputError && error.field === 'external_application_url'
  );
});

test('rejects salary ranges where maximum is lower than minimum', () => {
  assert.throws(
    () => normalizeEmployerJobInput({
      ...validInput,
      salary_min: 600000,
      salary_max: 400000
    }),
    error => error instanceof JobInputError && error.field === 'salary_max'
  );
});

test('creates job, skills and questions transactionally with ID-only identity projection', async () => {
  const pool = new FakePool();
  const actor = {
    id: 41,
    status: 'active',
    created_at: 1780000000000,
    email: 'private@example.test',
    phone: '+250788000000',
    pw: 'private-password-hash'
  };

  const result = await createJobPost(pool, actor, validInput);
  const calls = pool.client.calls;
  const identityCall = calls.find(call => call.sql.includes('INSERT INTO public.users'));
  const jobCall = calls.find(call => call.sql.includes('INSERT INTO public.job_posts'));

  assert.equal(result.job.status, 'pending_review');
  assert.equal(result.next_step, 'awaiting_moderation');
  assert.ok(identityCall);
  assert.match(identityCall.sql, /identity_source/);
  assert.ok(identityCall.sql.includes("IN ('legacy_sqlite','imported')"));
  assert.doesNotMatch(identityCall.sql, /email|phone|\bpw\b/i);
  assert.ok(!identityCall.values.includes(actor.email));
  assert.ok(!identityCall.values.includes(actor.phone));
  assert.ok(!identityCall.values.includes(actor.pw));
  assert.ok(jobCall);
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO public.job_post_skills')));
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO public.job_application_questions')));
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO public.job_moderation_events')));
  assert.equal(calls[0].sql, 'BEGIN');
  assert.equal(calls.at(-1).sql, 'COMMIT');
  assert.equal(pool.client.released, true);
});

test('employer may save a draft but cannot make it public directly', async () => {
  const pool = new FakePool();
  const result = await createJobPost(
    pool,
    { id: 42, status: 'active', created_at: 1780000000000 },
    { ...validInput, save_draft: true }
  );

  assert.equal(result.job.status, 'draft');
  assert.equal(result.next_step, 'edit_and_submit');
});

test('rolls back a failed job write and does not partially save a posting', async () => {
  const pool = new FakePool({ failOn: 'INSERT INTO public.job_post_skills' });
  await assert.rejects(
    createJobPost(pool, { id: 43, status: 'active' }, validInput),
    /simulated database failure/
  );

  assert.ok(pool.client.calls.some(call => call.sql === 'ROLLBACK'));
  assert.ok(!pool.client.calls.some(call => call.sql === 'COMMIT'));
  assert.equal(pool.client.released, true);
});

test('employer job list is scoped to the authenticated account ID', async () => {
  const pool = new FakePool();
  const result = await listEmployerJobs(pool, { id: 51, status: 'active' });

  assert.equal(result.jobs.length, 1);
  assert.equal(pool.queries[0].values[0], 51);
  assert.match(pool.queries[0].sql, /WHERE j\.created_by_user_id = \$1/);
});
