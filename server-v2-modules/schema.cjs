'use strict';

const SCHEMA=`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pw TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  deleted_at INTEGER,
  terms_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles(
  user_id INTEGER PRIMARY KEY,
  pid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  caps TEXT NOT NULL,
  other_text TEXT,
  intro TEXT,
  edu TEXT,
  soc TEXT,
  wa TEXT,
  phone_visible INTEGER NOT NULL DEFAULT 1,
  phones TEXT NOT NULL DEFAULT '[]',
  svc TEXT NOT NULL DEFAULT '[]',
  nphotos INTEGER NOT NULL DEFAULT 0,
  suspended INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS capabilities(
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cap_requests(
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS saved(
  user_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY(user_id,pid)
);
CREATE TABLE IF NOT EXISTS reports(
  id INTEGER PRIMARY KEY,
  pid TEXT NOT NULL,
  reporter INTEGER,
  reason TEXT NOT NULL,
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS devices(
  id TEXT PRIMARY KEY,
  seed TEXT NOT NULL,
  epoch INTEGER NOT NULL DEFAULT 0,
  last_active INTEGER NOT NULL,
  snapshot_at INTEGER,
  snapshot TEXT,
  current TEXT
);
CREATE TABLE IF NOT EXISTS exposure(
  device TEXT NOT NULL,
  pid TEXT NOT NULL,
  seen INTEGER NOT NULL DEFAULT 0,
  last_seen INTEGER,
  PRIMARY KEY(device,pid)
);
CREATE TABLE IF NOT EXISTS stats(
  pid TEXT PRIMARY KEY,
  impressions INTEGER NOT NULL DEFAULT 0,
  opens INTEGER NOT NULL DEFAULT 0,
  contacts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS intent(
  device TEXT NOT NULL,
  key TEXT NOT NULL,
  score REAL NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY(device,key)
);
CREATE TABLE IF NOT EXISTS resets(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY,
  admin INTEGER,
  action TEXT,
  target TEXT,
  at INTEGER
);
CREATE TABLE IF NOT EXISTS search_log(
  id INTEGER PRIMARY KEY,
  q TEXT,
  district TEXT,
  n INTEGER,
  at INTEGER
);
`;

/* Extended tables used by the current server. */const SCHEMA_V2_TABLES=`
CREATE TABLE IF NOT EXISTS site_settings(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_logs(
  id INTEGER PRIMARY KEY,
  admin_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip TEXT,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY,
  from_id INTEGER,
  to_id INTEGER NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  title TEXT,
  body TEXT,
  link TEXT,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS email_verifications(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS phone_verifications(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS verifications(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at INTEGER NOT NULL,
  decided_at INTEGER,
  decided_by INTEGER
);
CREATE TABLE IF NOT EXISTS strip_ads(
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'about',
  action_value TEXT,
  kind TEXT DEFAULT 'announcement',
  active INTEGER NOT NULL DEFAULT 1,
  start_at INTEGER,
  end_at INTEGER,
  priority INTEGER DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  paid_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS help_faq(
  id INTEGER PRIMARY KEY,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  terms TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS help_messages(
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
`;


module.exports = { SCHEMA, SCHEMA_V2_TABLES };
