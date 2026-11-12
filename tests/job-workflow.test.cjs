'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  JobWorkflowError,
  updateEmployerJobDraft,
  submitEmployerJobForReview,
  closeEmployerJob,
  listModerationQueue,
  reviewEmployerJob
} = require('../server/job-workflow.cjs');

const JOB_ID = 'd14a611e-4f2f-4f2d-8ad3-6343658e1c13';
const ACTOR = { id: 41, status: 'active', created_at: 1780000000000 };

const existingJob = {
  id: JOB_ID, created_by_user_id: 41, employer_user_id: 41, organization_id: null,
  title: 'Abashoferi barakenewe',
  description: 'Dukeneye abashoferi bafite uruhushya rwo gutwara ibinyabiziga n uburambe.',
  category: 'Ubwikorezi', primary_capability_id: null, employment_type: 'full_time',
  work_arrangement: 'on_site', province: 'Umujyi wa Kigali', district: 'Gasabo',
  location_text: null, vacancies: 5, salary_min: null, salary_max: null,
  salary_currency: 'RWF', salary_period: null, salary_visible: true,
  experience_min_years: null, education_level: null,
  requirements: ['Driving licence'], responsibilities: ['Drive safely'],
  application_method: 'in_platform', application_instructions: null,
  external_application_url: null, deadline_at: null, status: 'draft'
};

class FakeClient {
  constructor(options = {}) {
    this.options = options;
    this.calls = [];
    this.released = false;
  }

  async query(sql, values = []) {
    this.calls.push({ sql, values });
    if (this.options.failOn && sql.includes(this.options.failOn)) {
      const error = new Error('simulated database failure');
      error.code = 'XX000';
      throw error;
    }
    if (sql.includes('FROM public.job_posts j') && sql.includes('created_by_user_id')) {
      return { rows: this.options.jobRows === undefined ? [existingJob] : this.options.jobRows };
    }
    if (sql.includes('FROM public.job_posts') && sql.includes('created_by_user_id') && sql.includes('FOR UPDATE')) {
      return { rows: this.options.jobRows === undefined ? [existingJob] : this.options.jobRows };
    }
    if (sql.includes('FROM public.job_posts') && sql.includes('FOR UPDATE')) {
      return { rows: this.options.reviewJobRows === undefined ? [{
        id: JOB_ID, title: existingJob.title, status: 'pending_review', employer_user_id: 41
      }] : this.options.reviewJobRows };
    }
    if (sql.includes('FROM public.employer_profiles')) return { rows: [{ display_name: 'Employer' }] };
    if (sql.includes('FROM public.job_post_skills')) return { rows: [] };
    if (sql.includes('FROM public.job_application_questions')) return { rows: [] };
    if (sql.includes('UPDATE public.job_posts')) {
      const status = sql.includes("status = 'pending_review'") ? 'pending_review'
        : sql.includes("status = 'closed'") ? 'closed'
        : values.includes('approved') ? 'approved'
        : values.includes('changes_requested') ? 'changes_requested'
        : values.includes('rejected') ? 'rejected' : 'draft';
      return { rows: [{
        id: JOB_ID, title: existingJob.title, status, updated_at: '2026-11-12T18:00:00Z',
        moderation_note: values[1] || null, reviewed_at: null, published_at: null, deadline_at: null
      }] };
    }
    return { rows: [] };
  }

  release() { this.released = true; }
}

class FakePool {
  constructor(options = {}) {
    this.client = new FakeClient(options);
    this.options = options;
    this.queries = [];
  }
  async connect() { return this.client; }
  async query(sql, values = []) {
    this.queries.push({ sql, values });
    return { rows: this.options.queueRows || [{ id: JOB_ID, title: existingJob.title, status: 'pending_review' }] };
  }
}

const patch = {
  title: 'Abashoferi bashya barakenewe',
  description: 'Dukeneye abashoferi bashobora gutwara ibinyabiziga mu mujyi wa Kigali.',
  vacancies: 6
};

test('employer edits only their draft and child questions/skills are saved in one transaction', async () => {
  const pool = new FakePool();
  const result = await updateEmployerJobDraft(pool, ACTOR, JOB_ID, patch);
  assert.equal(result.job.status, 'draft');
  const calls = pool.client.calls;
  assert.equal(calls[0].sql, 'BEGIN');
  assert.ok(calls.some(call => call.sql.includes('UPDATE public.job_posts')));
  assert.ok(calls.some(call => call.sql.includes('DELETE FROM public.job_post_skills')));
  assert.ok(calls.some(call => call.sql.includes('DELETE FROM public.job_application_questions')));
  assert.ok(calls.some(call => call.sql.includes("'draft_saved'")));
  assert.equal(calls.at(-1).sql, 'COMMIT');
});

test('employer cannot edit another account job', async () => {
  const pool = new FakePool();
  pool.client.options.jobRows = [];
  await assert.rejects(
    updateEmployerJobDraft(pool, ACTOR, JOB_ID, patch),
    error => error instanceof JobWorkflowError && error.status === 404
  );
  assert.ok(pool.client.calls.some(call => call.sql === 'ROLLBACK'));
});

test('employer cannot edit a job already approved or under review', async () => {
  const pool = new FakePool();
  pool.client.options.jobRows = [{ ...existingJob, status: 'approved' }];
  await assert.rejects(
    updateEmployerJobDraft(pool, ACTOR, JOB_ID, patch),
    error => error instanceof JobWorkflowError && error.code === 'JOB_NOT_EDITABLE'
  );
});

test('employer submits draft for moderation rather than publishing directly', async () => {
  const pool = new FakePool();
  const result = await submitEmployerJobForReview(pool, ACTOR, JOB_ID);
  assert.equal(result.job.status, 'pending_review');
  assert.equal(result.next_step, 'awaiting_moderation');
  assert.ok(pool.client.calls.some(call => call.sql.includes("'submitted'")));
});

test('employer can resubmit a changes-requested advert for review', async () => {
  const pool = new FakePool();
  pool.client.options.jobRows = [{ id: JOB_ID, status: 'changes_requested', deadline_at: null }];
  const result = await submitEmployerJobForReview(pool, ACTOR, JOB_ID);
  assert.equal(result.job.status, 'pending_review');
});

test('employer cannot submit jobs owned by another person or already approved', async () => {
  const missing = new FakePool();
  missing.client.options.jobRows = [];
  await assert.rejects(submitEmployerJobForReview(missing, ACTOR, JOB_ID), error => error.status === 404);

  const approved = new FakePool();
  approved.client.options.jobRows = [{ id: JOB_ID, status: 'approved', deadline_at: null }];
  await assert.rejects(
    submitEmployerJobForReview(approved, ACTOR, JOB_ID),
    error => error.code === 'JOB_NOT_SUBMITTABLE'
  );
});

test('employer closes only their own eligible job and records event', async () => {
  const pool = new FakePool();
  const result = await closeEmployerJob(pool, ACTOR, JOB_ID);
  assert.equal(result.job.status, 'closed');
  assert.ok(pool.client.calls.some(call => call.sql.includes("'closed'")));
});

test('moderation queue uses a bounded limit and returns pending review jobs only', async () => {
  const pool = new FakePool();
  const result = await listModerationQueue(pool, { limit: 1000 });
  assert.equal(result.jobs.length, 1);
  assert.equal(pool.queries[0].values[0], 100);
  assert.match(pool.queries[0].sql, /j\.status = 'pending_review'/);
});

test('moderator approves a pending post and notifies its employer', async () => {
  const pool = new FakePool();
  const result = await reviewEmployerJob(pool, { id: 9, status: 'active' }, JOB_ID, { action: 'approved' });
  assert.equal(result.job.status, 'approved');
  assert.ok(pool.client.calls.some(call => call.sql.includes('INSERT INTO public.job_moderation_events')));
  assert.ok(pool.client.calls.some(call => call.sql.includes('INSERT INTO public.notifications')));
});

test('moderator requires a reason for rejection or requested changes', async () => {
  const pool = new FakePool();
  await assert.rejects(
    reviewEmployerJob(pool, { id: 9, status: 'active' }, JOB_ID, { action: 'rejected' }),
    error => error instanceof JobWorkflowError && error.code === 'MODERATION_NOTE_REQUIRED'
  );
});

test('moderator cannot review a job that is not pending moderation', async () => {
  const pool = new FakePool();
  pool.client.options.reviewJobRows = [{ id: JOB_ID, status: 'approved', employer_user_id: 41 }];
  await assert.rejects(
    reviewEmployerJob(pool, { id: 9, status: 'active' }, JOB_ID, { action: 'rejected', note: 'Duplicate advert.' }),
    error => error instanceof JobWorkflowError && error.code === 'JOB_NOT_PENDING_REVIEW'
  );
});

test('job workflow rolls back on failed child-record updates', async () => {
  const pool = new FakePool({ failOn: 'DELETE FROM public.job_application_questions' });
  await assert.rejects(updateEmployerJobDraft(pool, ACTOR, JOB_ID, patch), /simulated database failure/);
  assert.ok(pool.client.calls.some(call => call.sql === 'ROLLBACK'));
  assert.ok(!pool.client.calls.some(call => call.sql === 'COMMIT'));
});
