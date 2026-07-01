import type { CmsPage, DashboardStats, Lead, PageStatus } from "./types";
import type { PageBlock, BlockType } from "./lead-pages";

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
const LS_PAGES_MIGRATION = "sel_admin_pages_migration_v3";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Default block sets for the built-in pages. These mirror what the
 * hardcoded frontend already renders so the Page Builder is never empty
 * for the shipped site. Frontends fall back to their static markup only
 * when a CMS page has no blocks.
 */
function mkBlock(type: BlockType, data: Record<string, unknown>): PageBlock {
  return { id: uid(), type, data };
}

export function defaultBlocksForSlug(slug: string): PageBlock[] {
  switch (slug) {
    case "/":
      return [
        mkBlock("hero", {
          key: "home.hero",
          title: "Own Your Land in a Planned Township — Today and for Generations",
          image: "",
          ctaLabel: "Explore Projects",
          ctaHref: "/property",
          stats: [
            { k: "8k+", v: "Plot Owners" },
            { k: "31k+", v: "Katha Delivered" },
            { k: "৳ 34L", v: "Starting Plot Price" },
          ],
        }),
        mkBlock("features", { key: "home.features", eyebrow: "", title: "Grow the Value of Your Land Portfolio", subtitle: "Discover why plot buyers and land investors trust Southeast Landmark for planned township development, clean documentation and long-term appreciation.", items: [
          { title: "Easy Installments", body: "Flexible monthly installment facilities to make land ownership accessible." },
          { title: "Clean & Verified Land", body: "Every plot is legally cleared, mutation-ready and independently verified." },
          { title: "Transparent Documentation", body: "Full land papers, layout plans and approvals — accessible on request." },
          { title: "Dedicated Support", body: "A dedicated project team guides you from site visit to plot handover." },
        ] }),
        mkBlock("text", { key: "home.about", eyebrow: "About Us", title: "Welcome to Southeast Landmark", subtitle: "Planned Townships. Verified Land. Trusted Handover.", body1: "Southeast Landmark Ltd. is a Dhaka-based land development company dedicated to planning and delivering residential plots and township projects that combine strong infrastructure, clean documentation and lasting land value for every plot owner.", body2: "From land acquisition and layout approval to plot registration and handover, we work transparently and on schedule so families and investors can trust that the plot they book today will stand strong for generations.", ctaLabel: "Learn About Us", ctaHref: "/about" }),
        mkBlock("property_grid", { key: "home.projects", eyebrow: "Featured Projects", title: "Ongoing & Upcoming Land Projects", ctaLabel: "Explore all projects →", ctaHref: "/property" }),
        mkBlock("testimonials", { key: "home.testimonials", eyebrow: "Testimonials", title: "Trust, Planning and Service in Every Plot Handover", items: [
          { name: "Rafiq Ahmed", role: "Business Owner", body: "Southeast Landmark guided me through every step of my plot booking. Documentation and handover were smooth and honest." },
          { name: "Nasrin Kabir", role: "Architect", body: "Their township planning and road layout are exceptional. I recommend their projects to every client seeking long-term land value." },
          { name: "Imran Hossain", role: "Land Investor", body: "Clear papers, honest timelines and real appreciation on my plot. Exactly what a modern land development partner should be." },
          { name: "Sadia Rahman", role: "Plot Owner", body: "From site visit to registration, the team was responsive and transparent. My family is proud of the land we own." },
        ] }),
        mkBlock("counter", { key: "home.stats", title: "You Book. We Develop.", subtitle: "Focus on what matters. Southeast Landmark manages land planning, approvals, infrastructure and handover so your plot investment quietly appreciates in value.", items: [
          { value: "10,000+", label: "Plot Owners" },
          { value: "3,000+", label: "Land Investors" },
          { value: "25", label: "Years Experience" },
          { value: "30%", label: "Land Value Growth" },
        ] }),
        mkBlock("blog_grid", { key: "home.blog", eyebrow: "News & Insights", title: "Stay Informed with Our Latest Stories", ctaLabel: "View all posts →", ctaHref: "/blog" }),
      ];
    case "/about":
      return [
        mkBlock("hero", { key: "about.hero", title: "About", crumb: "About" }),
        mkBlock("text", { key: "about.intro", title: "Grow the Value of Your Land Portfolio", body: "Southeast Landmark Ltd. is a land development company on a mission to make planned, secure land ownership accessible. Our teams combine urban planning, civil engineering and land expertise to deliver residential plots and townships that stand out for their infrastructure, clean papers and long-term value." }),
        mkBlock("features", { key: "about.features", items: [
          { title: "Easy Installments", body: "Flexible monthly installment support to make plot ownership accessible." },
          { title: "Verified Land", body: "Every project is legally cleared, mutation-ready and independently verified." },
          { title: "Transparent Papers", body: "Full land documentation and approvals accessible for every plot owner." },
          { title: "Dedicated Support", body: "A dedicated project team supports you from site visit to registration." },
        ] }),
        mkBlock("text", { key: "about.story", eyebrow: "Our Story", title: "Welcome to Southeast Landmark", body1: "Southeast Landmark is a land development company committed to delivering thoughtfully planned residential plots and township projects for families and investors across Bangladesh.", body2: "From land acquisition and layout approval to plot registration and handover, we work transparently and on schedule — so that families and land investors alike can trust the plot they book today will stand strong for generations.", services: ["Residential Land Development", "Planned Township Development", "Residential Plot Sales", "Land Investment Advisory", "Site Visit Booking", "Installment Payment Support", "Customer Consultation", "After-Sales Support"] }),
      ];
    case "/property":
      return [
        mkBlock("hero", { key: "property.hero", title: "Projects", crumb: "Projects" }),
        mkBlock("property_grid", { key: "property.grid", searchTitle: "Find Your Plot", facilitiesTitle: "Project Facilities", amenities: ["Wide Roads", "Boundary Wall", "Utility Connections", "Drainage System", "Security", "Mosque & Community Space", "Playground / Park"] }),
      ];
    case "/blog":
      return [
        mkBlock("hero", { key: "blog.hero", title: "Blog", crumb: "Blog" }),
        mkBlock("blog_grid", { key: "blog.grid", eyebrow: "News & Insights", title: "Land Investment News & Township Insights", subtitle: "Explore our journal for expert land investment articles, township planning updates and stories from behind the scenes at Southeast Landmark." }),
      ];
    case "/faq":
      return [
        mkBlock("hero", { key: "faq.hero", title: "FAQ", crumb: "FAQ" }),
        mkBlock("faq", { key: "faq.content", eyebrow: "Frequently Asked Questions", title: "Answers to the Questions We Hear Most", subtitle: "If you can’t find what you’re looking for below, our team is happy to help — reach out through the contact page and we’ll get back within one business day.", items: [
          { q: "Who can book a plot with Southeast Landmark?", a: "Any adult resident or non-resident Bangladeshi with valid identification and a compliant source of funds can book a residential plot in our projects. Our team will guide you through booking, installments and registration step by step." },
          { q: "Is a land plot a long-term commitment?", a: "Our residential plots are designed for long-term ownership and land value appreciation. That said, plot owners are free to resell, transfer or gift their plot according to their own timelines." },
          { q: "How does plot pricing and installment work?", a: "Every project has a transparent per-katha price schedule, along with down-payment and monthly installment options. There are no hidden fees — you see the full breakdown, including registration and utility charges, before you book." },
          { q: "What after-sales support do you provide?", a: "After plot handover we support mutation, registration follow-up and project infrastructure upkeep such as roads, drainage and boundary walls. Our customer team stays available for any post-booking assistance you need." },
          { q: "Can I book a site visit to a project?", a: "Absolutely. Book a site visit through our contact page or by phone and we will arrange a guided project tour, layout walk-through and plot selection at a time that suits you." },
        ] }),
      ];
    case "/contact":
      return [
        mkBlock("hero", { key: "contact.hero", title: "Contact Us", crumb: "Contact Us" }),
        mkBlock("contact", { key: "contact.info", formTitle: "Book a Site Visit or Project Inquiry", formSubtitle: "Share your details and our land consultant will get in touch.", buttonLabel: "Book Your Plot Consultation", phone: "01591-134357", email: "info@southeastlandmark.com", address: "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207" }),
      ];
    default:
      return [];
  }
}

/**
 * Backfill blocks for built-in pages whose block list is currently empty.
 * Runs once per browser (guarded by a versioned flag) so it never
 * overwrites edits the admin has already made.
 */
function migrateDefaultPageBlocks() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(LS_PAGES_MIGRATION) === "done") return;
    const pages = readLS<CmsPage[]>(LS_PAGES, []);
    let changed = false;
    const next = pages.map((p) => {
      const hasBlocks = Array.isArray(p.blocks) && p.blocks.length > 0;
      const hasCmsSectionKeys = hasBlocks && p.blocks!.some((block) => typeof block.data?.key === "string");
      if (hasCmsSectionKeys) return p;
      const seedBlocks = defaultBlocksForSlug(p.slug);
      if (seedBlocks.length === 0) return p;
      changed = true;
      return { ...p, blocks: seedBlocks, updatedAt: new Date().toISOString() };
    });
    if (changed) writeLS(LS_PAGES, next);
    window.localStorage.setItem(LS_PAGES_MIGRATION, "done");
  } catch { /* ignore */ }
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
      formId: null,
      blocks: defaultBlocksForSlug(p.slug),
      showInNav: true,
      template: "standard",
      seoKeywords: "",
      ogImage: null,
      canonical: "",
    }));
    writeLS(LS_PAGES, built);
    if (typeof window !== "undefined") window.localStorage.setItem(LS_PAGES_MIGRATION, "done");
  }
  migrateDefaultPageBlocks();
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

/**
 * Normalize slug to a leading-slash absolute path (except keep "/" as-is).
 * Accepts "/about", "about", "/About Us" → "/about", "/about", "/about-us".
 */
function normalizeSlug(input: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  if (raw === "/") return "/";
  const cleaned = raw
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9\-/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `/${cleaned}`;
}

export { normalizeSlug };

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
  const title = (input.title ?? "Untitled").trim() || "Untitled";
  const slug = normalizeSlug(input.slug || title);
  const page: CmsPage = {
    id: uid(),
    title,
    slug: slug || `/untitled-${Date.now().toString(36)}`,
    parentId: input.parentId ?? null,
    status: input.status ?? "draft",
    seoTitle: input.seoTitle ?? title,
    seoDescription: input.seoDescription ?? "",
    content: input.content ?? "",
    publishAt: input.publishAt ?? null,
    updatedAt: now,
    createdAt: now,
    formId: input.formId ?? null,
    blocks: (input.blocks as PageBlock[] | undefined) ?? [],
    showInNav: input.showInNav ?? true,
    template: input.template ?? "standard",
    seoKeywords: input.seoKeywords ?? "",
    ogImage: input.ogImage ?? null,
    canonical: input.canonical ?? "",
  };
  // Guard against duplicate slugs in the mock store
  if (USE_MOCK) {
    const all = readLS<CmsPage[]>(LS_PAGES, []);
    let candidate = page.slug;
    let i = 2;
    while (all.some((p) => p.slug === candidate)) {
      candidate = `${page.slug}-${i++}`;
    }
    page.slug = candidate;
  }
  if (!USE_MOCK) return apiFetch<CmsPage>("/pages", { method: "POST", body: JSON.stringify(page) });
  const all = readLS<CmsPage[]>(LS_PAGES, []);
  all.unshift(page);
  writeLS(LS_PAGES, all);
  return page;
}

export async function updatePage(id: string, patch: Partial<CmsPage>): Promise<CmsPage> {
  const normalized: Partial<CmsPage> = { ...patch };
  if (typeof patch.slug === "string") normalized.slug = normalizeSlug(patch.slug) || patch.slug;
  if (!USE_MOCK) return apiFetch<CmsPage>(`/pages/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<CmsPage[]>(LS_PAGES, []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Page not found");
  all[idx] = { ...all[idx], ...normalized, updatedAt: new Date().toISOString() };
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
  const { id: _omitId, createdAt: _c, updatedAt: _u, ...rest } = src;
  return createPage({ ...rest, title: `${src.title} (Copy)`, slug: `${src.slug}-copy-${Date.now().toString(36)}`, status: "draft" });
}

/**
 * Public helper — look up a published page by its URL path (e.g. "/about").
 */
export async function getPageByPath(path: string): Promise<CmsPage | null> {
  const normalized = normalizeSlug(path) || path;
  const all = await listPages();
  return all.find((p) => p.slug === normalized && p.status === "published") ?? null;
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