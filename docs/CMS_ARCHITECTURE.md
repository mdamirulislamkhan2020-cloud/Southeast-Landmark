# CMS Architecture & Engineering Specification

## 1. Executive Overview

The CMS engine is a full-stack, modular, and reusable content management platform built on React, TypeScript, Tailwind CSS, TanStack Query, and Supabase (PostgreSQL, Supabase Auth, Supabase Storage, and Row Level Security).

It decouples **CMS Core Infrastructure** from **Project-Specific Content and Visual Themes**, ensuring high portability, atomic state handling, draft/publish lifecycle safety, and zero data loss.

---

## 2. Structural Layer Diagram

```
+-------------------------------------------------------------------------------+
|                               PUBLIC CLIENT LAYER                             |
|  - React Router Dynamic Resolver (DynamicPage.tsx / Built-in Routes)          |
|  - CmsPageContent & BlockRenderer (JSONB -> Reactive Tailwind JSX)            |
|  - Helmet SEO & Canonical Meta Injection                                      |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                                ADMIN CLIENT LAYER                             |
|  - Route Security: RequireAuth Guard                                          |
|  - Management Consoles: PagesListPage, MediaPage, NavigationPage, ThemePage   |
|  - Visual Editor: PageEditorPage (Content, Page Builder, Live Preview)        |
|  - TanStack Query State Layer: Cache invalidation & optimistic sync           |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                                DATA SERVICE LAYER                             |
|  - /src/admin/api/client.ts (CRUD: pages, settings, menus, forms, blogs)     |
|  - /src/admin/api/lead-pages.ts (Block definitions, types, schemas)           |
|  - /src/admin/api/lead-pages-client.ts (Factory & default initializers)       |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                            SUPABASE PERSISTENCE LAYER                         |
|  - PostgreSQL Database: public.pages, menus, forms, app_settings, user_roles  |
|  - Authentication: Supabase Auth JWT & session storage                        |
|  - Storage: Supabase Storage CDN (media bucket)                               |
|  - Security: PostgreSQL Row Level Security (RLS) & is_admin() RPC function    |
+-------------------------------------------------------------------------------+
```

---

## 3. Core Subsystems

### 3.1 Page & Block Architecture
Pages are stored in the PostgreSQL `public.pages` table. Each page contains:
* Standard metadata: `id`, `title`, `slug` (unique), `template`, `status`, `show_in_nav`, `parent_id`, `form_id`.
* Dynamic content: `blocks` (JSONB array of `PageBlock` structures) and `content` (raw HTML fallback).
* SEO fields: `seo_title`, `seo_description`, `seo_keywords`, `canonical`, `og_image`.
* Audit timestamps: `created_at`, `updated_at`, `published_at`, `publish_at`, `archived_at`.

### 3.2 Block Types & Rendering Engine
The `BlockRenderer` component maps block descriptors to responsive UI elements:
* **Layout Blocks:** `hero`, `cta`, `spacing`, `divider`
* **Content Blocks:** `text`, `image`, `gallery`, `video`, `features`, `counter`, `html`
* **Data Blocks:** `faq`, `testimonials`, `property_grid`, `blog_grid`
* **Connect Blocks:** `lead_form`, `contact`, `map`

### 3.3 Draft / Publish Lifecycle & Anti-Resurrection
* Pages in `draft` status are protected by PostgreSQL RLS and cannot be read by anonymous visitors.
* When published, the status becomes `published`, timestamp `published_at` is set, and public queries resolve the page instantly.
* Deletion is immediate and permanent in PostgreSQL; the CMS adheres to the **Anti-Resurrection Rule**, ensuring deleted blocks or pages are never restored from static fallbacks.

### 3.4 Media Management
* Media assets are stored in the Supabase Storage `media` bucket.
* Public visitors can read assets directly from the CDN URL.
* Upload, replacement, and deletion require authenticated admin privileges enforced by storage RLS policies.
