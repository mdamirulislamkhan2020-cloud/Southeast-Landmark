import type { Redirect, SeoEntity, SeoEntityType, SeoMeta, SitemapEntry } from "./seo";
import { emptyMeta } from "./seo";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_SEO = "sel_admin_seo_entities_v1";
const LS_REDIRECTS = "sel_admin_seo_redirects_v1";
const LS_ROBOTS = "sel_admin_seo_robots_v1";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function readLS<T>(k: string, f: T): T { if (typeof window === "undefined") return f; try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : f; } catch { return f; } }
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

const DEFAULT_ENTITIES: Omit<SeoEntity, "id" | "updatedAt" | "meta">[] = [
  { type: "home", slug: "/", label: "Home" },
  { type: "about", slug: "/about", label: "About" },
  { type: "property", slug: "/property", label: "Property (Listing)" },
  { type: "property_detail", slug: "/property/:slug", label: "Property Details Template" },
  { type: "blog", slug: "/blog", label: "Blog (Listing)" },
  { type: "blog_detail", slug: "/blog/:slug", label: "Blog Details Template" },
  { type: "faq", slug: "/faq", label: "FAQ" },
  { type: "contact", slug: "/contact", label: "Contact" },
  { type: "lead_page", slug: "/lead/:slug", label: "Lead Pages Template" },
];

function seed(): SeoEntity[] {
  const existing = readLS<SeoEntity[] | null>(LS_SEO, null);
  if (existing && existing.length) return existing;
  const now = new Date().toISOString();
  const list: SeoEntity[] = DEFAULT_ENTITIES.map((e) => ({
    id: uid(), ...e, updatedAt: now,
    meta: { ...emptyMeta(), title: `${e.label} — Southeast Landmark`, description: `${e.label} at Southeast Landmark Ltd.`, canonical: e.slug },
  }));
  writeLS(LS_SEO, list);
  return list;
}

// ---------- Entities ----------

export async function listSeoEntities(): Promise<SeoEntity[]> {
  if (!USE_MOCK) return apiFetch<SeoEntity[]>("/seo/entities");
  return seed();
}

export async function getSeoEntity(id: string): Promise<SeoEntity | null> {
  if (!USE_MOCK) return apiFetch<SeoEntity>(`/seo/entities/${id}`);
  return seed().find((e) => e.id === id) ?? null;
}

export async function updateSeoEntity(id: string, patch: Partial<Pick<SeoEntity, "slug" | "label"> & { meta: Partial<SeoMeta> }>): Promise<SeoEntity> {
  if (!USE_MOCK) return apiFetch<SeoEntity>(`/seo/entities/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = seed();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Not found");
  all[idx] = { ...all[idx], slug: patch.slug ?? all[idx].slug, label: patch.label ?? all[idx].label, meta: { ...all[idx].meta, ...(patch.meta ?? {}) }, updatedAt: new Date().toISOString() };
  writeLS(LS_SEO, all);
  return all[idx];
}

export async function createSeoEntity(input: { type: SeoEntityType; slug: string; label: string }): Promise<SeoEntity> {
  const now = new Date().toISOString();
  const item: SeoEntity = { id: uid(), type: input.type, slug: input.slug, label: input.label, meta: emptyMeta(), updatedAt: now };
  if (!USE_MOCK) return apiFetch<SeoEntity>("/seo/entities", { method: "POST", body: JSON.stringify(item) });
  const all = seed(); all.unshift(item); writeLS(LS_SEO, all);
  return item;
}

export async function deleteSeoEntity(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/seo/entities/${id}`, { method: "DELETE" });
  writeLS(LS_SEO, seed().filter((e) => e.id !== id));
}

// ---------- Redirects ----------

function seedRedirects(): Redirect[] {
  const existing = readLS<Redirect[] | null>(LS_REDIRECTS, null);
  if (existing) return existing;
  const now = new Date().toISOString();
  const seedList: Redirect[] = [
    { id: uid(), from: "/old-property", to: "/property", code: 301, active: true, createdAt: now },
  ];
  writeLS(LS_REDIRECTS, seedList);
  return seedList;
}

export async function listRedirects(): Promise<Redirect[]> {
  if (!USE_MOCK) return apiFetch<Redirect[]>("/seo/redirects");
  return seedRedirects();
}

export async function createRedirect(input: Omit<Redirect, "id" | "createdAt">): Promise<Redirect> {
  const r: Redirect = { id: uid(), createdAt: new Date().toISOString(), ...input };
  if (!USE_MOCK) return apiFetch<Redirect>("/seo/redirects", { method: "POST", body: JSON.stringify(r) });
  const all = seedRedirects(); all.unshift(r); writeLS(LS_REDIRECTS, all);
  return r;
}

export async function updateRedirect(id: string, patch: Partial<Redirect>): Promise<Redirect> {
  if (!USE_MOCK) return apiFetch<Redirect>(`/seo/redirects/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = seedRedirects();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Not found");
  all[idx] = { ...all[idx], ...patch };
  writeLS(LS_REDIRECTS, all);
  return all[idx];
}

export async function deleteRedirect(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/seo/redirects/${id}`, { method: "DELETE" });
  writeLS(LS_REDIRECTS, seedRedirects().filter((r) => r.id !== id));
}

// ---------- Robots.txt ----------

const DEFAULT_ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml\n`;

export async function getRobotsTxt(): Promise<string> {
  if (!USE_MOCK) return apiFetch<{ content: string }>("/seo/robots").then((r) => r.content);
  return readLS<string>(LS_ROBOTS, DEFAULT_ROBOTS);
}

export async function saveRobotsTxt(content: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>("/seo/robots", { method: "PUT", body: JSON.stringify({ content }) });
  writeLS(LS_ROBOTS, content);
}

// ---------- Sitemap ----------

export async function buildSitemapXml(baseUrl: string): Promise<string> {
  const entities = await listSeoEntities();
  const rows: SitemapEntry[] = entities
    .filter((e) => e.meta.robotsIndex !== "noindex")
    .filter((e) => !e.slug.includes(":"))
    .map((e) => ({ loc: `${baseUrl.replace(/\/$/, "")}${e.slug}`, priority: e.type === "home" ? 1.0 : 0.7, changefreq: "weekly" }));
  const now = new Date().toISOString().slice(0, 10);
  const body = rows.map((r) => `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}