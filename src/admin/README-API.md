# Admin REST API Contract (PHP + MySQL on cPanel)

The admin panel talks to `/api/*` on the same host. When these endpoints are
missing the frontend uses a localStorage mock so the SPA build stays
functional without a backend. To disable the mock, set:

```
VITE_ADMIN_USE_MOCK=false
```

Endpoints expected:

```
POST   /api/auth/login       { email, password } -> { email, name, role }
GET    /api/pages            -> CmsPage[]
GET    /api/pages/:id        -> CmsPage
POST   /api/pages            body: CmsPage       -> CmsPage
PUT    /api/pages/:id        body: Partial<Page> -> CmsPage
DELETE /api/pages/:id        -> 204
GET    /api/leads            -> Lead[]
GET    /api/dashboard        -> DashboardStats
```

Types are defined in `src/admin/api/types.ts`.