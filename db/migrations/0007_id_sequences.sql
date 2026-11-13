-- Migration 0007: give server-created BIGINT event/notification rows collision-safe IDs.
-- Existing IDs are preserved; sequences start at MAX(id)+1 in every database.
BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.notifications_id_seq;
ALTER TABLE public.notifications
  ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
SELECT setval('public.notifications_id_seq'::regclass,
              COALESCE((SELECT MAX(id) FROM public.notifications), 0) + 1,
              false);

CREATE SEQUENCE IF NOT EXISTS public.job_post_skills_id_seq;
ALTER TABLE public.job_post_skills
  ALTER COLUMN id SET DEFAULT nextval('public.job_post_skills_id_seq'::regclass);
ALTER SEQUENCE public.job_post_skills_id_seq OWNED BY public.job_post_skills.id;
SELECT setval('public.job_post_skills_id_seq'::regclass,
              COALESCE((SELECT MAX(id) FROM public.job_post_skills), 0) + 1,
              false);

CREATE SEQUENCE IF NOT EXISTS public.job_moderation_events_id_seq;
ALTER TABLE public.job_moderation_events
  ALTER COLUMN id SET DEFAULT nextval('public.job_moderation_events_id_seq'::regclass);
ALTER SEQUENCE public.job_moderation_events_id_seq OWNED BY public.job_moderation_events.id;
SELECT setval('public.job_moderation_events_id_seq'::regclass,
              COALESCE((SELECT MAX(id) FROM public.job_moderation_events), 0) + 1,
              false);

CREATE SEQUENCE IF NOT EXISTS public.application_status_events_id_seq;
ALTER TABLE public.application_status_events
  ALTER COLUMN id SET DEFAULT nextval('public.application_status_events_id_seq'::regclass);
ALTER SEQUENCE public.application_status_events_id_seq OWNED BY public.application_status_events.id;
SELECT setval('public.application_status_events_id_seq'::regclass,
              COALESCE((SELECT MAX(id) FROM public.application_status_events), 0) + 1,
              false);

CREATE SEQUENCE IF NOT EXISTS public.job_post_reports_id_seq;
ALTER TABLE public.job_post_reports
  ALTER COLUMN id SET DEFAULT nextval('public.job_post_reports_id_seq'::regclass);
ALTER SEQUENCE public.job_post_reports_id_seq OWNED BY public.job_post_reports.id;
SELECT setval('public.job_post_reports_id_seq'::regclass,
              COALESCE((SELECT MAX(id) FROM public.job_post_reports), 0) + 1,
              false);

GRANT USAGE, SELECT ON SEQUENCE
  public.notifications_id_seq,
  public.job_post_skills_id_seq,
  public.job_moderation_events_id_seq,
  public.application_status_events_id_seq,
  public.job_post_reports_id_seq
TO ahabona_app;

INSERT INTO public.schema_migrations (version, description)
VALUES ('0007_id_sequences', 'Add safe identity sequences to server-created event and notification rows')
ON CONFLICT (version) DO NOTHING;

COMMIT;
