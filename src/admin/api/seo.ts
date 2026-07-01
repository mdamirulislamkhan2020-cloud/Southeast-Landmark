export type RobotsIndex = "index" | "noindex";
export type RobotsFollow = "follow" | "nofollow";
export type TwitterCardType = "summary" | "summary_large_image" | "player" | "app";

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCardType;
  robotsIndex: RobotsIndex;
  robotsFollow: RobotsFollow;
  jsonLd: string;
}

export type SeoEntityType =
  | "page" | "property" | "property_detail" | "blog" | "blog_detail"
  | "faq" | "contact" | "lead_page" | "home" | "about";

export interface SeoEntity {
  id: string;
  type: SeoEntityType;
  slug: string;
  label: string;
  meta: SeoMeta;
  updatedAt: string;
}

export interface Redirect {
  id: string;
  from: string;
  to: string;
  code: 301 | 302;
  active: boolean;
  createdAt: string;
}

export interface SitemapEntry { loc: string; priority: number; changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" }

export function emptyMeta(): SeoMeta {
  return {
    title: "", description: "", keywords: "", canonical: "",
    ogTitle: "", ogDescription: "", ogImage: "",
    twitterCard: "summary_large_image",
    robotsIndex: "index", robotsFollow: "follow",
    jsonLd: "",
  };
}