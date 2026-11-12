'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ApplicationError,
  normalizeAnswers,
  createJobApplication,
  listMyApplications,
  listEmployerApplications,
  updateEmployerApplicationStatus
} = require('../server/applications.cjs');

const JOB_ID = 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13';
const APPLICATION_ID = '8f8a9df4-0e0b-4f3b-92da-cf04e4b0cc1a';
const QUESTION_ID = '0f6a3c52-c4ad-4f7b-9ac8-cf1a57cba0d3';
const ACTOR = { id: 51, status: 'active', created_at: 1780000000000, display_name: 'Candidate' };

const job = {
  id: JOB_ID,
  title: 'Abashoferi barakenewe',
  employer_user_id: 72,
  organization_id: null,
  application_method: 'in_platform'
};

const profile = {
  name: 'Candidate',
  district: 'Gasabo',
  caps: ['Umushoferi'],
  other_text: 'Professional driver',
  intro: 'I have driving experience.',
  edu: 'Secondary',
  experience: [{ title: 'Driver', years: 3 }],
  languages: ['Kinyarwanda'],
  availability: ['Full-time'],
  suspended: false,
  phones: ['+250700000000'],
  email_public: 'private@example.test'
};

const questions = [{
  id: QUESTION_ID,
  prompt: 'Waba watangira ryari?',
  input_type: 'short_text',
  options: [],
  required: true,
  sort_order: 0
}];

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
      error.code = this.options.code || 'XX000';
      throw error;
    }
    if (sql.includes('INSERT INTO public.users') && sql.includes('RETURNING id')) {
      return { rows: [{ id: ACTOR.id }] };
    }
    if (sql.includes('FROM public.job_posts') && sql.includes('FOR UPDATE')) {
      return { rows: this.options.jobRows === undefined ? [job] : this.options.jobRows };
    }
    if (sql.includes('FROM public.profiles WHERE user_id')) {
      return { rows: this.options.profileRows === undefined ? [profile] : this.options.profileRows };
    }
    if (sql.includes('FROM public.job_application_questions')) {
      return { rows: this.options.questionRows === undefined ? questions : this.options.questionRows };
    }
    if (sql.includes('INSERT INTO public.job_applications')) {
      return { rows: [{ id: APPLICATION_ID, job_post_id: JOB_ID, status: 'submitted', submitted_at: '2026-11-12T18:00:00Z' }] };
    }
    if (sql.includes('FROM public.job_applications a') && sql.includes('FOR UPDATE OF a')) {
      return { rows: this.options.applicationRows === undefined
        ? [{ id: APPLICATION_ID, job_post_id: JOB_ID, candidate_user_id: 51, status: 'submitted', title: job.title }]
        : this.options.applicationRows };
    }
    if (sql.includes('UPDATE public.job_applications')) {
      return { rows: [{ id: APPLICATION_ID, job_post_id: JOB_ID, status: values[0], updated_at: '2026-11-12T18:05:00Z' }] };
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
    this.options = options;
    this.connectCount = 0;
    this.queries = [];
  }

  async connect() {
    this.connectCount += 1;
    return this.client;
  }

  async query(sql, values = []) {
    this.queries.push({ sql, values });
    if (sql.includes('SELECT id, title FROM public.job_posts')) {
      return { rows: this.options.ownedJobRows === undefined ? [{ id: JOB_ID, title: job.title }] : this.options.ownedJobRows };
    }
    if (sql.includes('FROM public.job_applications a') && sql.includes('candidate_user_id')) {
      return { rows: [{ id: APPLICATION_ID, status: 'submitted' }] };
    }
    if (sql.includes('FROM public.job_applications a') && sql.includes('WHERE a.job_post_id')) {
      return { rows: [{ id: APPLICATION_ID, status: 'submitted', profile_snapshot: { display_name: 'Candidate' } }] };
    }
    return { rows: [] };
  }
}

test('validates required question answers and accepted yes/no values', () => {
  assert.throws(
    () => normalizeAnswers({}, questions),
    error => error instanceof ApplicationError && error.code === 'REQUIRED_ANSWER_MISSING'
  );
  const result = normalizeAnswers({ [QUESTION_ID]: 'Immediately' }, questions);
  assert.deepEqual(result, { [QUESTION_ID]: 'Immediately' });
  assert.equal(normalizeAnswers({ q: 'yes' }, [{ id: 'q', input_type: 'yes_no', options: [], required: true }]).q, true);
});

test('rejects unknown question IDs and invalid choice answers', () => {
  assert.throws(
    () => normalizeAnswers({ unknown: 'answer' }, questions),
    error => error instanceof ApplicationError && error.code === 'UNKNOWN_APPLICATION_QUESTION'
  );
  assert.throws(
    () => normalizeAnswers({ q: 'outside' }, [{ id: 'q', input_type: 'single_choice', options: ['A', 'B'], required: true }]),
    error => error instanceof ApplicationError && error.code === 'INVALID_CHOICE_ANSWER'
  );
});

test('submits an application transactionally and excludes private profile contacts from snapshot', async () => {
  const pool = new FakePool();
  const result = await createJobApplication(pool, ACTOR, JOB_ID, {
    cover_message: 'I can start next week.',
    answers: { [QUESTION_ID]: 'Next Monday' }
  });

  assert.equal(result.application.status, 'submitted');
  assert.equal(result.next_step, 'track_application');
  const calls = pool.client.calls;
  const applicationInsert = calls.find(call => call.sql.includes('INSERT INTO public.job_applications'));
  const snapshot = JSON.parse(applicationInsert.values[2]);
  assert.equal(snapshot.display_name, 'Candidate');
  assert.deepEqual(snapshot.capabilities, ['Umushoferi']);
  assert.equal(snapshot.email_public, undefined);
  assert.equal(snapshot.phones, undefined);
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO public.application_status_events')));
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO public.notifications')));
  assert.equal(calls[0].sql, 'BEGIN');
  assert.equal(calls.at(-1).sql, 'COMMIT');
  assert.equal(pool.client.released, true);
});

test('does not accept external-apply jobs through the in-platform application endpoint', async () => {
  const pool = new FakePool();
  pool.client.options.jobRows = [{ ...job, application_method: 'external_url' }];
  await assert.rejects(
    createJobApplication(pool, ACTOR, JOB_ID, { answers: { [QUESTION_ID]: 'Tomorrow' } }),
    error => error instanceof ApplicationError && error.code === 'APPLICATION_NOT_HOSTED_HERE'
  );
  assert.ok(!pool.client.calls.some(call => call.sql.includes('INSERT INTO public.job_applications')));
  assert.ok(pool.client.calls.some(call => call.sql === 'ROLLBACK'));
});

test('does not allow application to unpublished or expired jobs', async () => {
  const pool = new FakePool();
  pool.client.options.jobRows = [];
  await assert.rejects(
    createJobApplication(pool, ACTOR, JOB_ID, {}),
    error => error instanceof ApplicationError && error.code === 'JOB_NOT_AVAILABLE'
  );
});

test('does not allow a suspended candidate profile to apply', async () => {
  const pool = new FakePool();
  pool.client.options.profileRows = [{ ...profile, suspended: true }];
  await assert.rejects(
    createJobApplication(pool, ACTOR, JOB_ID, { answers: { [QUESTION_ID]: 'Tomorrow' } }),
    error => error instanceof ApplicationError && error.code === 'PROFILE_NOT_AVAILABLE'
  );
});

test('maps duplicate applications to a conflict response', async () => {
  const pool = new FakePool({ failOn: 'INSERT INTO public.job_applications', code: '23505' });
  await assert.rejects(
    createJobApplication(pool, ACTOR, JOB_ID, { answers: { [QUESTION_ID]: 'Tomorrow' } }),
    error => error instanceof ApplicationError && error.status === 409 && error.code === 'ALREADY_APPLIED'
  );
});

test('candidate application list is scoped to the signed-in candidate', async () => {
  const pool = new FakePool();
  const result = await listMyApplications(pool, ACTOR);
  assert.equal(result.applications.length, 1);
  assert.equal(pool.queries[0].values[0], ACTOR.id);
  assert.match(pool.queries[0].sql, /WHERE a\.candidate_user_id = \$1/);
});

test('employer cannot list applications for another employer job', async () => {
  const pool = new FakePool({ ownedJobRows: [] });
  await assert.rejects(
    listEmployerApplications(pool, ACTOR, JOB_ID),
    error => error instanceof ApplicationError && error.status === 404
  );
  assert.equal(pool.queries.length, 1);
});

test('employer status changes are ownership checked and recorded transactionally', async () => {
  const pool = new FakePool();
  const result = await updateEmployerApplicationStatus(pool, { id: 72, status: 'active' }, APPLICATION_ID, {
    status: 'viewed',
    note: 'Application reviewed.'
  });

  assert.equal(result.application.status, 'viewed');
  assert.ok(pool.client.calls.some(call => call.sql.includes('INSERT INTO public.application_status_events')));
  assert.ok(pool.client.calls.some(call => call.sql.includes('INSERT INTO public.notifications')));
  assert.equal(pool.client.calls[0].sql, 'BEGIN');
  assert.equal(pool.client.calls.at(-1).sql, 'COMMIT');
});

test('employer cannot skip allowed application status transitions', async () => {
  const pool = new FakePool();
  pool.client.options.applicationRows = [{
    id: APPLICATION_ID,
    job_post_id: JOB_ID,
    candidate_user_id: 51,
    status: 'submitted',
    title: job.title
  }];

  await assert.rejects(
    updateEmployerApplicationStatus(pool, { id: 72, status: 'active' }, APPLICATION_ID, { status: 'hired' }),
    error => error instanceof ApplicationError && error.code === 'INVALID_STATUS_TRANSITION'
  );
  assert.ok(!pool.client.calls.some(call => call.sql.includes('UPDATE public.job_applications')));
});

test('employer application list includes only records for a job they own', async () => {
  const pool = new FakePool();
  const result = await listEmployerApplications(pool, { id: 72, status: 'active' }, JOB_ID);
  assert.equal(result.applications.length, 1);
  assert.match(pool.queries[0].sql, /created_by_user_id = \$2/);
  assert.equal(pool.queries[0].values[1], 72);
});
