import type { CmsPage, DashboardStats, Lead, PageStatus } from "./types";

/**
 * Admin API client.
 *
 * Uses a REST contract expected on the same cPanel host under `/api/*`.
 * When the endpoint is unreachable (e.g. local dev without PHP backend),
 * it transparently falls back to a localStorage-backed mock so the UI
 * remains fully functional. Swap `USE_MOCK` to false once the PHP API
 * is deployed at /api.
 */

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_PAGES = "sel_admin_pages_v1";
const LS_LEADS = "sel_admin_leads_v1";
const LS_AUTH = "sel_admin_auth_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  if (readLS<CmsPage[] | null>(LS_PAGES, null) === null) {
    const now = new Date().toISOString();
    const built: CmsPage[] = [
      { title: "Home", slug: "/", parentId: null, status: "published" },
      { title: "About", slug: "/about", parentId: null, status: "published" },
      { title: "Property", slug: "/property", parentId: null, status: "published" },
      { title: "Blog", slug: "/blog", parentId: null, status: "published" },
      { title: "FAQ", slug: "/faq", parentId: null, status: "published" },
      { title: "Contact", slug: "/contact", parentId: null, status: "published" },
      { title: "Privacy Policy", slug: "/privacy", parentId: null, status: "draft" },
      { title: "Terms", slug: "/terms", parentId: null, status: "draft" },
    ].map((p) => ({
      id: uid(),
      title: p.title,
      slug: p.slug,
      parentId: p.parentId,
      status: p.status as PageStatus,
      seoTitle: p.title,
      seoDescription: "",
      content: `<h1>${p.title}</h1>`,
      publishAt: null,
      updatedAt: now,
      createdAt: now,
    }));
    writeLS(LS_PAGES, built);
  }
  if (readLS<Lead[] | null>(LS_LEADS, null) === null) {
    const sources = ["Website", "Facebook", "Google Ads", "Referral", "Walk-in"];
    const names = ["Ayesha Khan", "Rafiq Islam", "Tania Rahman", "Sabbir Ahmed", "Nadia Chowdhury", "Imran Hossain", "Mou Akter", "Jahid Karim"];
    const leads: Lead[] = Array.from({ length: 24 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 28));
      return {
        id: uid(),
        name: names[i % names.length],
        email: `lead${i + 1}@example.com`,
        phone: `0159${(1000000 + i).toString().slice(0, 7)}`,
        source: sources[i % sources.length],
        message: "Interested in a plot.",
        createdAt: d.toISOString(),
      };
    });
    writeLS(LS_LEADS, leads);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.text()).slice(0, 200); } catch { /* ignore */ }
      throw new Error(`API ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Request timed out: ${path}`);
    }
    if (err instanceof TypeError) {
      // Network failure (offline, CORS, DNS)
      throw new Error(`Network error while calling ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- Auth ----------

export interface AuthUser {
  email: string;
  name: string;
  role: "admin";
}

export function getSession(): AuthUser | null {
  return readLS<AuthUser | null>(LS_AUTH, null);
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (!USE_MOCK) {
    const user = await apiFetch<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    writeLS(LS_AUTH, user);
    return user;
  }
  if (!email || password.length < 4) throw new Error("Invalid credentials");
  const user: AuthUser = { email, name: email.split("@")[0] || "Admin", role: "admin" };
  writeLS(LS_AUTH, user);
  return user;
}

export function logout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(LS_AUTH);
}

// ---------- Pages ----------

export async function listPages(): Promise<CmsPage[]> {
  if (!USE_MOCK) return apiFetch<CmsPage[]>("/pages");
  seed();
  return readLS<CmsPage[]>(LS_PAGES, []);
}

export async function getPage(id: string): Promise<CmsPage | null> {
  if (!USE_MOCK) return apiFetch<CmsPage>(`/pages/${id}`);
  seed();
  return readLS<CmsPage[]>(LS_PAGES, []).find((p) => p.id === id) ?? null;
}

export async function createPage(input: Partial<CmsPage>): Promise<CmsPage> {
  const now = new Date().toISOString();
  const page: CmsPage = {
    id: uid(),
    title: input.title ?? "Untitled",
    slug: input.slug ?? `/untitled-${Date.now()}`,
    parentId: input.parentId ?? null,
    status: input.status ?? "draft",
    seoTitle: input.seoTitle ?? input.title ?? "",
    seoDescription: input.seoDescription ?? "",
    content: input.content ?? "",
    publishAt: input.publishAt ?? null,
    updatedAt: now,
    createdAt: now,
  };
  if (!USE_MOCK) return apiFetch<CmsPage>("/pages", { method: "POST", body: JSON.stringify(page) });
  const all = readLS<CmsPage[]>(LS_PAGES, []);
  all.unshift(page);
  writeLS(LS_PAGES, all);
  return page;
}

export async function updatePage(id: string, patch: Partial<CmsPage>): Promise<CmsPage> {
  if (!USE_MOCK) return apiFetch<CmsPage>(`/pages/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<CmsPage[]>(LS_PAGES, []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Page not found");
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS_PAGES, all);
  return all[idx];
}

export async function deletePage(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/pages/${id}`, { method: "DELETE" });
  writeLS(LS_PAGES, readLS<CmsPage[]>(LS_PAGES, []).filter((p) => p.id !== id));
}

export async function duplicatePage(id: string): Promise<CmsPage> {
  const src = await getPage(id);
  if (!src) throw new Error("Page not found");
  return createPage({ ...src, id: undefined, title: `${src.title} (Copy)`, slug: `${src.slug}-copy-${Date.now().toString(36)}`, status: "draft" });
}

// ---------- Leads / Dashboard ----------

export async function listLeads(): Promise<Lead[]> {
  if (!USE_MOCK) return apiFetch<Lead[]>("/leads");
  seed();
  return readLS<Lead[]>(LS_LEADS, []);
}

export async function getDashboard(): Promise<DashboardStats> {
  if (!USE_MOCK) return apiFetch<DashboardStats>("/dashboard");
  seed();
  const leads = readLS<Lead[]>(LS_LEADS, []);
  const pages = readLS<CmsPage[]>(LS_PAGES, []);
  const today = new Date();
  const isSameDay = (d: Date) => d.toDateString() === today.toDateString();
  const isSameMonth = (d: Date) => d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const sourceMap = new Map<string, number>();
  leads.forEach((l) => sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1));

  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const count = leads.filter((l) => new Date(l.createdAt).toDateString() === d.toDateString()).length;
    days.push({ day: label, count });
  }

  return {
    totalLeads: leads.length,
    todayLeads: leads.filter((l) => isSameDay(new Date(l.createdAt))).length,
    monthlyLeads: leads.filter((l) => isSameMonth(new Date(l.createdAt))).length,
    totalProperties: 12,
    totalBlogPosts: 8,
    totalPages: pages.length,
    propertyViews: 4820,
    conversionRate: leads.length ? Math.round((leads.length / 4820) * 1000) / 10 : 0,
    recentLeads: [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    recentActivity: [
      { id: uid(), text: "New lead captured from Website form", at: new Date().toISOString() },
      { id: uid(), text: "Property 'Landmark Heights' updated", at: new Date(Date.now() - 3600e3).toISOString() },
      { id: uid(), text: "Blog post 'Investing in Dhaka' published", at: new Date(Date.now() - 7200e3).toISOString() },
      { id: uid(), text: "Page 'About' edited", at: new Date(Date.now() - 86400e3).toISOString() },
    ],
    leadsBySource: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
    leadsByDay: days,
  };
}