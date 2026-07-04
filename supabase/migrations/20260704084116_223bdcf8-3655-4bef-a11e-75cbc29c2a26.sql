
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  listing_status TEXT NOT NULL DEFAULT 'available',
  category TEXT NOT NULL DEFAULT 'Residential',
  type TEXT NOT NULL DEFAULT 'apartment',
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  featured_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  floor_plan TEXT,
  brochure_url TEXT,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  investment JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  lead_form_id UUID,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published properties"
  ON public.properties FOR SELECT
  USING (status = 'published' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert properties"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Super admins and admins can delete properties"
  ON public.properties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_properties_listing_status ON public.properties(listing_status);
