
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  message TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view activity"
  ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated insert activity"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins delete activity"
  ON public.activity_log FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX activity_log_created_at_idx ON public.activity_log (created_at DESC);
CREATE INDEX activity_log_entity_idx ON public.activity_log (entity, entity_id);
