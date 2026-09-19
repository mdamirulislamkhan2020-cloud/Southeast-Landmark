# CMS User Flows & Operational Workflows

## 1. Administrator Authentication & Access

```
1. Admin navigates to `/admin/login`.
2. Enters credentials (e.g. admin@southeastlandmark.com / 123456789).
3. Supabase Auth generates JWT session token.
4. RequireAuth validates `public.is_admin()` role check.
5. Admin is redirected to the management dashboard at `/admin`.
```

---

## 2. Page Creation & Visual Builder Flow

```
1. Admin navigates to `/admin/pages`.
2. Clicks "+ New Page".
3. Enters Page Title (e.g., "Investment Guide") and URL Slug (auto-generated: "/investment-guide").
4. Selects a template preset (Builder, Blank, Standard, Landing, Contact, Blog).
5. New page record is created in PostgreSQL with `status: 'draft'`.
6. Editor opens automatically on `/admin/pages/:id`.
7. Admin switches to the "Page Builder" tab:
   - Clicks on desired block types from the left palette (Hero, Features, FAQ, etc.).
   - Reorders blocks using drag-and-drop handles.
   - Configures section headings, copy, images, and repeatable lists in the right settings panel.
8. Admin views changes in real-time under the "Live Preview" tab.
9. Admin clicks "Save Draft" -> Writes state to Supabase PostgreSQL.
10. Admin clicks "Publish" -> Sets `status = 'published'`, updating public site instantly.
```

---

## 3. Editing Existing Content

```
1. Navigate to `/admin/pages`.
2. Locate target page in the data table (e.g., "About Us" or "/about").
3. Click "Edit" (pencil icon).
4. Modify text fields, update SEO meta description, or add/remove blocks.
5. Unsaved change indicator appears (`● Unsaved changes`).
6. Click "Save Draft" or "Publish".
7. TanStack Query cache is automatically invalidated and refreshed.
8. Public visitors refreshing the page see the updated content.
```

---

## 4. Media Library & Image Upload Flow

```
1. Open `/admin/media` or click Image selector in any block editor.
2. Drag and drop image files or click "Upload Media".
3. File is uploaded to Supabase Storage `media` bucket.
4. Public CDN URL is generated and copied to clipboard or inserted into block data.
5. Media assets can be searched, previewed, and reused across multiple pages.
```

---

## 5. Navigation & Global Menu Management

```
1. Open `/admin/navigation`.
2. Add navigation menu items with labels, internal router paths, or external URLs.
3. Toggle item visibility or reorder menu hierarchy.
4. Changes save to `public.menus` and reflect globally across all page headers and footers.
```
