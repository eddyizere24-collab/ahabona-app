-- AHABONA migration 0007: employer talent discovery matches.
-- Candidate profiles are searchable by employers only after explicit reverse-discovery consent.
CREATE TABLE IF NOT EXISTS public.talent_discovery_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_id uuid NOT NULL REFERENCES public.employer_talent_watches(id) ON DELETE CASCADE,
  candidate_user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_score numeric NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  match_reasons jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(match_reasons) = 'array'),
  state text NOT NULL DEFAULT 'matched' CHECK (state IN ('matched','notified','viewed','dismissed','contacted')),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (watch_id, candidate_user_id)
);

CREATE INDEX IF NOT EXISTS idx_talent_discovery_candidate_state
  ON public.talent_discovery_matches (candidate_user_id, state, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_talent_discovery_watch_state
  ON public.talent_discovery_matches (watch_id, state, calculated_at DESC);

INSERT INTO public.schema_migrations (version, description)
VALUES (
  '0007_talent_discovery_matches',
  'Store employer talent watch matches with candidate consent and deduplicated employer notifications'
)
ON CONFLICT (version) DO NOTHING;
