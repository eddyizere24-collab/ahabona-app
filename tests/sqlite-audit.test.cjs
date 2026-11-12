'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');

const script = path.join(__dirname, '..', 'scripts', 'audit-sqlite-schema.cjs');

function withTempDb(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahabona-sqlite-audit-'));
  const dbPath = path.join(dir, 'backup.sqlite');
  const db = new DatabaseSync(dbPath);
  try {
    db.exec([
      'CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL, pw TEXT NOT NULL)',
      'CREATE TABLE profiles (user_id INTEGER PRIMARY KEY REFERENCES users(id), name TEXT NOT NULL)',
      'CREATE INDEX idx_profiles_name ON profiles(name)',
      "INSERT INTO users(email, pw) VALUES ('private@example.test', 'do-not-export-hash')",
      "INSERT INTO profiles(user_id, name) VALUES (1, 'Private Test Name')"
    ].join(';'));
    db.close();
    return run({ dir, dbPath });
  } finally {
    try { db.close(); } catch {}
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('schema audit reports metadata and counts without exporting row contents', () => {
  withTempDb(({ dbPath }) => {
    const result = spawnSync(process.execPath, [script], {
      encoding: 'utf8',
      env: { ...process.env, AHABONA_SQLITE_PATH: dbPath }
    });

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.readOnly, true);
    assert.equal(report.tableCount, 2);
    assert.equal(report.totalRows, 2);
    assert.equal(report.foreignKeyViolations, 0);
    assert.ok(report.tables.some(table =>
      table.name === 'profiles' && table.foreignKeys.length === 1
    ));
    assert.ok(!result.stdout.includes('private@example.test'));
    assert.ok(!result.stdout.includes('do-not-export-hash'));
    assert.ok(!result.stdout.includes('Private Test Name'));
  });
});

test('audit refuses to run without an explicit SQLite path', () => {
  const env = { ...process.env };
  delete env.AHABONA_SQLITE_PATH;
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8', env });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /AHABONA_SQLITE_PATH/);
  assert.equal(result.stdout, '');
});

test('audit refuses symlink paths', () => {
  withTempDb(({ dir, dbPath }) => {
    const linkPath = path.join(dir, 'linked.sqlite');
    fs.symlinkSync(dbPath, linkPath);
    const result = spawnSync(process.execPath, [script], {
      encoding: 'utf8',
      env: { ...process.env, AHABONA_SQLITE_PATH: linkPath }
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /regular, non-symlink/);
  });
});
