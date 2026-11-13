'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {JOB_MODERATION_HTML}=require('../server/job-moderation-ui.cjs');

test('moderation interface uses protected queue and review endpoints',()=>{
 assert.match(JOB_MODERATION_HTML,/\/api\/admin\/jobs\?limit=50/);
 assert.match(JOB_MODERATION_HTML,/jobs\.moderate/);
 assert.match(JOB_MODERATION_HTML,/\/review/);
});

test('moderation requires notes before rejection or changes requested',()=>{
 assert.match(JOB_MODERATION_HTML,/note\.length<5/);
 assert.match(JOB_MODERATION_HTML,/changes_requested/);
 assert.match(JOB_MODERATION_HTML,/data-review="approved"/);
 assert.match(JOB_MODERATION_HTML,/data-review="rejected"/);
});

test('moderation confirmation is required before a public announcement is approved',()=>{
 assert.match(JOB_MODERATION_HTML,/window\.confirm/);
 assert.match(JOB_MODERATION_HTML,/approved/);
});
