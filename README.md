# AHABONA

AHABONA is a free Rwanda-based discovery platform that helps people present their skills, trades, abilities and services so people who need them can find and contact them.

## How AHABONA works

1. A person who has a skill or service creates a profile for free.
2. They choose what they can do, where they can offer it, and which contact details they want to make public.
3. Someone who needs a service searches by skill and location, reviews public profiles, and contacts a person directly.
4. The two people discuss and agree directly on the work, price, timing and conditions.

## What AHABONA is not

AHABONA is not an employer, staffing agency, recruitment intermediary or job board. It does not hire people, charge users to register or search, collect payment for work, or mediate agreements between users.

## Technical notes

- The public Node.js server is in `server-v2.cjs`.
- The server uses Node's built-in `node:sqlite` module (Node 22.5+; Node 24+ is also suitable).
- The Vite/React client is in `src/`.
- Discovery helpers for robots.txt, sitemap.xml, crawlable public profiles and public information pages are in `discovery-seo.cjs`.
- Public information and privacy/release guardrails are documented in `docs/CHATGPT-DISCOVERY-READINESS.md`.

## Focused tests

Run the discovery helper tests with:

```bash
npm run test:discovery
```

The tests check crawler permissions, sitemap content, public profile rendering, hidden-phone behavior, safe HTML output, public information pages, and date formatting.

## Privacy and accuracy rules

Only active and non-suspended public profiles may be listed. Public pages must use the existing public profile projection and must not expose private account email, birth dates, identity details, or phone numbers that the profile owner has chosen to hide. Do not invent skills, qualifications, locations, ratings, prices or availability.

## Release safety

Discovery changes are prepared and tested on a feature branch first. Do not merge into `main`, deploy to the production AHABONA host, restart PM2, or change host configuration without an explicit release decision.