'use strict';

const { withTransaction } = require('./postgres.cjs');
const { ensureLegacyIdentity } = require('./jobs-employer.cjs');

function parseArray(value, maxItems = 100) {
  let source = value;
  if (typeof source === 'string') {
    try { source = JSON.parse(source); } catch { source = []; }
  }
  if (!Array.isArray(source)) return [];
  return source.slice(0, maxItems);
}

function safeIdList(value) {
  return [...new Set(parseArray(value, 40)
    .map(item => Number(item))
    .filter(id => Number.isSafeInteger(id) && id > 0))].slice(0, 40);
}

function safeText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C-\u001F\u007F]/g, '').trim().slice(0, maxLength)
    : '';
}

function safeJsonList(value, maxItems, maxLength) {
  return JSON.stringify(parseArray(value, maxItems).map(item => {
    if (typeof item === 'string') return safeText(item, maxLength);
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const clean = {};
    for (const [key, itemValue] of Object.entries(item).slice(0, 12)) {
      if (typeof itemValue === 'string') clean[key] = safeText(itemValue, maxLength);
      else if (typeof itemValue === 'number' && Number.isFinite(itemValue)) clean[key] = itemValue;
      else if (typeof itemValue === 'boolean') clean[key] = itemValue;
    }
    return Object.keys(clean).length ? clean : null;
  }).filter(Boolean));
}

/**
 * Mirrors only the minimum work-profile projection needed by matching and
 * application snapshots. Private contacts, credentials and identity fields
 * are deliberately not copied into Neon.
 */
async function syncLegacyProfile(pool, actor, sourceProfile, sourceCapabilities = []) {
  if (!pool || typeof pool.connect !== 'function') throw new TypeError('PostgreSQL pool is required.');
  const userId = Number(actor && actor.id);
  if (!Number.isSafeInteger(userId) || userId < 1 || actor.status !== 'active') {
    throw new TypeError('An active AHABONA user is required.');
  }
  if (!sourceProfile || Number(sourceProfile.user_id) !== userId) {
    throw new TypeError('A matching legacy profile is required.');
  }

  const pid = safeText(sourceProfile.pid, 40);
  const name = safeText(sourceProfile.name, 120);
  const district = safeText(sourceProfile.district, 80);
  if (!pid || !name || !district) throw new TypeError('The legacy profile is missing required public fields.');

  const capabilityIds = safeIdList(sourceProfile.caps);
  const allowedIds = new Set(capabilityIds);
  const capabilities = (Array.isArray(sourceCapabilities) ? sourceCapabilities : [])
    .filter(item => allowedIds.has(Number(item && item.id)))
    .slice(0, 40)
    .map(item => ({
      id: Number(item.id),
      name: safeText(item.name, 120),
      category: safeText(item.category, 100),
      nameEn: safeText(item.name_en, 120) || null,
      aliases: JSON.stringify(parseArray(item.aliases, 30).map(x => safeText(x, 120)).filter(Boolean)),
      sortOrder: Number.isSafeInteger(Number(item.sort_order)) ? Number(item.sort_order) : 0,
      active: item.active === 0 || item.active === false ? false : true
    }))
    .filter(item => Number.isSafeInteger(item.id) && item.id > 0 && item.name && item.category);

  return withTransaction(pool, async client => {
    await ensureLegacyIdentity(client, actor);

    for (const capability of capabilities) {
      await client.query(
        'INSERT INTO public.capabilities (id, name, category, aliases, active, name_en, sort_order) ' +
        'VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7) ' +
        'ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, ' +
        'aliases = EXCLUDED.aliases, active = EXCLUDED.active, name_en = EXCLUDED.name_en, sort_order = EXCLUDED.sort_order',
        [capability.id, capability.name, capability.category, capability.aliases, capability.active, capability.nameEn, capability.sortOrder]
      );
    }

    if (capabilities.length) {
      await client.query(
        "SELECT setval(pg_get_serial_sequence('public.capabilities', 'id'), " +
        'GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.capabilities), 1), true)'
      );
    }

    const createdAt = Number.isFinite(Number(sourceProfile.created_at)) ? Number(sourceProfile.created_at) : Number(actor.created_at) || Date.now();
    const updatedAt = Number.isFinite(Number(sourceProfile.updated_at)) ? Number(sourceProfile.updated_at) : Date.now();
    const caps = JSON.stringify(capabilityIds.filter(id => capabilities.some(item => item.id === id)));
    const experience = safeJsonList(sourceProfile.experience, 20, 180);
    const languages = safeJsonList(sourceProfile.languages, 20, 60);
    const availability = safeJsonList(sourceProfile.availability, 20, 100);
    const educationLevel = safeText(sourceProfile.edu_level, 80) || null;

    await client.query(
      'INSERT INTO public.profiles (user_id, pid, name, district, caps, suspended, created_at, updated_at, experience, languages, availability, edu_level) ' +
      'VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12) ' +
      'ON CONFLICT (user_id) DO UPDATE SET pid = EXCLUDED.pid, name = EXCLUDED.name, district = EXCLUDED.district, ' +
      'caps = EXCLUDED.caps, suspended = EXCLUDED.suspended, updated_at = EXCLUDED.updated_at, ' +
      'experience = EXCLUDED.experience, languages = EXCLUDED.languages, availability = EXCLUDED.availability, edu_level = EXCLUDED.edu_level',
      [
        userId, pid, name, district, caps, sourceProfile.suspended === 1 || sourceProfile.suspended === true,
        createdAt, updatedAt, experience, languages, availability, educationLevel
      ]
    );

    return { userId, profileSynced: true, capabilityCount: capabilities.length };
  });
}

module.exports = { parseArray, safeIdList, syncLegacyProfile };
