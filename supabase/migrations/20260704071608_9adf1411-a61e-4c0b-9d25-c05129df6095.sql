
-- Menus table (items stored as JSONB to match current MenuItem shape)
CREATE TABLE public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'New Menu',
  slug text NOT NULL UNIQUE,
  location text NOT NULL DEFAULT 'custom',
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menus TO authenticated;
GRANT ALL ON public.menus TO service_role;

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads menus" ON public.menus
  FOR SELECT USING (true);
CREATE POLICY "Admins insert menus" ON public.menus
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update menus" ON public.menus
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete menus" ON public.menus
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Key/value settings table for header/footer/mobile navigation settings
CREATE TABLE public.nav_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nav_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_settings TO authenticated;
GRANT ALL ON public.nav_settings TO service_role;

ALTER TABLE public.nav_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads nav_settings" ON public.nav_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins upsert nav_settings" ON public.nav_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update nav_settings" ON public.nav_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete nav_settings" ON public.nav_settings
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER nav_settings_updated_at
  BEFORE UPDATE ON public.nav_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
