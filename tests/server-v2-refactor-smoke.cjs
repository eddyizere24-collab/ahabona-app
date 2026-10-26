'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const legacyServer = require('../server-v2.cjs');
const modularServer = require('../server-v2-refactor-test.cjs');

const envKeys = [
  'MAIL_API_URL',
  'MAIL_API_KEY',
  'MAIL_FROM',
  'ADMIN_EMAIL',
  'ADMIN_PHONE',
  'ADMIN_PASSWORD',
  'AHABONA_URL',
  'AHABONA_DATA',
  'AHABONA_DEV',
  'AHABONA_SECURE',
  'PORT'
];
const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of envKeys) {
    if (previousEnv[key] === undefined) delete process.env[key];
    else process.env[key] = previousEnv[key];
  }
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function closeServer(server) {
  return new Promise((resolve) => {
    if (!server || !server.listening) return resolve();
    server.close(() => resolve());
  });
}

async function postJson(base, route, body, cookie) {
  const headers = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return fetch(base + route, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-modular-test-'));
  const mailRequests = [];
  const mailRelay = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        mailRequests.push({
          method: req.method,
          url: req.url,
          authorization: req.headers.authorization,
          body: JSON.parse(Buffer.concat(chunks).toString('utf8'))
        });
        res.writeHead(202, { 'content-type': 'application/json' });
        res.end('{"ok":true}');
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end('{"ok":false}');
      }
    });
  });

  let legacyApp = null;
  let app = null;

  try {
    const relayPort = await listen(mailRelay);
    process.env.MAIL_API_URL = 'http://127.0.0.1:' + relayPort + '/send';
    process.env.MAIL_API_KEY = 'test-only-key';
    process.env.MAIL_FROM = 'test-sender@example.com';
    process.env.ADMIN_EMAIL = 'ci-admin@example.com';
    process.env.ADMIN_PHONE = '0790000000';
    process.env.ADMIN_PASSWORD = 'TestAdminPass123!';
    process.env.AHABONA_URL = 'http://127.0.0.1';
    process.env.AHABONA_DATA = dataDir;

    // Create a scratch database with the original server, then reopen it using
    // the modular copy to check that existing user/profile rows survive startup.
    legacyApp = legacyServer.start({ dataDir, secure: false, dev: true });
    await legacyApp.adminBoot;
    const createdAt = Date.now();
    const inserted = legacyApp.db.prepare(
      'INSERT INTO users(email,phone,pw,terms_at,created_at) VALUES(?,?,?,?,?)'
    ).run('legacy-fixture@example.com', '0780000001', 'fixture-password-hash', createdAt, createdAt);
    const legacyUserId = Number(inserted.lastInsertRowid);
    legacyApp.db.prepare(
      'INSERT INTO profiles(user_id,pid,name,district,caps,created_at,updated_at) VALUES(?,?,?,?,?,?,?)'
    ).run(legacyUserId, 'legacyci01', 'Legacy Fixture', 'Gasabo', '[]', createdAt, createdAt);
    await legacyApp.listen(0);
    await legacyApp.close();
    legacyApp = null;

    app = modularServer.start({ dataDir, secure: false, dev: false });
    const adminBoot = await app.adminBoot;
    assert.equal(adminBoot.ok, true, 'admin bootstrap should work on the scratch database');

    const preservedUser = app.db.prepare(
      'SELECT email,phone FROM users WHERE email=?'
    ).get('legacy-fixture@example.com');
    assert.ok(preservedUser, 'old user row should remain after modular startup');
    assert.equal(preservedUser.phone, '0780000001');
    const preservedProfile = app.db.prepare(
      'SELECT name,district FROM profiles WHERE pid=?'
    ).get('legacyci01');
    assert.deepEqual(preservedProfile, { name: 'Legacy Fixture', district: 'Gasabo' });

    const port = await app.listen(0);
    const base = 'http://127.0.0.1:' + port;

    for (const route of ['/', '/app.js', '/admin', '/admin.js', '/terms', '/privacy', '/splash.js', '/sw.js']) {
      const response = await fetch(base + route);
      const text = await response.text();
      assert.equal(response.status, 200, 'asset route should work: ' + route + '; body=' + text.slice(0, 160));
      assert.ok(text.length > 0, 'asset should not be empty: ' + route);
    }

    const healthResponse = await fetch(base + '/api/health');
    assert.equal(healthResponse.status, 200, 'health endpoint should respond');
    const healthText = await healthResponse.text();
    assert.doesNotThrow(() => JSON.parse(healthText), 'health endpoint should return JSON');

    const configResponse = await fetch(base + '/api/config');
    assert.equal(configResponse.status, 200, 'config endpoint should respond');
    const configText = await configResponse.text();
    assert.doesNotThrow(() => JSON.parse(configText), 'config endpoint should return JSON');

    const invalid = await postJson(base, '/api/register', {});
    assert.equal(invalid.status, 400, 'invalid registration should be rejected');

    const validProfile = {
      name: 'CI Test Member',
      birthdate: '1992-02-02',
      gender: 'm',
      district: 'Gasabo',
      jobs: ['Umubaji'],
      other: '',
      intro: 'Automated test profile',
      edu: '',
      soc: '',
      phone: '0781234567',
      phone_visible: true,
      phones: [],
      svc: [],
      email: 'ci-member@example.com',
      password: 'TestMemberPass123!',
      terms: true,
      photos: [],
      thumbs: [],
      languages: ['rw'],
      availability: []
    };

    const registration = await postJson(base, '/api/register', validProfile);
    const registrationText = await registration.text();
    assert.equal(registration.status, 201, 'valid registration should succeed: ' + registrationText.slice(0, 500));
    const registrationResult = JSON.parse(registrationText);
    assert.ok(registrationResult.profile && registrationResult.profile.pid, 'registration should return a profile');

    const welcome = mailRequests.find((item) =>
      item.body && item.body.to === 'ci-member@example.com' &&
      item.body.subject === 'AHABONA: Murakaza neza / Welcome'
    );
    assert.ok(welcome, 'successful registration should send the welcome email to the configured relay');
    assert.equal(welcome.method, 'POST');
    assert.equal(welcome.url, '/send');
    assert.equal(welcome.authorization, 'Bearer test-only-key');
    assert.equal(welcome.body.from, 'test-sender@example.com');

    const duplicatePhone = Object.assign({}, validProfile, {
      email: 'ci-phone-duplicate@example.com',
      phone: '+250781234567'
    });
    const phoneDuplicateResponse = await postJson(base, '/api/register', duplicatePhone);
    assert.equal(phoneDuplicateResponse.status, 409, 'duplicate phone should be rejected, including +250 normalization');

    const duplicateEmail = Object.assign({}, validProfile, {
      email: 'ci-member@example.com',
      phone: '0791234567'
    });
    const emailDuplicateResponse = await postJson(base, '/api/register', duplicateEmail);
    assert.equal(emailDuplicateResponse.status, 409, 'duplicate email should be rejected');

    const login = await postJson(base, '/api/login', {
      id: 'ci-member@example.com',
      password: 'TestMemberPass123!'
    });
    const loginText = await login.text();
    assert.equal(login.status, 200, 'new member should be able to log in: ' + loginText.slice(0, 300));
    const memberCookieHeader = login.headers.get('set-cookie') || '';
    assert.ok(memberCookieHeader.includes('ahs='), 'login should create a session cookie');
    const memberCookie = memberCookieHeader.split(';')[0];

    const me = await fetch(base + '/api/me', { headers: { cookie: memberCookie } });
    assert.equal(me.status, 200, 'logged-in member endpoint should work');
    const meData = await me.json();
    assert.equal(meData.user.email, 'ci-member@example.com');

    const adminLogin = await postJson(base, '/api/login', {
      id: 'ci-admin@example.com',
      password: 'TestAdminPass123!'
    });
    const adminLoginText = await adminLogin.text();
    assert.equal(adminLogin.status, 200, 'bootstrapped admin should be able to log in: ' + adminLoginText.slice(0, 300));
    const adminCookieHeader = adminLogin.headers.get('set-cookie') || '';
    assert.ok(adminCookieHeader.includes('ahs='), 'admin login should create a session cookie');

    const adminSummary = await fetch(base + '/api/admin/summary', {
      headers: { cookie: adminCookieHeader.split(';')[0] }
    });
    assert.equal(adminSummary.status, 200, 'admin route should work for the bootstrapped admin');

    assert.equal(mailRequests.length, 1, 'only the successful signup should send an email in this test');
    console.log('PASS: modular startup, existing DB rows, assets, health/config, registration, phone/email uniqueness, welcome-email relay, member login, and admin route.');
  } finally {
    if (app) {
      try { await app.close(); } catch (error) {}
    }
    if (legacyApp) {
      try { await legacyApp.close(); } catch (error) {}
    }
    await closeServer(mailRelay);
    fs.rmSync(dataDir, { recursive: true, force: true });
    restoreEnv();
  }
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
