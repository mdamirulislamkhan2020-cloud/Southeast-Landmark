import type { CmsPage } from "./types";

export type PropertyStatus = "draft" | "published";
export type ListingStatus = "available" | "sold" | "reserved" | "upcoming";
export type PropertyType = "apartment" | "plot" | "commercial" | "duplex" | "penthouse";

export interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
}

export interface Amenity {
  id: string;
  label: string;
  icon?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  status: PropertyStatus;
  listingStatus: ListingStatus;
  category: string;
  type: PropertyType;
  location: {
    address: string;
    city: string;
    area: string;
    lat?: number | null;
    lng?: number | null;
  };
  featuredImage: string | null;
  gallery: PropertyImage[];
  floorPlan: string | null;
  brochureUrl: string | null;
  amenities: Amenity[];
  pricing: {
    price: number;
    currency: string;
    pricePerSqft?: number | null;
    negotiable: boolean;
  };
  investment: {
    roi: number;
    paybackYears: number;
    downPayment: number;
    installments: number;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    floors: number;
    parking: number;
    yearBuilt: number | null;
  };
  description: string;
  seo: { title: string; description: string; keywords: string };
  leadFormId: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewPropertyInput = Partial<Property>;

// Re-export for convenience
export type { CmsPage };