import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, FunnelChart, Funnel, LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users, CalendarDays, TrendingUp, Percent, Eye, Home, Newspaper, Layers,
  MonitorSmartphone, Globe2, Rocket,
} from "lucide-react";
import { getAnalytics, getFilterFacets, getIntegrationPlaceholders, rangeFromPreset, saveIntegrationPlaceholders } from "../api/analytics-client";
import { listForms } from "../api/forms-client";
import { listLeadPages } from "../api/lead-pages-client";
import type { AnalyticsFilters, DateRangePreset, IntegrationPlaceholders } from "../api/analytics";

const PIE_COLORS = ["#D4AF37", "#EBD07A", "#9C7A1A", "#F5EAC2", "#6B4E0E", "#B8912A", "#8b6f1f", "#e6c85a"];

function Stat({ label, value, Icon, sub }: { label: string; value: string | number; Icon: React.ComponentType<{ className?: string }>; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold truncate">{value}</div>
            {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
          </div>
          <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownList({ title, rows, Icon }: { title: string; rows: { label: string; value: number }[]; Icon?: React.ComponentType<{ className?: string }> }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{Icon && <Icon className="h-4 w-4 text-primary" />}{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {rows.length === 0 && <div className="text-sm text-muted-foreground">No data.</div>}
          {rows.slice(0, 8).map((r) => (
            <div key={r.label} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="truncate mr-2">{r.label}</span>
                <span className="text-muted-foreground">{r.value.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [preset, setPreset] = useState<DateRangePreset>("last_30");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [campaign, setCampaign] = useState<string>("all");
  const [formId, setFormId] = useState<string>("all");
  const [leadPageId, setLeadPageId] = useState<string>("all");

  const range = useMemo(() => rangeFromPreset(preset, customFrom ? new Date(customFrom).toISOString() : undefined, customTo ? new Date(customTo + "T23:59:59").toISOString() : undefined), [preset, customFrom, customTo]);

  const filters: AnalyticsFilters = useMemo(() => ({
    range,
    campaign: campaign === "all" ? null : campaign,
    formId: formId === "all" ? null : formId,
    leadPageId: leadPageId === "all" ? null : leadPageId,
  }), [range, campaign, formId, leadPageId]);

  const { data, isLoading } = useQuery({ queryKey: ["analytics", filters], queryFn: () => getAnalytics(filters) });
  const { data: facets } = useQuery({ queryKey: ["analytics-facets"], queryFn: getFilterFacets });
  const { data: forms } = useQuery({ queryKey: ["forms-list"], queryFn: listForms });
  const { data: leadPages } = useQuery({ queryKey: ["lead-pages-list"], queryFn: listLeadPages });

  const [integrations, setIntegrations] = useState<IntegrationPlaceholders>(() => getIntegrationPlaceholders());

  const saveIntegrations = () => { saveIntegrationPlaceholders(integrations); };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">Enterprise-grade insights across leads, campaigns and content.</p>
        </div>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Label className="text-xs">Date Range</Label>
              <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_7">Last 7 Days</SelectItem>
                  <SelectItem value="last_30">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {preset === "custom" && (
              <>
                <div><Label className="text-xs">From</Label><Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} /></div>
                <div><Label className="text-xs">To</Label><Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} /></div>
              </>
            )}
            <div>
              <Label className="text-xs">Campaign</Label>
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {facets?.campaigns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Lead Form</Label>
              <Select value={formId} onValueChange={setFormId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {forms?.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Lead Page</Label>
              <Select value={leadPageId} onValueChange={setLeadPageId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {leadPages?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading || !data ? (
        <div className="text-muted-foreground">Loading analytics…</div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total Leads" value={data.kpis.totalLeads} Icon={Users} />
              <Stat label="Today's Leads" value={data.kpis.todayLeads} Icon={CalendarDays} />
              <Stat label="Weekly Leads" value={data.kpis.weeklyLeads} Icon={TrendingUp} />
              <Stat label="Monthly Leads" value={data.kpis.monthlyLeads} Icon={CalendarDays} />
              <Stat label="Conversion Rate" value={`${data.kpis.conversionRate}%`} Icon={Percent} sub="converted / total" />
              <Stat label="Property Views" value={data.kpis.totalPropertyViews.toLocaleString()} Icon={Home} />
              <Stat label="Blog Views" value={data.kpis.totalBlogViews.toLocaleString()} Icon={Newspaper} />
              <Stat label="Total Page Views" value={data.kpis.totalViews.toLocaleString()} Icon={Eye} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Leads Over Time</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeSeries}>
                      <defs>
                        <linearGradient id="al-gold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.55} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                      <Area type="monotone" dataKey="leads" stroke="#D4AF37" fill="url(#al-gold)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Lead Sources</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.leadsBySource} dataKey="value" nameKey="label" innerRadius={45} outerRadius={80} paddingAngle={2}>
                        {data.leadsBySource.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11, color: "#a89b7a" }} />
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                      <Funnel dataKey="value" data={data.funnel} isAnimationActive>
                        <LabelList position="right" fill="#a89b7a" stroke="none" dataKey="stage" />
                        {data.funnel.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Lead Status Distribution</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.leadsByStatus} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" tick={{ fill: "#a89b7a", fontSize: 11 }} width={100} />
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                      <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <BreakdownList title="Device Breakdown" rows={data.leadsByDevice} Icon={MonitorSmartphone} />
              <BreakdownList title="Browser Breakdown" rows={data.leadsByBrowser} />
              <BreakdownList title="Country (Placeholder)" rows={data.leadsByCountry} Icon={Globe2} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">UTM Source Trend</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.leadsByUtmSource}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="label" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                      <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Page Views (proxy)</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                      <Line type="monotone" dataKey="views" stroke="#D4AF37" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <BreakdownList title="Top Landing Pages" rows={data.topLandingPages} Icon={Layers} />
              <BreakdownList title="Top Lead Pages" rows={data.topLeadPages} Icon={Rocket} />
              <BreakdownList title="Top Forms" rows={data.topForms} />
              <BreakdownList title="Most Visited Pages" rows={data.mostVisitedPages} />
              <BreakdownList title="Top Properties (Views)" rows={data.topProperties} Icon={Home} />
              <BreakdownList title="Top Blog Posts (Views)" rows={data.topBlogPosts} Icon={Newspaper} />
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Form Submission Trend</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                    <Area type="monotone" dataKey="submissions" stroke="#D4AF37" fill="rgba(212,175,55,0.25)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Campaign Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2 pr-4">Campaign</th>
                        <th className="py-2 pr-4">UTM Source</th>
                        <th className="py-2 pr-4">Leads</th>
                        <th className="py-2 pr-4">Converted</th>
                        <th className="py-2 pr-4">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.campaigns.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-muted-foreground">No campaigns in range.</td></tr>
                      )}
                      {data.campaigns.map((c) => (
                        <tr key={c.campaign}>
                          <td className="py-2 pr-4 font-medium">{c.campaign}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{c.source ?? "—"}</td>
                          <td className="py-2 pr-4">{c.leads}</td>
                          <td className="py-2 pr-4">{c.converted}</td>
                          <td className="py-2 pr-4">{c.conversion}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Campaign Leads (Chart)</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.campaigns.map((c) => ({ label: c.campaign, value: c.leads }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                    <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations placeholders */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Analytics Integrations (Placeholders)</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Google Analytics 4 — Measurement ID</Label>
                  <Input placeholder="G-XXXXXXXXXX" value={integrations.ga4MeasurementId ?? ""} onChange={(e) => setIntegrations((v) => ({ ...v, ga4MeasurementId: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Google Tag Manager — Container ID</Label>
                  <Input placeholder="GTM-XXXXXXX" value={integrations.gtmContainerId ?? ""} onChange={(e) => setIntegrations((v) => ({ ...v, gtmContainerId: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Facebook Pixel ID</Label>
                  <Input placeholder="000000000000000" value={integrations.facebookPixelId ?? ""} onChange={(e) => setIntegrations((v) => ({ ...v, facebookPixelId: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Google Ads Conversion ID</Label>
                  <Input placeholder="AW-XXXXXXXXX" value={integrations.googleAdsConversionId ?? ""} onChange={(e) => setIntegrations((v) => ({ ...v, googleAdsConversionId: e.target.value }))} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button onClick={saveIntegrations}>Save Placeholders</Button>
                </div>
                <p className="sm:col-span-2 text-xs text-muted-foreground">
                  These fields are stored for future activation. The Integrations module will wire them up to live tracking scripts.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}