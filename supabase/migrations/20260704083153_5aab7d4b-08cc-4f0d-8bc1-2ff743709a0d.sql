
CREATE TABLE public.crm_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'sales',
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_assignees TO authenticated;
GRANT ALL ON public.crm_assignees TO service_role;
ALTER TABLE public.crm_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignees admin read" ON public.crm_assignees FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "assignees admin write" ON public.crm_assignees FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "assignees admin update" ON public.crm_assignees FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "assignees admin delete" ON public.crm_assignees FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_crm_assignees_updated BEFORE UPDATE ON public.crm_assignees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  score integer NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES public.crm_assignees(id) ON DELETE SET NULL,
  form_id uuid REFERENCES public.forms(id) ON DELETE SET NULL,
  form_name text,
  lead_page_id uuid,
  lead_page_slug text,
  source text NOT NULL DEFAULT 'Website',
  analytics jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  communications jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads public submit" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "leads authed submit" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "leads admin read" ON public.leads FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "leads admin update" ON public.leads FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "leads admin delete" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_form_id ON public.leads (form_id);
