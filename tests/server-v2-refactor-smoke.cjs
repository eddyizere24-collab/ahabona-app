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

async function requestJson(base, route, method, body, cookie) {
  const headers = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return fetch(base + route, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function postJson(base, route, body, cookie) {
  return requestJson(base, route, 'POST', body, cookie);
}

async function putJson(base, route, body, cookie) {
  return requestJson(base, route, 'PUT', body, cookie);
}

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-modular-test-'));
  const baselineDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-baseline-test-'));
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
  let baselineApp = null;

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
    assert.ok(preservedProfile, 'legacy profile row should remain after modular startup');
    assert.equal(preservedProfile.name, 'Legacy Fixture');
    assert.equal(preservedProfile.district, 'Gasabo');

    const port = await app.listen(0);
    const base = 'http://127.0.0.1:' + port;

    // Compare every extracted embedded asset against the still-unmodified server.
    baselineApp = legacyServer.start({ dataDir: baselineDataDir, secure: false, dev: false });
    await baselineApp.adminBoot;
    const baselinePort = await baselineApp.listen(0);
    const baseline = 'http://127.0.0.1:' + baselinePort;
    const assetRoutes = [
      '/', '/index.html', '/admin', '/admin.html', '/admin.js',
      '/legal.css', '/terms', '/terms.html', '/privacy', '/privacy.html',
      '/splash.js', '/sw.js'
    ];
    for (const route of assetRoutes) {
      const [modularResponse, originalResponse] = await Promise.all([
        fetch(base + route),
        fetch(baseline + route)
      ]);
      const [modularText, originalText] = await Promise.all([
        modularResponse.text(),
        originalResponse.text()
      ]);
      assert.equal(modularResponse.status, 200, 'modular asset route should work: ' + route);
      assert.equal(originalResponse.status, 200, 'original asset route should work: ' + route);
      assert.equal(modularText, originalText, 'extracted asset must be byte-for-byte equivalent: ' + route);
    }

    // The client dictionaries must cover the same keys in both supported languages.
    const clientAppSource = fs.readFileSync(
      path.join(__dirname, '../server-v2-modules/assets/app.js'), 'utf8'
    );
    const rwStart = clientAppSource.indexOf('  rw:{');
    const enStart = clientAppSource.indexOf('  en:{');
    const enEnd = clientAppSource.indexOf("\n  }\n};", enStart);
    assert.ok(rwStart >= 0 && enStart > rwStart && enEnd > enStart,
      'both Kinyarwanda and English dictionaries should exist');
    function localeKeys(text) {
      return [...text.matchAll(/'([^']+)'\s*:/g)].map((match) => match[1]).sort();
    }
    assert.deepEqual(
      localeKeys(clientAppSource.slice(rwStart, enStart)),
      localeKeys(clientAppSource.slice(enStart, enEnd)),
      'Kinyarwanda and English should define matching translation keys'
    );

    // Regression checks for the registration phone-consent and Back-navigation bugs.
    assert.match(clientAppSource, /rgSet\('phone_visible',!!el\.checked\)/,
      'phone visibility consent must be saved when the checkbox changes');
    assert.match(clientAppSource, /if\(!d\.phone_visible\)return 'reg\.err\.phone\.agree';/,
      'registration must require explicit phone visibility consent');
    assert.equal(
      (clientAppSource.match(/body\.phone_visible=!!d\.phone_visible/g) || []).length,
      2,
      'registration and profile edits must submit stored phone visibility state'
    );
    assert.match(clientAppSource, /isRegisterStep&&typeof RG!=='undefined'&&RG\.step>1/,
      'browser Back should navigate to the previous registration step first');

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
    const originalInvalid = await postJson(baseline, '/api/register', {});
    assert.equal(originalInvalid.status, invalid.status, 'invalid registration status must match the original server');
    assert.deepEqual(await originalInvalid.json(), await invalid.clone().json(), 'invalid registration error shape must match the original server');

    const photoFixture = Buffer.alloc(256, 0x5a);
    photoFixture[0] = 0xff;
    photoFixture[1] = 0xd8;
    const photoData = 'data:image/jpeg;base64,' + photoFixture.toString('base64');

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
      photos: [photoData],
      thumbs: [photoData],
      languages: ['rw'],
      availability: []
    };

    // Consent is mandatory at registration: unchecked or missing consent must not
    // create an account or send a welcome email.
    for (const [label, consent] of [['unchecked', false], ['missing', undefined]]) {
      const refusedProfile = Object.assign({}, validProfile, {
        email: 'ci-consent-' + label + '@example.com',
        phone: label === 'unchecked' ? '0781234501' : '0781234502'
      });
      if (consent === undefined) delete refusedProfile.phone_visible;
      else refusedProfile.phone_visible = consent;
      const refusedResponse = await postJson(base, '/api/register', refusedProfile);
      const refusedText = await refusedResponse.text();
      assert.equal(refusedResponse.status, 400,
        'registration without explicit phone visibility consent must fail: ' + refusedText.slice(0, 300));
      const refusedResult = JSON.parse(refusedText);
      assert.equal(refusedResult.field, 'phone_visible',
        'consent refusal should identify the missing/unchecked phone visibility field');
      assert.equal(
        app.db.prepare('SELECT 1 FROM users WHERE email=?').get(refusedProfile.email),
        undefined,
        'consent refusal must not create a user account'
      );
    }

    const registration = await postJson(base, '/api/register', validProfile);
    const registrationText = await registration.text();
    assert.equal(registration.status, 201, 'valid registration should succeed: ' + registrationText.slice(0, 500));
    const registrationResult = JSON.parse(registrationText);
    assert.ok(registrationResult.profile && registrationResult.profile.pid, 'registration should return a profile');
    assert.equal(registrationResult.profile.phone_visible, true, 'registered profile should retain explicit phone visibility consent');

    const originalProfile = Object.assign({}, validProfile, {
      email: 'ci-baseline-member@example.com',
      phone: '0781234568'
    });
    const originalRegistration = await postJson(baseline, '/api/register', originalProfile);
    const originalRegistrationText = await originalRegistration.text();
    assert.equal(originalRegistration.status, registration.status, 'original and modular signup statuses should match: ' + originalRegistrationText.slice(0, 300));
    const originalRegistrationResult = JSON.parse(originalRegistrationText);
    assert.ok(originalRegistrationResult.profile && originalRegistrationResult.profile.pid, 'original signup should return a profile');
    for (const key of ['name', 'district', 'province', 'cap', 'pending', 'intro', 'edu', 'gender', 'birthdate', 'phone_visible']) {
      assert.equal(registrationResult.profile[key], originalRegistrationResult.profile[key],
        'registration behavior should match original for field ' + key);
    }
    assert.deepEqual(registrationResult.profile.caps, originalRegistrationResult.profile.caps);
    assert.deepEqual(registrationResult.profile.svc, originalRegistrationResult.profile.svc);
    assert.deepEqual(registrationResult.profile.languages, originalRegistrationResult.profile.languages);
    assert.deepEqual(registrationResult.profile.availability, originalRegistrationResult.profile.availability);
    assert.equal(registrationResult.profile.photos.length, 1, 'modular signup should store the uploaded photo');
    assert.equal(originalRegistrationResult.profile.photos.length, 1, 'original signup should store the uploaded photo');
    const [modularPhotoResponse, originalPhotoResponse] = await Promise.all([
      fetch(base + registrationResult.profile.photos[0]),
      fetch(baseline + originalRegistrationResult.profile.photos[0])
    ]);
    assert.equal(modularPhotoResponse.status, 200, 'modular photo should be readable');
    assert.equal(originalPhotoResponse.status, 200, 'original photo should be readable');
    const [modularPhotoBytes, originalPhotoBytes] = await Promise.all([
      modularPhotoResponse.arrayBuffer(),
      originalPhotoResponse.arrayBuffer()
    ]);
    assert.deepEqual(Buffer.from(modularPhotoBytes), Buffer.from(originalPhotoBytes),
      'stored photo bytes should match between the original and modular servers');
    assert.deepEqual(Buffer.from(modularPhotoBytes), photoFixture, 'stored photo bytes should match the submitted image');

    const welcome = mailRequests.find((item) =>
      item.body && item.body.to === 'ci-member@example.com' &&
      item.body.subject === 'AHABONA: Murakaza neza / Welcome'
    );
    const originalWelcome = mailRequests.find((item) =>
      item.body && item.body.to === 'ci-baseline-member@example.com' &&
      item.body.subject === 'AHABONA: Murakaza neza / Welcome'
    );
    assert.ok(welcome, 'modular signup should send the welcome email to the configured relay');
    assert.ok(originalWelcome, 'original signup should send the welcome email to the configured relay');
    for (const message of [welcome, originalWelcome]) {
      assert.equal(message.method, 'POST');
      assert.equal(message.url, '/send');
      assert.equal(message.authorization, 'Bearer test-only-key');
      assert.equal(message.body.from, 'test-sender@example.com');
    }

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

    const phoneLogin = await postJson(base, '/api/login', {
      id: '+250 781 234 567',
      password: 'TestMemberPass123!'
    });
    assert.equal(phoneLogin.status, 200, 'member should also be able to log in with a normalized phone number');

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
    const memberAdminSummary = await fetch(base + '/api/admin/summary', {
      headers: { cookie: memberCookie }
    });
    assert.equal(memberAdminSummary.status, 403, 'ordinary member should not access admin routes');

    // Exercise profile updates and the phone-visibility preference before restart.
    const editPayload = Object.assign({}, validProfile, {
      name: 'CI Updated Member',
      intro: 'Updated profile fixture',
      phone_visible: false
    });
    delete editPayload.password;
    delete editPayload.email;
    delete editPayload.phone;
    delete editPayload.terms;
    delete editPayload.photos;
    delete editPayload.thumbs;
    const profileUpdate = await putJson(base, '/api/me', editPayload, memberCookie);
    const profileUpdateText = await profileUpdate.text();
    assert.equal(profileUpdate.status, 200, 'member should be able to update profile: ' + profileUpdateText.slice(0, 300));
    const updatedProfile = JSON.parse(profileUpdateText).profile;
    assert.equal(updatedProfile.name, 'CI Updated Member');
    assert.equal(updatedProfile.phone_visible, false, 'member should be able to change phone visibility in profile settings');
    assert.equal(updatedProfile.phone, '0781234567', 'the profile owner should still be able to see their own phone number');
    const publicHiddenResponse = await fetch(base + '/api/profile/' + registrationResult.profile.pid);
    assert.equal(publicHiddenResponse.status, 200, 'public profile endpoint should remain accessible');
    const publicHiddenProfile = (await publicHiddenResponse.json()).profile;
    assert.equal(publicHiddenProfile.phone, '', 'a hidden phone number must not be exposed publicly');

    const revealPayload = Object.assign({}, editPayload, { phone_visible: true, name: 'CI Updated Member' });
    const revealResponse = await putJson(base, '/api/me', revealPayload, memberCookie);
    assert.equal(revealResponse.status, 200, 'member should be able to restore phone visibility');
    assert.equal((await revealResponse.json()).profile.phone_visible, true,
      'phone visibility should update when consent is restored');

    // Restart the modular server on the same isolated database and verify the
    // account, session, profile, and uploaded photo still work after reopening.
    const userCountBeforeRestart = app.db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    await app.close();
    app = null;
    app = modularServer.start({ dataDir, secure: false, dev: false });
    const restartBoot = await app.adminBoot;
    assert.equal(restartBoot.ok, true, 'admin bootstrap should remain healthy after restart');
    assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM users').get().n, userCountBeforeRestart,
      'restarting should not add or remove user accounts');
    assert.ok(app.db.prepare('SELECT 1 FROM users WHERE email=?').get('ci-member@example.com'),
      'registered account should remain after restart');
    const persistedProfileRow = app.db.prepare('SELECT name,phone_visible FROM profiles WHERE pid=?')
      .get(registrationResult.profile.pid);
    assert.ok(persistedProfileRow, 'registered profile should remain after restart');
    assert.equal(persistedProfileRow.name, 'CI Updated Member', 'profile updates should survive restart');
    assert.equal(persistedProfileRow.phone_visible, 1, 'phone visibility preference should survive restart');
    const restartedPort = await app.listen(0);
    const restartedBase = 'http://127.0.0.1:' + restartedPort;
    const persistedSession = await fetch(restartedBase + '/api/me', {
      headers: { cookie: memberCookie }
    });
    assert.equal(persistedSession.status, 200, 'session should remain usable after restart');
    const persistedPhoto = await fetch(restartedBase + registrationResult.profile.photos[0]);
    assert.equal(persistedPhoto.status, 200, 'uploaded photo should remain readable after restart');
    assert.deepEqual(Buffer.from(await persistedPhoto.arrayBuffer()), photoFixture,
      'photo bytes should remain unchanged after restart');

    // Forgot/reset password: the relay receives a reset link, its token is single-use,
    // password reset invalidates existing sessions, and the new password can log in.
    const forgotResponse = await postJson(restartedBase, '/api/password/forgot', {
      email: 'ci-member@example.com'
    });
    assert.equal(forgotResponse.status, 200, 'password-reset request should respond without exposing account state');
    const resetMail = mailRequests.find((item) =>
      item.body && item.body.to === 'ci-member@example.com' &&
      item.body.subject === 'AHABONA: kugarura ijambobanga'
    );
    assert.ok(resetMail && typeof resetMail.body.text === 'string', 'password-reset email should be sent to relay');
    const resetMatch = resetMail.body.text.match(/\/reset\/([A-Za-z0-9_-]+)/);
    assert.ok(resetMatch, 'reset email should contain a valid reset URL token');
    const resetToken = resetMatch[1];
    const resetPassword = 'NewTestMemberPass456!';
    const resetResponse = await postJson(restartedBase, '/api/password/reset', {
      token: resetToken,
      password: resetPassword
    });
    assert.equal(resetResponse.status, 200, 'valid reset token should change password');
    const reusedToken = await postJson(restartedBase, '/api/password/reset', {
      token: resetToken,
      password: 'AnotherTestPass789!'
    });
    assert.equal(reusedToken.status, 400, 'reset token must not be reusable');
    const invalidatedSession = await fetch(restartedBase + '/api/me', {
      headers: { cookie: memberCookie }
    });
    assert.equal(invalidatedSession.status, 200);
    assert.equal((await invalidatedSession.json()).user, null,
      'password reset should invalidate the old member session');

    const oldPasswordLogin = await postJson(restartedBase, '/api/login', {
      id: 'ci-member@example.com',
      password: 'TestMemberPass123!'
    });
    assert.equal(oldPasswordLogin.status, 401, 'old password must stop working after reset');
    const newPasswordLogin = await postJson(restartedBase, '/api/login', {
      id: 'ci-member@example.com',
      password: resetPassword
    });
    assert.equal(newPasswordLogin.status, 200, 'new password should work after reset');
    const newCookieHeader = newPasswordLogin.headers.get('set-cookie') || '';
    assert.ok(newCookieHeader.includes('ahs='), 'login after reset should create a session');

    const logoutResponse = await postJson(restartedBase, '/api/logout', {}, newCookieHeader.split(';')[0]);
    assert.equal(logoutResponse.status, 200, 'member should be able to log out');
    const afterLogout = await fetch(restartedBase + '/api/me', {
      headers: { cookie: newCookieHeader.split(';')[0] }
    });
    assert.equal((await afterLogout.json()).user, null, 'logged-out session must no longer authenticate');

    assert.equal(mailRequests.filter((item) => item.body && item.body.subject === 'AHABONA: Murakaza neza / Welcome').length, 2,
      'only the two successful signups should send welcome emails');
    assert.equal(mailRequests.filter((item) => item.body && item.body.subject === 'AHABONA: kugarura ijambobanga').length, 1,
      'password reset should send exactly one reset email');
    console.log('PASS: asset parity, language key parity, phone consent and visibility, registration parity, duplicate checks, profile updates, DB/session/photo restart persistence, password reset, logout, welcome email, and admin permissions.');
  } finally {
    if (app) {
      try { await app.close(); } catch (error) {}
    }
    if (legacyApp) {
      try { await legacyApp.close(); } catch (error) {}
    }
    if (baselineApp) {
      try { await baselineApp.close(); } catch (error) {}
    }
    await closeServer(mailRelay);
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(baselineDataDir, { recursive: true, force: true });
    restoreEnv();
  }
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
