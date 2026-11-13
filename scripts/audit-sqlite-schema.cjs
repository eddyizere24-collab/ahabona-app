'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function quoteIdentifier(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function requiredDatabasePath(env = process.env) {
  const raw = env.AHABONA_SQLITE_PATH;
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Set AHABONA_SQLITE_PATH to an explicit SQLite backup file.');
  }

  const resolved = path.resolve(raw);
  let stat;
  try {
    stat = fs.lstatSync(resolved);
  } catch {
    throw new Error('The configured SQLite file is not accessible.');
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error('The configured SQLite path must be a regular, non-symlink file.');
  }
  return resolved;
}

function inspectDatabase(db) {
  db.exec('PRAGMA query_only = ON');

  const quickCheck = db.prepare('PRAGMA quick_check').all().map(row => row.quick_check);
  const schemaVersion = db.prepare('PRAGMA schema_version').get().schema_version;
  const objects = db.prepare(
    "SELECT name, type FROM sqlite_master " +
    "WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' " +
    "ORDER BY type, name"
  ).all();

  const tables = [];
  let totalRows = 0;

  for (const object of objects) {
    const identifier = quoteIdentifier(object.name);
    const row = db.prepare('SELECT COUNT(*) AS row_count FROM ' + identifier).get();
    const rowCount = Number(row.row_count) || 0;
    const columns = db.prepare('PRAGMA table_info(' + identifier + ')').all();
    const foreignKeys = db.prepare('PRAGMA foreign_key_list(' + identifier + ')').all();
    const indexes = db.prepare('PRAGMA index_list(' + identifier + ')').all().map(index => ({
      name: index.name,
      unique: Boolean(index.unique),
      origin: index.origin,
      partial: Boolean(index.partial),
      columns: db.prepare('PRAGMA index_info(' + quoteIdentifier(index.name) + ')')
        .all()
        .map(column => column.name)
    }));

    tables.push({
      name: object.name,
      type: object.type,
      rowCount,
      columns: columns.map(column => ({
        name: column.name,
        type: column.type,
        notNull: Boolean(column.notnull),
        primaryKeyPosition: column.pk,
        hasDefault: column.dflt_value !== null
      })),
      foreignKeys: foreignKeys.map(fk => ({
        id: fk.id,
        sequence: fk.seq,
        table: fk.table,
        from: fk.from,
        to: fk.to,
        onUpdate: fk.on_update,
        onDelete: fk.on_delete
      })),
      indexes
    });

    totalRows += rowCount;
  }

  const foreignKeyViolations = db.prepare('PRAGMA foreign_key_check').all().length;
  const triggerCount = db.prepare(
    "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='trigger'"
  ).get().count;

  return {
    auditVersion: 1,
    readOnly: true,
    schemaVersion,
    quickCheck,
    tableCount: tables.filter(table => table.type === 'table').length,
    viewCount: tables.filter(table => table.type === 'view').length,
    totalRows,
    foreignKeyViolations,
    triggerCount,
    tables
  };
}

function main() {
  const dbPath = requiredDatabasePath();
  let db;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
    const report = inspectDatabase(db);
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    if (report.quickCheck.some(value => value !== 'ok') || report.foreignKeyViolations > 0) {
      process.exitCode = 2;
    }
  } finally {
    if (db) db.close();
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    // The message is intentionally generic and never prints database contents or file path.
    process.stderr.write('[sqlite-audit] ' + error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = { inspectDatabase, requiredDatabasePath };
