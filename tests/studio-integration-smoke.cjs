'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const savedEnv = {
  beta: process.env.AHABONA_STUDIO_BETA,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPhone: process.env.ADMIN_PHONE,
  adminPassword: process.env.ADMIN_PASSWORD
};
process.env.AHABONA_STUDIO_BETA = '1';
delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PHONE;
delete process.env.ADMIN_PASSWORD;

const { start } = require('../server-v2.cjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-studio-integration-'));
let app = null;

async function request(base, pathname, options) {
  const response = await fetch(base + pathname, options);
  const body = await response.text();
  let json = null;
  try { json = JSON.parse(body); } catch (_) {}
  return { response, body, json };
}

(async function main() {
  let base = null;
  try {
    app = start({ dataDir: tmp, publicDir: tmp, secure: false, dev: true });
    await app.adminBoot;
    const port = await app.listen(0);
    base = 'http://127.0.0.1:' + port;

    // Studio is opt-in and must start disabled with no public scenes.
    const before = await request(base, '/api/studio/playlist');
    assert.equal(before.response.status, 200);
    assert.equal(before.json.enabled, false);
    assert.deepEqual(before.json.scenes, []);

    // The legacy strip API remains present and populated.
    const legacyBefore = await request(base, '/api/strip');
    assert.equal(legacyBefore.response.status, 200);
    assert.ok(Array.isArray(legacyBefore.json.ads));
    assert.ok(legacyBefore.json.ads.length > 0);
    const legacyCount = app.db.prepare('SELECT COUNT(*) n FROM strip_ads').get().n;

    // A text scene can be published in the isolated DB and appears publicly
    // only after the Studio switch is enabled.
    const now = Date.now();
    const scene = app.ctx.studio.createScene(app.db, {
      scene_kind: 'text',
      title_rw: 'Igenzura rya Studio',
      body_rw: 'Iyi ni test yihariye.',
      status: 'published',
      duration_ms: 5000
    }, { now, actorId: 1 });
    app.ctx.studio.updateSettings(app.db, { enabled: true }, { now: now + 1 });

    const after = await request(base, '/api/studio/playlist');
    assert.equal(after.response.status, 200);
    assert.equal(after.json.enabled, true);
    assert.equal(after.json.scenes.length, 1);
    assert.equal(after.json.scenes[0].id, scene.id);
    assert.equal(after.json.scenes[0].title_rw, 'Igenzura rya Studio');
    assert.equal(Object.prototype.hasOwnProperty.call(after.json.scenes[0], 'storage_key'), false);

    // Admin UI remains protected, while its JS/CSS renderer assets load.
    const protectedEditor = await request(base, '/admin/studio');
    assert.equal(protectedEditor.response.status, 401);
    const editorScript = await request(base, '/admin/studio/editor.js');
    assert.equal(editorScript.response.status, 401);
    const rendererScript = await request(base, '/studio-renderer.js');
    assert.equal(rendererScript.response.status, 200);
    assert.match(rendererScript.body, /AhabonaStudioRenderer/);
    assert.equal(rendererScript.response.headers.get('cache-control'), 'no-store');
    const rendererCss = await request(base, '/studio-renderer.css');
    assert.equal(rendererCss.response.status, 200);
    assert.match(rendererCss.body, /studio-preview-stage/);
    assert.equal(rendererCss.response.headers.get('cache-control'), 'no-store');

    // Service worker must not cache authenticated Studio pages, Studio media,
    // or the renderer by URL, which could otherwise leave stale JS/CSS.
    const sw = await request(base, '/sw.js');
    assert.equal(sw.response.status, 200);
    assert.ok(sw.body.includes("p.indexOf('/studio-media/')===0"));
    assert.ok(sw.body.includes("p==='/studio-renderer.js'"));
    assert.ok(sw.body.includes("p.indexOf('/admin/studio/')===0"));

    // Existing strip data and API are still unchanged by Studio operations.
    const legacyAfter = await request(base, '/api/strip');
    assert.equal(legacyAfter.response.status, 200);
    assert.ok(legacyAfter.json.ads.length > 0);
    assert.equal(app.db.prepare('SELECT COUNT(*) n FROM strip_ads').get().n, legacyCount);

    console.log('Studio server integration smoke tests passed.');
  } finally {
    if (app) {
      try { await app.close(); } catch (_) {}
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    if (savedEnv.beta === undefined) delete process.env.AHABONA_STUDIO_BETA;
    else process.env.AHABONA_STUDIO_BETA = savedEnv.beta;
    for (const [name, value] of [['ADMIN_EMAIL', savedEnv.adminEmail], ['ADMIN_PHONE', savedEnv.adminPhone], ['ADMIN_PASSWORD', savedEnv.adminPassword]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
})().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
