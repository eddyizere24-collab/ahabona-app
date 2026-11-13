# AHABONA

AHABONA is a free public discovery platform for people in Rwanda to present skills, trades and services, and for others to find and contact them directly.

AHABONA is not an employer, recruitment agency, staffing intermediary, job board or payment processor. People agree directly on the service, price and timing. The platform does not guarantee work, income or enquiries.

## Runtime

The production application is a native **Node.js HTTP server** in `server-v2.cjs`. It uses Node.js built-ins, including `node:sqlite`, and serves the application UI from the embedded assets in that file. It is not a Vite/React build and has no TypeScript compilation step.

- Required runtime: Node.js 24 or newer.
- Start: `npm start`
- Local development with automatic restart: `npm run dev`
- Syntax checks: `npm run check`
- Full project tests: `npm test`
- Focused Search discovery tests: `npm run test:discovery`
- Isolated HTTP/server smoke tests: `npm run test:server`

Use `npm ci` to reproduce the lockfile state. No external npm packages are required by the native server runtime.

## Local development

Set a separate, disposable data directory before starting the server. Do not point a local run at a production database or media directory.

```sh
mkdir -p /tmp/ahabona-local-data
AHABONA_DATA=/tmp/ahabona-local-data PORT=3000 npm run dev
```

The server creates its SQLite database, photos, uploads and media directories below `AHABONA_DATA`. Without this setting, it uses a `data` directory under the application folder. Never use production paths for local or staging tests.

## Environment

The host/service manager should provide the production environment through protected configuration, not a committed file. Common settings include:

- `PORT`: HTTP listen port.
- `AHABONA_DATA`: persistent private data directory.
- `AHABONA_SECURE=1`: set secure cookies and HTTPS behavior when served behind trusted HTTPS.
- `AHABONA_TRUST_PROXY=1`: only when requests pass through a trusted reverse proxy; set `AHABONA_PROXY_HOPS` to match the actual proxy chain.
- `AHABONA_URL`: canonical public HTTPS origin.
- `AHABONA_STUDIO_BETA=1`: opt-in Studio feature. Keep disabled in production until a separate isolated staging deployment, browser/device tests, backup/restore and rollback checks have passed.

Never commit `.env`, passwords, API keys, production databases, user uploads, or session data.

## Public discovery

The public discovery routes are:

- `/robots.txt`: permits OAI-SearchBot and blocks GPTBot, while excluding private/admin routes.
- `/sitemap.xml`: lists the homepage, public information pages, active public profiles and service categories with matching profiles.
- `/u/{profile-id}`: server-rendered public profile pages.
- `/about` and `/how-it-works`: bilingual public explanations.
- `/services/{category}`: public category discovery pages.

Crawler access only makes pages eligible for crawling. It does not guarantee indexing, ChatGPT Search inclusion, rankings, leads or work.

## Release discipline

1. Work on a feature branch based on the active production branch.
2. Run `npm ci` and `npm test`; require GitHub Actions checks to pass.
3. Back up the application source and create a consistent SQLite backup before a production release.
4. Use a fast-forward-only update when the release branch is based on the exact production revision.
5. Restart only the AHABONA process, then verify the public HTTPS site, health endpoint, crawler routes and critical user flows.
6. Keep rollback copies private and outside the public web root. Do not use a database restore as a substitute for reviewing a failed release.

The Studio feature remains opt-in. Its staging runbook is in `docs/studio-staging-runbook.md`. Legal Terms and Privacy pages are draft material pending owner/controller details and qualified Rwanda legal review; do not present them as approved policies.


## Opportunity Engine staged integration

The Opportunity Engine adds a server-only Neon PostgreSQL data path. It remains opt-in with `AHABONA_ENABLE_POSTGRES=1`; SQLite remains authoritative for existing accounts and people discovery during migration. Public job APIs are separate from the people-first homepage.
