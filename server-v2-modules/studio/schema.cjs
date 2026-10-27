'use strict';

/*
 * AHABONA Studio uses additive-only tables. This schema does not alter or
 * migrate existing application tables (including strip_ads or site_settings).
 * Call initStudioSchema(db) only in the Studio-enabled server build.
 */
const STUDIO_SCHEMA = `
CREATE TABLE IF NOT EXISTS studio_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
  playback_mode TEXT NOT NULL DEFAULT 'sequential'
    CHECK (playback_mode IN ('sequential','shuffle')),
  transition TEXT NOT NULL DEFAULT 'fade'
    CHECK (transition IN ('none','fade','slide')),
  transition_ms INTEGER NOT NULL DEFAULT 450
    CHECK (transition_ms BETWEEN 0 AND 1500),
  default_duration_ms INTEGER NOT NULL DEFAULT 7000
    CHECK (default_duration_ms BETWEEN 1000 AND 90000),
  pause_on_interaction INTEGER NOT NULL DEFAULT 1
    CHECK (pause_on_interaction IN (0,1)),
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS studio_assets (
  id INTEGER PRIMARY KEY,
  asset_kind TEXT NOT NULL CHECK (asset_kind IN ('image','video','poster')),
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  bytes INTEGER NOT NULL CHECK (bytes > 0),
  sha256 TEXT,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  codec TEXT,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing','ready','failed')),
  failure_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (width IS NULL OR width BETWEEN 1 AND 20000),
  CHECK (height IS NULL OR height BETWEEN 1 AND 20000),
  CHECK (duration_ms IS NULL OR duration_ms BETWEEN 1 AND 90000),
  CHECK (sha256 IS NULL OR (length(sha256) = 64 AND sha256 NOT GLOB '*[^0-9a-f]*'))
);

CREATE TABLE IF NOT EXISTS studio_scenes (
  id INTEGER PRIMARY KEY,
  scene_kind TEXT NOT NULL CHECK (scene_kind IN ('text','image','video')),
  title_rw TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  body_rw TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  text_style_json TEXT NOT NULL DEFAULT '{}',
  overlay_style_json TEXT NOT NULL DEFAULT '{}',
  asset_id INTEGER REFERENCES studio_assets(id) ON DELETE SET NULL,
  poster_asset_id INTEGER REFERENCES studio_assets(id) ON DELETE SET NULL,
  cta_label_rw TEXT NOT NULL DEFAULT '',
  cta_label_en TEXT NOT NULL DEFAULT '',
  cta_action TEXT NOT NULL DEFAULT 'none'
    CHECK (cta_action IN ('none','register','search','help','about','link')),
  cta_value TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN -100000 AND 100000),
  duration_ms INTEGER NOT NULL DEFAULT 7000
    CHECK (duration_ms BETWEEN 1000 AND 90000),
  transition TEXT NOT NULL DEFAULT 'fade'
    CHECK (transition IN ('inherit','none','fade','slide')),
  fit TEXT NOT NULL DEFAULT 'cover' CHECK (fit IN ('cover','contain')),
  crop_x INTEGER NOT NULL DEFAULT 50 CHECK (crop_x BETWEEN 0 AND 100),
  crop_y INTEGER NOT NULL DEFAULT 50 CHECK (crop_y BETWEEN 0 AND 100),
  start_at INTEGER,
  end_at INTEGER,
  created_by INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (start_at IS NULL OR end_at IS NULL OR end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_studio_scenes_status_order
  ON studio_scenes(status, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_studio_scenes_schedule
  ON studio_scenes(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_studio_assets_status
  ON studio_assets(status, asset_kind);
`;

function initStudioSchema(db, now) {
  if (!db || typeof db.exec !== 'function' || typeof db.prepare !== 'function') {
    throw new TypeError('A SQLite-compatible database handle is required');
  }
  db.exec(STUDIO_SCHEMA);
  const t = Number.isSafeInteger(now) ? now : Date.now();
  db.prepare(`INSERT OR IGNORE INTO studio_settings
    (id, enabled, playback_mode, transition, transition_ms,
     default_duration_ms, pause_on_interaction, updated_at)
    VALUES (1, 0, 'sequential', 'fade', 450, 7000, 1, ?)`).run(t);
  return true;
}

module.exports = { STUDIO_SCHEMA, initStudioSchema };
