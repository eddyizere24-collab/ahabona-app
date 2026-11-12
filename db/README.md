# AHABONA database operations

## Environments

- Neon project: `ahabona-platform`, region `aws-eu-central-1`.
- Development branch: `br-super-truth-b9ei5e3y`.
- Neon `main` and Lightsail production are not part of routine development writes.
- Current production application continues to use its existing SQLite database until an approved migration/cutover.

## Migration rules

1. Store each schema change as an ordered SQL file in `db/migrations/`.
2. Test changes on the Neon development branch first.
3. Use the direct (non-pooled) PostgreSQL URL for schema migrations, dumps, and restores.
4. Use the pooled connection URL for ordinary application query traffic.
5. Do not run SQL copied ad hoc from chat against Production. Review the migration file and its diff first.
6. Keep migration version names stable and record every applied migration in `public.schema_migrations`.
7. Prefer additive changes. For a destructive change, require an explicit backup, rollback plan, and owner release approval.

## Runtime connection

- The Node.js adapter is `server/postgres.cjs`.
- It reads `DATABASE_URL` from the server environment only.
- The connection URL must never be placed in browser code, source files, GitHub Actions logs, or chat messages.
- TLS certificate verification is enabled by the adapter; TLS overrides in URL query parameters are removed so the explicit verified TLS configuration is used.
- Pool limits and timeouts are controlled by `AHABONA_PG_POOL_MAX`, `AHABONA_PG_CONNECTION_TIMEOUT_MS`, `AHABONA_PG_IDLE_TIMEOUT_MS`, and `AHABONA_PG_QUERY_TIMEOUT_MS`.
- The adapter is not activated by the existing server yet. Do not set a runtime switch or configure Lightsail until repository routes have been migrated and parity tests pass.

## Roles and sensitive information

- `ahabona_owner`: schema owner / migration principal. Keep credentials out of application requests.
- `ahabona_app`: runtime data role. It must not create schema objects.
- Runtime access to `user_sensitive_records` and `schema_migrations` is revoked.
- National ID material is never stored in plaintext. Any future import must encrypt it before storage and record the encryption-key version.
- Phone verification codes, push subscription endpoint/key material, and private application fields must not be logged or exposed to anonymous visitors.
- Authorize all application, employer, moderator, and candidate operations in the AHABONA server. Do not give browser clients a privileged PostgreSQL connection.

## Data migration requirements

Before any migration from SQLite:

1. Make a protected, encrypted backup of the active SQLite database and uploaded files.
2. Measure actual row counts and inspect all table columns, unique constraints, relationships, and timestamp units.
3. Export from a consistent SQLite snapshot; never copy directly from a database that is being concurrently written without a consistency plan.
4. Preserve `users.id`, `profiles.user_id`, `profiles.pid`, capability IDs, and session/token semantics where valid.
5. Move national ID values into encrypted storage; never copy them into the Postgres `users` table.
6. Hash or re-issue verification codes and reset/session tokens safely; do not migrate active plaintext OTPs.
7. Verify row counts, relationships, indexes, login, profile discovery, messaging, saved profiles, notifications, and restore procedure.
8. Rehearse rollback to SQLite before approving cutover.

## Current implementation status

- `0001_opportunity_foundation.sql`: applied on Neon development.
- `0002_restrict_sensitive_runtime_access.sql`: applied on Neon development and recorded in the migration ledger.
- The Neon development database contains schema only; it has zero user, profile, job-post, and application rows.
- Neon main is still clean. No live application routes are connected to Postgres yet.
- No Lightsail environment settings, Production database, or production data have been changed.
