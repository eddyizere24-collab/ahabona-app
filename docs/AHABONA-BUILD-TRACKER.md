# AHABONA Opportunity Engine — Build Tracker

**Verification date:** 13 Ugushyingo 2026  
**Integration branch:** \`feature/opportunity-engine-integration-20261113\`  
**Current code commit before CI files:** \`9462bdeb6681989c57c50dd3c66e239f26295133\`  
**Base:** deployed app branch \`studio/backend-foundation-20261027\` at \`44376dbb84181d5824dfb165b94a33915e1f2d8a\`  
**Production status:** unchanged; live SQLite database, PM2 process and environment have not been modified.

The progress figures refer to specific workstreams, not total product completion.

## Verified production and development environment

| Area | Verified state |
|---|---|
| Live application | Node.js 24.21.0, Caddy HTTPS, PM2 app \`ahabona\` online on port 3000 |
| Live SQLite DB | \`/home/admin/ahabona-data/ahabona.db\`, selected by \`AHABONA_DATA\` |
| Live data counts | 28 tables; 25 users, 24 profiles, 66 messages, 21 sessions and 15 strip ads |
| Health | Public HTTPS returned 200; AWS SSM reports the instance online |
| Neon project | \`ahabona-platform\`, PostgreSQL 17.12, Frankfurt |
| Neon development | 45 tables, six migrations recorded, application data tables empty |
| Neon main | No app tables; no production migration |
| Backups | Earlier private release copies exist; a fresh consistent SQLite online backup and integrity check remain pending |

The earlier Opportunity Engine source branch was based on an older application and diverged from the actual deployed branch. This integration branch is based on the deployed application source so that its Studio, discovery and security changes are preserved.

## Workstream status

| Workstream | Progress | Evidence / boundary |
|---|---:|---|
| Product architecture | 100% | Build plan committed in this repository |
| Live host/source audit | 100% | Read-only SSM audit of runtime, process and actual SQLite path |
| Neon development schema | 100% | 45 tables and six recorded migration versions |
| SQLite audit tooling | 100% | Read-only audit utility and fixture tests copied into branch |
| Fresh live backup/data mapping | 20% | Real DB path and row counts confirmed; backup and full mapping not complete |
| PostgreSQL adapter | 90% | TLS/bounded-pool implementation and tests; real Lightsail network check pending |
| Public job APIs | 70% | Public list/detail APIs and guarded server wiring; no public job UI |
| Employer job APIs | 70% | Create/list/edit/submit/close/moderation backend; no Employer Desk UI |
| Candidate application APIs | 65% | Apply/status pipeline and safe legacy-profile bridge; no candidate UI/live integration |
| Job unread tracking | 70% | Account/device hash and count endpoint; no header bell |
| Opportunity notification APIs | 50% | User-scoped list/read API; mail/push delivery and UI remain |
| Matching/Talent Watch | 10% | Schema only |
| Employer verification/anti-fraud | 20% | Schema only |
| Frontend | 0% | Homepage is still intentionally people-first and unchanged |
| Production cutover | 0% | SQLite remains authoritative; no production env/data/process change |

## Safety and release gates

- Keep \`AHABONA_ENABLE_POSTGRES\` off in Production until route parity, backup/restore, security and load tests pass.
- Keep existing SQLite login/session and people discovery authoritative throughout migration rehearsal.
- Project only job-relevant profile fields into Neon; never project passwords, email, phone, national ID, sessions, WhatsApp or private social/contact details.
- Public visitors can browse approved/unexpired job posts; applications and employer information remain private.
- Reverse talent matching must require explicit opt-in and show understandable match reasons.
- Preserve the people-first homepage; jobs are entered from a small optional header control.
- No merge or production deployment before all CI and release gates pass.

## Next tasks

1. Run the integration CI and fix regressions.
2. Create a fresh consistent SQLite online backup; audit columns, indexes, triggers and timestamp units without uploading personal data.
3. Rehearse a restartable import on a disposable Neon branch, preserving IDs and relationships.
4. Keep the Neon profile projection synchronized when the SQLite profile is created or updated.
5. Build public job list/detail and the top-right unread bell without changing the homepage entry layout.
6. Build employer job-post wizard/Employer Desk and candidate Apply/application tracker.
7. Add candidate-opt-in matching/Talent Watch, email delivery queue, Web Push opt-in and retries.
8. Complete moderation, verification, abuse reports, privacy and anti-fraud.
9. Test Lightsail-to-Neon connectivity in isolated staging.
10. Cut over only after restore rehearsal, security/load review and cost review.

## Audit references

- Live application source: \`studio/backend-foundation-20261027\` / \`44376dbb84181d5824dfb165b94a33915e1f2d8a\`.
- Live SQLite folder: \`/home/admin/ahabona-data\`.
- Neon development branch: \`br-super-truth-b9ei5e3y\`.
- Neon main branch: \`br-twilight-flower-b9o8noqo\`.
