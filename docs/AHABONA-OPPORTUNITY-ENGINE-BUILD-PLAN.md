# AHABONA OPPORTUNITY ENGINE
## Product Requirements, Architecture Direction & Phased Build Plan

**Inyandiko-fatizo yo kubaka Job & Opportunity Marketplace ihujwe na AHABONA**

- Document ID: AHABONA-OPP-001
- Version: 1.2
- Itariki: 12 Ugushyingo 2026
- Status: Planning baseline; si uburenganzira bwo guhindura Production.
- Repository: eddyizere24-collab/ahabona-app
- Working branch: feature/chatgpt-discovery-foundation-20261112
- Baseline commit: 58a406afe238dd8360108ac48cde1aa4a276062d

---

## 1. Icyerekezo n'intego

AHABONA izakomeza kuba urubuga rufasha abantu kwerekana ubumenyi, imyuga, ubushobozi na serivisi, kugira ngo ababikeneye bababone kandi bavugane. Hiyongeraho **AHABONA Opportunity Engine**, system ihuza abatanga akazi n'abashaka akazi, igatuma gutangaza, kubona, gusaba no gucunga amahirwe bishoboka muri AHABONA.

Iyi ntabwo ari job-board y'amatangazo gusa. Ni platform ifite:
- Job Marketplace: gutangaza, gushakisha no gusoma amatangazo.
- Progressive onboarding na Talent Passport: umuntu yinjira byoroshye, akuzuza amakuru buhoro buhoro, hanyuma agakoresha profile imwe mu gusaba akazi kenshi.
- Job Creation Assistant: umukoresha yandika cyangwa akavuga icyo akeneye; system ikabihindura draft, ikabaza ibibuze kandi ntihimbe amakuru.
- Apply on AHABONA: gusaba akazi no gukurikirana application muri system imwe.
- Employer Desk: gucunga amatangazo, applicants, interviews n'ibyemezo.
- Two-way matching na Talent Watch: gushakira candidate akazi no gushakira employer abantu bemeye kugaragara.
- Notifications: in-app, email na web push yemejwe na user.
- Trust & Safety: employer checks, moderation, reporting, fraud controls na audit.

**Ihame ry'ingenzi:** AHABONA igomba gufunguka yerekana abantu na profiles zabo ako kanya nk'uko iri ubu. Homepage ntihindurwa kubera jobs. Akamenyetso gato ka notifications kari hejuru ni ko kazaba entry point ijyana ku Job Marketplace. Nta job wall, forced modal cyangwa interstitial.

## 2. Ibyo baseline ya GitHub yagaragaje

Igenzura ryakozwe kuri branch iri hejuru, commit 58a406afe238dd8360108ac48cde1aa4a276062d. Ibi ni source-code observations; si ikimenyetso cy'uko byose biri gukora kuri production.

| Ikintu | Ibyagaragaye |
|---|---|
| Server | Node.js public server iri muri server-v2.cjs. |
| Client | React 19, Vite 7 na TypeScript biri muri src/. |
| Database | Server source ikoresha node:sqlite / DatabaseSync. |
| Taxonomy | Categories, skills, aliases n'indimi biri muri server source; bigomba kongerwaho aho guhimba taxonomy ibangikanye. |
| Discovery work | discovery-seo.cjs na tests biri kuri working branch; bigomba kurindwa. |
| Existing permissions | PERMS irimo requests.handle; nta jobs.moderate yabonetse kuri baseline. |
| Banner ads | strip_ads na promotional content ni amatangazo yo kwamamaza; si structured job-post system. |
| Jobs schema | Nta dedicated job_posts / job_applications module yabonetse mu schema yagenzuwe. |
| Feature defaults | messaging, email_verification na push_notifications byagaragaye nka OFF; pwa nka ON. Runtime configuration igomba kongera kugenzurwa. |
| Documentation conflict | README isobanura AHABONA nk'itari job board. Product docs zigomba kuvugururwa kugira ngo zigaragaze icyerekezo gishya, ariko AHABONA ntihinduke employer cyangwa staffing agency. |

**Technical decision:** Ntituzahitamo database nshya kubera ko package dependency iboneka gusa. Phase 0 igomba kwemeza production host, real schema, auth, backups, uploads, email provider, PWA/service worker, deploy method na active source revision. Existing account/profile system ni yo igomba kongerwaho, ntituzubaka accounts ebyiri cyangwa user database nshya.

## 3. Hosting facts zemejwe na nyir'urubuga (12 Ugushyingo 2026)

Screenshot ya AWS Lightsail nyir'urubuga yatanze igaragaza ibi bikurikira. Ibi ni facts zigaragara kuri console igihe screenshot yafashwe; si uko twagenzuye server imbere.

| Ikintu | Icyemejwe |
|---|---|
| Cloud platform | Amazon Lightsail (AWS) |
| Instance name | ahabona-server |
| Blueprint / application family | Node.js |
| Instance state | Running |
| System status check | Passed |
| Instance status check | Passed |
| Instance plan | 1 GB RAM, 2 vCPUs, 40 GB SSD |
| Instance class | General purpose |
| AWS region / zone | Frankfurt, Zone A (eu-central-1a) |
| Networking | Dual-stack; Static IPv4 and public IPv6 are assigned |

**Icyo bivuze ku kubaka:** AHABONA igomba gufatwa nka application ikorera kuri Lightsail VPS yayo. Deployment, backup, monitoring, server resource budget, process manager, Node runtime, database na storage bigomba kugenzurwa kuri iyi instance. Ntituzafata Vercel nk'aho ari production host yayo.

**Ibyo screenshot itagaragaza kandi bigomba kugenzurwa kuri Phase 0:** domain/DNS mapping, exact Node.js runtime version, repository path and deployed Git SHA, process manager and startup command, reverse proxy/TLS settings, environment variable names (values never print), database file location and backup/restore procedure, uploaded-file storage, firewall/security group rules, logs and monitoring. Screenshot ya console yonyine ntihamya ko branch cyangwa commit runaka ari yo iri live.

Public server IPs ntizishyirwa muri iyi product document; zibikwa mu private operations inventory aho bikenewe.


### ADR-001: Database target and separation (recommended; not yet provisioned)

**Recommendation:** Use one dedicated Supabase-managed PostgreSQL project as the long-term authoritative database for AHABONA, while keeping the existing Node.js application/API on Lightsail. Do not create multiple unrelated databases for users, jobs, applications and notifications. Those are related parts of the same platform and should share one transactional source of truth.

**Read-only connector discovery (12 Nov 2026):**
- The connected Supabase organization is currently on the Free plan.
- It contains one active, healthy project named `iwacu-rwanda-2`, in `eu-central-1`; this is the IWACU project, not AHABONA.
- Supabase allows two active Free projects across organizations where the owner/admin belongs. One project slot is therefore currently available based on the visible connected account state.
- The Supabase connector is available in this ChatGPT workspace for project discovery, schema inspection, SQL queries, migrations, logs, advisors and supported project operations.

**Separation rule:** Never put AHABONA tables or AHABONA user records inside the IWACU project. Recommended future layout is a separate Supabase Organization named AHABONA, with one AHABONA project in Central EU (Frankfurt, `eu-central-1`). This separates project access, data and later billing. Keeping the AHABONA organization separate means a future Pro upgrade for AHABONA need not upgrade the existing IWACU organization. No organization or project has been created by this recommendation.

**Connection direction:**
- Lightsail continues hosting the Node.js API and existing AHABONA web application.
- The Node.js server connects to Supabase PostgreSQL over TLS using a persistent-server connection method and a small application connection pool. Test IPv6 direct connectivity first because the supplied Lightsail instance is dual-stack; use Supabase's IPv4 session pooler if direct IPv6 connectivity is not available.
- Database credentials stay on the server and never enter browser code, GitHub or logs. Use a least-privilege runtime database role; don't use the project owner/superuser for ordinary API queries.
- Keep AHABONA's existing authentication/session behavior during the database migration unless an independent review approves a separate Auth change. Supabase Auth is not required just to use Supabase PostgreSQL.
- Public visitors and candidates continue to use AHABONA server APIs. Do not expose raw database credentials or broad database access to the browser.
- Use the PostgreSQL database for related structured application data: existing account/profile data, job posts, employer records, applications, preferences, matches, notifications and audit. Separate these through clear table/schema boundaries and access policies, not disconnected databases.
- Portfolio photos and private documents are files, not relational rows. Store them in controlled object storage (Supabase Storage or an evaluated S3 design), with private buckets, signed access, size/type checks and retention rules.
- Add cache/search/queue products only when measured workload or product requirements justify them; PostgreSQL remains the source of truth.

**Migration rule:** The current source code uses `node:sqlite` / `DatabaseSync`. Before building a jobs-only database, audit the actual production SQLite schema, data volume, auth/session dependencies and backup location. Prepare a staging Supabase project, migrate the existing AHABONA data with repeatable scripts, preserve stable user IDs and ownership relationships, compare row counts and critical records, test every existing user flow, and prepare cutover/rollback. Do not maintain two competing writable sources of truth. Do not cut production over until the owner approves the migration and the rollback has been rehearsed.

**Free-plan use versus production-readiness:**
- Supabase Free is suitable for development, schema experiments and controlled QA. Current published allowances include 500 MB database size per project, 5 GB egress, 1 GB file storage and up to two active Free projects across the owner's/admin memberships.
- Free projects can pause after seven days of low database activity, and Free does not provide downloadable automatic database backups. This is not an acceptable final reliability posture for a public production system holding job applications and personal data; use scheduled off-site exports while testing.
- Current Supabase Pro starts at $25/month for an organization, includes $10 monthly compute credits covering one default Micro/Nano compute project, 8 GB database disk, 100 GB file storage, 250 GB egress, and daily backups kept for seven days. Overages, add-ons or a larger compute size can increase cost. Re-check plan terms at the time of upgrade.
- Production release gate: activate the dedicated AHABONA organization/project on the appropriate paid plan, verify backups and restore, configure spend alerts, RLS/least-privilege access, SSL and monitoring before moving real user data. This is a future readiness condition, not a request to purchase now.

**Alternatives considered:**
- Keep SQLite on Lightsail: simplest immediate continuity, but not the recommended long-term primary database for the planned relational jobs/applications/matching workflows and future growth.
- Lightsail managed database: AWS-native PostgreSQL/MySQL with less self-hosting work; published plans start at $15/month for 1 GB RAM/40 GB SSD, but it does not provide the same directly connected Supabase management workflow in this ChatGPT workspace.
- Supabase PostgreSQL: recommended because it is managed PostgreSQL, has the relevant data/security/backup tools, is accessible through the connected Supabase tools in this workspace, and supports Frankfurt region selection. Re-evaluate on measured requirements rather than locking AHABONA into a provider forever.

### AWS Free Plan and billing guardrail

The AWS screenshot confirms the Lightsail instance and size, not the AWS account's billing plan or remaining credits. Current AWS documentation says a new AWS Free account plan lasts up to six months or until credits are exhausted, whichever happens first; the plan closes the AWS account at expiry, with a 90-day window to upgrade and regain access before data is erased. New accounts can receive up to $200 in credits. A Paid plan with credits behaves differently, so Phase 0 must record the exact account plan, credit balance and expiry date from the AWS Cost and Usage widget.

The current Lightsail public-IPv4 bundle matching 1 GB RAM / 2 vCPUs / 40 GB SSD is listed at $7/month. That price is not proof of what the owner is currently paying: actual charges depend on plan, credits, trial eligibility, usage and billing period. Build for the intended product scale; use the Free Plan for experimentation and plan the billing transition before it ends, rather than limiting the architecture to today's trial.


## 4. Ibyemezo bidahinduka (Guardrails)

1. Homepage iguma yerekana abantu n'ubushobozi bwabo ako kanya; jobs ntizisimbura abantu.
2. Job icon iba nto kuri header. Badge yerekana jobs notifications zitarasomwa n'umukoresha winjiye; ntigaragaza private unread count ku visitor utinjiye.
3. Visitor wese ashobora kureba job list na details atariyandikishije.
4. Kwiyandikisha, gushakisha no gusaba akazi kuri v1 biguma ari ubuntu 100%.
5. Registration ya mbere iba ngufi. Amakuru y'inyongera asabwa buhoro buhoro igihe akenewe.
6. Nta AI izihimbira salary, location, qualification, requirements, verification cyangwa availability.
7. Employer ni we wemeza draft y'itangazo; AI ifasha kuyitunganya gusa.
8. Candidate ni we ugena niba profile ye igaragara mu matching/reverse discovery n'amakuru yemera gusangiza employer.
9. Matching score ni recommendation isobanurwa, si icyemezo cyikora cyo kwanga umuntu.
10. Moderation, audit, reporting, anti-fraud na rate limits biri muri launch criteria.
11. DB changes ziba additive, zifite backup na rollback plan; nta gusiba data itabanje kugenzurwa.
12. Nta main merge, Production deploy, PM2 restart, production migration cyangwa host configuration change hatabaye release approval yihariye.

## 5. Roles

- **Visitor:** kureba abantu, profiles, jobs na details; gushakisha no report.
- **Registered candidate:** preferences, Talent Passport, saved jobs, Apply, application tracking, notifications.
- **Service provider:** akomeza gukoresha profile asanzwe; ashobora kuba candidate nta konti ya kabiri.
- **Individual employer:** gutangaza no gucunga jobs ze, kureba applicants no kuvugana na bo.
- **Organization owner:** gucunga organization, members, access n'amatangazo.
- **Recruiter/team member:** ibikorwa yahawe uruhushya gusa.
- **Moderator:** job review, approve/reject/request changes, reports.
- **Admin/Super Admin:** roles, settings, escalations na audit.
- **System worker:** expiry, matching, email/push queue na retry; nta user admin privileges.

Umuntu umwe ashobora kuba candidate n'employer kuri account imwe.

## 6. End-to-end journeys

### 5.1 Candidate
1. Afungura AHABONA akabona homepage isanzwe.
2. Afungura jobs akareba amatangazo atariyandikishije.
3. Ashobora gushakisha, filter, save link cyangwa gusangiza itangazo.
4. Akanda Apply; niba atinjiye, AHABONA imusaba gukora account cyangwa login mu buryo bugumana draft/application intent.
5. Yuzuza amakuru asabwa kuri ako kazi gusa.
6. Ahabwa confirmation, application reference na status tracker.
7. AHABONA imumenyesha updates hakurikijwe preferences.

### 5.2 Progressive onboarding
- **Starter:** konti n'amakuru make ikora.
- **Work-ready:** skills/interests, preferred work areas na contact method.
- **Detailed:** experience, education, portfolio, languages cyangwa references.
- **Evidence checked:** ibyangombwa byagenzuwe koko; ntibigaragazwe nta verification yabaye.
System igaragaza progress, ikanasobanura impamvu isaba buri field. User ashobora kubika, gusubika cyangwa gusimbuka ikitari mandatory. Profile completion si qualification cyangwa guarantee yo kubona akazi.

### 5.3 Employer job creation
1. Akanda Tangaza akazi, agahitamo individual cyangwa organization.
2. Yandika cyangwa akavuga icyo akeneye.
3. Assistant ikora structured draft, ikabaza ibibuze.
4. Required fields zigenzurwa; optional salary/benefits biguma empty iyo bitatanzwe.
5. Employer areba preview, abika draft cyangwa yohereza moderation.
6. Moderator yemeje itangazo, riba public; matching/alerts bigatangira.
7. Employer ashobora pause, edit, close, fill cyangwa renew itangazo.

### 5.4 Apply and hiring
Candidate yohereza application muri AHABONA. Employer abona applicants mu Employer Desk, akabareba, akabashyira muri stages, akohereza messages cyangwa interview invites. Candidate abona status updates. Internal employer notes ntizigaragarira candidate.

## 7. Functional requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-001 | Homepage preservation | Profiles zigaragara ako kanya; job module ntihindura homepage layout/order. |
| FR-002 | Job icon + unread badge | Header icon responsive, accessible; unread count ibara user-specific unread alerts. |
| FR-003 | Public job browsing | Visitor ashobora kubona list/details, no share, nta account. |
| FR-004 | Job posting wizard | Draft, preview, edit, save/resume, submit. |
| FR-005 | Job Creation Assistant | Text/voice to structured draft; asks for missing fields, no invention. |
| FR-006 | Job lifecycle | draft, pending_review, approved/published, paused, rejected, closed, filled, expired; server validates transitions. |
| FR-007 | Search/filter | title, skill, category, district/area, job type, date, deadline; pagination. |
| FR-008 | Work preferences | categories, location, schedule, availability, salary preference optional, channels. |
| FR-009 | Progressive onboarding | Minimal registration; step-by-step profile completion. |
| FR-010 | Talent Passport | Reusable profile with skills, experience, education, languages, portfolio and private evidence. |
| FR-011 | Apply on AHABONA | Apply from Passport plus job-specific questions; confirmation and tracking. |
| FR-012 | External apply | Employer may choose external URL/email/contact; clear external flow label. |
| FR-013 | Employer Desk | Employer manages own jobs, applicants, pipeline and interview process. |
| FR-014 | Application lifecycle | status, messages, employer-private notes and audit are separated. |
| FR-015 | In-app notifications | history, unread/read, mark read, settings and frequency controls. |
| FR-016 | Email notifications | verified address, consent, queue, delivery status and retries. |
| FR-017 | Web Push | explicit opt-in, device/browser support, unsubscribe and revocation. |
| FR-018 | Two-way matching | relevant jobs for candidates; opted-in talent discovery for employers. |
| FR-019 | Talent Watch | monitors newly approved jobs/profiles and prevents duplicate alerts. |
| FR-020 | Job moderation | approve, reject, request changes, pause; reason and audit history. |
| FR-021 | Reports and anti-fraud | report queue, rate limits, suspicious-content checks and escalation. |
| FR-022 | Employer verification | contact/organization checks, evidence and truthful badges. |
| FR-023 | Expiry/freshness | deadlines update state; expired jobs absent from active recommendations. |
| FR-024 | Languages | Kinyarwanda, English and French for main job flows and notifications. |
| FR-025 | Accessibility/low bandwidth | mobile-first, tap targets, pagination, compressed images and clear error states. |
| FR-026 | Audit/analytics | key actions, moderation and delivery attempts logged safely. |
| FR-027 | Saved jobs | save/unsave, saved list and changed/expired status. |
| FR-028 | Communication | in-platform communication with consent, ownership, anti-abuse and attachment checks. |

## 8. Job data and experience

### Job types
Full-time, part-time, temporary, casual/day work, contract, project-based, gig/short task, internship/trainee, apprenticeship. The posting flow must distinguish employment type, work arrangement (on-site/remote/hybrid where relevant), schedule, duration and location.

### Job post fields
Title, employer identity, category/skills, responsibilities, required/preferred skills, headcount, location, type, schedule, duration, salary or salary range if supplied, benefits if supplied, minimum eligibility, application method, questions, deadline, contact visibility, status, timestamps and audit metadata. Optional fields remain optional; no fake defaults.

### Public job pages
List and detail cards show title, employer and genuine verification state, location, type, posted date, deadline, and compensation only when declared. Public URL is shareable. Closed/expired jobs are marked clearly and never presented as active.

### Job application
Candidate uses Talent Passport and only answers missing job-specific questions. Employer selects one of: Apply on AHABONA (preferred), in-platform contact, or external apply link/email. AHABONA must not pretend it handles an external application.

## 9. Talent Passport

Passport is a reusable skills profile, not a rigid CV template. It may include:
- Basic identity and selected public contact method.
- Skills, categories, self-described level and optional experience years.
- District/area and preferred work locations.
- Availability, schedule and job-type preferences.
- Work history and project descriptions.
- Education and qualifications where relevant.
- Certificates and licenses, private by default.
- Portfolio photos, work samples and links.
- References only with permission.
- Languages and self-described level.

User controls public visibility, employer sharing and matching opt-in. Profile completion must not be confused with verification or job suitability.

## 10. Matching Engine and Talent Watch

Matching must consider user-declared skills/interest, required vs preferred skills, location/commute preferences, work type, availability and declared constraints. It must explain why a job matches and allow user feedback. Do not infer protected attributes or use sensitive personal data to rank candidates. Avoid opaque automated rejection.

- **Candidate-to-job:** approved new jobs are scored against opted-in candidate preferences.
- **Employer-to-talent:** employer sees only candidates who opted into discovery and only fields permitted by their privacy controls.
- **Talent Watch:** continues matching when a new job or new consenting candidate appears.
- Avoid duplicate alerts, expired listings and over-notification.
- Matching rules require versioning and deterministic tests.

## 11. Notifications

Three channels:
1. **In-app:** icon badge, notifications center, unread/read state, deep link to relevant job/application, history.
2. **Email:** transactional and alert email to a verified address, frequency settings and unsubscribe.
3. **Web Push:** browser/device push after explicit user permission; subscription removal and per-device status.

Controls:
- User selects channels and alert frequency (instant, digest, weekly, pause).
- Alerts should only be sent for relevant matches or important application updates.
- Notification event is persisted before delivery; use an outbox/queue, retry with backoff, idempotency and delivery status.
- Unread count is per user/device policy, consistent across devices where account identity permits.
- SMS/WhatsApp are not part of v1; assess costs and consent before adding.

## 12. Logical data model (subject to Phase 0 audit)

Proposed entities, not production SQL:
- job_posts
- employer_orgs, employer_members
- candidate_job_preferences
- talent_passport_sections / evidence references
- job_applications
- application_events
- job_matches
- talent_watch_rules
- notifications
- notification_preferences
- notification_outbox
- push_subscriptions
- job_reports
- employer_verifications
- job_audit_events

Reuse existing users, authentication, profiles and taxonomy. Define foreign keys, indexes, ownership rules, deletion/retention and migration strategy only after inspecting the exact production schema. Files containing certificates or personal documents must use private storage, signed access and retention controls; never commit them to GitHub.

## 13. Architecture direction

- Preserve the existing Node.js server and React/Vite client unless Phase 0 proves a change is necessary.
- Add bounded modules/services for jobs, employer, applications, matching, notifications, moderation and audit; avoid expanding the existing server into an untestable monolith.
- Keep validation, authorization and lifecycle rules on the server; frontend is not trusted.
- Create versioned API contracts and a centralized notification event model.
- Use a durable outbox/worker for email and push; scheduled expiry and Talent Watch jobs must be idempotent.
- Do not introduce paid APIs or infrastructure without checking owner budget and free-tier limits.
- Maintain responsive UI for low-end Android and weak network connections.

## 14. Trust, privacy and safety

- Verify employer email/phone as appropriate; organization verification requires evidence and reviewer process.
- Show verification badges only when a real check has completed.
- Use report job / block employer / moderation review and abuse escalation.
- Detect suspicious claims and requests for candidate fees; do not promise jobs or guarantee recruitment.
- Collect minimum necessary personal data; protect candidate contact and evidence files.
- Candidate controls discoverability and data shared before/after applying.
- Separate employer-only notes from candidate-visible communication.
- Apply access control by ownership and explicit permissions; add job-specific moderation permissions.
- Audit admin decisions and important application status changes.
- Define retention, export and deletion rules before launch.
- AI can assist with drafting, classification and flagging; humans make moderation and hiring decisions. AI must not fabricate information or reject people autonomously.

## 15. UX, accessibility and performance

- Preserve homepage and current profile discovery priority.
- Jobs area is separate and reachable from the small header icon.
- Use short forms, clear field labels, save/resume, preview and progress indication.
- Public browsing requires no account; account is requested at Apply or account-specific actions.
- Support Kinyarwanda, English and French; preserve source text and review translations.
- Provide loading, empty, offline, validation and error recovery states.
- Keyboard and screen-reader labels, adequate contrast, large tap targets and accessible form errors.
- Mobile-first; keep bundles, images and network requests light; paginate lists and avoid mandatory animation.
- Do not show push permission on page load; explain benefit, ask at a meaningful point after user action.

## 16. Measurement / KPIs

Measure, do not invent targets before a baseline:
- Job publish completion and time to publish.
- Candidate view-to-Apply and Apply completion.
- Match relevance feedback and notification delivery/open rate.
- Employer response time and application outcomes.
- Talent Passport progression and completion.
- Fraud/report incidence and moderation response time.
- Expired-job exposure (target zero in active recommendations).
- Performance: mobile load, API latency, error rate and notification queue failures.

Targets are agreed after pilot baseline data; never optimize volume at the expense of relevance or trust.

## 17. Phased roadmap and gates

| Phase | Work | Exit evidence |
|---|---|---|
| 0. Product & technical audit | verify live host/revision, auth, SQLite schema, backups, email, messaging, PWA, storage, deploy workflow, privacy and product docs | audit report, architecture decision, migration/rollback plan, test plan |
| 1. Core job foundation | additive schema, job service/API, lifecycle, employer ownership, permissions, audit | unit/API/auth/migration tests; existing profile regression tests |
| 2. Public Job Marketplace | header entry, public job list/detail, search, filters, share link, expiry, mobile UI | visitor flow works; moderation required; homepage unchanged |
| 3. Apply & Employer Desk | progressive onboarding, Talent Passport v1, Apply flow, applications, employer pipeline | cross-user isolation, candidate privacy and end-to-end tests |
| 4. Matching & notifications | explicit preferences, deterministic match v1, in-app center/badge, email outbox/digest | consent, dedupe, retry, unsubscribe, match explanation tests |
| 5. Push and reverse matching | Web Push, opt-in employer talent discovery, Talent Watch | device/browser matrix, visibility consent, anti-spam and access tests |
| 6. Trust, insights and scale | enhanced verification, fraud signals, reports, analytics, Opportunity Map only if data supports | privacy/security review, performance, backup/restore and support plan |
| 7. Controlled release | staging/pilot, owner acceptance, release checklist, backup, live verification | explicit release approval, rollback readiness, no critical defects |

Every phase has a deliverable, requirements IDs, tests, review and decision gate. No phase advances because code was merely written.

## 18. Quality strategy and Definition of Done

Test cases include:
- Anonymous visitor sees jobs but cannot access private candidate/employer data.
- Homepage profile discovery remains unchanged.
- Employer A cannot read or edit Employer B's jobs/applications.
- A user can be both employer and candidate with one account.
- Draft and required fields validate server-side; optional fields stay optional.
- Expired/closed jobs never appear as active matches.
- Candidate sees only their applications and relevant status.
- Private profile fields remain private through all public APIs and matching.
- Push requests happen only after user action/consent.
- Email/push retry does not send duplicate notifications.
- Unread count and read state remain consistent.
- Moderation, verification and audit events are persisted.
- App works on mobile, low bandwidth and recovery from transient failure.

Feature is done only when its requirement ID and issue/PR exist; UI has loading/empty/error/success states; server validation, authorization and ownership are tested; migrations/backup/rollback are documented; unit/integration/end-to-end tests pass; accessibility/mobile/localization are checked; no secrets/private data enter logs or GitHub; docs/changelog updated; commit SHA and CI result are recorded. Production status must be labeled honestly: branch only, staging verified or production verified.

## 19. Initial GitHub work breakdown

- EPIC-00 Product & technical audit.
- EPIC-01 Data and API foundation.
- EPIC-02 Job publishing wizard and moderation queue.
- EPIC-03 Candidate Passport and progressive onboarding.
- EPIC-04 Apply and application lifecycle.
- EPIC-05 Matching and Talent Watch.
- EPIC-06 In-app, email and push notifications.
- EPIC-07 Safety, employer verification and admin.
- EPIC-08 Quality, accessibility and controlled release.

Every issue must include purpose, user story, FR/EPIC IDs, dependencies, database/API impact, privacy/security risks, acceptance tests, rollback notes and evidence required to close.

## 20. Decisions to resolve in Phase 0

1. Exact active host revision and deployment/rollback process.
2. Existing sign-up/login and verified contact methods.
3. Full SQLite schema, database location, backup schedule and migration discipline.
4. Transactional email provider, quotas, costs and deliverability.
5. PWA/service worker and target Android/browser Web Push support.
6. Private storage for certificates/portfolio files and retention policy.
7. Individual vs organization employer verification standard and affordability.
8. What employer can see before/after Apply; default to least disclosure.
9. Whether in-platform messaging is enabled in v1 or initially only application updates.
10. Kinyarwanda/English/French translation ownership and review.
11. Job categories/job types: reuse current taxonomy, extend only for evidenced gaps.
12. Closed pilot employer group, candidate test group, support and abuse escalation.
13. Operational worker model and SQLite reliability/backup under expected traffic.

These are not reasons to stall the project; they are decisions that prevent building on guessed infrastructure or weakening user privacy.

## 21. Project management and change control

**Source of truth**
- Product baseline: this document in docs/.
- Implementation source: GitHub repository and feature branch.
- Work tracking: GitHub issues and PRs with FR/EPIC IDs.
- Evidence: commit/PR SHA, CI result, migration status, staging URL, screenshots/test output and live verification.

**Progress report format**
1. Progress: phase completion with denominator (e.g. 6/10 acceptance checks).
2. Done: change and exact GitHub reference.
3. Tests: command/workflow and result.
4. Blockers: specific missing item and why it matters.
5. Next step: one concrete action.
6. Release status: branch only, staging verified or production verified.

New requirements get IDs and rationale. Changes to homepage, privacy, pricing, candidate consent, product direction or release guardrails require owner decision. Each schema change requires additive migration plus backup/rollback. No secrets, private user data or identity documents in repository. Use feature branch/PR before main; no merge or production release without explicit approval.

## 22. Icyo tubanza gukora

Tangira kuri **Phase 0: Product & Technical Audit**. Reba live host n'uko account, DB, email, PWA/push, file storage, backups na deploy bikora. Ibyavuye muri audit bibikwe muri GitHub issues nk'ibipimo n'ibimenyetso. Nyuma y'ibyo, dufate architecture decisions maze dutangire Phase 1. Nta code igomba guhita ishyirwa kuri Production.

**Ihame riza imbere ya byose:** niba umuntu atanga akazi, AHABONA imufasha kugatangaza no kubona applicants; niba umuntu ashaka akazi, AHABONA imufasha kukabona no gusaba; bombi bagakomeza gukorera muri system imwe, mu gihe homepage isanzwe ikomeza kwerekana abantu n'ubushobozi bwabo.

---

**Change Log**

| Version | Itariki | Ibyahindutse |
|---|---|---|
| 1.0 | 12 Ugushyingo 2026 | Planning baseline: product requirements, technical direction, phases, trust/safety, tests and release gates. |\n| 1.1 | 12 Ugushyingo 2026 | Recorded owner-provided Lightsail hosting facts and clarified VPS-specific Phase 0 checks. |
