# AHABONA Studio staging and rollback runbook

**Status: preparation only — no staging host has been configured or deployed.**  
Prepared on 2026-10-27 for branch `studio/backend-foundation-20261027`, tested code commit `431113d3116ef6eee308dfd07e308efce121f54e`.

## 1. What has been checked

- The branch contains `.github/workflows/studio-isolated-checks.yml` as its only workflow. Run `40481588713` completed with **success** on commit `431113d3116ef6eee308dfd07e308efce121f54e`; all 11 substantive steps passed.
- That workflow is **CI, not staging**: it runs on a temporary GitHub-hosted runner, uses temporary test data directories and ephemeral local ports, then cleans them up. It does not provide a persistent URL, persistent database, or a real deployment.
- The tracked project tree has no staging/deployment definition such as a Dockerfile/Compose file, Procfile, or Vercel/Netlify/Render/Fly/Railway configuration. The Studio README also says this branch has not been deployed.
- The server code supports data isolation through `AHABONA_DATA` (the data directory), an optional `PORT`, and the opt-in switch `AHABONA_STUDIO_BETA=1`. The Studio flag must be set **only on the separate test server**.
- The connector did not expose repository Settings > Actions Environments, so this inspection does not prove whether an unused GitHub Environment exists in the web UI. No repository secret or deployment setting was changed.

## 2. Non-negotiable isolation rules

1. Use an **already available host separate from production**. Do not run this on the production Lightsail instance, share its process/port, or point staging to production storage.
2. Do not create or purchase hosting, a domain, or another paid service without explicit approval.
3. Start with a fresh, empty staging data directory. Do not copy production `ahabona.db`, photos, media, users, sessions, mail credentials, API keys, or environment files.
4. Use a test-only administrator (for example, an `example.test` email), a disposable test password, and synthetic image/video files. Never store credentials in this repository. Do not configure the production mail/SMS provider.
5. Keep `main`, PR #2, and production unchanged. Do not merge or deploy to production as part of this runbook.

## 3. Staging preparation (only after a separate host is available)

### Host and code

- Confirm the hostname points to the staging host, HTTPS is enabled, firewall rules expose only the required staging endpoint, and the host is not the production server.
- Install Node.js 24 and both `ffmpeg` and `ffprobe`. Keep logs and backups outside the public web root.
- Check out the tested Studio branch/commit without merging it:
  ```sh
  git fetch origin studio/backend-foundation-20261027
  git checkout --detach 431113d3116ef6eee308dfd07e308efce121f54e
  git rev-parse HEAD
  node --version
  ffmpeg -version | head -n 1
  ffprobe -version | head -n 1
  ```
  Stop if the commit is not the expected SHA or the required tools are missing.

### Isolated settings and first boot

Use the host's protected service/secret configuration, not a committed file or shell history. Example values (adjust the path and port for that staging host):

- `AHABONA_DATA=/srv/ahabona-staging/data` — a new, staging-only directory.
- `AHABONA_STUDIO_BETA=1` — staging only.
- `PORT=3301` — a port reserved for staging and not used by any other service.
- `AHABONA_SECURE=1` when served over HTTPS.
- `ADMIN_EMAIL`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` — staging-only bootstrap credentials, stored as secrets.

Before starting, verify that the selected data path is not a production path and does not contain a database already. Do not blindly reuse an existing directory. The server creates `ahabona.db`, `photos`, `media`, and `studio-media` below the selected data directory. The first boot and all test uploads must remain there. Keep the app behind HTTPS; configure proxy trust only when the staging reverse proxy is trusted and correctly configured.

Do **not** create an Actions deployment workflow or add hosting secrets until a specific staging target and authorization are available.

## 4. Test matrix and evidence to collect

Use only the staging URL and synthetic data. Record pass/fail, browser/device, timestamp, commit SHA, and a screenshot or redacted log for each result.

| Area | Procedure | Pass condition |
|---|---|---|
| Admin security | Open `/admin/studio` signed out, then sign in with the test admin. Try the admin API while signed out. | Editor and protected APIs reject unauthenticated access; test admin can enter. |
| Scenes | Create text and image/video drafts; edit and save each; preview the saved draft. | Reloaded values persist; editor preview matches the saved scene. |
| Media | Upload a synthetic image and a short synthetic MP4; wait for server conversion and poster generation. | Image is optimized; video is H.264 MP4; poster exists; invalid/oversized files are rejected. |
| Publish/visitor | Publish a text scene and a video scene; open a clean, anonymous browser session. | Public playlist/hero contains only eligible published scenes; the public view matches the admin preview; draft media stays private. |
| Schedule | Give a scene a future start time, confirm it is hidden, then move the start time into the past. Set an end time and confirm it disappears after expiry. | The public playlist respects both schedule boundaries. |
| Reorder/delete | Create at least two test scenes, move one up/down, reload; delete a disposable draft. | New order persists; deleted draft disappears. Remember that deleting a scene does not automatically delete its media files. |
| Byte ranges | For a published test video, run `curl -i -H 'Range: bytes=0-99' 'https://STAGING_HOST/studio-media/VIDEO_ASSET_ID'`. | HTTP `206`, `Content-Range: bytes 0-99/…`, and `Accept-Ranges: bytes`. Never substitute the production host. |
| Failure handling | In browser DevTools, block the test video's poster request and simulate a rejected video play/autoplay. Also test a missing/failed media response. | UI remains usable, shows an appropriate fallback, and does not leave the hero blank or stuck. Use request blocking; do not delete files outside staging. |
| Slow network and caching | Throttle the browser to a slow mobile connection; inspect reloads and Cache Storage/Network in DevTools. | UI remains usable; `/admin/studio`, `/studio-media/`, and Studio renderer routes are not accidentally persisted in shared/offline caches. |
| Legacy fallback | Disable `AHABONA_STUDIO_BETA` on the staging service and restart it. Check `/api/studio/playlist` and `/api/strip`. | Studio reports disabled and the existing legacy strip/hero still works. Re-enable only on staging if more Studio tests are needed. |

### Physical-phone pass

After the staging URL is reachable over HTTPS, test it on at least one real Android phone (and iPhone/Safari if available): normal and slow mobile data, narrow portrait and landscape, upload, preview, visitor hero, video autoplay rejection, blocked/missing poster, and navigation/reload with the service worker enabled. Keep a screen recording or screenshots plus the phone/browser version. Chromium viewport tests in CI are not a substitute for this check.

## 5. Backup and rollback drill (staging only)

Before the first manual test, capture the deployed commit, service configuration **without secrets**, and a backup of the entire staging data directory. Stop the staging process before making a filesystem copy so SQLite files are consistent.

Example after substituting a private backup directory on the staging host:
```sh
umask 077
# Stop the staging service first.
tar -C /srv/ahabona-staging/data -czf /srv/private-backups/ahabona-studio-staging-before-test.tgz .
sha256sum /srv/private-backups/ahabona-studio-staging-before-test.tgz
```

- Confirm the archive exists, has restrictive permissions, and contains the staging database and its `photos`, `media`, and `studio-media` directories. Keep it outside the web root.
- Test the feature-flag rollback by removing `AHABONA_STUDIO_BETA` from the **staging** service environment, restarting the service, and verifying the legacy fallback in the table above.
- For a full staging restore drill, stop the service, copy the original staging directory aside, restore the backup to the same isolated data path, restart, and verify database/media consistency. Record the result. Never restore this backup to production.
- If testing a previous code revision, record the old and new SHAs and keep the staging data backup. Do not delete Studio assets or tables as a rollback shortcut.

## 6. Current release gate

**Not yet demonstrated:** a persistent separate staging host/URL, real-phone behavior, staging backup/restore, staging rollback, and the manual network/media-failure tests. The successful GitHub workflow proves the isolated automated checks only. Do not declare Studio production-ready until the above evidence is recorded and reviewed; do not merge or deploy without explicit authorization.
