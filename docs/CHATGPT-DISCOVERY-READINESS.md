# AHABONA discovery readiness

## Product rules (must not change)
- AHABONA is a free discovery platform. Registration and searching are free.
- AHABONA introduces people with skills or services to people who need them.
- Users contact one another and negotiate directly. AHABONA is not an employer, staffing agency, contractor, payment collector, or intermediary in their agreements.
- Never invent skills, qualifications, prices, ratings, locations, availability, or verification status.
- Only active, non-suspended public profiles may be exposed to search engines and AI crawlers.
- Respect the public profile projection returned by pubProfile. Do not expose private phone numbers, identity details, account emails, birth dates, or unpublished data.

## Why this work exists
AHABONA's current profile URLs use /u/{pid}, but the active server currently returns the JavaScript application shell for those routes. Profile information is then fetched by the browser from /api/profile/{pid}. The public profile pages therefore need crawlable HTML so search engines and AI search crawlers can understand the actual public profile, not only a generic app shell.

## Foundation in this branch
1. Add explicit crawler rules: allow OAI-SearchBot for ChatGPT Search; keep admin, API, password-reset and saved routes out of crawling; block GPTBot separately. ChatGPT-User is used for user-initiated page fetches, not for deciding ChatGPT Search inclusion.
2. Add a sitemap containing the homepage plus only public profile IDs selected from active users and non-suspended profiles.
3. Return a server-rendered HTML profile page for direct requests to /u/{pid} with canonical/Open Graph metadata and conservative WebPage structured data.
4. Use only fields from the existing pubProfile projection. Phone links appear only when the public projection includes the phone; no private account fields are added.
5. Preserve the existing in-app SPA navigation. A direct link or crawler request receives HTML; existing client-side navigation can continue to open its current modal without a reload. A direct link or crawler request receives HTML; existing client-side navigation can continue to open its current modal without a reload.

## Not included
- No Business Hub claim submission yet.
- No new paid APIs, subscriptions, ads, or infrastructure.
- No Production deployment, database migration, main-branch merge, PM2 restart, or host changes.
- No automatic public job-board or paid listing features.
- No claim that being crawlable guarantees ChatGPT recommendations or employment.

## Next stages
- Confirm the active AHABONA host is running this exact repository server-v2.cjs revision before deployment.
- Add a consent/visibility review for the public profile contract before expanding structured data.
- Test robots.txt, sitemap.xml, representative /u/{pid} pages, private phone hiding, suspended/deleted profiles, mobile rendering, and Google/OAI crawler fetches.
- Verify the Lightsail host firewall or any upstream security layer does not block OpenAI's published OAI-SearchBot IP ranges. robots.txt permission alone cannot override a network block.
- Only after explicit release approval, deploy to the existing AHABONA host and verify the live endpoints.
- Attempt Business Hub claim only if AHABONA itself is eligible and the owner can complete the requested verification. A claim does not claim each user's profile or guarantee recommendations.
