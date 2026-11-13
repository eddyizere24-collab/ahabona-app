'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRobotsTxt, buildSitemapXml, renderPublicProfileHtml, renderInfoPageHtml, getServiceLandingDefinition, renderServiceLandingHtml, renderDiscoveryDirectoryHtml, isoDate } = require('../discovery-seo.cjs');

test('robots permits ChatGPT search while keeping private routes out', () => {
  const robots = buildRobotsTxt('https://ahabona.duckdns.org/');
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Sitemap: https:\/\/ahabona\.duckdns\.org\/sitemap\.xml/);
});
test('sitemap includes only valid public profile ids and safely encodes paths', () => {
  const xml = buildSitemapXml([
    { pid: 'a1b2c3d4', updated_at: 1794469200000 }, { pid: 'a1b2c3d4', updated_at: 1794469200000 },
    { pid: 'abc', updated_at: 1794469200000 }, { pid: 'bad<script>', updated_at: 1794469200000 }, { pid: 'e5f6g7h8' }
  ]);
  assert.match(xml, /https:\/\/ahabona\.duckdns\.org\//);
  assert.equal((xml.match(/<loc>/g) || []).length, 6);
  assert.match(xml, /https:\/\/ahabona\.duckdns\.org\/u\/a1b2c3d4/);
  assert.doesNotMatch(xml, /<script>/);
  assert.match(xml, /<lastmod>2026-11-12T/);
});
test('public profile HTML renders canonical metadata and approved public fields', () => {
  const html = renderPublicProfileHtml({
    pid: 'a1b2c3d4', name: 'Eddy Example', district: 'Gasabo', province: 'Umujyi wa Kigali',
    caps: ['Umushoferi', 'Umukanishi'], intro: 'Mfite uburambe mu gutwara imodoka.',
    phone: '+250 788 123 456', wa: '0788123456', phones: [], photos: ['/photos/a1b2c3d4-0.jpg?v=1794469200000'],
    thumb: '/photos/a1b2c3d4-t.jpg?v=1794469200000', edu: 'Amashuri yisumbuye', svc: ['Gasabo'],
    languages: ['rw', 'en'], experience: [{ role: 'Umushoferi', where: 'Kigali', years: 'Imyaka 4' }]
  }, { updatedAt: 1794469200000 });
  assert.ok(html.includes('href="https://ahabona.duckdns.org/u/a1b2c3d4"'));
  assert.match(html, /Eddy Example/); assert.match(html, /Umushoferi/);
  assert.match(html, /href="tel:\+250788123456"/); assert.match(html, /https:\/\/wa\.me\/250788123456/); assert.match(html, /Indimi/); assert.match(html, /Gasabo/); assert.match(html, /Imyaka 4/); assert.match(html, /og:image/);
  assert.ok(html.includes('application/ld+json'));
  const profileTitle = html.match(/<title>([^<]+)<\/title>/);
  const profileDescription = html.match(/<meta name="description" content="([^"]+)"/);
  assert.ok(profileTitle && profileTitle[1].length <= 60, 'profile title should stay concise');
  assert.ok(profileDescription && profileDescription[1].length <= 160, 'profile description should fit a search snippet');
});
test('profile page cannot leak a phone omitted by the public API projection', () => {
  const html = renderPublicProfileHtml({ pid: 'a1b2c3d4', name: 'Private Phone Example', district: 'Huye', caps: ['Umudozi'], phone: '', phones: [] });
  assert.doesNotMatch(html, /tel:/); assert.doesNotMatch(html, /0788123456/);
  assert.match(html, /Nta makuru yo kuvugana yashyizwe ku mugaragaro/);
});
test('profile text is escaped and unsafe external URLs are omitted', () => {
  const html = renderPublicProfileHtml({
    pid: 'a1b2c3d4', name: '<script>alert(1)</script>', district: 'Kigali & Gasabo',
    caps: ['Umudozi <img src=x>'], intro: 'Hello </script><script>alert(2)</script>',
    facebook: 'javascript:alert(3)', phone: ''
  });
  assert.doesNotMatch(html, /<script>alert\(/); assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /javascript:/);
});

test('sitemap includes the public explanation pages', () => {
  const xml = buildSitemapXml([{ pid: 'a1b2c3d4' }]);
  assert.ok(xml.includes('https://ahabona.duckdns.org/about'));
  assert.ok(xml.includes('https://ahabona.duckdns.org/how-it-works'));
  assert.ok(xml.includes('https://ahabona.duckdns.org/people'));
});
test('about page explains the free discovery model in Kinyarwanda and English', () => {
  const html = renderInfoPageHtml('about');
  assert.match(html, /AHABONA ni iki/);
  assert.match(html, /ni ubuntu/);
  assert.match(html, /si job board/);
  assert.match(html, /People make their own agreements/);
  assert.ok(html.includes('application/ld+json'));
});
test('how-it-works page explains direct contact and direct agreements', () => {
  const html = renderInfoPageHtml('how-it-works');
  assert.match(html, /Ushaka umuntu\? Shakisha icyo akeneye/);
  assert.match(html, /Muganire ku kazi, igiciro, igihe/);
  assert.match(html, /contact the person directly/);
});


test('service category sitemap entries are added only from validated slugs', () => {
  const xml = buildSitemapXml([], 'https://ahabona.duckdns.org', ['umushoferi', 'bad<script>']);
  assert.ok(xml.includes('https://ahabona.duckdns.org/services/umushoferi'));
  assert.ok(!xml.includes('bad<script>'));
});
test('service landing pages render only matched public profiles and their links', () => {
  const definition = getServiceLandingDefinition('umushoferi');
  assert.ok(definition);
  const html = renderServiceLandingHtml(definition, [
    { pid: 'a1b2c3d4', name: 'Eddy Driver', district: 'Gasabo', province: 'Umujyi wa Kigali',
      caps: ['Umushoferi'], intro: 'Nkorera mu Rwanda.', phone: '', phones: [],
      thumb: '/photos/a1b2c3d4-t.jpg?v=1794469200000' },
    { pid: 'invalid<script>', name: 'Should not render', caps: ['Umushoferi'] }
  ]);
  assert.match(html, /Abashoferi mu Rwanda/);
  assert.match(html, /Drivers in Rwanda/);
  assert.match(html, /Eddy Driver/);
  assert.ok(html.includes('href="/u/a1b2c3d4"'));
  assert.match(html, /og:title/);
  const serviceTitle = html.match(/<title>([^<]+)<\/title>/);
  const serviceDescription = html.match(/<meta name="description" content="([^"]+)"/);
  assert.ok(serviceTitle && serviceTitle[1].length <= 60, 'service title should stay concise');
  assert.ok(serviceDescription && serviceDescription[1].length <= 160, 'service description should fit a search snippet');
  assert.doesNotMatch(html, /Should not render/);
  assert.ok(html.includes('application/ld+json'));
});
test('empty service landing pages are noindex until matching public profiles exist', () => {
  const definition = getServiceLandingDefinition('umubaji');
  const html = renderServiceLandingHtml(definition, []);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /Nta muntu ubonetse muri iki cyiciro ubu/);
});

test('public people directory links only validated public profiles and active service categories', () => {
  const html = renderDiscoveryDirectoryHtml([
    { pid: 'a1b2c3d4', name: 'Eddy Example', district: 'Gasabo', province: 'Umujyi wa Kigali',
      caps: ['Umushoferi'], intro: 'Nkorera mu Rwanda.', phone: '+250788123456',
      email: 'private@example.test', thumb: '/photos/a1b2c3d4-t.jpg?v=1794469200000' },
    { pid: 'invalid<script>', name: 'Must not render', caps: ['Umushoferi'] }
  ], ['umushoferi', 'invalid<script>']);
  assert.match(html, /href="\/u\/a1b2c3d4"/);
  assert.match(html, /href="\/services\/umushoferi"/);
  assert.match(html, /Eddy Example/);
  assert.doesNotMatch(html, /Must not render/);
  assert.doesNotMatch(html, /\+250788123456|private@example\.test/);
  assert.match(html, /name="robots" content="index,follow"/);
  assert.ok(html.includes('application/ld+json'));
});
test('empty public people directory is noindex', () => {
  const html = renderDiscoveryDirectoryHtml([], []);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /Nta mwirondoro wa public urashyirwaho ubu/);
});

test('ISO date conversion accepts Unix milliseconds and seconds', () => {
  assert.equal(isoDate(1794469200), new Date(1794469200000).toISOString());
  assert.equal(isoDate('not a date'), '');
});
