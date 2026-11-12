'use strict';

const DEFAULT_POOL_MAX = 8;
const MAX_POOL_MAX = 30;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5000;
const DEFAULT_IDLE_TIMEOUT_MS = 30000;
const DEFAULT_QUERY_TIMEOUT_MS = 15000;

let sharedPool = null;

function positiveInt(value, fallback, maximum) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function parseDatabaseUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('DATABASE_URL is required before PostgreSQL can be enabled.');
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol.');
  }
  if (!url.hostname || !url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_URL must include a PostgreSQL host and database name.');
  }
  if (!url.username || !url.password) {
    throw new Error('DATABASE_URL must include a database username and password.');
  }

  // Keep the URL free of TLS options because node-postgres gives connection-string
  // SSL options precedence over the explicit, certificate-verifying SSL object.
  for (const key of [
    'sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert',
    'sslpassword', 'sslcrl', 'ssl_min_protocol_version',
    'ssl_max_protocol_version'
  ]) {
    url.searchParams.delete(key);
  }

  return url.toString();
}

function createPostgresPool(options = {}) {
  const env = options.env || process.env;
  const connectionString = parseDatabaseUrl(env.DATABASE_URL);
  const PoolClass = options.PoolClass || require('pg').Pool;

  const pool = new PoolClass({
    connectionString,
    ssl: { rejectUnauthorized: true },
    max: positiveInt(env.AHABONA_PG_POOL_MAX, DEFAULT_POOL_MAX, MAX_POOL_MAX),
    connectionTimeoutMillis: positiveInt(
      env.AHABONA_PG_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS,
      30000
    ),
    idleTimeoutMillis: positiveInt(
      env.AHABONA_PG_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS,
      300000
    ),
    query_timeout: positiveInt(
      env.AHABONA_PG_QUERY_TIMEOUT_MS,
      DEFAULT_QUERY_TIMEOUT_MS,
      120000
    ),
    keepAlive: true,
    application_name: 'ahabona-api'
  });

  // Never log a connection URL, credentials, SQL parameters, or user data.
  pool.on('error', error => {
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]{1,32}$/.test(error.code)
      ? error.code
      : 'UNKNOWN';
    process.emitWarning('AHABONA PostgreSQL idle-client error (' + code + ').');
  });

  return pool;
}

function getPostgresPool() {
  if (!sharedPool) sharedPool = createPostgresPool();
  return sharedPool;
}

async function closePostgresPool() {
  if (!sharedPool) return;
  const pool = sharedPool;
  sharedPool = null;
  await pool.end();
}

async function checkPostgres(pool = getPostgresPool()) {
  const startedAt = Date.now();
  const result = await pool.query(
    'SELECT 1 AS ok, current_database() AS database_name, current_setting($1) AS server_version_num',
    ['server_version_num']
  );
  const row = result.rows?.[0];
  if (!row || Number(row.ok) !== 1) {
    throw new Error('PostgreSQL health check returned an unexpected result.');
  }

  return {
    ok: true,
    database: row.database_name,
    serverVersionNum: row.server_version_num,
    latencyMs: Date.now() - startedAt
  };
}

async function withTransaction(pool, work) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new TypeError('A PostgreSQL pool is required.');
  }
  if (typeof work !== 'function') {
    throw new TypeError('A transaction callback is required.');
  }

  const client = await pool.connect();
  let began = false;
  let released = false;
  try {
    await client.query('BEGIN');
    began = true;
    const result = await work(client);
    await client.query('COMMIT');
    began = false;
    return result;
  } catch (error) {
    if (began) {
      try {
        await client.query('ROLLBACK');
        began = false;
      } catch {
        // A failed rollback makes the client unsafe to return to the pool.
        client.release(error);
        released = true;
      }
    }
    throw error;
  } finally {
    if (!released) client.release();
  }
}

module.exports = {
  createPostgresPool,
  getPostgresPool,
  closePostgresPool,
  checkPostgres,
  withTransaction,
  parseDatabaseUrl
};
