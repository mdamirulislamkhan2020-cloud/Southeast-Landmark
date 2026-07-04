import type { CmsPage, DashboardStats, Lead, PageStatus } from "./types";
import type { PageBlock, BlockType } from "./lead-pages";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { listCrmLeads } from "./crm-client";
import { listActivity } from "./activity-log-client";

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

// Leads are still on localStorage until Phase 6 (CRM).
const LS_LEADS = "sel_admin_leads_v1";

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

// Legacy migrateDefaultPageBlocks() was removed — pages now live in Supabase.

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

/**
 * Seed built-in CMS pages the first time an admin opens the Pages list
 * against an empty database. Requires an authenticated admin session
 * (RLS blocks anon inserts). Public visitors see static markup fallbacks
 * until an admin has visited at least once.
 */
let _pagesSeedPromise: Promise<void> | null = null;
async function seedBuiltInPagesIfEmpty(): Promise<void> {
  if (_pagesSeedPromise) return _pagesSeedPromise;
  _pagesSeedPromise = (async () => {
    const { count, error: cErr } = await supabase
      .from("pages")
      .select("id", { count: "exact", head: true });
    if (cErr || (count ?? 0) > 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // only authenticated admins may seed
    const built = [
      { title: "Home", slug: "/", status: "published" as const },
      { title: "About", slug: "/about", status: "published" as const },
      { title: "Property", slug: "/property", status: "published" as const },
      { title: "Blog", slug: "/blog", status: "published" as const },
      { title: "FAQ", slug: "/faq", status: "published" as const },
      { title: "Contact", slug: "/contact", status: "published" as const },
      { title: "Privacy Policy", slug: "/privacy", status: "draft" as const },
      { title: "Terms", slug: "/terms", status: "draft" as const },
    ].map((p) => ({
      title: p.title,
      slug: p.slug,
      status: p.status,
      seo_title: p.title,
      seo_description: "",
      content: `<h1>${p.title}</h1>`,
      blocks: defaultBlocksForSlug(p.slug) as unknown as Json,
      show_in_nav: true,
      template: "standard" as const,
      created_by: session.user.id,
    }));
    await supabase.from("pages").insert(built);
  })();
  try { await _pagesSeedPromise; } finally { /* keep promise cached */ }
}

function seedLeadsIfEmpty() {
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
// Auth has moved to `./auth.ts` (Supabase-backed). This re-export keeps
// legacy imports working during the phased migration.
export { signIn as login, signOut as logout, getSessionSnapshot as getSession } from "./auth";
export type { AppRole } from "./auth";

// ---------- Pages (Supabase-backed) ----------

type PageRow = Database["public"]["Tables"]["pages"]["Row"];
type PageInsert = Database["public"]["Tables"]["pages"]["Insert"];
type PageUpdate = Database["public"]["Tables"]["pages"]["Update"];

function rowToPage(r: PageRow): CmsPage {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    parentId: r.parent_id,
    status: r.status as PageStatus,
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
    content: r.content ?? "",
    publishAt: r.publish_at,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
    publishedAt: r.published_at ?? null,
    archivedAt: r.archived_at ?? null,
    formId: r.form_id,
    blocks: (Array.isArray(r.blocks) ? (r.blocks as unknown as PageBlock[]) : []),
    showInNav: r.show_in_nav,
    template: r.template as CmsPage["template"],
    seoKeywords: r.seo_keywords ?? "",
    ogImage: r.og_image,
    canonical: r.canonical ?? "",
  };
}

function pageToDbPatch(p: Partial<CmsPage>): PageUpdate {
  const out: PageUpdate = {};
  if (p.title !== undefined) out.title = p.title;
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.parentId !== undefined) out.parent_id = p.parentId;
  if (p.status !== undefined) out.status = p.status;
  if (p.seoTitle !== undefined) out.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) out.seo_description = p.seoDescription;
  if (p.content !== undefined) out.content = p.content;
  if (p.publishAt !== undefined) out.publish_at = p.publishAt;
  if (p.publishedAt !== undefined) out.published_at = p.publishedAt;
  if (p.archivedAt !== undefined) out.archived_at = p.archivedAt;
  if (p.formId !== undefined) out.form_id = p.formId;
  if (p.blocks !== undefined) out.blocks = p.blocks as unknown as Json;
  if (p.showInNav !== undefined) out.show_in_nav = p.showInNav;
  if (p.template !== undefined) out.template = p.template;
  if (p.seoKeywords !== undefined) out.seo_keywords = p.seoKeywords;
  if (p.ogImage !== undefined) out.og_image = p.ogImage;
  if (p.canonical !== undefined) out.canonical = p.canonical;
  return out;
}

export async function listPages(): Promise<CmsPage[]> {
  await seedBuiltInPagesIfEmpty();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPage);
}

export async function getPage(id: string): Promise<CmsPage | null> {
  const { data, error } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToPage(data) : null;
}

/**
 * Make a slug unique by appending -2, -3, … if the target slug already exists.
 * Case-insensitive on `pages.slug` (which itself is stored lowercased).
 */
async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const query = supabase.from("pages").select("id, slug");
  const { data } = await query;
  const taken = new Set((data ?? []).filter((r) => r.id !== ignoreId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export async function createPage(input: Partial<CmsPage>): Promise<CmsPage> {
  const title = (input.title ?? "Untitled").trim() || "Untitled";
  const baseSlug = normalizeSlug(input.slug || title) || `/untitled-${Date.now().toString(36)}`;
  const slug = await ensureUniqueSlug(baseSlug);
  const status: PageStatus = input.status ?? "draft";
  const { data: { session } } = await supabase.auth.getSession();
  const row: PageInsert = {
    title,
    slug,
    parent_id: input.parentId ?? null,
    status,
    seo_title: input.seoTitle ?? title,
    seo_description: input.seoDescription ?? "",
    content: input.content ?? "",
    publish_at: input.publishAt ?? null,
    form_id: input.formId ?? null,
    blocks: (input.blocks ?? []) as unknown as Json,
    show_in_nav: input.showInNav ?? true,
    template: input.template ?? "standard",
    seo_keywords: input.seoKeywords ?? "",
    og_image: input.ogImage ?? null,
    canonical: input.canonical ?? "",
    created_by: session?.user.id ?? null,
  };
  const { data, error } = await supabase.from("pages").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return rowToPage(data);
}

export async function updatePage(id: string, patch: Partial<CmsPage>): Promise<CmsPage> {
  const normalized: Partial<CmsPage> = { ...patch };
  if (typeof patch.slug === "string") {
    const base = normalizeSlug(patch.slug) || patch.slug;
    normalized.slug = await ensureUniqueSlug(base, id);
  }
  const dbPatch = pageToDbPatch(normalized);
  const { data, error } = await supabase.from("pages").update(dbPatch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return rowToPage(data);
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicatePage(id: string): Promise<CmsPage> {
  const src = await getPage(id);
  if (!src) throw new Error("Page not found");
  const { id: _omitId, createdAt: _c, updatedAt: _u, publishedAt: _p, archivedAt: _a, ...rest } = src;
  return createPage({
    ...rest,
    title: `${src.title} (Copy)`,
    slug: `${src.slug}-copy-${Date.now().toString(36)}`,
    status: "draft",
  });
}

/**
 * Public helper — look up a published page by its URL path (e.g. "/about").
 */
export async function getPageByPath(path: string): Promise<CmsPage | null> {
  const normalized = normalizeSlug(path) || path;
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", normalized)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToPage(data) : null;
}

// ---------- Leads / Dashboard ----------

export async function listLeads(): Promise<Lead[]> {
  // Repository layer: leads live in the CRM store. Map to the legacy DashboardStats Lead shape.
  const crm = await listCrmLeads();
  return crm.map<Lead>((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    message: (l.answers.message as string) ?? "",
    source: l.source,
    createdAt: l.createdAt,
  }));
}

export async function getDashboard(): Promise<DashboardStats> {
  const leads = await listLeads();
  const pages = await listPages();
  const activity = await listActivity({ limit: 20 }).catch(() => []);
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
    recentActivity: activity.slice(0, 8).map((a) => ({
      id: a.id,
      text: a.message || `${a.action}${a.entity ? ` · ${a.entity}` : ""}`,
      at: a.createdAt,
    })),
    leadsBySource: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
    leadsByDay: days,
  };
}