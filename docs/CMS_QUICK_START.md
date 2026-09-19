# CMS Quick Start Guide

## 1. Prerequisites & Environment

The application requires the following environment variables configured in `.env`:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## 2. Default Administrator Credentials

* **Login URL:** `/admin/login`
* **Email:** `admin@southeastlandmark.com`
* **Password:** `123456789`
* **Role:** `super_admin` / `admin`

---

## 3. Key Navigation Paths

| Section | Route | Purpose |
|---------|-------|---------|
| **Dashboard** | `/admin` | Lead metrics, quick stats, overview |
| **Pages Manager** | `/admin/pages` | Page list, creation, editing, publishing |
| **Page Editor** | `/admin/pages/:id` | Visual block builder, content & SEO |
| **Media Library** | `/admin/media` | Image and asset management |
| **Navigation** | `/admin/navigation` | Header & footer menu builder |
| **Brand & Theme** | `/admin/theme` | Visual branding and site identity |
| **Forms Manager** | `/admin/forms` | Lead capture forms & builder |
| **Leads CRM** | `/admin/leads` | Incoming inquiries & customer leads |
| **SEO Settings** | `/admin/seo` | Global meta tags & sitemap settings |

---

## 4. Basic Operations Cheat-Sheet

* **Create a new page:** Go to `/admin/pages` -> Click `+ New Page` -> Enter Title and Slug -> Save.
* **Add a section block:** Inside the Page Editor -> Click `Page Builder` tab -> Select block type (e.g. `Hero`, `Features`, `FAQ`) from the left panel.
* **Preview unsaved changes:** Switch to the `Live Preview` tab inside the editor.
* **Publish to public site:** Click `Publish` in the top right corner.
* **Restore/Discard changes:** Click `Restore` or navigate away after confirming prompt.
