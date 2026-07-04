import type { Property, PropertyStatus, ListingStatus, PropertyType, PropertyImage, Amenity } from "./properties";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const asJson = <T,>(v: T): Json => v as unknown as Json;

type PropertyRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  listing_status: string;
  category: string;
  type: string;
  location: unknown;
  featured_image: string | null;
  gallery: unknown;
  floor_plan: string | null;
  brochure_url: string | null;
  amenities: unknown;
  pricing: unknown;
  investment: unknown;
  details: unknown;
  description: string;
  seo: unknown;
  lead_form_id: string | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToProperty(row: PropertyRow): Property {
  const loc = (row.location ?? {}) as Partial<Property["location"]>;
  const pricing = (row.pricing ?? {}) as Partial<Property["pricing"]>;
  const investment = (row.investment ?? {}) as Partial<Property["investment"]>;
  const details = (row.details ?? {}) as Partial<Property["details"]>;
  const seo = (row.seo ?? {}) as Partial<Property["seo"]>;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status as PropertyStatus,
    listingStatus: row.listing_status as ListingStatus,
    category: row.category,
    type: row.type as PropertyType,
    location: {
      address: loc.address ?? "",
      city: loc.city ?? "Dhaka",
      area: loc.area ?? "",
      lat: loc.lat ?? null,
      lng: loc.lng ?? null,
    },
    featuredImage: row.featured_image,
    gallery: (row.gallery ?? []) as PropertyImage[],
    floorPlan: row.floor_plan,
    brochureUrl: row.brochure_url,
    amenities: (row.amenities ?? []) as Amenity[],
    pricing: {
      price: pricing.price ?? 0,
      currency: pricing.currency ?? "BDT",
      pricePerSqft: pricing.pricePerSqft ?? null,
      negotiable: pricing.negotiable ?? false,
    },
    investment: {
      roi: investment.roi ?? 0,
      paybackYears: investment.paybackYears ?? 0,
      downPayment: investment.downPayment ?? 0,
      installments: investment.installments ?? 0,
    },
    details: {
      bedrooms: details.bedrooms ?? 0,
      bathrooms: details.bathrooms ?? 0,
      areaSqft: details.areaSqft ?? 0,
      floors: details.floors ?? 1,
      parking: details.parking ?? 0,
      yearBuilt: details.yearBuilt ?? null,
    },
    description: row.description,
    seo: {
      title: seo.title ?? "",
      description: seo.description ?? "",
      keywords: seo.keywords ?? "",
    },
    leadFormId: row.lead_form_id,
    featured: row.featured,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function propertyToRow(p: Partial<Property>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.title !== undefined) row.title = p.title;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.status !== undefined) row.status = p.status;
  if (p.listingStatus !== undefined) row.listing_status = p.listingStatus;
  if (p.category !== undefined) row.category = p.category;
  if (p.type !== undefined) row.type = p.type;
  if (p.location !== undefined) row.location = asJson(p.location);
  if (p.featuredImage !== undefined) row.featured_image = p.featuredImage;
  if (p.gallery !== undefined) row.gallery = asJson(p.gallery);
  if (p.floorPlan !== undefined) row.floor_plan = p.floorPlan;
  if (p.brochureUrl !== undefined) row.brochure_url = p.brochureUrl;
  if (p.amenities !== undefined) row.amenities = asJson(p.amenities);
  if (p.pricing !== undefined) row.pricing = asJson(p.pricing);
  if (p.investment !== undefined) row.investment = asJson(p.investment);
  if (p.details !== undefined) row.details = asJson(p.details);
  if (p.description !== undefined) row.description = p.description;
  if (p.seo !== undefined) row.seo = asJson(p.seo);
  if (p.leadFormId !== undefined) row.lead_form_id = p.leadFormId;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.publishedAt !== undefined) row.published_at = p.publishedAt;
  return row;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = slugify(base) || `property-${Date.now().toString(36)}`;
  let candidate = clean;
  let n = 1;
  while (true) {
    let query = supabase.from("properties").select("id").eq("slug", candidate).limit(1);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
}

export interface ListPropertiesQuery {
  search?: string;
  status?: PropertyStatus | "all";
  listingStatus?: string | "all";
  type?: string | "all";
  category?: string | "all";
  page?: number;
  perPage?: number;
}

export interface ListPropertiesResult {
  items: Property[];
  total: number;
  page: number;
  perPage: number;
}

export async function listProperties(q: ListPropertiesQuery = {}): Promise<ListPropertiesResult> {
  const page = q.page ?? 1;
  const perPage = q.perPage ?? 10;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q.status && q.status !== "all") query = query.eq("status", q.status);
  if (q.listingStatus && q.listingStatus !== "all") query = query.eq("listing_status", q.listingStatus);
  if (q.type && q.type !== "all") query = query.eq("type", q.type);
  if (q.category && q.category !== "all") query = query.eq("category", q.category);
  if (q.search) {
    const s = q.search.replace(/[%,]/g, " ").trim();
    if (s) query = query.or(`title.ilike.%${s}%,category.ilike.%${s}%`);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []).map((r) => rowToProperty(r as PropertyRow)),
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProperty(data as PropertyRow) : null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProperty(data as PropertyRow) : null;
}

export async function createProperty(input: Partial<Property>): Promise<Property> {
  const slug = await uniqueSlug(input.slug || input.title || "property");
  const row = propertyToRow({ ...input, slug });
  // ensure required defaults
  if (row.title === undefined) row.title = "Untitled Property";
  const { data, error } = await supabase.from("properties").insert(row as never).select("*").single();
  if (error) throw error;
  return rowToProperty(data as PropertyRow);
}

export async function updateProperty(id: string, patch: Partial<Property>): Promise<Property> {
  const row = propertyToRow(patch);
  if (patch.slug !== undefined) row.slug = await uniqueSlug(patch.slug, id);
  const { data, error } = await supabase.from("properties").update(row as never).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToProperty(data as PropertyRow);
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

export async function listCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("properties").select("category");
  if (error) throw error;
  const cats = new Set<string>(["Residential", "Commercial", "Land", "Luxury"]);
  for (const r of data ?? []) if (r.category) cats.add(r.category as string);
  return Array.from(cats);
}