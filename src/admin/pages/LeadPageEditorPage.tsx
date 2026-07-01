import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Copy, Plus, Save, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getLeadPage, newBlock, updateLeadPage } from "../api/lead-pages-client";
import { BLOCK_GROUPS, BLOCK_LABELS, type BlockType, type LeadPage, type PageBlock } from "../api/lead-pages";
import { listForms } from "../api/forms-client";
import { BlockRenderer } from "../components/BlockRenderer";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

export function LeadPageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [page, setPage] = useState<LeadPage | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });

  useEffect(() => { if (id) getLeadPage(id).then(setPage); }, [id]);

  const selected = useMemo(() => page?.blocks.find((b) => b.id === selectedId) ?? null, [page, selectedId]);

  if (!page) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  const update = (patch: Partial<LeadPage>) => setPage({ ...page, ...patch });
  const updateBlocks = (blocks: PageBlock[]) => update({ blocks });
  const updateBlockData = (bid: string, patch: Record<string, unknown>) => updateBlocks(page.blocks.map((b) => (b.id === bid ? { ...b, data: { ...b.data, ...patch } } : b)));

  const addBlock = (t: BlockType) => { const b = newBlock(t); updateBlocks([...page.blocks, b]); setSelectedId(b.id); };
  const removeBlock = (bid: string) => { updateBlocks(page.blocks.filter((b) => b.id !== bid)); if (selectedId === bid) setSelectedId(null); };
  const dupBlock = (bid: string) => { const src = page.blocks.find((b) => b.id === bid); if (!src) return; const copy = { ...src, id: uid(), data: { ...src.data } }; const i = page.blocks.findIndex((b) => b.id === bid); const next = [...page.blocks]; next.splice(i + 1, 0, copy); updateBlocks(next); };
  const onDrop = (bid: string) => {
    if (!dragId || dragId === bid) { setDragId(null); setDragOverId(null); return; }
    const list = [...page.blocks];
    const from = list.findIndex((b) => b.id === dragId);
    const to = list.findIndex((b) => b.id === bid);
    const [moved] = list.splice(from, 1); list.splice(to, 0, moved);
    updateBlocks(list); setDragId(null); setDragOverId(null);
  };

  const save = async () => { await updateLeadPage(page.id, page); toast.success("Lead page saved"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav("/admin/lead-pages")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Input value={page.name} onChange={(e) => update({ name: e.target.value })} className="w-64 font-medium" />
          <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
          <span className="text-xs text-muted-foreground">/lead/{page.slug}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><a href={`/lead/${page.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />View</a></Button>
          <Button onClick={save}><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Page Builder</TabsTrigger>
          <TabsTrigger value="page">Page Settings</TabsTrigger>
          <TabsTrigger value="form">Form Assignment</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="seo">SEO / OG</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="pt-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-3"><CardHeader><CardTitle className="text-sm">Add Blocks</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {BLOCK_GROUPS.map((g) => (
                  <div key={g.label}>
                    <div className="text-[10px] uppercase text-muted-foreground mb-2">{g.label}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {g.types.map((t) => (
                        <Button key={t} size="sm" variant="outline" className="justify-start text-xs h-8" onClick={() => addBlock(t)}>
                          <Plus className="h-3 w-3 mr-1" />{BLOCK_LABELS[t]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="col-span-12 lg:col-span-6"><CardHeader><CardTitle className="text-sm">Blocks ({page.blocks.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2 min-h-[400px]">
                {page.blocks.length === 0 && <div className="text-sm text-muted-foreground border-2 border-dashed border-border rounded-md p-8 text-center">Add blocks from the left panel.</div>}
                {page.blocks.map((b) => (
                  <div key={b.id} draggable onDragStart={() => setDragId(b.id)} onDragOver={(e) => { e.preventDefault(); setDragOverId(b.id); }} onDrop={() => onDrop(b.id)} onClick={() => setSelectedId(b.id)}
                    className={`group rounded-md border ${selectedId === b.id ? "border-primary" : "border-border"} ${dragOverId === b.id ? "bg-secondary" : "bg-card"} p-3 cursor-pointer flex items-center gap-2`}>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="text-xs uppercase text-muted-foreground">{BLOCK_LABELS[b.type]}</span>
                    <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); dupBlock(b.id); }}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="col-span-12 lg:col-span-3"><CardHeader><CardTitle className="text-sm">Block Settings</CardTitle></CardHeader>
              <CardContent>
                {!selected ? <div className="text-xs text-muted-foreground">Select a block to edit.</div> :
                  <BlockSettings block={selected} forms={forms} onChange={(p) => updateBlockData(selected.id, p)} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="page" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="space-y-2"><Label>Page Name</Label><Input value={page.name} onChange={(e) => update({ name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={page.slug} onChange={(e) => update({ slug: e.target.value.replace(/[^a-z0-9-]/g, "") })} /></div>
            <div className="space-y-2"><Label>Page Title</Label><Input value={page.title} onChange={(e) => update({ title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={page.category} onChange={(e) => update({ category: e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={page.status} onValueChange={(v) => update({ status: v as LeadPage["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={page.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Publish At</Label><Input type="datetime-local" value={page.publishAt ?? ""} onChange={(e) => update({ publishAt: e.target.value || null })} /></div>
            <div className="space-y-2"><Label>Banner URL</Label><Input value={page.banner ?? ""} onChange={(e) => update({ banner: e.target.value || null })} /></div>
            <div className="space-y-2"><Label>Featured Image URL</Label><Input value={page.featuredImage ?? ""} onChange={(e) => update({ featuredImage: e.target.value || null })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Short Description</Label><Textarea rows={2} value={page.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Long Description</Label><Textarea rows={5} value={page.longDescription} onChange={(e) => update({ longDescription: e.target.value })} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="form" className="pt-4">
          <Card><CardContent className="p-6 space-y-4">
            <div className="space-y-2 max-w-lg">
              <Label>Default Form for This Page</Label>
              <Select value={page.formId ?? "none"} onValueChange={(v) => update({ formId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select a form" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No form —</SelectItem>
                  {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used automatically inside any Lead Form block that has no form selected.</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="design" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="space-y-2"><Label>Background</Label><Input type="color" value={page.design.background} onChange={(e) => update({ design: { ...page.design, background: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Section Width: {page.design.sectionWidth}px</Label><Slider min={800} max={1600} step={20} value={[page.design.sectionWidth]} onValueChange={(v) => update({ design: { ...page.design, sectionWidth: v[0] } })} /></div>
            <div className="space-y-2"><Label>Padding: {page.design.padding}px</Label><Slider min={0} max={160} step={4} value={[page.design.padding]} onValueChange={(v) => update({ design: { ...page.design, padding: v[0] } })} /></div>
            <div className="space-y-2"><Label>Margin: {page.design.margin}px</Label><Slider min={0} max={80} step={4} value={[page.design.margin]} onValueChange={(v) => update({ design: { ...page.design, margin: v[0] } })} /></div>
            <div className="space-y-2"><Label>Heading Font</Label><Input value={page.design.fontHeading} onChange={(e) => update({ design: { ...page.design, fontHeading: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Body Font</Label><Input value={page.design.fontBody} onChange={(e) => update({ design: { ...page.design, fontBody: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Button Style</Label>
              <Select value={page.design.buttonStyle} onValueChange={(v) => update({ design: { ...page.design, buttonStyle: v as LeadPage["design"]["buttonStyle"] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="rounded">Rounded</SelectItem><SelectItem value="square">Square</SelectItem><SelectItem value="pill">Pill</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Border Radius: {page.design.radius}px</Label><Slider min={0} max={24} step={1} value={[page.design.radius]} onValueChange={(v) => update({ design: { ...page.design, radius: v[0] } })} /></div>
            <div className="flex items-center justify-between rounded-md border border-input p-3 md:col-span-2">
              <div><Label>Animations</Label><p className="text-xs text-muted-foreground">Enable section transitions.</p></div>
              <Switch checked={page.design.animations} onCheckedChange={(v) => update({ design: { ...page.design, animations: v } })} />
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="space-y-2"><Label>SEO Title</Label><Input value={page.seo.title} onChange={(e) => update({ seo: { ...page.seo, title: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Canonical URL</Label><Input value={page.seo.canonical} onChange={(e) => update({ seo: { ...page.seo, canonical: e.target.value } })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>SEO Description</Label><Textarea rows={3} value={page.seo.description} onChange={(e) => update({ seo: { ...page.seo, description: e.target.value } })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Keywords</Label><Input value={page.seo.keywords} onChange={(e) => update({ seo: { ...page.seo, keywords: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Open Graph Image URL</Label><Input value={page.og.image} onChange={(e) => update({ og: { ...page.og, image: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Twitter Card</Label>
              <Select value={page.og.twitterCard} onValueChange={(v) => update({ og: { ...page.og, twitterCard: v as LeadPage["og"]["twitterCard"] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="summary">Summary</SelectItem><SelectItem value="summary_large_image">Summary Large Image</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="analytics" className="pt-4">
          <Card><CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">Placeholders captured on submission (implemented later in CRM):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid","landing_url","referrer","device","browser","ip"].map((k) => (
                <div key={k} className="rounded-md border border-border px-2 py-1.5 font-mono">{k}</div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          <div className="rounded-md border border-border overflow-hidden" style={{ background: page.design.background }}>
            {page.blocks.map((b) => <BlockRenderer key={b.id} block={b} containerWidth={page.design.sectionWidth} pageFormId={page.formId} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlockSettings({ block, forms, onChange }: { block: PageBlock; forms: { id: string; name: string }[]; onChange: (patch: Record<string, unknown>) => void }) {
  const d = block.data as Record<string, unknown>;
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  const num = (k: string, dflt = 0) => (typeof d[k] === "number" ? (d[k] as number) : dflt);

  const StrField = ({ k, label, textarea, rows }: { k: string; label: string; textarea?: boolean; rows?: number }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {textarea ? <Textarea rows={rows ?? 3} value={str(k)} onChange={(e) => onChange({ [k]: e.target.value })} /> : <Input value={str(k)} onChange={(e) => onChange({ [k]: e.target.value })} />}
    </div>
  );

  switch (block.type) {
    case "hero": return (<div className="space-y-3"><StrField k="title" label="Title" /><StrField k="subtitle" label="Subtitle" textarea rows={2} /><StrField k="image" label="Background Image URL" /><StrField k="ctaLabel" label="CTA Label" /><StrField k="ctaHref" label="CTA Link" /></div>);
    case "text": return <StrField k="html" label="HTML" textarea rows={8} />;
    case "image": return (<div className="space-y-3"><StrField k="src" label="Image URL" /><StrField k="alt" label="Alt Text" /><StrField k="caption" label="Caption" /></div>);
    case "gallery": return (
      <div className="space-y-2">
        <Label className="text-xs">Image URLs (one per line)</Label>
        <Textarea rows={6} value={(Array.isArray(d.images) ? (d.images as string[]) : []).join("\n")} onChange={(e) => onChange({ images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
      </div>
    );
    case "video": return <StrField k="url" label="Embed URL (YouTube/Vimeo)" />;
    case "features":
    case "counter":
    case "faq": {
      const key = block.type === "faq" ? "items" : "items";
      const items = Array.isArray(d[key]) ? (d[key] as Record<string, unknown>[]) : [];
      const template = block.type === "features" ? { title: "Title", text: "Text" } : block.type === "counter" ? { value: 0, label: "Label" } : { q: "Question", a: "Answer" };
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label className="text-xs">Items</Label>
            <Button size="sm" variant="outline" className="h-7" onClick={() => onChange({ [key]: [...items, template] })}><Plus className="h-3 w-3" /></Button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="rounded-md border border-border p-2 space-y-1">
              {Object.keys(template).map((k) => (
                <Input key={k} placeholder={k} value={String((it as Record<string, unknown>)[k] ?? "")} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], [k]: k === "value" ? Number(e.target.value) : e.target.value }; onChange({ [key]: next }); }} />
              ))}
              <Button size="sm" variant="ghost" onClick={() => onChange({ [key]: items.filter((_, j) => j !== i) })}>Remove</Button>
            </div>
          ))}
        </div>
      );
    }
    case "cta": return (<div className="space-y-3"><StrField k="title" label="Title" /><StrField k="subtitle" label="Subtitle" textarea rows={2} /><StrField k="ctaLabel" label="CTA Label" /><StrField k="ctaHref" label="CTA Link" /></div>);
    case "map": return <StrField k="embed" label="Map iframe / URL" textarea rows={4} />;
    case "property_grid": return (<div className="space-y-3"><div><Label className="text-xs">Limit</Label><Input type="number" value={num("limit", 6)} onChange={(e) => onChange({ limit: Number(e.target.value) })} /></div><StrField k="category" label="Category filter" /></div>);
    case "blog_grid": return <div><Label className="text-xs">Limit</Label><Input type="number" value={num("limit", 3)} onChange={(e) => onChange({ limit: Number(e.target.value) })} /></div>;
    case "contact": return (<div className="space-y-3"><StrField k="phone" label="Phone" /><StrField k="email" label="Email" /><StrField k="address" label="Address" textarea rows={2} /></div>);
    case "lead_form": return (
      <div className="space-y-3">
        <StrField k="title" label="Section Title" />
        <div className="space-y-1"><Label className="text-xs">Form</Label>
          <Select value={(d.formId as string | null) ?? "none"} onValueChange={(v) => onChange({ formId: v === "none" ? null : v })}>
            <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Use page default</SelectItem>
              {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
    case "html": return <StrField k="html" label="Custom HTML" textarea rows={10} />;
    case "spacing": return <div><Label className="text-xs">Height (px)</Label><Input type="number" value={num("height", 48)} onChange={(e) => onChange({ height: Number(e.target.value) })} /></div>;
    case "divider": return <div className="text-xs text-muted-foreground">No settings for divider.</div>;
  }
}