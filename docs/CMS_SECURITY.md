# CMS Security & Row Level Security (RLS) Specification

## 1. Security Architecture

The CMS enforces security across three independent layers:
1. **Network & Client Guard:** Frontend routing guards (`<RequireAuth>`) intercept unauthorized access to `/admin/*`.
2. **Database Engine:** PostgreSQL Row Level Security (RLS) enforces authorization at the row and column level for all database operations.
3. **Storage Engine:** Supabase Storage access policies govern asset read/write permissions on the `media` bucket.

---

## 2. Row Level Security (RLS) Policies

### Table: `public.pages`

```sql
-- Allow anonymous and public visitors to SELECT published pages only
CREATE POLICY "Public read published pages"
  ON public.pages FOR SELECT
  TO public
  USING (status = 'published' OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

-- Restrict INSERT, UPDATE, and DELETE to authenticated administrators
CREATE POLICY "Admin manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

### Table: `public.menus` & `public.app_settings`

```sql
-- Public can read enabled menus and settings
CREATE POLICY "Public read menus"
  ON public.menus FOR SELECT
  TO public
  USING (enabled = true OR (auth.role() = 'authenticated' AND public.is_admin(auth.uid())));

CREATE POLICY "Public read settings"
  ON public.app_settings FOR SELECT
  TO public
  USING (true);

-- Mutations restricted to admins
CREATE POLICY "Admin manage menus"
  ON public.menus FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin manage settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

---

## 3. Administrator Privilege Verification

Authorization uses the secure PostgreSQL function `public.is_admin(_user_id UUID)`:

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'manager', 'editor')
  );
$$;
```

---

## 4. Key Management & Secrets Protection

* **Client Code:** Uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key).
* **Service Role & Master Keys:** Never committed to git, never exposed in client bundles, and never injected into client JSX.
