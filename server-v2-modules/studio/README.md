# AHABONA Studio — isolated development branch

This branch contains the first integrated, opt-in Studio implementation. The code is wired into this branch's `server-v2.cjs` only when `AHABONA_STUDIO_BETA=1` is set. With the flag unset, Studio's store, media pipeline, UI routes and public renderer are not enabled. **This branch has not been deployed to production.** The live server, live database, existing `strip_ads` rows, `main` and PR #2 have not been changed by this work.

## What is included

- `schema.cjs`: additive SQLite tables and indexes for Studio settings, scenes and media metadata.
- `store.cjs`: validated create/update/delete, publish/archive, ordering, scheduling and playback settings.
- `media.cjs`: bounded image/video processing, strict file validation, H.264 MP4 conversion, poster generation and one-at-a-time media-job lock.
- `renderer.js` and `renderer.css`: shared renderer for the existing top hero area and the Studio preview.
- `editor.html`, `editor.css` and `editor.js`: responsive authoring interface with text, image and video scenes, style/overlay controls, scheduling, upload, reordering and shared-renderer preview.
- `../../tests/studio-store-smoke.cjs` and `../../tests/studio-media-validation-smoke.cjs`: isolated SQLite and upload-validation smoke tests.

## Opt-in behavior in this branch

With `AHABONA_STUDIO_BETA=1`:
- `/admin/studio` opens the editor for a signed-in admin with `content.edit` permission. The existing admin menu is not changed yet.
- `/api/admin/studio/scenes`, `/api/admin/studio/assets` and `/api/admin/studio/settings` provide protected data operations. Image/video upload endpoints are `POST /api/admin/studio/assets/image` and `POST /api/admin/studio/assets/video`.
- `GET /api/studio/playlist` returns the public list only when Studio is enabled and its scenes are published and in schedule.
- `/studio-media/:assetId` resolves an asset ID through the database to a validated file name under the dedicated Studio media directory. Public caching is used only for published media; private draft preview media is sent with `private, no-store`.
- The existing hero first checks Studio. If the flag/settings/playlist/renderer are unavailable, it falls back to the existing `/api/strip` content. Studio starts disabled; the public renderer does not become active merely because the code is present.

The shared renderer uses the same slide builder for public playback and admin preview. It retains the existing hero placement, uses poster images before video playback, loads video when a slide becomes active, and supports pause/resume, touch swipe, shuffle, per-scene duration and transitions. Real browser behavior still needs end-to-end verification on small mobile screens.

## Media limits and safeguards

- Images: up to 8 MB input; re-encoded to JPEG, up to 1280 pixels wide, with metadata stripped.
- Videos: up to 64 MB input, maximum 90 seconds and 20 megapixels in source. The pipeline converts them to MP4/H.264 up to 960 pixels wide, uses one encoder thread, limits the video bitrate, removes the audio track and enables MP4 fast-start metadata. A JPEG poster is also generated.
- Image/video processing is serialized; if `ffmpeg`/`ffprobe` is missing or conversion/validation fails, the upload is rejected and is not marked ready.
- Scene text is rendered as text rather than trusted HTML. Style values are allow-listed, external CTA links require HTTPS, scene durations and image zoom are bounded, and file paths are not taken from request parameters.
- The additive Studio schema does not change `strip_ads`, `site_settings`, users or profiles. Deleting a scene does not automatically delete its media files; a separate reviewed retention process is required.

## Checks and remaining work

The GitHub Actions workflow `AHABONA Studio isolated checks` checks JavaScript syntax and runs isolated store/media-validation tests. A successful workflow is **not** the same as having tested a real phone browser or a full video upload with the exact runtime environment.

Before any release, still perform a separate non-production deployment and verify:
1. Admin access and every editor operation, including publish/schedule/reorder/upload/delete.
2. Real image/video upload using installed `ffmpeg`/`ffprobe`, memory/disk use and failure paths.
3. The public hero and admin preview rendering the same saved content on narrow phones, tablets and desktop.
4. Weak network, missing media/poster, autoplay rejection, byte-range streaming, service-worker caching and legacy fallback.
5. Database backup, reversible deployment, and rollback.

Do not set the flag on the live server, migrate the production database or merge this branch until the non-production tests and release/rollback review have passed.
