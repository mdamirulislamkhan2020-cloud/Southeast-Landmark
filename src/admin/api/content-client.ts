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

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string;
  categories: unknown;
  tags: unknown;
  status: string;
  reading_time: number;
  publish_at: string | null;
  published_at: string | null;
  seo: unknown;
  og: unknown;
  created_at: string;
  updated_at: string;
};

function rowToBlog(r: BlogRow): BlogPost {
  const seo = (r.seo ?? {}) as Partial<BlogPost["seo"]>;
  const og = (r.og ?? {}) as Partial<BlogPost["og"]>;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    content: r.content,
    featuredImage: r.featured_image,
    author: r.author,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    status: r.status as BlogStatus,
    readingTime: r.reading_time,
    publishAt: r.publish_at,
    publishedAt: r.published_at,
    seo: { title: seo.title ?? "", description: seo.description ?? "", keywords: seo.keywords ?? "" },
    og: { title: og.title ?? "", description: og.description ?? "", image: og.image ?? null },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function blogToRow(p: Partial<BlogPost>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.title !== undefined) row.title = p.title;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.excerpt !== undefined) row.excerpt = p.excerpt;
  if (p.content !== undefined) row.content = p.content;
  if (p.featuredImage !== undefined) row.featured_image = p.featuredImage;
  if (p.author !== undefined) row.author = p.author;
  if (p.categories !== undefined) row.categories = asJson(p.categories);
  if (p.tags !== undefined) row.tags = asJson(p.tags);
  if (p.status !== undefined) row.status = p.status;
  if (p.readingTime !== undefined) row.reading_time = p.readingTime;
  if (p.publishAt !== undefined) row.publish_at = p.publishAt;
  if (p.publishedAt !== undefined) row.published_at = p.publishedAt;
  if (p.seo !== undefined) row.seo = asJson(p.seo);
  if (p.og !== undefined) row.og = asJson(p.og);
  return row;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueBlogSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = slugify(base) || `post-${Date.now().toString(36)}`;
  let candidate = clean;
  let n = 1;
  while (true) {
    let q = supabase.from("blog_posts").select("id").eq("slug", candidate).limit(1);
    if (ignoreId) q = q.neq("id", ignoreId);
    const { data } = await q;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
}

export async function listBlogPosts(q: ListBlogQuery = {}): Promise<ListBlogResult> {
  const page = q.page ?? 1;
  const perPage = q.perPage ?? 8;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase.from("blog_posts").select("*", { count: "exact" }).order("updated_at", { ascending: false });
  if (q.status && q.status !== "all") query = query.eq("status", q.status);
  if (q.category && q.category !== "all") query = query.contains("categories", asJson([q.category]));
  if (q.tag && q.tag !== "all") query = query.contains("tags", asJson([q.tag]));
  if (q.search) {
    const s = q.search.replace(/[%,]/g, " ").trim();
    if (s) query = query.or(`title.ilike.%${s}%,excerpt.ilike.%${s}%,author.ilike.%${s}%`);
  }
  const { data, count, error } = await query.range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []).map((r) => rowToBlog(r as BlogRow)),
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToBlog(data as BlogRow) : null;
}

export async function createBlogPost(input: Partial<BlogPost>): Promise<BlogPost> {
  const readingTime = estimateReadingTime(input.content ?? "");
  const slug = await uniqueBlogSlug(input.slug || input.title || "post");
  const publishedAt = input.status === "published" ? (input.publishedAt ?? new Date().toISOString()) : (input.publishedAt ?? null);
  const row = blogToRow({ ...input, slug, readingTime, publishedAt });
  if (row.title === undefined) row.title = "Untitled Post";
  const { data, error } = await supabase.from("blog_posts").insert(row as never).select("*").single();
  if (error) throw error;
  return rowToBlog(data as BlogRow);
}

export async function updateBlogPost(id: string, patch: Partial<BlogPost>): Promise<BlogPost> {
  const next: Partial<BlogPost> = { ...patch };
  if (patch.content !== undefined) next.readingTime = estimateReadingTime(patch.content);
  if (patch.status === "published" && patch.publishedAt === undefined) {
    const existing = await getBlogPost(id);
    if (existing && !existing.publishedAt) next.publishedAt = new Date().toISOString();
  }
  const row = blogToRow(next);
  if (patch.slug !== undefined) row.slug = await uniqueBlogSlug(patch.slug, id);
  const { data, error } = await supabase.from("blog_posts").update(row as never).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToBlog(data as BlogRow);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateBlogPost(id: string): Promise<BlogPost> {
  const src = await getBlogPost(id);
  if (!src) throw new Error("Not found");
  const { id: _oldId, createdAt: _c, updatedAt: _u, ...rest } = src;
  void _oldId; void _c; void _u;
  return createBlogPost({
    ...rest,
    title: `${src.title} (Copy)`,
    slug: `${src.slug}-copy-${Date.now().toString(36)}`,
    status: "draft",
    publishedAt: null,
  });
}

export async function listBlogCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("blog_posts").select("categories");
  if (error) throw error;
  const cats = new Set<string>(["Investment", "Guides", "Design", "News"]);
  for (const r of data ?? []) for (const c of ((r.categories ?? []) as string[])) cats.add(c);
  return Array.from(cats);
}

export async function listBlogTags(): Promise<string[]> {
  const { data, error } = await supabase.from("blog_posts").select("tags");
  if (error) throw error;
  const tags = new Set<string>();
  for (const r of data ?? []) for (const t of ((r.tags ?? []) as string[])) tags.add(t);
  return Array.from(tags);
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