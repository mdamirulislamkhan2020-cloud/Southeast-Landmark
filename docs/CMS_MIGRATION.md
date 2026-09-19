# CMS Migration & Portability Guide

## 1. Portability Principles

The CMS engine is designed to be cleanly extracted and deployed to new projects with zero architectural rework.

### Portable Core Modules (Do Not Modify):
* `/src/admin/pages/PageEditorPage.tsx`
* `/src/admin/pages/PagesListPage.tsx`
* `/src/admin/pages/MediaPage.tsx`
* `/src/admin/components/BlockRenderer.tsx`
* `/src/admin/api/client.ts`
* `/src/admin/api/lead-pages.ts`
* `/src/admin/api/lead-pages-client.ts`
* `/supabase/migrations/*`

### Project-Specific Configuration (Customizable):
* Visual Theme & Tailwind Tokens (`tailwind.config.ts`, `src/index.css`)
* Custom Section Types in `lead-pages.ts` & `BlockRenderer.tsx`
* Public Navigation Layouts & Brand Assets

---

## 2. Step-by-Step Migration to a New Supabase Project

1. **Deploy Database Migrations:**
   Run all SQL files located in `/supabase/migrations/` in sequence:
   * `20260917000001_initial_schema.sql`
   * `20260917000002_functions.sql`
   * `20260917000003_rls.sql`
   * `20260917000004_storage.sql`

2. **Configure Supabase Storage:**
   Ensure the `media` storage bucket is created with public access enabled.

3. **Create the Initial Super Admin:**
   Execute the admin bootstrap script or insert the super admin role into `public.user_roles` linked to `auth.users`.

4. **Set Environment Variables:**
   Update `.env` with the new project credentials:
   ```env
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

5. **Run Seed / Default Pages:**
   When an administrator first loads `/admin/pages`, `seedDefaultPagesIfEmpty()` automatically establishes baseline pages (`/`, `/about`, `/property`, `/blog`, `/faq`, `/contact`).
