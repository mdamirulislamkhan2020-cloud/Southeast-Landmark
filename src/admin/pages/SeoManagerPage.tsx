import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Download } from "lucide-react";
import {
  buildSitemapXml, createRedirect, deleteRedirect, deleteSeoEntity, getRobotsTxt,
  listRedirects, listSeoEntities, saveRobotsTxt, updateRedirect, updateSeoEntity,
} from "../api/seo-client";
import type { Redirect, SeoEntity, SeoMeta } from "../api/seo";

function SeoPreview({ meta, url }: { meta: SeoMeta; url: string }) {
  const title = meta.title || "Untitled Page";
  const desc = meta.description || "No meta description yet.";
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Google Preview</div>
        <div className="rounded-md border border-border p-3 bg-card">
          <div className="text-xs text-emerald-600">{url}</div>
          <div className="text-base text-blue-500 truncate">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">{desc}</div>
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">Social Preview</div>
        <div className="rounded-md border border-border overflow-hidden bg-card">
          {meta.ogImage ? (
            <img src={meta.ogImage} alt="" className="w-full h-40 object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
          ) : (
            <div className="w-full h-40 grid place-items-center text-xs text-muted-foreground bg-secondary">No og:image set</div>
          )}
          <div className="p-3">
            <div className="text-xs uppercase text-muted-foreground">{new URL(url, "https://example.com").hostname}</div>
            <div className="text-sm font-medium truncate">{meta.ogTitle || title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{meta.ogDescription || desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntityEditor({ entity, onSaved }: { entity: SeoEntity; onSaved: () => void }) {
  const [slug, setSlug] = useState(entity.slug);
  const [meta, setMeta] = useState<SeoMeta>(entity.meta);
  useEffect(() => { setSlug(entity.slug); setMeta(entity.meta); }, [entity.id]); // eslint-disable-line

  const set = <K extends keyof SeoMeta>(k: K, v: SeoMeta[K]) => setMeta((m) => ({ ...m, [k]: v }));

  const save = async () => {
    await updateSeoEntity(entity.id, { slug, meta });
    toast.success("SEO saved");
    onSaved();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Slug / URL</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
          <div><Label>Canonical URL</Label><Input value={meta.canonical} onChange={(e) => set("canonical", e.target.value)} /></div>
        </div>
        <div><Label>SEO Title <span className="text-xs text-muted-foreground">({meta.title.length}/60)</span></Label>
          <Input value={meta.title} onChange={(e) => set("title", e.target.value)} maxLength={80} />
        </div>
        <div><Label>Meta Description <span className="text-xs text-muted-foreground">({meta.description.length}/160)</span></Label>
          <Textarea rows={3} value={meta.description} onChange={(e) => set("description", e.target.value)} maxLength={200} />
        </div>
        <div><Label>Meta Keywords (comma separated)</Label>
          <Input value={meta.keywords} onChange={(e) => set("keywords", e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Open Graph Title</Label><Input value={meta.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} /></div>
          <div><Label>Open Graph Image URL</Label><Input value={meta.ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://..." /></div>
        </div>
        <div><Label>Open Graph Description</Label>
          <Textarea rows={2} value={meta.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Twitter Card</Label>
            <Select value={meta.twitterCard} onValueChange={(v) => set("twitterCard", v as SeoMeta["twitterCard"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">summary</SelectItem>
                <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                <SelectItem value="player">player</SelectItem>
                <SelectItem value="app">app</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Robots — Index</Label>
            <Select value={meta.robotsIndex} onValueChange={(v) => set("robotsIndex", v as SeoMeta["robotsIndex"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="index">index</SelectItem><SelectItem value="noindex">noindex</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label>Robots — Follow</Label>
            <Select value={meta.robotsFollow} onValueChange={(v) => set("robotsFollow", v as SeoMeta["robotsFollow"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="follow">follow</SelectItem><SelectItem value="nofollow">nofollow</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>JSON-LD Schema</Label>
          <Textarea rows={6} placeholder='{ "@context": "https://schema.org", ... }' value={meta.jsonLd} onChange={(e) => set("jsonLd", e.target.value)} className="font-mono text-xs" />
        </div>

        <div className="flex justify-end"><Button onClick={save}>Save SEO</Button></div>
      </div>

      <div className="space-y-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
          <CardContent><SeoPreview meta={meta} url={slug || "/"} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function RedirectsTab() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["seo-redirects"], queryFn: listRedirects });
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [code, setCode] = useState<"301" | "302">("301");

  const add = async () => {
    if (!from || !to) { toast.error("From and To required"); return; }
    await createRedirect({ from, to, code: Number(code) as 301 | 302, active: true });
    setFrom(""); setTo("");
    toast.success("Redirect added");
    qc.invalidateQueries({ queryKey: ["seo-redirects"] });
  };
  const toggle = async (r: Redirect) => { await updateRedirect(r.id, { active: !r.active }); qc.invalidateQueries({ queryKey: ["seo-redirects"] }); };
  const remove = async (id: string) => { await deleteRedirect(id); qc.invalidateQueries({ queryKey: ["seo-redirects"] }); };

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
          <div><Label>From</Label><Input placeholder="/old-path" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><Label>To</Label><Input placeholder="/new-path" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div><Label>Code</Label>
            <Select value={code} onValueChange={(v) => setCode(v as "301" | "302")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="301">301</SelectItem><SelectItem value="302">302</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="self-end"><Button onClick={add}><Plus className="h-4 w-4 mr-1" />Add</Button></div>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
              <tr><th className="p-3">From</th><th className="p-3">To</th><th className="p-3">Code</th><th className="p-3">Active</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-mono text-xs">{r.from}</td>
                  <td className="p-3 font-mono text-xs">{r.to}</td>
                  <td className="p-3">{r.code}</td>
                  <td className="p-3"><Switch checked={r.active} onCheckedChange={() => toggle(r)} /></td>
                  <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
              {(!data || data.length === 0) && (<tr><td colSpan={5} className="p-4 text-muted-foreground">No redirects.</td></tr>)}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}

function SitemapRobotsTab() {
  const [baseUrl, setBaseUrl] = useState<string>(typeof window !== "undefined" ? window.location.origin : "https://example.com");
  const [robots, setRobots] = useState<string>("");
  const [sitemap, setSitemap] = useState<string>("");

  useEffect(() => { getRobotsTxt().then(setRobots); buildSitemapXml(baseUrl).then(setSitemap); }, [baseUrl]);

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">XML Sitemap</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Base URL</Label><Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></div>
          <Textarea rows={16} value={sitemap} onChange={(e) => setSitemap(e.target.value)} className="font-mono text-xs" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => buildSitemapXml(baseUrl).then(setSitemap)}>Regenerate</Button>
            <Button onClick={() => download("sitemap.xml", sitemap, "application/xml")}><Download className="h-4 w-4 mr-1" />Download</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">robots.txt</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={18} value={robots} onChange={(e) => setRobots(e.target.value)} className="font-mono text-xs" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => download("robots.txt", robots, "text/plain")}><Download className="h-4 w-4 mr-1" />Download</Button>
            <Button onClick={async () => { await saveRobotsTxt(robots); toast.success("robots.txt saved"); }}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SeoManagerPage() {
  const qc = useQueryClient();
  const { data: entities, refetch } = useQuery({ queryKey: ["seo-entities"], queryFn: listSeoEntities });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current = useMemo(() => entities?.find((e) => e.id === selectedId) ?? entities?.[0], [entities, selectedId]);

  const remove = async (id: string) => {
    await deleteSeoEntity(id);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["seo-entities"] });
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">SEO Manager</h1>
        <p className="text-sm text-muted-foreground">Manage SEO metadata for every page, plus sitemap, robots.txt and redirects.</p>
      </header>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap &amp; Robots</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <Card><CardContent className="p-2">
              <div className="max-h-[70vh] overflow-y-auto">
                {(entities ?? []).map((e) => (
                  <div key={e.id} className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer text-sm ${current?.id === e.id ? "bg-secondary" : "hover:bg-secondary/50"}`} onClick={() => setSelectedId(e.id)}>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{e.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{e.slug}</div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100" onClick={(ev) => { ev.stopPropagation(); remove(e.id); }}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent></Card>
            <div>{current && <EntityEditor entity={current} onSaved={() => refetch()} />}</div>
          </div>
        </TabsContent>

        <TabsContent value="sitemap"><SitemapRobotsTab /></TabsContent>
        <TabsContent value="redirects"><RedirectsTab /></TabsContent>
      </Tabs>
    </div>
  );
}