'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const serverModule = require('../server-v2-refactor-test.cjs');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-browser-test-'));
  const relay = http.createServer((req, res) => {
    req.resume();
    res.writeHead(202, { 'content-type': 'application/json' });
    res.end('{"ok":true}');
  });
  let app;
  let browser;
  try {
    const relayPort = await listen(relay);
    process.env.MAIL_API_URL = 'http://127.0.0.1:' + relayPort + '/send';
    process.env.MAIL_API_KEY = 'browser-test-key';
    process.env.MAIL_FROM = 'browser-test@example.test';
    process.env.ADMIN_EMAIL = 'browser-admin@example.test';
    process.env.ADMIN_PHONE = '0790000000';
    process.env.ADMIN_PASSWORD = 'BrowserTestAdmin123!';
    process.env.AHABONA_URL = 'https://ahabona.example.test';
    process.env.AHABONA_DATA = dataDir;
    process.env.AHABONA_DEV = '1';
    process.env.AHABONA_SECURE = '0';

    app = serverModule.start({ dataDir, secure: false, dev: true });
    await app.adminBoot;
    const port = await app.listen(0);
    const base = 'http://127.0.0.1:' + port;
    browser = await chromium.launch({ headless: true });

    for (const viewport of [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'desktop', width: 1440, height: 900 }
    ]) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('#bReg'));

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 1
      );
      assert.equal(overflow, false, viewport.name + ' home page must not overflow horizontally');

      await page.locator('.lsw button[data-lang="en"]').click();
      await page.waitForFunction(() => document.documentElement.lang === 'en');
      assert.equal((await page.locator('#rg').innerText()).trim(), 'Sign up',
        viewport.name + ' language switch should translate the registration button');

      await page.locator('#bReg').click();
      await page.waitForFunction(() =>
        document.querySelector('select[data-rg="province"] option[value]:not([value=""])')
      );
      await page.locator('[data-rg="name"]').fill('Browser Test Person');
      const province = await page.locator('select[data-rg="province"] option').evaluateAll(options =>
        options.find(option => option.value)?.value || ''
      );
      assert.ok(province, viewport.name + ' should provide province options');
      await page.locator('select[data-rg="province"]').selectOption(province);
      await page.waitForFunction(() => {
        const select = document.querySelector('select[data-rg="district"]');
        return select && Array.from(select.options).some(option => option.value);
      });
      const district = await page.locator('select[data-rg="district"] option').evaluateAll(options =>
        options.find(option => option.value)?.value || ''
      );
      assert.ok(district, viewport.name + ' should provide district options');
      await page.locator('select[data-rg="district"]').selectOption(district);
      await page.locator('#rg-next').click();

      // Photo step permits continuing without a photo; job step requires a selection.
      await page.locator('#rg-next').click();
      await page.locator('label.job-item').first().click();
      await page.locator('#rg-next').click();

      await page.locator('[data-rg="phone"]').fill('0780000101');
      await page.locator('[data-rg="phone-agree"]').check();
      assert.equal(await page.locator('[data-rg="phone-agree"]').isChecked(), true,
        viewport.name + ' phone visibility consent should be checked');
      await page.locator('#rg-next').click();

      await page.locator('[data-rg="email"]').fill('browser-' + viewport.name + '@example.test');
      await page.locator('[data-rg="password"]').fill('BrowserTestPass123!');
      await page.locator('#rg-next').click();
      await page.locator('[data-rg="terms"]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-rg="terms"]').isChecked(), false,
        viewport.name + ' should be on the terms step without asking for phone consent again');
      assert.equal(await page.locator('[data-rg="phone-agree"]').count(), 0,
        viewport.name + ' must not render a second phone visibility consent checkbox on step six');

      // Browser Back must step back within the registration form, not close the
      // modal or navigate away from the website.
      await page.evaluate(() => history.back());
      await page.locator('[data-rg="email"]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#ov').evaluate(el => el.classList.contains('on')), true,
        viewport.name + ' browser Back should keep registration open');
      await page.evaluate(() => history.back());
      await page.locator('[data-rg="phone-agree"]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-rg="phone-agree"]').isChecked(), true,
        viewport.name + ' browser Back should preserve phone visibility consent');

      assert.deepEqual(pageErrors, [], viewport.name + ' should not raise browser JavaScript errors');
      await page.close();
    }
    console.log('PASS: mobile and desktop viewport, no horizontal overflow, English switch, registration progression, phone consent persistence, and browser Back navigation.');
  } finally {
    if (browser) await browser.close();
    if (app) await app.close();
    await new Promise(resolve => relay.close(resolve));
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
