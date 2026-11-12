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
    'User-agent: GPTBot', 'Disallow: /', '', 'Sitemap: ' + base + '/sitemap.xml', ''].join('\n');
}
function buildSitemapXml(rows, baseUrl = DEFAULT_BASE_URL, serviceSlugs = []) {
  const base = baseOrigin(baseUrl);
  const entries = [
    '<url><loc>' + escapeXml(base + '/') + '</loc></url>',
    '<url><loc>' + escapeXml(base + '/about') + '</loc></url>',
    '<url><loc>' + escapeXml(base + '/how-it-works') + '</loc></url>'
  ];
  for (const slug of Array.isArray(serviceSlugs) ? serviceSlugs : []) {
    if (/^[a-z0-9-]{2,60}$/.test(String(slug))) {
      entries.push('<url><loc>' + escapeXml(base + '/services/' + slug) + '</loc></url>');
    }
  }
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
  const local = String(value || '').replace(/[\s-]/g, '').replace(/^\+?250/, '0');
  return /^07[2389]\d{7}$/.test(local) ? 'https://wa.me/250' + local.slice(1) : '';
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

const INFO_PAGES = {
  about: {
    title: 'AHABONA ni iki? Urubuga rw’ubuntu ruhuza abafite ubumenyi n’ababukeneye mu Rwanda',
    description: 'AHABONA ni urubuga rw’ubuntu rwo mu Rwanda rufasha abantu kugaragaza ubumenyi, imyuga, ubushobozi na serivisi bashobora gutanga, kugira ngo ababikeneye bababone kandi bavugane na bo.',
    sections: [
      ['AHABONA ni iki?', 'AHABONA ni urubuga rwigenga ruhuza abantu bafite ubumenyi, imyuga, impano, ubushobozi cyangwa serivisi bashobora gutanga n’abantu bashaka kubibona cyangwa kubikoresha. Rugamije gufasha umuntu wese kugaragaza icyo azi gukora no kugera ku bandi bashobora kugikeneye.'],
      ['Kwiyandikisha no gushakisha ni ubuntu', 'Gufungura konti, kugaragaza ibyo ushoboye no gushakisha abantu kuri AHABONA ni ubuntu. AHABONA ntiyishyuza abantu kugira ngo biyandikishe cyangwa bashake umuntu. Ntukishyure umuntu ukwitwaza ko agomba kukwandikisha kuri AHABONA.'],
      ['AHABONA si ikigo gitanga akazi', 'AHABONA si umukoresha, si ikigo gishakira abantu akazi, si staffing agency kandi si job board. Ntiha umuntu akazi mu izina ry’abandi. Yerekana abantu n’ibyo bashoboye kugira ngo ababikeneye babavugishe.'],
      ['Abantu bumvikana hagati yabo', 'Ushaka umukozi cyangwa serivisi areba umwirondoro wa public, agahitamo uwo ashaka, akamuhamagara cyangwa akamwandikira. Abantu bombi bumvikana ku kazi, igiciro, igihe n’ibindi bisabwa hagati yabo. AHABONA ntiyakira amafaranga y’akazi kandi ntiyinjira muri ayo masezerano.'],
      ['Koresha amakuru y’ukuri', 'Abakoresha bagomba kwerekana ubumenyi, serivisi, aho bakorera n’uburyo bwo kubavugisha mu buryo bw’ukuri. Kuba umwirondoro ugaragara kuri AHABONA ntibihwanye no kwemezwa kw’impamyabumenyi cyangwa uburambe. Abantu bagomba kugenzura amakuru no kumvikana neza mbere yo gutangira akazi.']
    ],
    englishTitle: 'What is AHABONA?',
    englishDescription: 'AHABONA is a free Rwanda-based discovery platform where people can present their skills, trades, abilities and services so others can find and contact them.',
    englishSections: [
      ['A free discovery platform', 'AHABONA helps people who have skills, trades, talents, abilities or services present what they can do. People who need those services can search public profiles, choose someone and contact them directly. Registration and searching are free.'],
      ['Not an employer or job board', 'AHABONA is not an employer, staffing agency, recruitment intermediary or job board. It does not hire people or promise employment. It helps people discover one another.'],
      ['People make their own agreements', 'The person seeking a service contacts the provider directly. They discuss the work, price, timing and conditions between themselves. AHABONA does not collect payment for the work or take part in their agreement.']
    ]
  },
  'how-it-works': {
    title: 'Uko AHABONA ikora: menya abantu bafite ubumenyi na serivisi mu Rwanda',
    description: 'Sobanukirwa uko wakwiyandikisha ku buntu, ukagaragaza ibyo ushoboye, ugashaka umukozi cyangwa serivisi, hanyuma mukavugana mukumvikana hagati yanyu.',
    sections: [
      ['1. Ufite icyo ushoboye? Iyandikishe ku buntu', 'Fungura konti yawe kuri AHABONA nta mafaranga wishyuye. Shyiraho umwirondoro wawe n’ibyo ushoboye gukora.'],
      ['2. Garagaza umwirondoro wawe', 'Hitamo ubumenyi cyangwa serivisi utanga, akarere ukoreramo, ibisobanuro bigufi n’uburyo abantu bashobora kukugeraho. Shyiraho amafoto yawe cyangwa y’akazi kawe igihe ubishaka. Tanga amakuru ushaka ko agaragara ku mugaragaro gusa.'],
      ['3. Ushaka umuntu? Shakisha icyo akeneye', 'Shakisha umushoferi, umubaji, umudozi, umukanishi, umukozi wo mu rugo cyangwa undi muntu ufite ubushobozi ukeneye. Ushobora kugabanya ibisubizo ukurikije akarere n’ubwoko bw’umurimo.'],
      ['4. Reba umwirondoro, uvugane na we', 'Fungura umwirondoro wa public kugira ngo urebe ibyo umuntu yagaragaje n’uburyo bwo kumuvugisha. Ushobora kumuhamagara cyangwa kumwandikira igihe ubwo buryo bugaragara kuri profile ye.'],
      ['5. Mwumvikane hagati yanyu', 'Muganire ku kazi, igiciro, igihe n’ibindi bisabwa. AHABONA ntiyishyurisha kwiyandikisha cyangwa gushakisha, ntiyakira amafaranga y’akazi kandi ntiyinjira mu masezerano yanyu. Banza ugenzure amakuru y’undi muntu mbere yo kwemera cyangwa kwishyura serivisi.']
    ],
    englishTitle: 'How AHABONA works',
    englishDescription: 'Sign up for free, present your skills or services, search for a person by skill and location, contact them directly and make your own agreement.',
    englishSections: [
      ['For people offering services', 'Create a free profile, describe the skills or services you offer, add your service area and choose the contact details you want to make public.'],
      ['For people looking for help', 'Search by skill and location, review public profiles, then contact the person directly using the contact method shown on their profile.'],
      ['Direct agreements', 'You and the service provider agree directly on the work, price and timing. AHABONA does not employ people, collect work payments or mediate the agreement.']
    ]
  }
};
function renderInfoPageHtml(pageKey, options = {}) {
  const page = INFO_PAGES[pageKey];
  if (!page) throw new TypeError('Unknown AHABONA information page');
  const base = baseOrigin(options.baseUrl);
  const canonical = base + (pageKey === 'about' ? '/about' : '/how-it-works');
  const rwSections = page.sections.map(([heading, body]) =>
    '<section><h2>' + escapeHtml(heading) + '</h2><p>' + escapeHtml(body) + '</p></section>'
  ).join('');
  const enSections = page.englishSections.map(([heading, body]) =>
    '<section><h2>' + escapeHtml(heading) + '</h2><p>' + escapeHtml(body) + '</p></section>'
  ).join('');
  const data = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: page.title,
    description: page.description, url: canonical, inLanguage: ['rw', 'en'],
    isPartOf: { '@type': 'WebSite', name: 'AHABONA', url: base + '/' }
  };
  return '<!doctype html><html lang="rw"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="index,follow"><meta name="theme-color" content="#1a9b6c">' +
    '<title>' + escapeHtml(page.title) + '</title><meta name="description" content="' + escapeHtml(page.description) + '">' +
    '<link rel="canonical" href="' + escapeHtml(canonical) + '">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="AHABONA">' +
    '<meta property="og:title" content="' + escapeHtml(page.title) + '">' +
    '<meta property="og:description" content="' + escapeHtml(page.description) + '">' +
    '<meta property="og:url" content="' + escapeHtml(canonical) + '">' +
    '<script type="application/ld+json">' + jsonForHtml(data) + '</script>' +
    '<style>:root{color-scheme:light;--green:#1a9b6c;--deep:#103d2b;--gold:#d4a838;--ink:#1e2a32;--muted:#5a6470;--paper:#faf7ef;--line:#e8e4da}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}' +
    'a{color:var(--green)}.wrap{width:min(820px,100% - 28px);margin:0 auto}.top{background:#fff;border-bottom:1px solid var(--line)}' +
    '.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}.brand{font-weight:850;color:var(--deep);text-decoration:none;font-size:20px}' +
    'main{margin:26px auto;background:#fff;border:1px solid var(--line);border-radius:20px;padding:clamp(18px,4vw,32px);box-shadow:0 8px 30px rgba(30,42,50,.05)}' +
    'h1{margin:0 0 12px;color:var(--deep);font-size:clamp(27px,5vw,38px);line-height:1.2}h2{margin:24px 0 6px;color:var(--deep);font-size:19px}' +
    '.lead{font-size:18px;color:#34433b}.lang{margin-top:34px;padding-top:20px;border-top:1px solid var(--line)}.lang h2{margin-top:0}' +
    '.footer{padding:0 0 30px;text-align:center;color:var(--muted);font-size:14px}.footer a{font-weight:700}' +
    '</style></head><body><header class="top"><div class="wrap bar"><a class="brand" href="/">AHABONA</a><a href="/">Subira ku rubuga</a></div></header>' +
    '<main class="wrap"><article><h1>' + escapeHtml(page.title) + '</h1><p class="lead">' + escapeHtml(page.description) + '</p>' +
    rwSections + '<div class="lang" lang="en"><h2>' + escapeHtml(page.englishTitle) + '</h2><p class="lead">' + escapeHtml(page.englishDescription) + '</p>' + enSections + '</div>' +
    '</article></main><footer class="wrap footer">AHABONA — Urugo rw’Izuba. <a href="/">Shakisha abantu cyangwa wigaragaze.</a></footer></body></html>';
}


const SERVICE_LANDING_PAGES = [
  { slug: 'umushoferi', query: 'umushoferi', rw: 'Abashoferi mu Rwanda', en: 'Drivers in Rwanda',
    rwDescription: 'Shaka umushoferi uri muri AHABONA. Reba profiles z’abashoferi, aho bakorera n’uburyo bwo kuvugana na bo.',
    enDescription: 'Find drivers in Rwanda on AHABONA. Review public profiles, service areas and available contact methods.' },
  { slug: 'umukozi-wo-mu-rugo', query: 'umukozi wo mu rugo', rw: 'Abakozi bo mu rugo mu Rwanda', en: 'House helpers in Rwanda',
    rwDescription: 'Shaka abantu bagaragaje ko batanga serivisi zo mu rugo, urebe aho bakorera n’uko wabavugisha.',
    enDescription: 'Find people who list household services on AHABONA, review their public profiles and contact them directly.' },
  { slug: 'umubaji', query: 'umubaji', rw: 'Ababaji mu Rwanda', en: 'Carpenters in Rwanda',
    rwDescription: 'Shaka ababaji bagaragaje ubushobozi bwabo kuri AHABONA, urebe profiles zabo n’aho batangira serivisi.',
    enDescription: 'Find carpenters who have public profiles on AHABONA and contact them directly.' },
  { slug: 'umudozi', query: 'umudozi', rw: 'Abadozi mu Rwanda', en: 'Tailors in Rwanda',
    rwDescription: 'Shaka abadozi bo mu Rwanda kuri AHABONA, urebe ibyo bagaragaje n’uburyo bwo kubavugisha.',
    enDescription: 'Discover tailors in Rwanda through their public AHABONA profiles.' },
  { slug: 'umukanishi-wimodoka', query: 'umukanishi w’imodoka', rw: 'Abakanishi b’imodoka mu Rwanda', en: 'Car mechanics in Rwanda',
    rwDescription: 'Shaka abakanishi b’imodoka bagaragaje serivisi batanga kuri AHABONA.',
    enDescription: 'Find car mechanics with public AHABONA profiles and contact them directly.' },
  { slug: 'umufundi', query: 'umufundi', rw: 'Abafundi n’abubatsi mu Rwanda', en: 'Masons and builders in Rwanda',
    rwDescription: 'Shaka abafundi n’abubatsi bagaragaje ubumenyi bwabo kuri AHABONA.',
    enDescription: 'Find masons and builders in Rwanda through public AHABONA profiles.' },
  { slug: 'umutetsi', query: 'umutetsi', rw: 'Abatetsi mu Rwanda', en: 'Cooks in Rwanda',
    rwDescription: 'Shaka abatetsi bagaragaje serivisi zabo kuri AHABONA.',
    enDescription: 'Find cooks who list their services on AHABONA.' },
  { slug: 'umuhinzi', query: 'umuhinzi', rw: 'Abahinzi mu Rwanda', en: 'Farmers in Rwanda',
    rwDescription: 'Menya abahinzi bagaragaje ibyo bakora n’ubushobozi bwabo kuri AHABONA.',
    enDescription: 'Discover farmers and agricultural service providers with public AHABONA profiles.' },
  { slug: 'umucuruzi', query: 'umucuruzi', rw: 'Abacuruzi n’abatanga ibicuruzwa mu Rwanda', en: 'Traders and sellers in Rwanda',
    rwDescription: 'Shaka abacuruzi bagaragaje ibikorwa cyangwa ibicuruzwa kuri AHABONA.',
    enDescription: 'Find traders and sellers who have public profiles on AHABONA.' },
  { slug: 'umwogoshi', query: 'umwogoshi', rw: 'Abogoshi mu Rwanda', en: 'Barbers in Rwanda',
    rwDescription: 'Shaka abogoshi bagaragaje aho bakorera n’uburyo bwo kubavugisha kuri AHABONA.',
    enDescription: 'Find barbers in Rwanda through AHABONA public profiles.' },
  { slug: 'umuvuzi-wimisatsi', query: 'umuvuzi w’imisatsi', rw: 'Abavura imisatsi mu Rwanda', en: 'Hairdressers in Rwanda',
    rwDescription: 'Shaka abavura imisatsi bagaragaje serivisi zabo kuri AHABONA.',
    enDescription: 'Find hairdressers and hair stylists with public AHABONA profiles.' },
  { slug: 'umufotozi', query: 'umufotozi', rw: 'Abafotozi mu Rwanda', en: 'Photographers in Rwanda',
    rwDescription: 'Shaka abafotozi bagaragaje ibikorwa byabo kuri AHABONA.',
    enDescription: 'Find photographers in Rwanda with public AHABONA profiles.' },
  { slug: 'umuganga', query: 'umuganga', rw: 'Abaganga n’abatanga serivisi z’ubuzima', en: 'Healthcare professionals in Rwanda',
    rwDescription: 'Reba imyirondoro y’abantu bagaragaje serivisi z’ubuzima kuri AHABONA. Banza ugenzure impamyabumenyi n’impushya zabo ku nzego zibifitiye ububasha.',
    enDescription: 'Browse public profiles of people who list health-related services. Verify professional registration and licensing with the relevant authorities before using healthcare services.' }
];
function getServiceLandingDefinition(slug) {
  return SERVICE_LANDING_PAGES.find(page => page.slug === String(slug || '')) || null;
}
function getServiceLandingSlugs() {
  return SERVICE_LANDING_PAGES.map(page => page.slug);
}
function renderServiceLandingHtml(page, profiles, options = {}) {
  if (!page || !/^[a-z0-9-]{2,60}$/.test(page.slug || '')) throw new TypeError('A valid service landing page is required');
  const base = baseOrigin(options.baseUrl);
  const list = Array.isArray(profiles) ? profiles.slice(0, 60) : [];
  const canonical = base + '/services/' + page.slug;
  const hasResults = list.length > 0;
  const title = page.rw + ' | AHABONA';
  const description = cleanText(page.rwDescription, 260);
  const cards = list.map(profile => {
    const pid = String(profile.pid || '');
    if (!PUBLIC_PID_RE.test(pid)) return '';
    const name = cleanText(profile.name, 120) || 'Umwirondoro wa AHABONA';
    const district = cleanText(profile.district, 100);
    const province = cleanText(profile.province, 100);
    const location = [district, province].filter(Boolean).join(', ');
    const skills = Array.isArray(profile.caps) ? profile.caps.map(value => cleanText(value, 70)).filter(Boolean).slice(0, 4) : [];
    const photo = safePhotoPath(profile.thumb) || (Array.isArray(profile.photos) ? profile.photos.map(safePhotoPath).find(Boolean) : '') || '';
    const intro = cleanText(profile.intro, 260);
    return '<article class="profile"><a class="profile-main" href="/u/' + escapeHtml(pid) + '">' +
      (photo ? '<img src="' + escapeHtml(base + photo) + '" alt="Ifoto ya ' + escapeHtml(name) + '" loading="lazy">' : '') +
      '<div><h2>' + escapeHtml(name) + '</h2>' +
      (location ? '<p class="muted">' + escapeHtml(location) + '</p>' : '') +
      (skills.length ? '<p class="skills">' + skills.map(escapeHtml).join(' · ') + '</p>' : '') +
      (intro ? '<p>' + escapeHtml(intro) + '</p>' : '') +
      '<span class="more">Reba umwirondoro</span></div></a></article>';
  }).filter(Boolean).join('');
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description,
    url: canonical, inLanguage: ['rw', 'en'],
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.filter(profile => PUBLIC_PID_RE.test(String(profile.pid || ''))).map((profile, index) => ({
        '@type': 'ListItem', position: index + 1,
        url: base + '/u/' + profile.pid,
        name: cleanText(profile.name, 120)
      }))
    },
    isPartOf: { '@type': 'WebSite', name: 'AHABONA', url: base + '/' }
  };
  return '<!doctype html><html lang="rw"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="' + (hasResults ? 'index,follow' : 'noindex,follow') + '">' +
    '<meta name="theme-color" content="#1a9b6c"><title>' + escapeHtml(title) + '</title>' +
    '<meta name="description" content="' + escapeHtml(description) + '">' +
    '<link rel="canonical" href="' + escapeHtml(canonical) + '">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="AHABONA">' +
    '<meta property="og:title" content="' + escapeHtml(title) + '">' +
    '<meta property="og:description" content="' + escapeHtml(description) + '">' +
    '<meta property="og:url" content="' + escapeHtml(canonical) + '">' +
    '<script type="application/ld+json">' + jsonForHtml(structuredData) + '</script>' +
    '<style>:root{color-scheme:light;--green:#1a9b6c;--deep:#103d2b;--ink:#1e2a32;--muted:#5a6470;--paper:#faf7ef;--line:#e8e4da}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}' +
    'a{color:var(--green);text-decoration:none}.wrap{width:min(900px,100% - 28px);margin:0 auto}.top{background:#fff;border-bottom:1px solid var(--line)}' +
    '.bar{display:flex;align-items:center;justify-content:space-between;padding:14px 0}.brand{font-weight:850;color:var(--deep);font-size:20px}' +
    'main{margin:24px auto}.lead{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px}h1{margin:0 0 8px;color:var(--deep);font-size:clamp(27px,5vw,38px);line-height:1.2}' +
    '.muted{color:var(--muted);font-size:14px}.profiles{display:grid;gap:12px;margin-top:14px}.profile{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}' +
    '.profile-main{display:flex;gap:14px;padding:14px;color:var(--ink)}.profile img{width:104px;height:104px;object-fit:cover;border-radius:12px;flex:none;background:#edf1ed}' +
    '.profile h2{font-size:19px;margin:0 0 4px;color:var(--deep)}.profile p{margin:4px 0;font-size:14px}.skills{color:#15583b;font-weight:650}.more{display:inline-block;margin-top:5px;color:var(--green);font-weight:750;font-size:14px}' +
    '.empty{margin-top:14px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:14px}.foot{text-align:center;padding:4px 0 28px;color:var(--muted);font-size:14px}' +
    '@media(max-width:520px){.profile-main{gap:10px;padding:11px}.profile img{width:82px;height:82px}}' +
    '</style></head><body><header class="top"><div class="wrap bar"><a class="brand" href="/">AHABONA</a><a href="/">Subira kuri AHABONA</a></div></header>' +
    '<main class="wrap"><section class="lead"><h1>' + escapeHtml(page.rw) + '</h1><p>' + escapeHtml(description) + '</p>' +
    '<p class="muted">Kwiyandikisha no gushakisha kuri AHABONA ni ubuntu. Abantu bavugana kandi bakumvikana hagati yabo.</p></section>' +
    (hasResults ? '<section class="profiles" aria-label="Abantu bafite public profiles">' + cards + '</section>' :
      '<section class="empty"><h2>Nta muntu ubonetse muri iki cyiciro ubu</h2><p>Subira kuri AHABONA ushakishe abandi cyangwa ugerageze nyuma.</p></section>') +
    '<footer class="foot">AHABONA ntitanga akazi kandi ntiyivanga mu masezerano y’abakoresha. <a href="/">Shakisha abantu kuri AHABONA.</a></footer></main></body></html>';
}

module.exports = { DEFAULT_BASE_URL, buildRobotsTxt, buildSitemapXml, renderPublicProfileHtml, renderInfoPageHtml, getServiceLandingDefinition, getServiceLandingSlugs, renderServiceLandingHtml, escapeHtml, isoDate };
