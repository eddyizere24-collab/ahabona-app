# AHABONA Opportunity Engine — Build Tracker

**Last verified:** 12 Ugushyingo 2026  
**Working branch:** `feature/chatgpt-discovery-foundation-20261112`  
**Production status:** unchanged. No Lightsail environment variables, production database, PM2 process, or public deployment has been modified.

This tracker distinguishes work that is implemented and tested from work that is only designed. Percentages are phase estimates, not a claim that the full product is complete.

## Verified progress

| Workstream | Progress | Evidence / current state |
|---|---:|---|
| Product requirements and architecture baseline | 100% | Build Plan v1.8 in `docs/AHABONA-OPPORTUNITY-ENGINE-BUILD-PLAN.md` |
| Neon development infrastructure | 100% | Frankfurt project `ahabona-platform`, PostgreSQL 17.11, development branch ready |
| Initial PostgreSQL schema | 100% | 45 tables, 62 foreign keys, two recorded migrations on development |
| Runtime database role security | 100% | `ahabona_app` has DML privileges; no schema CREATE; no read access to sensitive identity vault or migration ledger |
| Node.js PostgreSQL adapter | 70% | Server-only pool, verified TLS, timeouts, health check and transaction helper implemented; not yet wired into routes or connected to Neon from Lightsail |
| SQLite migration audit tooling | 100% | Read-only schema/count audit utility; synthetic fixture tests pass; real AHABONA backup not yet audited |
| SQLite data export/import and reconciliation | 0% | Waiting for a protected, consistent source backup and complete schema audit |
| Existing API/database route integration | 0% | Existing server still uses synchronous SQLite query methods |
| Public Job Marketplace API | 0% | Database tables exist; public endpoints not yet implemented |
| Employer creation and management | 0% | Schema foundation only |
| Apply on AHABONA and applicant tracking | 0% | Schema foundation only |
| Candidate Talent Passport enhancements | 0% | Existing profile model must be extended progressively, without duplicate accounts |
| Matching and Talent Watch | 0% | Schema foundation only; matching engine not implemented |
| In-app/email/web-push job notifications | 0% | Delivery schema exists; integration and worker not implemented |
| Moderation, verification and anti-fraud workflows | 0% | Tables exist; server authorization and admin UX not implemented |
| UI and responsive job experience | 0% | No homepage changes; homepage remains intentionally untouched |
| End-to-end tests and production cutover | 0% | No production change authorized or performed |

## GitHub implementation evidence

| Commit | Change |
|---|---|
| `84acb5821a08c1773bde46cc0d69197dc557e60b` | Initial relational foundation and Opportunity Engine tables |
| `e452d62f59d3fbecee1aa5f91b6b2ee590ecdfa7` | Record sensitive-access privilege migration in database ledger |
| `84c66b0f8fcfd0ab657a41514efdca832d8d7e38` | Revoke runtime-role access to sensitive identity vault and migration ledger |
| `930fb3402ad2793b5d5a331c603c6645c0f61b04` | Add Node.js PostgreSQL pool adapter |
| `2407071bd65b5e8a249c21d930dc300955018152` | Add PostgreSQL adapter unit tests |
| `afbb33bd4f0330b4abfaec23fb527e4489d359b9` | Add read-only SQLite schema audit utility |
| `4f1ae2b3504a81e7bc010d5098a7ee42919ed585` | Test SQLite audit privacy and safe path handling |
| `22dc0ff69384fb7768baf4a6c054d0d7b0d040a4` | Add package scripts for SQLite audit and tests |
| `1a797f6e58fd78b058e39772dbefe83363008bcf` | Extend GitHub Actions to run all three test suites |
| `6619aa327183e5ed3f1d474d2d100efc552229d8` | Update build plan to v1.8 |
| `16971dd4e542eb1a86990c0478a4ec51850dcf53` | Document SQLite backup audit runbook |

## CI evidence

- GitHub Actions run: [43274798387](https://github.com/eddyizere24-collab/ahabona-app/actions/runs/43274798387)
- Head commit: `1a797f6e58fd78b058e39772dbefe83363008bcf`
- Result: **success**
- Discovery tests: 12/12 passed
- PostgreSQL adapter tests: 8/8 passed
- SQLite audit tests: 3/3 passed
- JavaScript syntax checks: passed

## Next ordered tasks

1. Finish the read-only SQLite source audit against a protected backup.
2. Confirm all SQLite columns, indexes, triggers, timestamp units, data counts, session semantics, file paths and email verification behavior.
3. Build a repeatable, restartable importer for Neon development. Preserve user IDs, profile IDs, capability IDs and foreign-key relationships. Encrypt sensitive identity data before import.
4. Verify login, registration, profile discovery, saved profiles, messages, notifications, admin permissions and restore/rollback using test data.
5. Add an explicit development-only Postgres integration flag and route repositories; keep SQLite as active fallback until parity is proven.
6. Build Job Marketplace APIs, public read views, employer dashboard and moderation.
7. Add Apply, candidate status tracking, notifications and delivery retries.
8. Add matching, reverse discovery and Talent Watch with candidate opt-in and explainable results.
9. Add UI without changing the existing homepage discovery layout.
10. Production cutover only after backup/restore rehearsal, load/security tests, billing review and a separate owner release instruction.

## Non-negotiable guardrails

- No production database switch or migration without explicit release approval.
- No public deployment, PM2 restart or Lightsail environment update as part of routine branch development.
- No duplicate user accounts or separate job-only authentication.
- No passwords, national ID values, OTPs, push secrets or database credentials in GitHub, logs or chat.
- Candidate matching/reverse discovery must be opt-in.
- Public visitors can browse approved, active job posts; applications remain private.
- Do not claim that a feature is complete until its implementation and tests have passed.
