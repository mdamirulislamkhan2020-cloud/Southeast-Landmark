export type SiteMode = "normal" | "single" | "multi" | "maintenance" | "coming_soon";

export type PageVisibility = "public" | "hidden" | "members" | "admin";

export type BlockedRedirect = "404" | "home" | "selected" | "coming_soon";

export interface ComingSoonSettings {
  logo: string;
  background: string;
  title: string;
  description: string;
  countdownTo: string; // ISO date
  socials: { facebook: string; instagram: string; linkedin: string; youtube: string; twitter: string };
  contactNumber: string;
}

export interface MaintenanceSettings {
  title: string;
  description: string;
  logo: string;
  contactEmail: string;
  contactNumber: string;
}

export interface VisibilitySettings {
  mode: SiteMode;
  singlePagePath: string;               // path allowed in single mode
  multiPagePaths: string[];             // paths allowed in multi mode
  pageVisibility: Record<string, PageVisibility>; // path -> visibility
  whitelist: string[];                  // paths always accessible
  blockedRedirect: BlockedRedirect;     // where to send blocked visitors
  redirectTarget: string;               // used when blockedRedirect = 'selected'
  seoNoIndexBlocked: boolean;           // noindex/nofollow blocked pages
  hideFromNav: boolean;                 // auto-hide hidden pages from menus
  comingSoon: ComingSoonSettings;
  maintenance: MaintenanceSettings;
  updatedAt: string;
}

export const MODE_LABELS: Record<SiteMode, string> = {
  normal: "Normal",
  single: "Single Page",
  multi: "Multi Page",
  maintenance: "Maintenance",
  coming_soon: "Coming Soon",
};

export const DEFAULT_WHITELIST = [
  "/admin",
  "/api",
  "/assets",
  "/privacy",
  "/terms",
  "/sitemap.xml",
  "/robots.txt",
];

export const DEFAULT_VISIBILITY: VisibilitySettings = {
  mode: "normal",
  singlePagePath: "/",
  multiPagePaths: ["/"],
  pageVisibility: {},
  whitelist: [...DEFAULT_WHITELIST],
  blockedRedirect: "404",
  redirectTarget: "/",
  seoNoIndexBlocked: true,
  hideFromNav: true,
  comingSoon: {
    logo: "",
    background: "",
    title: "We're launching soon",
    description: "Southeast Landmark is preparing something great. Check back shortly.",
    countdownTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    socials: { facebook: "", instagram: "", linkedin: "", youtube: "", twitter: "" },
    contactNumber: "",
  },
  maintenance: {
    title: "We'll be back shortly",
    description: "The site is undergoing scheduled maintenance. Please check back in a little while.",
    logo: "",
    contactEmail: "",
    contactNumber: "",
  },
  updatedAt: new Date(0).toISOString(),
};