-- Restrict the sensitive identity vault and migration ledger from the runtime role.
-- The AHABONA API role is intentionally not allowed to read raw identity-verification material.
REVOKE ALL PRIVILEGES ON TABLE public.user_sensitive_records FROM ahabona_app;
REVOKE ALL PRIVILEGES ON TABLE public.schema_migrations FROM ahabona_app;

-- Record this privilege migration in the database ledger.
INSERT INTO public.schema_migrations(version, description)
VALUES ('0002_restrict_sensitive_runtime_access', 'Revoke runtime access to sensitive identity vault and migration ledger')
ON CONFLICT (version) DO NOTHING;
