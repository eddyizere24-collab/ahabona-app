'use strict';

const DEFAULT_BASE_URL = 'https://ahabona.duckdns.org';
const PUBLIC_PID_RE = /^[a-z0-9]{8,16}$/;
function baseOrigin(value) { try { return new URL(value || DEFAULT_BASE_URL).origin; } catch { return DEFAULT_BASE_URL; } }
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeXml(value) { return escapeHtml(value); }
function cleanText(value, maxLength = 500) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, maxLength); }
function isoDate(value) {
  if (value == null || value === '') return '';
  const numeric = Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric > 0 && numeric < 1000000000000 ? numeric * 1000 : numeric) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
function buildRobotsTxt(baseUrl = DEFAULT_BASE_URL) {
  const base = baseOrigin(baseUrl);
  const commonDisallows = ['Disallow: /admin', 'Disallow: /api/', 'Disallow: /reset/', 'Disallow: /saved'];
  return ['User-agent: *', 'Allow: /', ...commonDisallows, '',
    'User-agent: OAI-SearchBot', 'Allow: /', ...commonDisallows, '',
    'User-agent: ChatGPT-User', 'Allow: /', ...commonDisallows, '',
    'User-agent: GPTBot', 'Disallow: /', '', 'Sitemap: ' + base + '/sitemap.xml', ''].join('\n');
}
function buildSitemapXml(rows, baseUrl = DEFAULT_BASE_URL) {
  const base = baseOrigin(baseUrl);
  const entries = ['<url><loc>' + escapeXml(base + '/') + '</loc></url>'];
  const seen = new Set();
  for (const row of Array.isArray(rows) ? rows : []) {
    const pid = String(row && row.pid || '');
    if (!PUBLIC_PID_RE.test(pid) || seen.has(pid)) continue;
    seen.add(pid);
    const lastmod = isoDate(row.updated_at);
    entries.push('<url><loc>' + escapeXml(base + '/u/' + pid) + '</loc>' +
      (lastmod ? '<lastmod>' + escapeXml(lastmod) + '</lastmod>' : '') + '</url>');
    if (entries.length >= 50000) break;
  }
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries.join('') + '</urlset>';
}
function safePhotoPath(value) {
  const path = String(value || '');
  return /^\/photos\/[a-z0-9]+-(?:[0-5]|t)\.jpg(?:\?v=\d+)?$/i.test(path) ? path : '';
}
function safeHttpUrl(value) {
  try { const url = new URL(String(value || '')); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; }
  catch { return ''; }
}
function safePhone(value) {
  const display = cleanText(value, 40);
  const tel = display.replace(/[^0-9+]/g, '');
  return /^\+?[0-9]{7,15}$/.test(tel) ? { display, tel } : null;
}
function safeRwandaWhatsApp(value) {
  const local = String(value || '').replace(/[\\s-]/g, '').replace(/^\\+?250/, '0');
  return /^07[2389]\\d{7}$/.test(local) ? 'https://wa.me/250' + local.slice(1) : '';
}
function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
function renderPublicProfileHtml(profile, options = {}) {
  const base = baseOrigin(options.baseUrl);
  const pid = String(profile && profile.pid || '');
  if (!PUBLIC_PID_RE.test(pid)) throw new TypeError('A valid public profile id is required');
  const name = cleanText(profile.name, 120) || 'Umwirondoro wa AHABONA';
  const skills = Array.isArray(profile.caps) ? profile.caps.map(value => cleanText(value, 80)).filter(Boolean).slice(0, 12) : [];
  const district = cleanText(profile.district, 100);
  const province = cleanText(profile.province, 100);
  const location = [district, province].filter(Boolean).join(', ');
  const intro = cleanText(profile.intro, 1200);
  const skillSummary = skills.join(', ');
  const title = [name, skillSummary, 'AHABONA'].filter(Boolean).join(' | ').slice(0, 180);
  const descriptionParts = ['Umwirondoro wa ' + name + ' kuri AHABONA.'];
  if (skillSummary) descriptionParts.push('Ubushobozi: ' + skillSummary + '.');
  if (location) descriptionParts.push('Aho abarizwa: ' + location + '.');
  if (intro) descriptionParts.push(intro.slice(0, 150));
  const description = descriptionParts.join(' ').slice(0, 300);
  const canonical = base + '/u/' + pid;
  const photos = (Array.isArray(profile.photos) ? profile.photos : []).map(safePhotoPath).filter(Boolean).slice(0, 6);
  const thumb = safePhotoPath(profile.thumb) || photos[0] || '';
  const imageUrl = thumb ? base + thumb : '';
  const phoneValues = [profile.phone].concat(Array.isArray(profile.phones) ? profile.phones : []).map(safePhone).filter(Boolean);
  const uniquePhones = Array.from(new Map(phoneValues.map(phone => [phone.tel, phone])).values()).slice(0, 5);
  const whatsAppUrl = safeRwandaWhatsApp(profile.wa);
  const education = cleanText(profile.edu, 300);
  const serviceAreas = Array.isArray(profile.svc) ? profile.svc.map(value => cleanText(value, 80)).filter(Boolean).slice(0, 8) : [];
  const languageLabels = { rw: 'Ikinyarwanda', en: 'Icyongereza', fr: 'Igifaransa', sw: 'Igiswahili' };
  const languages = Array.isArray(profile.languages) ? profile.languages.map(value => languageLabels[String(value)]).filter(Boolean) : [];
  const experience = Array.isArray(profile.experience) ? profile.experience.slice(0, 8).map(item => {
    if (typeof item === 'string') return cleanText(item, 240);
    if (!item || typeof item !== 'object') return '';
    return [cleanText(item.role, 100), cleanText(item.where, 100), cleanText(item.years, 40)].filter(Boolean).join(' · ');
  }).filter(Boolean) : [];
  const publicEmail = cleanText(profile.email_public, 254);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail);
  const contactLinks = [];
  for (const phone of uniquePhones) contactLinks.push('<a class="contact-link" href="tel:' + escapeHtml(phone.tel) + '">Hamagara: ' + escapeHtml(phone.display) + '</a>');
  if (emailIsValid) contactLinks.push('<a class="contact-link" href="mailto:' + escapeHtml(publicEmail) + '">Ohereza Email</a>');
  if (whatsAppUrl) contactLinks.push('<a class="contact-link" href="' + escapeHtml(whatsAppUrl) + '" rel="noopener noreferrer">WhatsApp</a>');
  const socialItems = [
    ['Facebook', profile.facebook], ['Instagram', profile.instagram], ['TikTok', profile.tiktok],
    ['LinkedIn', profile.linkedin], ['Telegram', profile.telegram], ['X', profile.twitter], ['Link', profile.soc]
  ].map(([label, value]) => ({ label, href: safeHttpUrl(value) })).filter(item => item.href);
  for (const item of socialItems) contactLinks.push('<a class="contact-link secondary" href="' + escapeHtml(item.href) + '" rel="noopener noreferrer">' + escapeHtml(item.label) + '</a>');
  const skillHtml = skills.length ? '<section><h2>Ubushobozi n’imyuga</h2><ul class="tags">' + skills.map(skill => '<li>' + escapeHtml(skill) + '</li>').join('') + '</ul></section>' : '';
  const introHtml = intro ? '<section><h2>Ibyerekeye uyu mwirondoro</h2><p class="intro">' + escapeHtml(intro) + '</p></section>' : '';
  const educationHtml = education ? '<section><h2>Amashuri</h2><p>' + escapeHtml(education) + '</p></section>' : '';
  const serviceAreasHtml = serviceAreas.length ? '<section><h2>Uturere atangiramo serivisi</h2><ul class="tags">' + serviceAreas.map(value => '<li>' + escapeHtml(value) + '</li>').join('') + '</ul></section>' : '';
  const languagesHtml = languages.length ? '<section><h2>Indimi</h2><p>' + languages.map(escapeHtml).join(', ') + '</p></section>' : '';
  const experienceHtml = experience.length ? '<section><h2>Uburambe</h2><ul>' + experience.map(value => '<li>' + escapeHtml(value) + '</li>').join('') + '</ul></section>' : '';
  const galleryHtml = photos.length ? '<section><h2>Amafoto</h2><div class="gallery">' + photos.map((photo, index) =>
    '<img src="' + escapeHtml(base + photo) + '" alt="Ifoto ya ' + escapeHtml(name) + ' (' + (index + 1) + ')" loading="lazy">'
  ).join('') + '</div></section>' : '';
  const locationHtml = location ? '<p class="location">Aho abarizwa: <strong>' + escapeHtml(location) + '</strong></p>' : '';
  const contactsHtml = contactLinks.length ? '<section><h2>Uburyo bwo kuvugana</h2><div class="contacts">' + contactLinks.join('') + '</div></section>'
    : '<p class="muted">Nta makuru yo kuvugana yashyizwe ku mugaragaro kuri uyu mwirondoro.</p>';
  const updatedAt = isoDate(options.updatedAt);
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical,
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    isPartOf: { '@type': 'WebSite', name: 'AHABONA', url: base + '/' }
  };
  return '<!doctype html><html lang="rw"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="theme-color" content="#1a9b6c"><meta name="robots" content="index,follow,max-image-preview:large">' +
    '<title>' + escapeHtml(title) + '</title><meta name="description" content="' + escapeHtml(description) + '">' +
    '<link rel="canonical" href="' + escapeHtml(canonical) + '"><link rel="icon" href="/icon.svg" type="image/svg+xml">' +
    '<meta property="og:type" content="profile"><meta property="og:site_name" content="AHABONA">' +
    '<meta property="og:title" content="' + escapeHtml(title) + '"><meta property="og:description" content="' + escapeHtml(description) + '">' +
    '<meta property="og:url" content="' + escapeHtml(canonical) + '">' +
    (imageUrl ? '<meta property="og:image" content="' + escapeHtml(imageUrl) + '">' : '') +
    '<meta name="twitter:card" content="' + (imageUrl ? 'summary_large_image' : 'summary') + '">' +
    '<script type="application/ld+json">' + jsonForHtml(structuredData) + '</script>' +
    '<style>' +
    ':root{color-scheme:light;--green:#1a9b6c;--deep:#103d2b;--gold:#d4a838;--ink:#1e2a32;--muted:#5a6470;--paper:#faf7ef;--line:#e8e4da}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}' +
    'a{color:var(--green)}.wrap{width:min(900px,100% - 28px);margin:0 auto}.top{background:#fff;border-bottom:1px solid var(--line)}' +
    '.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}.brand{font-weight:850;letter-spacing:.4px;color:var(--deep);text-decoration:none;font-size:20px}' +
    '.back{font-size:14px;font-weight:700;text-decoration:none}.card{margin:28px auto;background:#fff;border:1px solid var(--line);border-radius:22px;padding:clamp(18px,4vw,34px);box-shadow:0 8px 30px rgba(30,42,50,.06)}' +
    'h1{margin:0;color:var(--deep);font-size:clamp(28px,5vw,42px);line-height:1.15;overflow-wrap:anywhere}h2{font-size:19px;color:var(--deep);margin:26px 0 10px}' +
    '.location,.muted{color:var(--muted);font-size:14px}.intro{white-space:pre-wrap;overflow-wrap:anywhere}.tags{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0}' +
    '.tags li{background:#e8f4ee;color:#15583b;border:1px solid #d4e9dd;border-radius:999px;padding:6px 12px;font-size:14px}' +
    '.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.gallery img{width:100%;height:180px;object-fit:cover;border-radius:13px;background:#f2f2f2}' +
    '.contacts{display:flex;flex-wrap:wrap;gap:9px}.contact-link{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 14px;border-radius:12px;background:var(--green);color:#fff;font-weight:700;text-decoration:none}' +
    '.contact-link.secondary{background:#f0f5f1;color:var(--deep);border:1px solid var(--line)}' +
    '.note{margin:24px 0 0;padding:14px 16px;background:#fbf5e5;border-left:4px solid var(--gold);border-radius:10px;color:#51431f;font-size:14px}.foot{padding:0 0 28px;text-align:center;color:var(--muted);font-size:13px}.foot a{font-weight:700}' +
    '</style></head><body><header class="top"><div class="wrap bar"><a class="brand" href="/">AHABONA</a><a class="back" href="/">Subira kuri AHABONA</a></div></header>' +
    '<main class="wrap"><article class="card"><h1>' + escapeHtml(name) + '</h1>' + locationHtml + skillHtml + introHtml + educationHtml + serviceAreasHtml + languagesHtml + experienceHtml + galleryHtml + contactsHtml +
    '<p class="note">AHABONA ihuza abantu bafite ubushobozi n’abakeneye serivisi. Abakoresha bavugana kandi bakumvikana hagati yabo. AHABONA ntiyishyurisha, ntiyakira amafaranga y’akazi kandi ntiyivanga mu masezerano yabo.</p>' +
    '</article><footer class="foot">Uyu ni umwirondoro wa public washyizwe kuri AHABONA. <a href="/">Shakisha abandi cyangwa wigaragaze kuri AHABONA.</a></footer></main></body></html>';
}
module.exports = { DEFAULT_BASE_URL, buildRobotsTxt, buildSitemapXml, renderPublicProfileHtml, escapeHtml, isoDate };
