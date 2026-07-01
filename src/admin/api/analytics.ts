export type DateRangePreset =
  | "today" | "yesterday" | "last_7" | "last_30" | "this_month" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  from: string; // ISO
  to: string;   // ISO
}

export interface AnalyticsFilters {
  range: DateRange;
  campaign?: string | null;
  formId?: string | null;
  leadPageId?: string | null;
}

export interface KpiSet {
  totalLeads: number;
  todayLeads: number;
  weeklyLeads: number;
  monthlyLeads: number;
  conversionRate: number;
  totalViews: number;
  totalPropertyViews: number;
  totalBlogViews: number;
}

export interface Breakdown { label: string; value: number }

export interface FunnelStage { stage: string; value: number }

export interface TimeSeriesPoint { date: string; leads: number; views: number; submissions: number }

export interface CampaignRow {
  campaign: string;
  leads: number;
  converted: number;
  conversion: number; // %
  source?: string;
}

export interface AnalyticsResult {
  kpis: KpiSet;
  leadsBySource: Breakdown[];
  leadsByStatus: Breakdown[];
  leadsByDevice: Breakdown[];
  leadsByBrowser: Breakdown[];
  leadsByCountry: Breakdown[];
  leadsByUtmSource: Breakdown[];
  topLandingPages: Breakdown[];
  topLeadPages: Breakdown[];
  topForms: Breakdown[];
  topBlogPosts: Breakdown[];
  topProperties: Breakdown[];
  mostVisitedPages: Breakdown[];
  campaigns: CampaignRow[];
  funnel: FunnelStage[];
  timeSeries: TimeSeriesPoint[];
  utmSeries: TimeSeriesPoint[];
}

export interface IntegrationPlaceholders {
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  facebookPixelId?: string;
  googleAdsConversionId?: string;
}