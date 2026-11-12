'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createPostgresPool,
  checkPostgres,
  withTransaction,
  parseDatabaseUrl
} = require('../server/postgres.cjs');

class FakePool {
  static lastOptions = null;

  constructor(options) {
    FakePool.lastOptions = options;
    this.handlers = {};
    this.ended = false;
    this.queryCalls = [];
  }

  on(event, handler) {
    this.handlers[event] = handler;
    return this;
  }

  async query(sql, values) {
    this.queryCalls.push({ sql, values });
    return {
      rows: [{ ok: 1, database_name: 'ahabona', server_version_num: '170011' }]
    };
  }

  async end() {
    this.ended = true;
  }
}

function makeEnv(overrides = {}) {
  return {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://ahabona_app:secret@ep-example.eu-central-1.aws.neon.tech/ahabona?sslmode=require',
    ...overrides
  };
}

test('requires DATABASE_URL and reports no secret values', () => {
  assert.throws(
    () => createPostgresPool({ env: {}, PoolClass: FakePool }),
    /DATABASE_URL is required/
  );
});

test('accepts PostgreSQL URLs only', () => {
  assert.throws(
    () => parseDatabaseUrl('mysql://user:pass@example.com/db'),
    /postgres or postgresql/
  );
});

test('removes connection-string TLS overrides so verified TLS config is authoritative', () => {
  const clean = parseDatabaseUrl(
    'postgres://user:pass@db.example.test/ahabona?sslmode=disable&sslrootcert=bad.pem&application_name=old'
  );
  const url = new URL(clean);
  assert.equal(url.searchParams.has('sslmode'), false);
  assert.equal(url.searchParams.has('sslrootcert'), false);
  assert.equal(url.searchParams.get('application_name'), 'old');
});

test('creates a bounded pool with certificate verification enabled', () => {
  createPostgresPool({
    env: makeEnv({ AHABONA_PG_POOL_MAX: '999' }),
    PoolClass: FakePool
  });

  assert.equal(FakePool.lastOptions.max, 30);
  assert.deepEqual(FakePool.lastOptions.ssl, { rejectUnauthorized: true });
  assert.equal(FakePool.lastOptions.application_name, 'ahabona-api');
  assert.equal(FakePool.lastOptions.connectionTimeoutMillis, 5000);
  assert.equal(FakePool.lastOptions.idleTimeoutMillis, 30000);
});

test('health check returns safe database metadata and latency', async () => {
  const pool = new FakePool({});
  const result = await checkPostgres(pool);

  assert.equal(result.ok, true);
  assert.equal(result.database, 'ahabona');
  assert.equal(result.serverVersionNum, '170011');
  assert.equal(typeof result.latencyMs, 'number');
  assert.equal(pool.queryCalls.length, 1);
});

test('transaction commits and releases its client', async () => {
  const calls = [];
  const client = {
    async query(sql) { calls.push(sql); return { rows: [] }; },
    release(error) { calls.push(error ? 'release-error' : 'release'); }
  };
  const pool = { async connect() { return client; } };

  const result = await withTransaction(pool, async tx => {
    await tx.query('SELECT 1');
    return 'saved';
  });

  assert.equal(result, 'saved');
  assert.deepEqual(calls, ['BEGIN', 'SELECT 1', 'COMMIT', 'release']);
});

test('transaction rolls back and releases when callback fails', async () => {
  const calls = [];
  const client = {
    async query(sql) { calls.push(sql); return { rows: [] }; },
    release(error) { calls.push(error ? 'release-error' : 'release'); }
  };
  const pool = { async connect() { return client; } };

  await assert.rejects(
    withTransaction(pool, async () => { throw new Error('expected test failure'); }),
    /expected test failure/
  );
  assert.deepEqual(calls, ['BEGIN', 'ROLLBACK', 'release']);
});


test('rollback failure evicts the connection and releases it only once', async () => {
  const calls = [];
  const client = {
    async query(sql) {
      calls.push(sql);
      if (sql === 'ROLLBACK') throw new Error('rollback failed');
      return { rows: [] };
    },
    release(error) { calls.push(error ? 'release-error' : 'release'); }
  };
  const pool = { async connect() { return client; } };

  await assert.rejects(
    withTransaction(pool, async () => { throw new Error('original failure'); }),
    /original failure/
  );
  assert.deepEqual(calls, ['BEGIN', 'ROLLBACK', 'release-error']);
});
