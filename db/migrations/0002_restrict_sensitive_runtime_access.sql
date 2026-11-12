-- Restrict the sensitive identity vault and migration ledger from the runtime role.
-- The AHABONA API role is intentionally not allowed to read raw identity-verification material.
REVOKE ALL PRIVILEGES ON TABLE public.user_sensitive_records FROM ahabona_app;
REVOKE ALL PRIVILEGES ON TABLE public.schema_migrations FROM ahabona_app;
