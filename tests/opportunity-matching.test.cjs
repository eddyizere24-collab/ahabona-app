'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateMatchScore } = require('../server/opportunity-matching.cjs');

const job = {
  primary_capability_id: 12,
  skill_capability_ids: [14],
  employment_type: 'full_time',
  work_arrangement: 'on_site',
  province: 'Umujyi wa Kigali',
  district: 'Gasabo',
  salary_min: 300000,
  salary_max: 400000
};

test('matching requires an explicit shared capability, not guessed title text', () => {
  assert.equal(calculateMatchScore(job, { profile_caps: '[1,2]', preferred_capability_ids: '[]' }), null);
  assert.ok(calculateMatchScore(job, { profile_caps: '[12]', preferred_capability_ids: '[]' }));
});

test('matching rewards exact district, employment and salary preference', () => {
  const score = calculateMatchScore(job, {
    profile_caps: [12],
    preferred_capability_ids: [],
    preferred_districts: ['Gasabo'],
    preferred_provinces: ['Umujyi wa Kigali'],
    employment_types: ['full_time'],
    min_salary: 350000
  });
  assert.equal(score.score, 1);
  assert.equal(score.reasons.length, 4);
});

test('nonmatching location or work type does not get a false perfect score', () => {
  const score = calculateMatchScore(job, {
    profile_caps: [12],
    preferred_capability_ids: [],
    preferred_districts: ['Rubavu'],
    preferred_provinces: ['Iburengerazuba'],
    employment_types: ['part_time'],
    min_salary: 900000
  });
  assert.ok(score.score < 0.8);
  assert.equal(score.reasons.length, 1);
});

test('remote jobs do not penalize location preferences', () => {
  const score = calculateMatchScore({ ...job, work_arrangement: 'remote' }, {
    profile_caps: [12], preferred_capability_ids: [], preferred_districts: ['Rubavu'],
    preferred_provinces: ['Iburengerazuba'], employment_types: [], min_salary: null
  });
  assert.ok(score.score >= 0.8);
});

test('preferred capabilities can include skills not yet shown in the profile', () => {
  const score = calculateMatchScore(job, {
    profile_caps: [], preferred_capability_ids: [14], preferred_districts: [],
    preferred_provinces: [], employment_types: [], min_salary: null
  });
  assert.ok(score);
});
