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
// Bootstrap a disposable super-admin only in this test's temporary database.
process.env.ADMIN_EMAIL = 'studio-test@example.test';
process.env.ADMIN_PHONE = '0781234567';
process.env.ADMIN_PASSWORD = 'Studio-test-pass-2026';

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

    // Studio's data APIs must not leak drafts or settings to anonymous visitors.
    for (const endpoint of [
      '/api/admin/studio/scenes',
      '/api/admin/studio/assets',
      '/api/admin/studio/settings'
    ]) {
      const protectedApi = await request(base, endpoint);
      assert.equal(protectedApi.response.status, 401, endpoint + ' must require admin login');
    }

    // A ready asset attached only to a draft must remain private to anonymous users.
    const privateAsset = app.ctx.studio.createAsset(app.db, {
      asset_kind:'image', storage_key:'studio-private123.jpg', mime_type:'image/jpeg',
      bytes:256, width:10, height:10
    }, {now:Date.now()});
    app.ctx.studio.updateAssetStatus(app.db, privateAsset.id, 'ready', {width:10,height:10});
    app.ctx.studio.createScene(app.db, {
      scene_kind:'image', title_rw:'Private draft', asset_id:privateAsset.id, status:'draft'
    });
    const privateMedia = await request(base, '/studio-media/' + privateAsset.id);
    assert.equal(privateMedia.response.status, 404, 'draft media must not be exposed publicly');

    // Sign in as the disposable test admin and exercise the authenticated UI
    // asset routes, including the renderer MIME types.
    const login = await request(base, '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'studio-test@example.test', password: 'Studio-test-pass-2026' })
    });
    assert.equal(login.response.status, 200);
    assert.equal(login.json.staff, true);
    const cookie = (login.response.headers.get('set-cookie') || '').split(';')[0];
    assert.match(cookie, /^ahs=/);
    for (const [pathname, mime, marker] of [
      ['/admin/studio', 'text/html', 'AHABONA Studio'],
      ['/admin/studio/editor.css', 'text/css', '.topbar'],
      ['/admin/studio/renderer.css', 'text/css', '.studio-track'],
      ['/admin/studio/renderer.js', 'text/javascript', 'AhabonaStudioRenderer'],
      ['/admin/studio/editor.js', 'text/javascript', 'async function uploadAsset']
    ]) {
      const asset = await request(base, pathname, { headers: { Cookie: cookie } });
      assert.equal(asset.response.status, 200, pathname + ' should load for an admin');
      assert.ok((asset.response.headers.get('content-type') || '').startsWith(mime), pathname + ' MIME type');
      assert.ok(asset.body.includes(marker), pathname + ' content marker');
      assert.equal(asset.response.headers.get('cache-control'), 'no-store', pathname + ' must not be cached');
    }

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
