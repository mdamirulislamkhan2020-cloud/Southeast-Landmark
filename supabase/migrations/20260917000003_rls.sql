-- ==============================================================================
-- Southeast Landmark — Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
-- Users can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile or admin can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Users can update their own profile; admins can update any profile
CREATE POLICY "Users can update own profile or admin can update all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Profiles insert allowed on user sign up / bootstrap
CREATE POLICY "Users can insert own profile or admin insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 2. USER ROLES
-- ------------------------------------------------------------------------------
-- Users can read their own role; admins can view all roles
CREATE POLICY "Read user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Only super_admin / admin can manage roles
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. APP SETTINGS & NAV SETTINGS
-- ------------------------------------------------------------------------------
-- Public/Anon can read settings
CREATE POLICY "Public read app_settings"
  ON public.app_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public read nav_settings"
  ON public.nav_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage nav_settings"
  ON public.nav_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 4. MENUS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read enabled menus"
  ON public.menus FOR SELECT
  TO public
  USING (enabled = true OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage menus"
  ON public.menus FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 5. FORMS
-- ------------------------------------------------------------------------------
-- Public can read published forms; admins can manage
CREATE POLICY "Public read published forms"
  ON public.forms FOR SELECT
  TO public
  USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage forms"
  ON public.forms FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 6. CRM ASSIGNEES
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff read crm_assignees"
  ON public.crm_assignees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin manage crm_assignees"
  ON public.crm_assignees FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 7. LEADS
-- ------------------------------------------------------------------------------
-- Public / Anon can submit leads (INSERT only)
CREATE POLICY "Public insert leads"
  ON public.leads FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated staff/admins can read and update leads
CREATE POLICY "Staff read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 8. PAGES (CMS)
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read published pages"
  ON public.pages FOR SELECT
  TO public
  USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 9. PROPERTIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read published properties"
  ON public.properties FOR SELECT
  TO public
  USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 10. BLOG POSTS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read published blog posts"
  ON public.blog_posts FOR SELECT
  TO public
  USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. FAQS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read active faqs"
  ON public.faqs FOR SELECT
  TO public
  USING (active = true OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 12. TESTIMONIALS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read active testimonials"
  ON public.testimonials FOR SELECT
  TO public
  USING (active = true OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Admin manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 13. ACTIVITY LOG
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated can insert activity log"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view activity log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
