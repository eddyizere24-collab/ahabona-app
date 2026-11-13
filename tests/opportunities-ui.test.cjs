'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { OPPORTUNITIES_HTML } = require('../server/opportunities-ui.cjs');

test('public opportunities page is a standalone, mobile-first job discovery experience', () => {
  assert.match(OPPORTUNITIES_HTML, /<html lang="rw">/);
  assert.match(OPPORTUNITIES_HTML, /name="viewport"/);
  assert.match(OPPORTUNITIES_HTML, /id="list-view"/);
  assert.match(OPPORTUNITIES_HTML, /id="detail-view"/);
  assert.match(OPPORTUNITIES_HTML, /id="post-view"/);
  assert.match(OPPORTUNITIES_HTML, /id="dashboard-view"/);
  assert.match(OPPORTUNITIES_HTML, /\/api\/jobs/);
});

test('public visitors can view opportunities without signing in', () => {
  assert.match(OPPORTUNITIES_HTML, /Reba imyanya y'akazi yatangajwe/);
  assert.match(OPPORTUNITIES_HTML, /gusoma utariyandikishije/);
  assert.match(OPPORTUNITIES_HTML, /GET','\/api\/jobs/);
});

test('in-platform applications use the protected AHABONA application API', () => {
  assert.match(OPPORTUNITIES_HTML, /POST','\/api\/jobs\/'/);
  assert.match(OPPORTUNITIES_HTML, /\/applications/);
  assert.match(OPPORTUNITIES_HTML, /cover_message/);
});

test('employer form submits a structured job announcement to moderation', () => {
  assert.match(OPPORTUNITIES_HTML, /Ohereza itangazo rijye kugenzurwa/);
  assert.match(OPPORTUNITIES_HTML, /application_method/);
  assert.match(OPPORTUNITIES_HTML, /external_application_url/);
  assert.match(OPPORTUNITIES_HTML, /pending_review/);
});
