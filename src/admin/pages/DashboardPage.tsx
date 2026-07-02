import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Home, Newspaper, Eye, TrendingUp, CalendarDays, Layers } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router-dom";
import { useVisibility } from "@/lib/use-visibility";
import { MODE_LABELS } from "../api/visibility";
import { Badge } from "@/components/ui/badge";

const stat = (label: string, value: string | number, Icon: React.ComponentType<{ className?: string }>, sub?: string) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className="h-10 w-10 grid place-items-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PIE_COLORS = ["#D4AF37", "#EBD07A", "#9C7A1A", "#F5EAC2", "#6B4E0E", "#B8912A"];

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const visibility = useVisibility();

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your website performance.</p>
        </div>
        <Link to="/admin/visibility" className="no-underline">
          <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm hover:border-primary/50 transition">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />Website Mode
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold">{MODE_LABELS[visibility.mode]}</span>
              <Badge variant={visibility.mode === "normal" ? "outline" : "default"} className={visibility.mode === "normal" ? "" : "bg-primary text-primary-foreground"}>
                {visibility.mode === "normal" ? "Live" : "Restricted"}
              </Badge>
            </div>
          </div>
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Total Leads", data.totalLeads, Users)}
        {stat("Today's Leads", data.todayLeads, CalendarDays)}
        {stat("Monthly Leads", data.monthlyLeads, TrendingUp)}
        {stat("Conversion", `${data.conversionRate}%`, TrendingUp, "leads / views")}
        {stat("Total Properties", data.totalProperties, Home)}
        {stat("Blog Posts", data.totalBlogPosts, Newspaper)}
        {stat("Total Pages", data.totalPages, Layers)}
        {stat("Property Views", data.propertyViews.toLocaleString(), Eye)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Leads — last 14 days</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.leadsByDay}>
                <defs>
                  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#a89b7a", fontSize: 11 }} />
                <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
                <Area type="monotone" dataKey="count" stroke="#D4AF37" fill="url(#gold)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lead Sources</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.leadsBySource} dataKey="count" nameKey="source" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {data.leadsBySource.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
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
          <CardHeader><CardTitle className="text-base">Recent Leads</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.recentLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.email} · {l.source}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {data.recentLeads.length === 0 && <div className="text-sm text-muted-foreground py-4">No leads yet.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <div className="text-sm">{a.text}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Property Views (last 14 days)</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.leadsByDay.map((d) => ({ ...d, views: d.count * 40 + 120 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#a89b7a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#a89b7a", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#141418", border: "1px solid rgba(212,175,55,0.3)" }} />
              <Bar dataKey="views" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <FileText className="hidden" />
    </div>
  );
}