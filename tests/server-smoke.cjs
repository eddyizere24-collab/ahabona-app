'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const previousFlag = process.env.AHABONA_STUDIO_BETA;
delete process.env.AHABONA_STUDIO_BETA;

const { start } = require('../server-v2.cjs');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-server-smoke-'));
const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-public-smoke-'));
let app = null;

async function get(base, route) {
  const response = await fetch(base + route);
  const body = await response.text();
  let json = null;
  try { json = JSON.parse(body); } catch (_) {}
  return { response, body, json };
}

async function checkServiceWorkerCachePolicy(source, origin) {
  const handlers = {};
  const calls = { fetch: 0, match: 0, open: 0, put: 0 };
  const cache = {
    addAll: async function () {},
    put: async function () { calls.put += 1; },
    keys: async function () { return []; }
  };
  const cacheStorage = {
    keys: async function () { return []; },
    open: async function () { calls.open += 1; return cache; },
    match: async function () { calls.match += 1; return null; }
  };
  const serviceWorker = {
    location: { origin: origin },
    addEventListener: function (name, handler) { handlers[name] = handler; },
    clients: { claim: async function () {} },
    skipWaiting: async function () {}
  };
  const workerFetch = async function () {
    calls.fetch += 1;
    return new Response('network response', { status: 200 });
  };
  vm.runInNewContext(source, {
    self: serviceWorker,
    caches: cacheStorage,
    URL: URL,
    Response: Response,
    fetch: workerFetch,
    Promise: Promise
  }, { filename: 'ahabona-sw.js' });
  assert.equal(source.includes("ahabona-shell-v10"), true, 'cache version must advance to evict the old shell containing reset URLs');
  assert.equal(typeof handlers.fetch, 'function', 'service worker fetch handler must be registered');

  async function dispatch(pathname) {
    const event = {
      request: { method: 'GET', url: origin + pathname, mode: 'navigate' },
      respondWith: function (promise) { event.response = promise; }
    };
    handlers.fetch(event);
    assert.ok(event.response, pathname + ' must be handled');
    const response = await event.response;
    await new Promise(function (resolve) { setImmediate(resolve); });
    return response;
  }

  const resetResponse = await dispatch('/reset/test-reset-token');
  assert.equal(resetResponse.status, 200);
  assert.equal(calls.fetch, 1, 'reset route must use the network');
  assert.equal(calls.match, 0, 'reset route must not read from Cache Storage');
  assert.equal(calls.open, 0, 'reset route must not open a cache');
  assert.equal(calls.put, 0, 'reset route must not be written to Cache Storage');

  const publicResponse = await dispatch('/u/a1b2c3d4');
  assert.equal(publicResponse.status, 200);
  assert.equal(calls.fetch, 2);
  assert.equal(calls.open, 1, 'ordinary public pages should retain normal shell caching');
  assert.equal(calls.put, 1, 'ordinary public pages should still be cached');
}

(async function main() {
  try {
    app = start({ dataDir, publicDir, secure: false, dev: true });
    await app.adminBoot;
    const port = await app.listen(0);
    const base = 'http://127.0.0.1:' + port;

    const home = await get(base, '/');
    assert.equal(home.response.status, 200);
    assert.match(home.body, /AHABONA/);
    assert.match(home.body, /<title>AHABONA \| Shaka abantu bafite ubumenyi na serivisi mu Rwanda<\/title>/);
    assert.match(home.body, /<h1 class="home-heading" data-i18n="home.heading">/);
    assert.match(home.body, /href="\/people"/);
    const homeDescription = home.body.match(/<meta name="description" content="([^"]+)"/);
    assert.ok(homeDescription, 'homepage meta description must exist');
    assert.ok(homeDescription[1].length <= 160, 'homepage meta description must be search-snippet length');
    assert.match(home.body, /rel="canonical"/);
    assert.match(home.body, /application\/ld\+json/);

    const health = await get(base, '/api/health');
    assert.equal(health.response.status, 200);
    assert.equal(health.json.ok, true);

    const robots = await get(base, '/robots.txt');
    assert.equal(robots.response.status, 200);
    assert.match(robots.body, /User-agent: OAI-SearchBot\nAllow: \//);
    assert.match(robots.body, /User-agent: GPTBot\nDisallow: \//);
    assert.match(robots.body, /Disallow: \/api\//);

    const sitemap = await get(base, '/sitemap.xml');
    assert.equal(sitemap.response.status, 200);
    assert.match(sitemap.body, /<urlset/);
    assert.match(sitemap.body, /\/about/);
    assert.match(sitemap.body, /\/how-it-works/);
    assert.match(sitemap.body, /\/people/);

    for (const route of ['/about', '/how-it-works', '/people', '/services/umushoferi']) {
      const result = await get(base, route);
      assert.equal(result.response.status, 200, route);
      assert.match(result.body, /canonical/);
    }

    const peopleDirectory = await get(base, '/people');
    assert.equal(peopleDirectory.response.status, 200);
    assert.match(peopleDirectory.body, /name="robots" content="noindex,follow"/);

    for (const [route, title] of [
      ['/terms', 'Amabwiriza yo gukoresha AHABONA'],
      ['/privacy', 'Amabwiriza y’Ibanga']
    ]) {
      const legal = await get(base, route);
      assert.equal(legal.response.status, 200, route);
      assert.ok(legal.body.includes(title), route + ' must keep its visible title');
      assert.match(legal.body, /name="robots" content="noindex,follow"/, route + ' draft must stay out of search results until approved');
      const description = legal.body.match(/<meta name="description" content="([^"]+)"/);
      assert.ok(description, route + ' must have an accurate description');
      assert.ok(description[1].length <= 160, route + ' description must fit a search snippet');
      assert.match(legal.body, /INYANDIKO Y’AGATEGANYO/, route + ' must retain its draft notice');
    }

    const resetPage = await fetch(base + '/reset/test-reset-token');
    assert.equal(resetPage.status, 200);
    assert.equal(resetPage.headers.get('cache-control'), 'no-store');

    const serviceWorker = await get(base, '/sw.js');
    assert.equal(serviceWorker.response.status, 200);
    assert.match(serviceWorker.body, /ahabona-shell-v10/);
    await checkServiceWorkerCachePolicy(serviceWorker.body, base);

    const missingProfile = await fetch(base + '/u/zzzzzzzz');
    assert.equal(missingProfile.status, 404);
    assert.equal(missingProfile.headers.get('x-robots-tag'), 'noindex, nofollow');

    const config = await get(base, '/api/config');
    assert.equal(config.response.status, 200);
    assert.ok(Array.isArray(config.json.capabilities));
    assert.ok(config.json.capabilities.length > 0);

    const anonymousAdmin = await get(base, '/api/admin/summary');
    assert.equal(anonymousAdmin.response.status, 401);

    const playlist = await get(base, '/api/studio/playlist');
    assert.equal(playlist.response.status, 200);
    assert.deepEqual(playlist.json, { enabled: false, scenes: [] });

    const legacyStrip = await get(base, '/api/strip');
    assert.equal(legacyStrip.response.status, 200);
    assert.ok(Array.isArray(legacyStrip.json.ads));
    assert.ok(legacyStrip.json.ads.length > 0);

    console.log('AHABONA native server smoke tests passed.');
  } finally {
    if (app) {
      try { await app.close(); } catch (_) {}
    }
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(publicDir, { recursive: true, force: true });
    if (previousFlag === undefined) delete process.env.AHABONA_STUDIO_BETA;
    else process.env.AHABONA_STUDIO_BETA = previousFlag;
  }
})().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
