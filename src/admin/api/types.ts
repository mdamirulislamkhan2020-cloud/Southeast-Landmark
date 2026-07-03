export type PageStatus = "draft" | "published" | "scheduled" | "archived";

// Re-export block types from the page-builder module so the CMS page can carry
// visual-builder blocks natively (Lead Pages is merged into the main Pages CMS).
export type { BlockType, PageBlock } from "./lead-pages";
import type { PageBlock } from "./lead-pages";

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  status: PageStatus;
  seoTitle: string;
  seoDescription: string;
  content: string;
  publishAt: string | null;
  updatedAt: string;
  createdAt: string;
  publishedAt?: string | null;   // last time the page was set to "published"
  archivedAt?: string | null;    // last time the page was archived
  // Extended CMS fields (all optional — legacy pages still work).
  formId?: string | null;         // assigned Lead Form for the page (auto-rendered)
  blocks?: PageBlock[];           // visual page-builder blocks
  showInNav?: boolean;            // include in Navigation Manager auto-detected pages
  template?: "standard" | "builder" | "blank" | "landing" | "contact" | "blog" | "full_width"; // rendering mode / starter layout
  seoKeywords?: string;
  ogImage?: string | null;
  canonical?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  todayLeads: number;
  monthlyLeads: number;
  totalProperties: number;
  totalBlogPosts: number;
  totalPages: number;
  propertyViews: number;
  conversionRate: number;
  recentLeads: Lead[];
  recentActivity: { id: string; text: string; at: string }[];
  leadsBySource: { source: string; count: number }[];
  leadsByDay: { day: string; count: number }[];
}