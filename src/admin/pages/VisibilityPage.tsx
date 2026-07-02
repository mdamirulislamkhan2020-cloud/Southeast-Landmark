import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, RotateCcw, Eye, EyeOff, Users as UsersIcon, ShieldCheck, ExternalLink } from "lucide-react";
import { getVisibility, updateVisibility, resetVisibility, normalizePath } from "../api/visibility-client";
import { MODE_LABELS, type PageVisibility, type SiteMode, type VisibilitySettings } from "../api/visibility";
import { listPages } from "../api/client";

const MODES: SiteMode[] = ["normal", "single", "multi", "maintenance", "coming_soon"];

export function VisibilityPage() {
  const { data: initial, refetch, isLoading } = useQuery({ queryKey: ["visibility"], queryFn: getVisibility });
  const { data: pages = [] } = useQuery({ queryKey: ["pages", "visibility"], queryFn: listPages });
  const [form, setForm] = useState<VisibilitySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [whitelistText, setWhitelistText] = useState("");

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setWhitelistText(initial.whitelist.join("\n"));
    }
  }, [initial]);

  const publishedPaths = useMemo(() => {
    const set = new Set<string>(["/", "/about", "/property", "/blog", "/faq", "/contact"]);
    for (const p of pages) if (p.status === "published" && p.slug) set.add(normalizePath(p.slug));
    return Array.from(set).sort();
  }, [pages]);

  if (isLoading || !form) return <div className="text-muted-foreground">Loading visibility settings…</div>;

  const setField = <K extends keyof VisibilitySettings>(key: K, value: VisibilitySettings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const setPageVis = (path: string, v: PageVisibility) => {
    setForm((f) => (f ? { ...f, pageVisibility: { ...f.pageVisibility, [path]: v } } : f));
  };

  const toggleMulti = (path: string, on: boolean) => {
    setForm((f) => {
      if (!f) return f;
      const next = new Set(f.multiPagePaths.map(normalizePath));
      if (on) next.add(normalizePath(path));
      else next.delete(normalizePath(path));
      return { ...f, multiPagePaths: Array.from(next) };
    });
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const whitelist = whitelistText.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      await updateVisibility({ ...form, whitelist });
      toast.success("Visibility settings saved");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset visibility to defaults?")) return;
    const next = await resetVisibility();
    setForm(next);
    setWhitelistText(next.whitelist.join("\n"));
    toast.success("Reset to defaults");
  };

  const modeBadge = (
    <Badge variant="outline" className="border-primary/40 text-primary">
      {MODE_LABELS[form.mode]}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl">Website Visibility</h1>
            {modeBadge}
          </div>
          <p className="text-sm text-muted-foreground">Control which pages are publicly accessible, and how blocked visitors are handled.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
          <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </header>

      <Tabs defaultValue="mode" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mode">Mode</TabsTrigger>
          <TabsTrigger value="pages">Page Visibility</TabsTrigger>
          <TabsTrigger value="rules">Redirects & SEO</TabsTrigger>
          <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
          <TabsTrigger value="coming">Coming Soon</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* MODE */}
        <TabsContent value="mode" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Website Mode</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {MODES.map((m) => {
                const active = form.mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setField("mode", m)}
                    className={`rounded-lg border p-4 text-left transition ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
                  >
                    <div className="font-medium">{MODE_LABELS[m]}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{modeHint(m)}</div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {form.mode === "single" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Single Public Page</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Label>Public page</Label>
                <Select value={normalizePath(form.singlePagePath)} onValueChange={(v) => setField("singlePagePath", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {publishedPaths.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Every other public page will be blocked using the redirect rule below.</p>
              </CardContent>
            </Card>
          )}

          {form.mode === "multi" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Publicly Accessible Pages</CardTitle></CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {publishedPaths.map((p) => {
                  const on = form.multiPagePaths.map(normalizePath).includes(p);
                  return (
                    <label key={p} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                      <Switch checked={on} onCheckedChange={(v) => toggleMulti(p, v)} />
                      <span className="truncate">{p}</span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PAGE VISIBILITY */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Per-Page Visibility</CardTitle>
              <p className="text-xs text-muted-foreground">Applies in Normal mode. Hidden or members-only pages are blocked according to the redirect rule.</p>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {publishedPaths.map((p) => {
                  const v = (form.pageVisibility[p] ?? "public") as PageVisibility;
                  return (
                    <div key={p} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <VisibilityIcon v={v} />
                        <span className="truncate text-sm">{p}</span>
                      </div>
                      <Select value={v} onValueChange={(val) => setPageVis(p, val as PageVisibility)}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                          <SelectItem value="members">Members only</SelectItem>
                          <SelectItem value="admin">Admin only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REDIRECTS & SEO */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Blocked Visitor Behavior</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>When a page is blocked</Label>
                <Select value={form.blockedRedirect} onValueChange={(v) => setField("blockedRedirect", v as VisibilitySettings["blockedRedirect"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="404">Show 404</SelectItem>
                    <SelectItem value="home">Redirect to Home</SelectItem>
                    <SelectItem value="selected">Redirect to selected page</SelectItem>
                    <SelectItem value="coming_soon">Show Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.blockedRedirect === "selected" && (
                <div>
                  <Label>Redirect target</Label>
                  <Select value={normalizePath(form.redirectTarget)} onValueChange={(v) => setField("redirectTarget", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {publishedPaths.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO & Navigation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-medium">Add noindex/nofollow to blocked pages</div>
                  <div className="text-xs text-muted-foreground">Search engines will skip blocked or restricted pages.</div>
                </div>
                <Switch checked={form.seoNoIndexBlocked} onCheckedChange={(v) => setField("seoNoIndexBlocked", v)} />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-medium">Hide restricted pages from navigation menus</div>
                  <div className="text-xs text-muted-foreground">Menu items pointing to hidden or blocked pages will not be shown.</div>
                </div>
                <Switch checked={form.hideFromNav} onCheckedChange={(v) => setField("hideFromNav", v)} />
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHITELIST */}
        <TabsContent value="whitelist">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Always-Accessible Paths</CardTitle>
              <p className="text-xs text-muted-foreground">One path per line. Matches path and any nested route. Login, Admin, Sitemap, Robots are recommended.</p>
            </CardHeader>
            <CardContent>
              <Textarea rows={10} value={whitelistText} onChange={(e) => setWhitelistText(e.target.value)} className="font-mono text-xs" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMING SOON */}
        <TabsContent value="coming">
          <Card>
            <CardHeader><CardTitle className="text-base">Coming Soon Page</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={form.comingSoon.title} onChange={(v) => setField("comingSoon", { ...form.comingSoon, title: v })} />
              <TextField label="Countdown to (ISO)" value={form.comingSoon.countdownTo} onChange={(v) => setField("comingSoon", { ...form.comingSoon, countdownTo: v })} />
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.comingSoon.description} onChange={(e) => setField("comingSoon", { ...form.comingSoon, description: e.target.value })} />
              </div>
              <TextField label="Logo URL" value={form.comingSoon.logo} onChange={(v) => setField("comingSoon", { ...form.comingSoon, logo: v })} />
              <TextField label="Background image URL" value={form.comingSoon.background} onChange={(v) => setField("comingSoon", { ...form.comingSoon, background: v })} />
              <TextField label="Contact number" value={form.comingSoon.contactNumber} onChange={(v) => setField("comingSoon", { ...form.comingSoon, contactNumber: v })} />
              {(Object.keys(form.comingSoon.socials) as Array<keyof typeof form.comingSoon.socials>).map((k) => (
                <TextField
                  key={k}
                  label={`${k[0].toUpperCase()}${k.slice(1)} URL`}
                  value={form.comingSoon.socials[k]}
                  onChange={(v) => setField("comingSoon", { ...form.comingSoon, socials: { ...form.comingSoon.socials, [k]: v } })}
                />
              ))}
              <div className="md:col-span-2">
                <Button variant="outline" asChild>
                  <a href="/" target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />Preview site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAINTENANCE */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader><CardTitle className="text-base">Maintenance Page</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={form.maintenance.title} onChange={(v) => setField("maintenance", { ...form.maintenance, title: v })} />
              <TextField label="Logo URL" value={form.maintenance.logo} onChange={(v) => setField("maintenance", { ...form.maintenance, logo: v })} />
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.maintenance.description} onChange={(e) => setField("maintenance", { ...form.maintenance, description: e.target.value })} />
              </div>
              <TextField label="Contact email" value={form.maintenance.contactEmail} onChange={(v) => setField("maintenance", { ...form.maintenance, contactEmail: v })} />
              <TextField label="Contact number" value={form.maintenance.contactNumber} onChange={(v) => setField("maintenance", { ...form.maintenance, contactNumber: v })} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function VisibilityIcon({ v }: { v: PageVisibility }) {
  if (v === "public") return <Eye className="h-4 w-4 text-emerald-500" />;
  if (v === "hidden") return <EyeOff className="h-4 w-4 text-muted-foreground" />;
  if (v === "members") return <UsersIcon className="h-4 w-4 text-blue-500" />;
  return <ShieldCheck className="h-4 w-4 text-primary" />;
}

function modeHint(m: SiteMode) {
  switch (m) {
    case "normal": return "All published pages are publicly accessible.";
    case "single": return "Only one selected page is public. Everything else is blocked.";
    case "multi": return "Only selected pages are public.";
    case "maintenance": return "Show a maintenance page instead of the site.";
    case "coming_soon": return "Show a Coming Soon splash page.";
  }
}