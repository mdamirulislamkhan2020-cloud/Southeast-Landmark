import type {
  AnalyticsFilters, AnalyticsResult, Breakdown, CampaignRow, DateRange,
  DateRangePreset, FunnelStage, IntegrationPlaceholders, TimeSeriesPoint,
} from "./analytics";
import { listCrmLeads } from "./crm-client";
import type { CrmLead, LeadStatus } from "./crm";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const LS_INTEG = "sel_admin_analytics_integrations_v1";

function readLS<T>(k: string, f: T): T {
  if (typeof window === "undefined") return f;
  try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : f; } catch { return f; }
}
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

// ---------- Date range helpers ----------

export function rangeFromPreset(preset: DateRangePreset, from?: string, to?: string): DateRange {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  switch (preset) {
    case "today": return { preset, from: start.toISOString(), to: end.toISOString() };
    case "yesterday": {
      const s = new Date(start); s.setDate(s.getDate() - 1);
      const e = new Date(end); e.setDate(e.getDate() - 1);
      return { preset, from: s.toISOString(), to: e.toISOString() };
    }
    case "last_7": {
      const s = new Date(start); s.setDate(s.getDate() - 6);
      return { preset, from: s.toISOString(), to: end.toISOString() };
    }
    case "last_30": {
      const s = new Date(start); s.setDate(s.getDate() - 29);
      return { preset, from: s.toISOString(), to: end.toISOString() };
    }
    case "this_month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { preset, from: s.toISOString(), to: end.toISOString() };
    }
    case "custom":
      return { preset, from: from ?? start.toISOString(), to: to ?? end.toISOString() };
  }
}

// ---------- Aggregation ----------

function within(d: string, r: DateRange) { const t = +new Date(d); return t >= +new Date(r.from) && t <= +new Date(r.to); }

function tally(arr: string[]): Breakdown[] {
  const m = new Map<string, number>();
  arr.forEach((k) => { if (!k) return; m.set(k, (m.get(k) ?? 0) + 1); });
  return Array.from(m.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function buildSeries(range: DateRange, leads: CrmLead[]): TimeSeriesPoint[] {
  const days: TimeSeriesPoint[] = [];
  const start = new Date(range.from); start.setHours(0, 0, 0, 0);
  const end = new Date(range.to); end.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.round((+end - +start) / 86400000) + 1);
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const count = leads.filter((l) => new Date(l.createdAt).toDateString() === d.toDateString()).length;
    days.push({ date: label, leads: count, views: count * 42 + 80, submissions: count });
  }
  return days;
}

function funnel(leads: CrmLead[]): FunnelStage[] {
  const status = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
  const visits = leads.length * 12 + 400; // proxy from mock views
  const submissions = leads.length;
  const contacted = status("contacted") + status("qualified") + status("follow_up") + status("negotiation") + status("site_visit") + status("converted");
  const qualified = status("qualified") + status("negotiation") + status("site_visit") + status("converted");
  const converted = status("converted");
  return [
    { stage: "Visits", value: visits },
    { stage: "Submissions", value: submissions },
    { stage: "Contacted", value: contacted },
    { stage: "Qualified", value: qualified },
    { stage: "Converted", value: converted },
  ];
}

function campaignsFrom(leads: CrmLead[]): CampaignRow[] {
  const map = new Map<string, CampaignRow>();
  leads.forEach((l) => {
    const key = l.analytics.utmCampaign || l.analytics.campaign || "(direct)";
    const row = map.get(key) ?? { campaign: key, leads: 0, converted: 0, conversion: 0, source: l.analytics.utmSource };
    row.leads += 1;
    if (l.status === "converted") row.converted += 1;
    map.set(key, row);
  });
  const rows = Array.from(map.values());
  rows.forEach((r) => { r.conversion = r.leads ? Math.round((r.converted / r.leads) * 1000) / 10 : 0; });
  return rows.sort((a, b) => b.leads - a.leads);
}

export async function getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsResult> {
  if (!USE_MOCK) return apiFetch<AnalyticsResult>(`/analytics`, { method: "POST", body: JSON.stringify(filters) });

  const all = await listCrmLeads();
  const scoped = all.filter((l) => within(l.createdAt, filters.range))
    .filter((l) => !filters.campaign || (l.analytics.utmCampaign || l.analytics.campaign) === filters.campaign)
    .filter((l) => !filters.formId || l.formId === filters.formId)
    .filter((l) => !filters.leadPageId || l.leadPageId === filters.leadPageId);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const week = new Date(today); week.setDate(week.getDate() - 6);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalLeads = scoped.length;
  const converted = scoped.filter((l) => l.status === "converted").length;
  const totalViews = totalLeads * 42 + 800;

  const kpis = {
    totalLeads,
    todayLeads: all.filter((l) => new Date(l.createdAt) >= today).length,
    weeklyLeads: all.filter((l) => new Date(l.createdAt) >= week).length,
    monthlyLeads: all.filter((l) => new Date(l.createdAt) >= month).length,
    conversionRate: totalLeads ? Math.round((converted / totalLeads) * 1000) / 10 : 0,
    totalViews,
    totalPropertyViews: Math.round(totalViews * 0.62),
    totalBlogViews: Math.round(totalViews * 0.28),
  };

  const leadsBySource = tally(scoped.map((l) => l.source || "Direct"));
  const leadsByStatus = tally(scoped.map((l) => l.status));
  const leadsByDevice = tally(scoped.map((l) => l.analytics.device || "unknown"));
  const leadsByBrowser = tally(scoped.map((l) => l.analytics.browser || "unknown"));
  const leadsByUtmSource = tally(scoped.map((l) => l.analytics.utmSource || "(direct)"));
  const leadsByCountry: Breakdown[] = [
    { label: "Bangladesh", value: Math.round(totalLeads * 0.72) },
    { label: "United States", value: Math.round(totalLeads * 0.11) },
    { label: "United Kingdom", value: Math.round(totalLeads * 0.07) },
    { label: "UAE", value: Math.round(totalLeads * 0.06) },
    { label: "Other", value: Math.max(0, totalLeads - Math.round(totalLeads * 0.96)) },
  ].filter((c) => c.value > 0);

  const topLandingPages = tally(scoped.map((l) => l.analytics.landingUrl || "/"));
  const topLeadPages = tally(scoped.filter((l) => l.leadPageSlug).map((l) => `/lead/${l.leadPageSlug}`));
  const topForms = tally(scoped.map((l) => l.formName || "Contact Form"));
  const topBlogPosts: Breakdown[] = [
    { label: "Investing in Dhaka Real Estate", value: 1240 },
    { label: "Top 5 Neighborhoods for Families", value: 980 },
    { label: "How to Buy Your First Plot", value: 720 },
  ];
  const topProperties: Breakdown[] = [
    { label: "Landmark Heights", value: 1820 },
    { label: "Mohammadpur Residency", value: 1435 },
    { label: "Dhanmondi Enclave", value: 1102 },
    { label: "Uttara Skyline", value: 890 },
  ];
  const mostVisitedPages: Breakdown[] = [
    { label: "/", value: 4820 },
    { label: "/property", value: 3210 },
    { label: "/about", value: 1420 },
    { label: "/blog", value: 1180 },
    { label: "/contact", value: 940 },
  ];

  return {
    kpis,
    leadsBySource, leadsByStatus, leadsByDevice, leadsByBrowser, leadsByCountry, leadsByUtmSource,
    topLandingPages, topLeadPages, topForms, topBlogPosts, topProperties, mostVisitedPages,
    campaigns: campaignsFrom(scoped),
    funnel: funnel(scoped),
    timeSeries: buildSeries(filters.range, scoped),
    utmSeries: buildSeries(filters.range, scoped),
  };
}

// ---------- Integration placeholders (future) ----------

export function getIntegrationPlaceholders(): IntegrationPlaceholders {
  return readLS<IntegrationPlaceholders>(LS_INTEG, {});
}
export function saveIntegrationPlaceholders(v: IntegrationPlaceholders) { writeLS(LS_INTEG, v); }

// ---------- Facet lists for filters ----------

export async function getFilterFacets(): Promise<{ campaigns: string[] }> {
  const all = await listCrmLeads();
  const camps = new Set<string>();
  all.forEach((l) => { const c = l.analytics.utmCampaign || l.analytics.campaign; if (c) camps.add(c); });
  return { campaigns: Array.from(camps).sort() };
}