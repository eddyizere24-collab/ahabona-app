-- 0006: Persist per-reader job announcement reads so the header badge is accurate.
-- The reader key is a server-side SHA-256 digest; raw device IDs are never stored.
CREATE TABLE public.job_post_reads (
  reader_key text NOT NULL
    CHECK (reader_key ~ '^[0-9a-f]{64}$'),
  job_post_id uuid NOT NULL
    REFERENCES public.job_posts(id) ON DELETE CASCADE,
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (reader_key, job_post_id)
);

CREATE INDEX idx_job_post_reads_last_viewed
  ON public.job_post_reads (last_viewed_at DESC);

GRANT SELECT, INSERT, UPDATE ON TABLE public.job_post_reads TO ahabona_app;

INSERT INTO public.schema_migrations(version, description)
VALUES (
  '0006_job_post_reads',
  'Track per-reader job announcement views for unread counts'
)
ON CONFLICT (version) DO NOTHING;
