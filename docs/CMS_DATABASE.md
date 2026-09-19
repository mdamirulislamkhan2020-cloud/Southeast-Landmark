# CMS Database Schema & Data Dictionary

## 1. Schema Overview

The CMS utilizes a normalized relational database schema in PostgreSQL, managed through Supabase migrations.

---

## 2. Core Tables

### `public.pages`
Stores all CMS page definitions, templates, publishing status, and block configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique page identifier |
| `title` | `TEXT` | `NOT NULL` | Page title |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | URL route path (e.g. `/about`) |
| `template` | `page_template` | `NOT NULL DEFAULT 'standard'` | Template layout enum |
| `status` | `page_status` | `NOT NULL DEFAULT 'draft'` | Publication status (`draft`, `published`, `scheduled`, `archived`) |
| `content` | `TEXT` | `NOT NULL DEFAULT ''` | Raw HTML content body |
| `blocks` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Ordered array of `PageBlock` JSON objects |
| `seo_title` | `TEXT` | `NOT NULL DEFAULT ''` | HTML `<title>` tag |
| `seo_description`| `TEXT` | `NOT NULL DEFAULT ''` | Meta description |
| `seo_keywords` | `TEXT` | `NULL` | Meta keywords |
| `og_image` | `TEXT` | `NULL` | OpenGraph preview image URL |
| `canonical` | `TEXT` | `NULL` | Canonical link URL |
| `parent_id` | `UUID` | `REFERENCES public.pages(id) ON DELETE SET NULL` | Parent page reference |
| `form_id` | `UUID` | `REFERENCES public.forms(id) ON DELETE SET NULL` | Attached Lead Form reference |
| `show_in_nav` | `BOOLEAN` | `NOT NULL DEFAULT true` | Menu visibility flag |
| `published_at` | `TIMESTAMPTZ`| `NULL` | Timestamp of publication |
| `publish_at` | `TIMESTAMPTZ`| `NULL` | Future scheduled publication timestamp |
| `archived_at` | `TIMESTAMPTZ`| `NULL` | Timestamp when page was archived |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Last update timestamp |

---

### `public.menus`
Stores global navigation bars, footers, and custom menus.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique menu identifier |
| `name` | `TEXT` | `NOT NULL` | Menu name (e.g. "Main Header Menu") |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | Menu slug |
| `location` | `TEXT` | `NOT NULL DEFAULT 'main_header'` | UI display location |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | Internal notes |
| `enabled` | `BOOLEAN` | `NOT NULL DEFAULT true` | Active flag |
| `items` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Array of menu items (label, href, target) |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Last update timestamp |

---

### `public.app_settings`
Stores global application parameters, site identity, and branding config.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | `TEXT` | `PRIMARY KEY` | Setting identifier (e.g. `site_identity`) |
| `value` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` | Arbitrary JSON setting payload |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT now()` | Last update timestamp |

---

### `public.forms`
Stores dynamic lead capture forms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique form identifier |
| `name` | `TEXT` | `NOT NULL` | Form display name |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | Form identifier |
| `status` | `TEXT` | `NOT NULL DEFAULT 'published'` | Status (`draft` / `published`) |
| `fields` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Array of form fields and validation rules |
| `steps` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Multi-step form step definitions |
| `design` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` | Visual styling settings |
| `settings` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` | Email notifications & redirect settings |

---

### `public.user_roles` & `public.profiles`
Manage administrator authentication and role assignments.

| Table | Columns | Description |
|-------|---------|-------------|
| `public.user_roles` | `id`, `user_id` (FK to `auth.users`), `role` (`app_role` enum), `created_at` | Role permissions mapping |
| `public.profiles` | `id` (FK to `auth.users`), `email`, `name`, `phone`, `avatar`, `active`, `created_at` | User account profiles |
