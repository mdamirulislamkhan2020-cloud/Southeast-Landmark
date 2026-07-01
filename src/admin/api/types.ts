export type PageStatus = "draft" | "published" | "scheduled";

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