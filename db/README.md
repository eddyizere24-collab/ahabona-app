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
- server-v2.cjs now creates the PostgreSQL pool only when AHABONA_ENABLE_POSTGRES=1. Employer job, public job, application and moderation API routes are wired behind this gate. The gate remains off in the live Lightsail environment; SQLite continues to serve Production. Do not enable it on Lightsail until full route parity, backup/restore rehearsal and a separate release approval are complete.

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
- `0003_legacy_identity_bridge.sql`: applied on Neon development; it permits ID-only identity projection without copying private contacts or credentials.
- `0004_job_draft_moderation_event.sql`: applied on Neon development; it records draft-save lifecycle events.
- `0005_job_changes_requested_status.sql`: applied on Neon development; it permits a moderator to request employer corrections.
- Neon development has 45 public tables and 62 foreign keys. Last read-back counts: users=0, profiles=0, capabilities=0, job_posts=0, job_applications=0, notifications=0.
- The runtime role can read/write job and application data and create notifications, but cannot read user_sensitive_records or schema_migrations.
- API route code is wired behind the feature gate, but no live Lightsail application route is using Postgres yet. No Lightsail environment settings, Production database, user data, or production data have been changed.
- No Lightsail environment settings, Production database, or production data have been changed.


## SQLite backup audit

To inventory a **protected backup**, set `AHABONA_SQLITE_PATH` to the explicit file path and run:

```bash
npm run audit:sqlite
```

The script opens SQLite in read-only mode and outputs schema metadata and counts only. It does not print row values. Do not point it at a live database file while the application is writing. The audit has not yet been run against the real AHABONA backup.


## Employer and candidate APIs (development branch only)

The feature branch now includes:
- Public job reads: GET /api/jobs and GET /api/jobs/:uuid.
- Employer job creation and listing: POST /api/jobs and GET /api/me/jobs.
- Employer job draft edit, moderation submission, and close: PUT /api/me/jobs/:uuid, POST /api/me/jobs/:uuid/submit, POST /api/me/jobs/:uuid/close.
- Permissioned moderation: GET /api/admin/jobs and POST /api/admin/jobs/:uuid/review. The distinct jobs.moderate permission is granted to admin and mod roles.
- Candidate applications: POST /api/jobs/:uuid/applications and GET /api/me/applications.
- Employer applicant pipeline: GET /api/employer/jobs/:uuid/applications and POST /api/employer/applications/:uuid/status.

All of these routes require AHABONA_ENABLE_POSTGRES=1. The flag defaults off. Employer ownership, candidate ownership, moderation permissions, same-origin mutation checks, request-size limits and rate limits are enforced in the Node.js server. These are API layers only; UI, email/push dispatch, matching and Talent Watch are not complete.

## Verification boundaries

- GitHub Actions checks JavaScript syntax and runs the repository's focused service tests, including application and job moderation workflow tests.
- Service tests use fake PostgreSQL pools. They do not prove the Lightsail server can currently connect to Neon.
- Neon development schema and runtime-role privileges have been verified separately using read-only connector queries.
- No production connection strings, Neon main schema changes, Lightsail environment updates, PM2 restarts, production migrations or deployments have been performed.
