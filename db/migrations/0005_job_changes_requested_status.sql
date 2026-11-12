-- 0005: allow moderation to return an advert to its author for corrections.
ALTER TABLE public.job_posts
  DROP CONSTRAINT job_posts_status_check;

ALTER TABLE public.job_posts
  ADD CONSTRAINT job_posts_status_check
  CHECK (status IN (
    'draft','pending_review','changes_requested','approved',
    'rejected','closed','expired','archived'
  ));

INSERT INTO public.schema_migrations(version, description)
VALUES ('0005_job_changes_requested_status', 'Add a moderation changes-requested state for employer corrections')
ON CONFLICT (version) DO NOTHING;
