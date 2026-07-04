import type { BlogPost, BlogStatus, Faq, Testimonial } from "./content";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const asJson = <T,>(v: T): Json => v as unknown as Json;

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_FAQ = "sel_admin_faq_v1";
const LS_TESTIMONIALS = "sel_admin_testimonials_v1";

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
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------- Seeds ----------

const AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=70";

function seedFaq() {
  if (readLS<Faq[] | null>(LS_FAQ, null) !== null) return;
  const now = new Date().toISOString();
  const samples: Partial<Faq>[] = [
    { question: "What areas does Southeast Landmark cover?", answer: "We currently focus on Mohammadpur, Adabor, and surrounding zones in Dhaka.", category: "General" },
    { question: "Do you offer installment plans?", answer: "Yes, most properties support flexible installment plans up to 36 months.", category: "Payment" },
    { question: "Can I schedule a site visit?", answer: "Absolutely — book from any property page or contact our sales team.", category: "Visits" },
    { question: "Are the properties ready to move in?", answer: "Availability varies. Each listing shows its current status (available, upcoming, sold).", category: "General" },
  ];
  const built: Faq[] = samples.map((f, i) => ({
    id: uid(),
    question: f.question!,
    answer: f.answer!,
    category: f.category ?? "General",
    active: true,
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }));
  writeLS(LS_FAQ, built);
}

function seedTestimonials() {
  if (readLS<Testimonial[] | null>(LS_TESTIMONIALS, null) !== null) return;
  const now = new Date().toISOString();
  const samples: Partial<Testimonial>[] = [
    { name: "Ayesha Khan", position: "Owner", company: "Landmark Heights", rating: 5, review: "The experience from booking to handover was seamless. Highly recommend Southeast Landmark." },
    { name: "Rafiq Islam", position: "Investor", company: "Private", rating: 5, review: "Transparent pricing and strong ROI. My family trusts them for every deal now." },
    { name: "Tania Rahman", position: "Resident", company: "Green Villa", rating: 4, review: "Beautiful build quality and responsive after-sales support." },
  ];
  const built: Testimonial[] = samples.map((t, i) => ({
    id: uid(),
    name: t.name!,
    position: t.position ?? "",
    company: t.company ?? "",
    image: AVATAR,
    rating: t.rating ?? 5,
    review: t.review!,
    active: true,
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }));
  writeLS(LS_TESTIMONIALS, built);
}

// ---------- Blog ----------

export interface ListBlogQuery {
  search?: string;
  status?: BlogStatus | "all";
  category?: string | "all";
  tag?: string | "all";
  page?: number;
  perPage?: number;
}

export interface ListBlogResult {
  items: BlogPost[];
  total: number;
  page: number;
  perPage: number;
}

export async function listBlogPosts(q: ListBlogQuery = {}): Promise<ListBlogResult> {
  if (!USE_MOCK) {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v != null && v !== "all" && params.set(k, String(v)));
    return apiFetch<ListBlogResult>(`/blog?${params.toString()}`);
  }
  seedBlog();
  let items = readLS<BlogPost[]>(LS_BLOG, []);
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter((p) =>
      (p.title + p.excerpt + p.author + p.tags.join(" ") + p.categories.join(" ")).toLowerCase().includes(s),
    );
  }
  if (q.status && q.status !== "all") items = items.filter((p) => p.status === q.status);
  if (q.category && q.category !== "all") items = items.filter((p) => p.categories.includes(q.category!));
  if (q.tag && q.tag !== "all") items = items.filter((p) => p.tags.includes(q.tag!));
  items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const page = q.page ?? 1;
  const perPage = q.perPage ?? 8;
  const total = items.length;
  const paged = items.slice((page - 1) * perPage, page * perPage);
  return { items: paged, total, page, perPage };
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  if (!USE_MOCK) return apiFetch<BlogPost>(`/blog/${id}`);
  seedBlog();
  return readLS<BlogPost[]>(LS_BLOG, []).find((p) => p.id === id) ?? null;
}

function blankBlogPost(): BlogPost {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "Untitled Post",
    slug: `untitled-${Date.now().toString(36)}`,
    excerpt: "",
    content: "",
    featuredImage: null,
    author: "Editorial Team",
    categories: [],
    tags: [],
    status: "draft",
    readingTime: 1,
    publishAt: null,
    publishedAt: null,
    seo: { title: "", description: "", keywords: "" },
    og: { title: "", description: "", image: null },
    createdAt: now,
    updatedAt: now,
  };
}

export async function createBlogPost(input: Partial<BlogPost>): Promise<BlogPost> {
  const merged: BlogPost = { ...blankBlogPost(), ...input };
  merged.readingTime = estimateReadingTime(merged.content || "");
  if (merged.status === "published" && !merged.publishedAt) merged.publishedAt = new Date().toISOString();
  merged.updatedAt = new Date().toISOString();
  if (!USE_MOCK) return apiFetch<BlogPost>("/blog", { method: "POST", body: JSON.stringify(merged) });
  const all = readLS<BlogPost[]>(LS_BLOG, []);
  all.unshift(merged);
  writeLS(LS_BLOG, all);
  return merged;
}

export async function updateBlogPost(id: string, patch: Partial<BlogPost>): Promise<BlogPost> {
  if (!USE_MOCK) return apiFetch<BlogPost>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<BlogPost[]>(LS_BLOG, []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Not found");
  const next: BlogPost = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  if (patch.content !== undefined) next.readingTime = estimateReadingTime(next.content);
  if (next.status === "published" && !next.publishedAt) next.publishedAt = new Date().toISOString();
  all[idx] = next;
  writeLS(LS_BLOG, all);
  return next;
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/blog/${id}`, { method: "DELETE" });
  writeLS(LS_BLOG, readLS<BlogPost[]>(LS_BLOG, []).filter((p) => p.id !== id));
}

export async function duplicateBlogPost(id: string): Promise<BlogPost> {
  const src = await getBlogPost(id);
  if (!src) throw new Error("Not found");
  return createBlogPost({
    ...src,
    id: undefined,
    title: `${src.title} (Copy)`,
    slug: `${src.slug}-copy-${Date.now().toString(36)}`,
    status: "draft",
    publishedAt: null,
  });
}

export async function listBlogCategories(): Promise<string[]> {
  seedBlog();
  const items = readLS<BlogPost[]>(LS_BLOG, []);
  return Array.from(new Set(["Investment", "Guides", "Design", "News", ...items.flatMap((i) => i.categories)]));
}

export async function listBlogTags(): Promise<string[]> {
  seedBlog();
  const items = readLS<BlogPost[]>(LS_BLOG, []);
  return Array.from(new Set(items.flatMap((i) => i.tags)));
}

// ---------- FAQ ----------

export interface ListFaqQuery {
  search?: string;
  category?: string | "all";
  active?: "all" | "active" | "inactive";
}

export async function listFaqs(q: ListFaqQuery = {}): Promise<Faq[]> {
  if (!USE_MOCK) {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v != null && v !== "all" && params.set(k, String(v)));
    return apiFetch<Faq[]>(`/faqs?${params.toString()}`);
  }
  seedFaq();
  let items = readLS<Faq[]>(LS_FAQ, []);
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter((f) => (f.question + f.answer + f.category).toLowerCase().includes(s));
  }
  if (q.category && q.category !== "all") items = items.filter((f) => f.category === q.category);
  if (q.active === "active") items = items.filter((f) => f.active);
  if (q.active === "inactive") items = items.filter((f) => !f.active);
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createFaq(input: Partial<Faq>): Promise<Faq> {
  const now = new Date().toISOString();
  const existing = readLS<Faq[]>(LS_FAQ, []);
  const faq: Faq = {
    id: uid(),
    question: input.question ?? "New question",
    answer: input.answer ?? "",
    category: input.category ?? "General",
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: now,
    updatedAt: now,
  };
  if (!USE_MOCK) return apiFetch<Faq>("/faqs", { method: "POST", body: JSON.stringify(faq) });
  existing.push(faq);
  writeLS(LS_FAQ, existing);
  return faq;
}

export async function updateFaq(id: string, patch: Partial<Faq>): Promise<Faq> {
  if (!USE_MOCK) return apiFetch<Faq>(`/faqs/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<Faq[]>(LS_FAQ, []);
  const idx = all.findIndex((f) => f.id === id);
  if (idx < 0) throw new Error("Not found");
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS_FAQ, all);
  return all[idx];
}

export async function deleteFaq(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/faqs/${id}`, { method: "DELETE" });
  writeLS(LS_FAQ, readLS<Faq[]>(LS_FAQ, []).filter((f) => f.id !== id));
}

export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch<void>("/faqs/reorder", { method: "POST", body: JSON.stringify({ orderedIds }) });
    return;
  }
  const all = readLS<Faq[]>(LS_FAQ, []);
  const map = new Map(all.map((f) => [f.id, f]));
  const next: Faq[] = orderedIds.map((id, i) => {
    const f = map.get(id)!;
    return { ...f, sortOrder: i };
  });
  // include any missing
  all.forEach((f) => { if (!orderedIds.includes(f.id)) next.push(f); });
  writeLS(LS_FAQ, next);
}

export async function listFaqCategories(): Promise<string[]> {
  seedFaq();
  const items = readLS<Faq[]>(LS_FAQ, []);
  return Array.from(new Set(["General", "Payment", "Visits", "Legal", ...items.map((f) => f.category)]));
}

// ---------- Testimonials ----------

export interface ListTestimonialsQuery {
  search?: string;
  active?: "all" | "active" | "inactive";
}

export async function listTestimonials(q: ListTestimonialsQuery = {}): Promise<Testimonial[]> {
  if (!USE_MOCK) {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v != null && v !== "all" && params.set(k, String(v)));
    return apiFetch<Testimonial[]>(`/testimonials?${params.toString()}`);
  }
  seedTestimonials();
  let items = readLS<Testimonial[]>(LS_TESTIMONIALS, []);
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter((t) => (t.name + t.company + t.review + t.position).toLowerCase().includes(s));
  }
  if (q.active === "active") items = items.filter((t) => t.active);
  if (q.active === "inactive") items = items.filter((t) => !t.active);
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTestimonial(input: Partial<Testimonial>): Promise<Testimonial> {
  const now = new Date().toISOString();
  const existing = readLS<Testimonial[]>(LS_TESTIMONIALS, []);
  const item: Testimonial = {
    id: uid(),
    name: input.name ?? "New Client",
    position: input.position ?? "",
    company: input.company ?? "",
    image: input.image ?? null,
    rating: input.rating ?? 5,
    review: input.review ?? "",
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: now,
    updatedAt: now,
  };
  if (!USE_MOCK) return apiFetch<Testimonial>("/testimonials", { method: "POST", body: JSON.stringify(item) });
  existing.push(item);
  writeLS(LS_TESTIMONIALS, existing);
  return item;
}

export async function updateTestimonial(id: string, patch: Partial<Testimonial>): Promise<Testimonial> {
  if (!USE_MOCK) return apiFetch<Testimonial>(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<Testimonial[]>(LS_TESTIMONIALS, []);
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) throw new Error("Not found");
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS_TESTIMONIALS, all);
  return all[idx];
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/testimonials/${id}`, { method: "DELETE" });
  writeLS(LS_TESTIMONIALS, readLS<Testimonial[]>(LS_TESTIMONIALS, []).filter((t) => t.id !== id));
}

export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  const all = readLS<Testimonial[]>(LS_TESTIMONIALS, []);
  const map = new Map(all.map((t) => [t.id, t]));
  const next: Testimonial[] = orderedIds.map((id, i) => ({ ...(map.get(id) as Testimonial), sortOrder: i }));
  all.forEach((t) => { if (!orderedIds.includes(t.id)) next.push(t); });
  writeLS(LS_TESTIMONIALS, next);
}