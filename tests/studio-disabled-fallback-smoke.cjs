'use strict';

// This runs in a clean Node process so the server reads the disabled flag
// before loading its modules, matching a deployment where the flag is absent.
const oldFlag = process.env.AHABONA_STUDIO_BETA;
delete process.env.AHABONA_STUDIO_BETA;

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { start } = require('../server-v2.cjs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-studio-disabled-'));
let app = null;

async function get(base, route) {
  const response = await fetch(base + route);
  const body = await response.text();
  let json = null;
  try { json = JSON.parse(body); } catch (_) {}
  return { response, body, json };
}

(async function main() {
  try {
    app = start({ dataDir: tmp, publicDir: tmp, secure: false, dev: true });
    await app.adminBoot;
    const port = await app.listen(0);
    const base = 'http://127.0.0.1:' + port;

    // With no opt-in flag, Studio must remain unavailable and uninitialized.
    const playlist = await get(base, '/api/studio/playlist');
    assert.equal(playlist.response.status, 200);
    assert.deepEqual(playlist.json, { enabled: false, scenes: [] });
    assert.equal(playlist.response.headers.get('cache-control'), 'no-store');

    // Legacy strip remains live and populated under the disabled configuration.
    const legacyBefore = await get(base, '/api/strip');
    assert.equal(legacyBefore.response.status, 200);
    assert.ok(Array.isArray(legacyBefore.json.ads));
    assert.ok(legacyBefore.json.ads.length > 0);
    const oldCount = app.db.prepare('SELECT COUNT(*) AS n FROM strip_ads').get().n;

    // Studio UI, renderer, and media routes must not be exposed accidentally.
    for (const route of [
      '/admin/studio',
      '/admin/studio/editor.js',
      '/studio-renderer.js',
      '/studio-renderer.css',
      '/studio-media/1'
    ]) {
      const result = await get(base, route);
      assert.equal(result.response.status, 404, route + ' must stay disabled without AHABONA_STUDIO_BETA');
    }

    const legacyAfter = await get(base, '/api/strip');
    assert.equal(legacyAfter.response.status, 200);
    assert.ok(legacyAfter.json.ads.length > 0);
    assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM strip_ads').get().n, oldCount,
      'disabled Studio startup must not alter legacy strip rows');

    console.log('Studio-disabled fallback smoke test passed.');
  } finally {
    if (app) {
      try { await app.close(); } catch (_) {}
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    if (oldFlag === undefined) delete process.env.AHABONA_STUDIO_BETA;
    else process.env.AHABONA_STUDIO_BETA = oldFlag;
  }
})().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
