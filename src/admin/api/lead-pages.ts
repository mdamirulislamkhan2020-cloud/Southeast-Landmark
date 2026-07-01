export type BlockType =
  | "hero" | "text" | "image" | "gallery" | "video" | "features" | "counter"
  | "faq" | "testimonials" | "cta" | "map" | "property_grid" | "blog_grid"
  | "contact" | "lead_form" | "html" | "spacing" | "divider";

export type LeadPageStatus = "draft" | "published" | "scheduled" | "archived";

export interface PageBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface LeadPageDesign {
  background: string;
  sectionWidth: number;
  padding: number;
  margin: number;
  fontHeading: string;
  fontBody: string;
  buttonStyle: "rounded" | "square" | "pill";
  radius: number;
  animations: boolean;
}

export interface LeadPageAnalytics {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  landingUrl?: string;
  referrer?: string;
  device?: string;
  browser?: string;
  ip?: string;
}

export interface LeadPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  banner: string | null;
  featuredImage: string | null;
  shortDescription: string;
  longDescription: string;
  status: LeadPageStatus;
  category: string;
  sortOrder: number;
  formId: string | null;
  blocks: PageBlock[];
  design: LeadPageDesign;
  seo: { title: string; description: string; keywords: string; canonical: string };
  og: { image: string; twitterCard: "summary" | "summary_large_image" };
  publishAt: string | null;
  analyticsPlaceholders: LeadPageAnalytics;
  createdAt: string;
  updatedAt: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero", text: "Text", image: "Image", gallery: "Gallery", video: "Video",
  features: "Features", counter: "Counter", faq: "FAQ", testimonials: "Testimonials",
  cta: "Call To Action", map: "Map", property_grid: "Property Grid", blog_grid: "Blog Grid",
  contact: "Contact", lead_form: "Lead Form", html: "Custom HTML", spacing: "Spacing", divider: "Divider",
};

export const BLOCK_GROUPS: { label: string; types: BlockType[] }[] = [
  { label: "Layout", types: ["hero", "cta", "spacing", "divider"] },
  { label: "Content", types: ["text", "image", "gallery", "video", "features", "counter", "html"] },
  { label: "Data", types: ["faq", "testimonials", "property_grid", "blog_grid"] },
  { label: "Connect", types: ["lead_form", "contact", "map"] },
];