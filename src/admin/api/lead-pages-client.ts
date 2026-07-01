import type { BlockType, LeadPage, PageBlock } from "./lead-pages";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const LS = "sel_admin_lead_pages_v1";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function readLS<T>(k: string, f: T): T { if (typeof window === "undefined") return f; try { const r = window.localStorage.getItem(k); return r ? JSON.parse(r) as T : f; } catch { return f; } }
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export function newBlock(type: BlockType): PageBlock {
  const id = uid();
  switch (type) {
    case "hero": return { id, type, data: { title: "Landmark Living Awaits", subtitle: "Discover premium residences in Dhaka.", image: "", ctaLabel: "Get Started", ctaHref: "#form" } };
    case "text": return { id, type, data: { html: "<p>Write your content here.</p>" } };
    case "image": return { id, type, data: { src: "", alt: "", caption: "" } };
    case "gallery": return { id, type, data: { images: [] as string[] } };
    case "video": return { id, type, data: { url: "" } };
    case "features": return { id, type, data: { items: [ { title: "Premium Locations", text: "Handpicked plots in Dhaka." }, { title: "Trusted Builder", text: "Decade of experience." } ] } };
    case "counter": return { id, type, data: { items: [ { value: 250, label: "Projects" }, { value: 12, label: "Years" }, { value: 1800, label: "Happy Families" } ] } };
    case "faq": return { id, type, data: { items: [ { q: "Question 1", a: "Answer 1" } ] } };
    case "testimonials": return { id, type, data: { source: "all" } };
    case "cta": return { id, type, data: { title: "Ready to invest?", subtitle: "Talk to our team today.", ctaLabel: "Contact Us", ctaHref: "#form" } };
    case "map": return { id, type, data: { embed: "" } };
    case "property_grid": return { id, type, data: { limit: 6, category: "" } };
    case "blog_grid": return { id, type, data: { limit: 3 } };
    case "contact": return { id, type, data: { phone: "", email: "", address: "" } };
    case "lead_form": return { id, type, data: { formId: null, title: "Request a Callback" } };
    case "html": return { id, type, data: { html: "<div>Custom HTML</div>" } };
    case "spacing": return { id, type, data: { height: 48 } };
    case "divider": return { id, type, data: {} };
  }
}

function seed() {
  if (readLS<LeadPage[] | null>(LS, null) !== null) return;
  const now = new Date().toISOString();
  const page: LeadPage = {
    id: uid(), name: "Investment Opportunity", slug: "investment", title: "Invest in Dhaka Real Estate",
    banner: null, featuredImage: null,
    shortDescription: "High-ROI plots and apartments in prime Dhaka locations.",
    longDescription: "Southeast Landmark curates investment-grade properties.",
    status: "published", category: "Investment", sortOrder: 1,
    formId: null,
    blocks: [
      newBlock("hero"),
      newBlock("features"),
      newBlock("counter"),
      newBlock("lead_form"),
    ],
    design: { background: "#ffffff", sectionWidth: 1200, padding: 64, margin: 0, fontHeading: "Playfair Display", fontBody: "Inter", buttonStyle: "rounded", radius: 8, animations: true },
    seo: { title: "Investment Opportunities — Southeast Landmark", description: "Discover high-yield plots and apartments in Dhaka.", keywords: "dhaka real estate, invest, plots", canonical: "" },
    og: { image: "", twitterCard: "summary_large_image" },
    publishAt: null,
    analyticsPlaceholders: {},
    createdAt: now, updatedAt: now,
  };
  writeLS(LS, [page]);
}

export async function listLeadPages(): Promise<LeadPage[]> {
  if (!USE_MOCK) return apiFetch<LeadPage[]>("/lead-pages");
  seed();
  return readLS<LeadPage[]>(LS, []);
}
export async function getLeadPage(id: string): Promise<LeadPage | null> {
  if (!USE_MOCK) return apiFetch<LeadPage>(`/lead-pages/${id}`);
  seed(); return readLS<LeadPage[]>(LS, []).find((p) => p.id === id) ?? null;
}
export async function getLeadPageBySlug(slug: string): Promise<LeadPage | null> {
  if (!USE_MOCK) return apiFetch<LeadPage>(`/lead-pages/slug/${slug}`);
  seed(); return readLS<LeadPage[]>(LS, []).find((p) => p.slug === slug && p.status === "published") ?? null;
}
export async function createLeadPage(name = "New Lead Page"): Promise<LeadPage> {
  const now = new Date().toISOString();
  const p: LeadPage = {
    id: uid(), name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: name,
    banner: null, featuredImage: null, shortDescription: "", longDescription: "",
    status: "draft", category: "General", sortOrder: 999, formId: null,
    blocks: [newBlock("hero")],
    design: { background: "#ffffff", sectionWidth: 1200, padding: 64, margin: 0, fontHeading: "Playfair Display", fontBody: "Inter", buttonStyle: "rounded", radius: 8, animations: true },
    seo: { title: name, description: "", keywords: "", canonical: "" },
    og: { image: "", twitterCard: "summary_large_image" },
    publishAt: null, analyticsPlaceholders: {},
    createdAt: now, updatedAt: now,
  };
  if (!USE_MOCK) return apiFetch<LeadPage>("/lead-pages", { method: "POST", body: JSON.stringify(p) });
  const all = readLS<LeadPage[]>(LS, []); all.unshift(p); writeLS(LS, all); return p;
}
export async function updateLeadPage(id: string, patch: Partial<LeadPage>): Promise<LeadPage> {
  if (!USE_MOCK) return apiFetch<LeadPage>(`/lead-pages/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<LeadPage[]>(LS, []);
  const i = all.findIndex((p) => p.id === id);
  if (i < 0) throw new Error("Lead page not found");
  all[i] = { ...all[i], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS, all);
  return all[i];
}
export async function deleteLeadPage(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/lead-pages/${id}`, { method: "DELETE" });
  writeLS(LS, readLS<LeadPage[]>(LS, []).filter((p) => p.id !== id));
}
export async function duplicateLeadPage(id: string): Promise<LeadPage> {
  const src = await getLeadPage(id);
  if (!src) throw new Error("Not found");
  const now = new Date().toISOString();
  const copy: LeadPage = { ...src, id: uid(), name: `${src.name} (Copy)`, slug: `${src.slug}-copy`, status: "draft", createdAt: now, updatedAt: now };
  const all = readLS<LeadPage[]>(LS, []); all.unshift(copy); writeLS(LS, all); return copy;
}