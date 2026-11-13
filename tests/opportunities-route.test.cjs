'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { start } = require('../server-v2.cjs');

test('opportunities route loads while preserving the existing people-discovery homepage', async t => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-opportunities-smoke-'));
  const previousEnable = process.env.AHABONA_ENABLE_POSTGRES;
  const previousDatabaseUrl = process.env.AHABONA_DATABASE_URL;
  delete process.env.AHABONA_ENABLE_POSTGRES;
  delete process.env.AHABONA_DATABASE_URL;

  const app = start({ dataDir, secure: false, dev: true });
  t.after(async () => {
    await app.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
    if (previousEnable === undefined) delete process.env.AHABONA_ENABLE_POSTGRES;
    else process.env.AHABONA_ENABLE_POSTGRES = previousEnable;
    if (previousDatabaseUrl === undefined) delete process.env.AHABONA_DATABASE_URL;
    else process.env.AHABONA_DATABASE_URL = previousDatabaseUrl;
  });

  const port = await app.listen(0);
  const base = 'http://127.0.0.1:' + port;

  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /id="jobs-entry"/);
  assert.match(homeHtml, /id="grid"/);
  assert.match(homeHtml, /Menya abantu/);

  const opportunities = await fetch(base + '/opportunities');
  assert.equal(opportunities.status, 200);
  const opportunitiesHtml = await opportunities.text();
  assert.match(opportunitiesHtml, /Amahirwe y'akazi/);
  assert.match(opportunitiesHtml, /id="post-form"/);
  assert.match(opportunitiesHtml, /id="detail-view"/);

  const health = await fetch(base + '/api/health');
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.ok, true);

  const jobsWithoutPostgres = await fetch(base + '/api/jobs');
  assert.equal(jobsWithoutPostgres.status, 503);
});
