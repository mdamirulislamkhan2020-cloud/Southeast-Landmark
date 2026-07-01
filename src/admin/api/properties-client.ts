import type { Property, PropertyStatus } from "./properties";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_PROPERTIES = "sel_admin_properties_v1";

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

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=70";
const PLACEHOLDER2 =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=70";
const PLACEHOLDER3 =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=70";

function seed() {
  if (readLS<Property[] | null>(LS_PROPERTIES, null) !== null) return;
  const now = new Date().toISOString();
  const samples: Partial<Property>[] = [
    { title: "Landmark Heights", type: "apartment", category: "Residential", listingStatus: "available", featured: true },
    { title: "Southeast Green Villa", type: "duplex", category: "Residential", listingStatus: "available", featured: true },
    { title: "Adabor Corner Plot", type: "plot", category: "Land", listingStatus: "reserved" },
    { title: "Ring Road Commercial Tower", type: "commercial", category: "Commercial", listingStatus: "upcoming" },
    { title: "Mohammadpur Penthouse", type: "penthouse", category: "Luxury", listingStatus: "available", featured: true },
    { title: "Dhanmondi Urban Flat", type: "apartment", category: "Residential", listingStatus: "sold" },
  ];
  const built: Property[] = samples.map((s, i) => ({
    id: uid(),
    title: s.title!,
    slug: (s.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    status: "published" as PropertyStatus,
    listingStatus: s.listingStatus ?? "available",
    category: s.category ?? "Residential",
    type: s.type ?? "apartment",
    location: {
      address: `${19 + i}/2-C Ring Road, Adabor`,
      city: "Dhaka",
      area: "Mohammadpur",
      lat: 23.7639,
      lng: 90.3593,
    },
    featuredImage: [PLACEHOLDER, PLACEHOLDER2, PLACEHOLDER3][i % 3],
    gallery: [
      { id: uid(), url: PLACEHOLDER, alt: "Exterior" },
      { id: uid(), url: PLACEHOLDER2, alt: "Living room" },
      { id: uid(), url: PLACEHOLDER3, alt: "Bedroom" },
    ],
    floorPlan: null,
    brochureUrl: null,
    amenities: [
      { id: uid(), label: "Lift" },
      { id: uid(), label: "24/7 Security" },
      { id: uid(), label: "Rooftop" },
      { id: uid(), label: "Parking" },
      { id: uid(), label: "Generator" },
    ],
    pricing: {
      price: 8500000 + i * 1250000,
      currency: "BDT",
      pricePerSqft: 12000 + i * 250,
      negotiable: true,
    },
    investment: {
      roi: 8 + (i % 4),
      paybackYears: 8 + (i % 3),
      downPayment: 20,
      installments: 36,
    },
    details: {
      bedrooms: 3 + (i % 3),
      bathrooms: 2 + (i % 2),
      areaSqft: 1450 + i * 120,
      floors: 1,
      parking: 1,
      yearBuilt: 2022 + (i % 3),
    },
    description: "A premium Southeast Landmark property crafted for modern living.",
    seo: { title: s.title!, description: "", keywords: "" },
    leadFormId: null,
    featured: !!s.featured,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }));
  writeLS(LS_PROPERTIES, built);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
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
  if (!USE_MOCK) {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v != null && v !== "all" && params.set(k, String(v)));
    return apiFetch<ListPropertiesResult>(`/properties?${params.toString()}`);
  }
  seed();
  let items = readLS<Property[]>(LS_PROPERTIES, []);
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter((p) =>
      (p.title + p.location.address + p.location.area + p.category).toLowerCase().includes(s),
    );
  }
  if (q.status && q.status !== "all") items = items.filter((p) => p.status === q.status);
  if (q.listingStatus && q.listingStatus !== "all") items = items.filter((p) => p.listingStatus === q.listingStatus);
  if (q.type && q.type !== "all") items = items.filter((p) => p.type === q.type);
  if (q.category && q.category !== "all") items = items.filter((p) => p.category === q.category);
  const page = q.page ?? 1;
  const perPage = q.perPage ?? 10;
  const total = items.length;
  const paged = items.slice((page - 1) * perPage, page * perPage);
  return { items: paged, total, page, perPage };
}

export async function getProperty(id: string): Promise<Property | null> {
  if (!USE_MOCK) return apiFetch<Property>(`/properties/${id}`);
  seed();
  return readLS<Property[]>(LS_PROPERTIES, []).find((p) => p.id === id) ?? null;
}

function blankProperty(): Property {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "Untitled Property",
    slug: `untitled-${Date.now().toString(36)}`,
    status: "draft",
    listingStatus: "available",
    category: "Residential",
    type: "apartment",
    location: { address: "", city: "Dhaka", area: "", lat: null, lng: null },
    featuredImage: null,
    gallery: [],
    floorPlan: null,
    brochureUrl: null,
    amenities: [],
    pricing: { price: 0, currency: "BDT", pricePerSqft: null, negotiable: false },
    investment: { roi: 0, paybackYears: 0, downPayment: 0, installments: 0 },
    details: { bedrooms: 0, bathrooms: 0, areaSqft: 0, floors: 1, parking: 0, yearBuilt: null },
    description: "",
    seo: { title: "", description: "", keywords: "" },
    leadFormId: null,
    featured: false,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createProperty(input: Partial<Property>): Promise<Property> {
  const merged: Property = { ...blankProperty(), ...input, updatedAt: new Date().toISOString() };
  if (!USE_MOCK) return apiFetch<Property>("/properties", { method: "POST", body: JSON.stringify(merged) });
  const all = readLS<Property[]>(LS_PROPERTIES, []);
  all.unshift(merged);
  writeLS(LS_PROPERTIES, all);
  return merged;
}

export async function updateProperty(id: string, patch: Partial<Property>): Promise<Property> {
  if (!USE_MOCK) return apiFetch<Property>(`/properties/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<Property[]>(LS_PROPERTIES, []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Not found");
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS_PROPERTIES, all);
  return all[idx];
}

export async function deleteProperty(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/properties/${id}`, { method: "DELETE" });
  writeLS(LS_PROPERTIES, readLS<Property[]>(LS_PROPERTIES, []).filter((p) => p.id !== id));
}

export async function listCategories(): Promise<string[]> {
  if (!USE_MOCK) return apiFetch<string[]>("/properties/categories");
  seed();
  const items = readLS<Property[]>(LS_PROPERTIES, []);
  return Array.from(new Set(["Residential", "Commercial", "Land", "Luxury", ...items.map((i) => i.category)]));
}