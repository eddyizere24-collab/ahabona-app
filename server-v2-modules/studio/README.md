# AHABONA Studio backend foundation (Phase 3)

This is an isolated foundation module. It is **not imported by `server-v2.cjs`**, does not register routes, and is not active on the website. Keep it isolated until the editor, upload path, public renderer, tests, and rollback plan are reviewed.

## Files

- `schema.cjs`: additive-only SQLite tables and indexes for Studio settings, media metadata, and scenes.
- `store.cjs`: validated storage operations for settings, draft/published scenes, and asset-processing states.

- `media.cjs`: isolated image/video optimization, strict size/dimension/duration checks, H.264 MP4 conversion, poster generation, and a one-job-at-a-time media lock.
- `editor.html`, `editor.css`, `editor.js`: responsive Studio editor and upload controls. The editor calls the opt-in Studio API and is not linked from the existing admin menu yet.
- `../../tests/studio-media-validation-smoke.cjs`: tests format sniffing, safe asset-key checks, limits, and the media-processing lock.
- `../../tests/studio-store-smoke.cjs`: isolated SQLite smoke tests.

## Safety

- Studio starts with `studio_settings.enabled = 0` and an empty playlist.
- Initialization only creates `studio_settings`, `studio_assets`, `studio_scenes`, and their indexes. It does not alter `strip_ads`, `site_settings`, users, profiles, or existing media.
- A public image/video scene cannot be published until its asset is `ready`. A public video also requires a ready poster. Text and style content are stored as text/validated JSON, never trusted HTML.
- External CTA links require HTTPS. Asset storage keys are fixed safe names, not filesystem paths supplied to a media route.
- Deleting a Studio scene does not delete media files or asset records. Media cleanup needs a separate reviewed retention procedure.
- The store is not an authorization layer. Any future route must apply the existing server admin/permission checks before write operations and must not expose raw storage keys publicly.

## Later integration requirements

1. Call `initStudioSchema(db)` only from an isolated, reviewed Studio-enabled build, not the currently running production server.
2. Resolve media by database asset ID to a validated key in a dedicated Studio media directory; never accept arbitrary request paths. Stream video with byte-range support.
3. Keep uploaded assets in `processing` until validation, MP4/H.264 transcoding with fast-start metadata, poster generation, and duration checks all pass. Only then mark them `ready`.
4. Keep the global Studio switch off until browser tests confirm the public renderer and admin preview use the same renderer.
5. Preserve the old strip renderer/API as fallback until the new path passes the full test phase.

Run the isolated smoke test with:

```sh
node tests/studio-store-smoke.cjs
```

Timestamps (`start_at`, `end_at`) are Unix milliseconds. This foundation caps final video duration at 90 seconds. The upload/transcoding path is implemented and verified in a later phase.

## Studio API and media rules

With `AHABONA_STUDIO_BETA=1` in an isolated test deployment, the opt-in build creates only the new Studio tables and exposes the protected `/admin/studio` editor. The admin API supports scene CRUD, scheduling, ordering, playback settings, and image/video upload. The public playlist is `GET /api/studio/playlist`; its media references use `/studio-media/:assetId`, resolved from a ready database record rather than a request-supplied filesystem path.

Uploads are raw request bodies (not base64), serialized so at most one Studio media transcode runs at a time. Images are limited to 8 MB and re-encoded to JPEG at up to 1280 pixels wide with metadata stripped. Source images/videos are capped at 20 megapixels. Videos are limited to 64 MB and 90 seconds; they must be decodable by ffmpeg and are converted to MP4/H.264 at up to 960 pixels wide with one encoder thread, without an audio track. A JPEG poster (up to 640 pixels wide) must also be created. If ffmpeg/ffprobe is missing or conversion fails, the upload is rejected; original unverified bytes are never marked ready or published.

This branch contains route wiring only behind the `AHABONA_STUDIO_BETA=1` opt-in. No setting is enabled in the live server, no live database was opened or migrated, and the branch has not been deployed. Run the GitHub Actions workflow `AHABONA Studio isolated checks` for syntax and isolated data/validation tests. Real phone-browser rendering, production-sized transcode timing, and end-to-end public preview still require a separate non-production deployment before any release.
