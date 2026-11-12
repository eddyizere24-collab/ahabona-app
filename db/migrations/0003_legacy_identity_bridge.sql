-- 0003: bridge the existing SQLite-authenticated user ID into Neon.
-- Only the stable numeric user ID and active/deleted status are mirrored.
-- No email, phone, password hash, national ID or session token is copied.

ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN pw DROP NOT NULL;

ALTER TABLE public.users
  ADD COLUMN identity_source TEXT NOT NULL DEFAULT 'legacy_sqlite'
  CHECK (identity_source IN ('legacy_sqlite','neon_native','imported'));

COMMENT ON COLUMN public.users.identity_source IS
  'Identifies the origin of the stable AHABONA user ID. Legacy identity shells contain no credentials or private contacts.';

CREATE INDEX IF NOT EXISTS idx_users_identity_source
  ON public.users(identity_source, id);

INSERT INTO public.schema_migrations(version, description)
VALUES (
  '0003_legacy_identity_bridge',
  'Allow ID-only legacy account projection without copying contacts or credentials'
)
ON CONFLICT (version) DO NOTHING;
