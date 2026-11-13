-- 0004: record employer draft saves without misclassifying them as submissions.
ALTER TABLE public.job_moderation_events
  DROP CONSTRAINT job_moderation_events_action_check;

ALTER TABLE public.job_moderation_events
  ADD CONSTRAINT job_moderation_events_action_check
  CHECK (action IN (
    'draft_saved','submitted','approved','rejected','changes_requested',
    'closed','reopened','expired','reported'
  ));

INSERT INTO public.schema_migrations(version, description)
VALUES ('0004_job_draft_moderation_event', 'Allow an explicit moderation event for saved job drafts')
ON CONFLICT (version) DO NOTHING;
