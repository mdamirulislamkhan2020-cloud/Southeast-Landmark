import type { BlogPost, BlogStatus, Faq, Testimonial } from "./content";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const asJson = <T,>(v: T): Json => v as unknown as Json;

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
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
  if (q.category && q.category !== "all") query = query.contains("categories", [q.category]);
  if (q.tag && q.tag !== "all") query = query.contains("tags", [q.tag]);
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

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function rowToFaq(r: FaqRow): Faq {
  return {
    id: r.id,
    question: r.question,
    answer: r.answer,
    category: r.category,
    active: r.active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function faqToRow(p: Partial<Faq>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.question !== undefined) row.question = p.question;
  if (p.answer !== undefined) row.answer = p.answer;
  if (p.category !== undefined) row.category = p.category;
  if (p.active !== undefined) row.active = p.active;
  if (p.sortOrder !== undefined) row.sort_order = p.sortOrder;
  return row;
}

export async function listFaqs(q: ListFaqQuery = {}): Promise<Faq[]> {
  let query = supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  if (q.category && q.category !== "all") query = query.eq("category", q.category);
  if (q.active === "active") query = query.eq("active", true);
  if (q.active === "inactive") query = query.eq("active", false);
  if (q.search) {
    const s = q.search.replace(/[%,]/g, " ").trim();
    if (s) query = query.or(`question.ilike.%${s}%,answer.ilike.%${s}%,category.ilike.%${s}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => rowToFaq(r as FaqRow));
}

export async function createFaq(input: Partial<Faq>): Promise<Faq> {
  const { count } = await supabase.from("faqs").select("id", { count: "exact", head: true });
  const row = faqToRow({
    question: input.question ?? "New question",
    answer: input.answer ?? "",
    category: input.category ?? "General",
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? (count ?? 0),
  });
  const { data, error } = await supabase.from("faqs").insert(row as never).select("*").single();
  if (error) throw error;
  return rowToFaq(data as FaqRow);
}

export async function updateFaq(id: string, patch: Partial<Faq>): Promise<Faq> {
  const { data, error } = await supabase.from("faqs").update(faqToRow(patch) as never).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToFaq(data as FaqRow);
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("faqs").update({ sort_order: i } as never).eq("id", id),
    ),
  );
}

export async function listFaqCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("faqs").select("category");
  if (error) throw error;
  const cats = new Set<string>(["General", "Payment", "Visits", "Legal"]);
  for (const r of data ?? []) cats.add((r as { category: string }).category);
  return Array.from(cats);
}

// ---------- Testimonials ----------

export interface ListTestimonialsQuery {
  search?: string;
  active?: "all" | "active" | "inactive";
}

type TestimonialRow = {
  id: string;
  name: string;
  position: string;
  company: string;
  image: string | null;
  rating: number;
  review: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function rowToTestimonial(r: TestimonialRow): Testimonial {
  return {
    id: r.id,
    name: r.name,
    position: r.position,
    company: r.company,
    image: r.image,
    rating: r.rating,
    review: r.review,
    active: r.active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function testimonialToRow(p: Partial<Testimonial>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.position !== undefined) row.position = p.position;
  if (p.company !== undefined) row.company = p.company;
  if (p.image !== undefined) row.image = p.image;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.review !== undefined) row.review = p.review;
  if (p.active !== undefined) row.active = p.active;
  if (p.sortOrder !== undefined) row.sort_order = p.sortOrder;
  return row;
}

export async function listTestimonials(q: ListTestimonialsQuery = {}): Promise<Testimonial[]> {
  let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  if (q.active === "active") query = query.eq("active", true);
  if (q.active === "inactive") query = query.eq("active", false);
  if (q.search) {
    const s = q.search.replace(/[%,]/g, " ").trim();
    if (s) query = query.or(`name.ilike.%${s}%,company.ilike.%${s}%,review.ilike.%${s}%,position.ilike.%${s}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => rowToTestimonial(r as TestimonialRow));
}

export async function createTestimonial(input: Partial<Testimonial>): Promise<Testimonial> {
  const { count } = await supabase.from("testimonials").select("id", { count: "exact", head: true });
  const row = testimonialToRow({
    name: input.name ?? "New Client",
    position: input.position ?? "",
    company: input.company ?? "",
    image: input.image ?? null,
    rating: input.rating ?? 5,
    review: input.review ?? "",
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? (count ?? 0),
  });
  const { data, error } = await supabase.from("testimonials").insert(row as never).select("*").single();
  if (error) throw error;
  return rowToTestimonial(data as TestimonialRow);
}

export async function updateTestimonial(id: string, patch: Partial<Testimonial>): Promise<Testimonial> {
  const { data, error } = await supabase.from("testimonials").update(testimonialToRow(patch) as never).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToTestimonial(data as TestimonialRow);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("testimonials").update({ sort_order: i } as never).eq("id", id),
    ),
  );
}