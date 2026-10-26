# Server v2 working-copy modules

This folder supports the isolated `server-v2.cjs17` refactor branch. It is not the production entry point.

## Module map

- `assets.cjs` loads the extracted browser assets from `assets/`.
- `assets/` contains the page HTML, browser JavaScript, legal pages, stylesheet, splash script, and service worker.
- `catalogs.cjs` contains Rwanda location/job catalogs, role/permission catalogs, and server defaults.
- `i18n.cjs` contains the Kinyarwanda/English translation dictionaries and translation helpers.
- `utils.cjs` contains input normalization, date and profile validation helpers, hashing/password helpers, and blocklist checks.
- `compression.cjs` contains HTTP content-compression and ETag helpers.
- `schema.cjs` contains SQLite schema definitions.
- `database.cjs` contains additive migrations and initial seed data for capabilities, homepage strips, hero slides, and help FAQs.
- `media.cjs` contains profile-photo validation/storage and promo-media processing.

The HTTP endpoints, request context, profile/discovery logic, and request handling remain in `server-v2.cjs17` for later, separately tested extraction. `server-v2.cjs` remains the active server and is unchanged by this refactor.
