import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPage, getPage, listPages, updatePage } from "../api/client";
import type { CmsPage, PageStatus } from "../api/types";
import type { PageBlock, BlockType } from "../api/lead-pages";
import { BLOCK_GROUPS, BLOCK_LABELS } from "../api/lead-pages";
import { newBlock } from "../api/lead-pages-client";
import { listForms } from "../api/forms-client";
import { BlockRenderer } from "../components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, ExternalLink, Plus, Copy, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/error-handler";

function slugify(s: string) {
  const base = s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base ? `/${base}` : "";
}

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

export function PageEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ["page", id],
    queryFn: () => getPage(id!),
    enabled: !isNew,
  });
  const { data: allPages = [] } = useQuery({ queryKey: ["pages"], queryFn: listPages });
  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });

  const [form, setForm] = useState<Partial<CmsPage>>({
    title: "", slug: "", parentId: null, status: "draft",
    seoTitle: "", seoDescription: "", content: "", publishAt: null,
    formId: null, blocks: [], showInNav: true, template: "standard",
    seoKeywords: "", ogImage: null, canonical: "",
  });
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        blocks: [], showInNav: true, template: "standard",
        formId: null, seoKeywords: "", ogImage: null, canonical: "",
        ...existing,
      });
      setAutoSlug(false);
    }
  }, [existing]);

  useEffect(() => {
    if (autoSlug && form.title) {
      const s = slugify(form.title);
      if (s) setForm((f) => ({ ...f, slug: s }));
    }
  }, [form.title, autoSlug]);

  const parentOptions = useMemo(
    () => allPages.filter((p) => p.id !== id),
    [allPages, id],
  );

  const blocks: PageBlock[] = form.blocks ?? [];
  const setBlocks = (next: PageBlock[]) => setForm((f) => ({ ...f, blocks: next }));
  const addBlock = (t: BlockType) => { const b = newBlock(t); setBlocks([...blocks, b]); setSelectedBlockId(b.id); };
  const removeBlock = (bid: string) => { setBlocks(blocks.filter((b) => b.id !== bid)); if (selectedBlockId === bid) setSelectedBlockId(null); };
  const dupBlock = (bid: string) => {
    const src = blocks.find((b) => b.id === bid); if (!src) return;
    const copy: PageBlock = { ...src, id: uid(), data: { ...src.data } };
    const i = blocks.findIndex((b) => b.id === bid);
    const next = [...blocks]; next.splice(i + 1, 0, copy); setBlocks(next);
  };
  const onDropBlock = (bid: string) => {
    if (!dragId || dragId === bid) { setDragId(null); setDragOverId(null); return; }
    const list = [...blocks];
    const from = list.findIndex((b) => b.id === dragId);
    const to = list.findIndex((b) => b.id === bid);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1); list.splice(to, 0, moved);
    setBlocks(list); setDragId(null); setDragOverId(null);
  };
  const updateBlockData = (bid: string, patch: Record<string, unknown>) =>
    setBlocks(blocks.map((b) => (b.id === bid ? { ...b, data: { ...b.data, ...patch } } : b)));
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const save = async (status?: PageStatus) => {
    try {
      const payload = { ...form, ...(status ? { status } : {}) };
      if (!payload.title) return toast.error("Title is required");
      if (!payload.slug) return toast.error("Slug is required");
      if (isNew) {
        const created = await createPage(payload);
        toast.success("Page created");
        qc.invalidateQueries({ queryKey: ["pages"] });
        nav(`/admin/pages/${created.id}`, { replace: true });
      } else {
        await updatePage(id!, payload);
        toast.success("Page saved");
        qc.invalidateQueries({ queryKey: ["pages"] });
        qc.invalidateQueries({ queryKey: ["page", id] });
      }
    } catch (e) {
      toast.error(toErrorMessage(e));
    }
  };

  const set = <K extends keyof CmsPage>(k: K, v: CmsPage[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost"><Link to="/admin/pages"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <h1 className="font-display text-2xl">{isNew ? "New Page" : "Edit Page"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && form.slug && (
            <Button asChild variant="outline" size="sm"><a href={form.slug} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" /> Preview</a></Button>
          )}
          <Button variant="outline" onClick={() => save("draft")}>Save Draft</Button>
          <Button onClick={() => save("published")}><Save className="h-4 w-4 mr-1" /> Publish</Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="builder">Page Builder</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="pt-4">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <Label>URL (slug)</Label>
                <div className="flex gap-2">
                  <Input value={form.slug ?? ""} onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }} placeholder="/about" />
                  <Button type="button" variant="outline" onClick={() => { setAutoSlug(true); if (form.title) set("slug", slugify(form.title)); }}>Auto</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Body (HTML)</Label>
                <Textarea rows={14} value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} placeholder="<h1>Hello</h1>" className="font-mono text-xs" />
                <p className="text-xs text-muted-foreground">Raw HTML for simple pages. For richer layouts use the <b>Page Builder</b> tab.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta title</Label>
                <Input value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} maxLength={60} />
                <p className="text-xs text-muted-foreground">{(form.seoTitle ?? "").length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Textarea rows={3} value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} maxLength={160} />
                <p className="text-xs text-muted-foreground">{(form.seoDescription ?? "").length}/160</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input value={form.seoKeywords ?? ""} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="comma, separated" />
                </div>
                <div className="space-y-2">
                  <Label>Canonical URL</Label>
                  <Input value={form.canonical ?? ""} onChange={(e) => set("canonical", e.target.value)} placeholder="https://…" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Open Graph image URL</Label>
                  <Input value={form.ogImage ?? ""} onChange={(e) => set("ogImage", e.target.value || null)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status ?? "draft"} onValueChange={(v) => set("status", v as PageStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.status === "scheduled" && (
                <div className="space-y-2">
                  <Label>Publish at</Label>
                  <Input type="datetime-local" value={form.publishAt ? form.publishAt.slice(0, 16) : ""} onChange={(e) => set("publishAt", new Date(e.target.value).toISOString())} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Parent page</Label>
                <Select value={form.parentId ?? "none"} onValueChange={(v) => set("parentId", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {parentOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border border-input p-3">
                <div>
                  <Label>Show in Navigation</Label>
                  <p className="text-xs text-muted-foreground">Available to Navigation Manager.</p>
                </div>
                <Switch checked={form.showInNav ?? true} onCheckedChange={(v) => set("showInNav", v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Assigned Lead Form</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={form.formId ?? "none"}
                onValueChange={(v) => set("formId", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If set, the form auto-renders at the bottom of the page and inside any Lead Form block that has no form selected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="builder" className="pt-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-3">
              <CardHeader><CardTitle className="text-sm">Add Blocks</CardTitle></CardHeader>
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

            <Card className="col-span-12 lg:col-span-6">
              <CardHeader><CardTitle className="text-sm">Blocks ({blocks.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2 min-h-[400px]">
                {blocks.length === 0 && (
                  <div className="text-sm text-muted-foreground border-2 border-dashed border-border rounded-md p-8 text-center">
                    Add blocks from the left panel. Drag rows to reorder.
                  </div>
                )}
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => setDragId(b.id)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(b.id); }}
                    onDrop={() => onDropBlock(b.id)}
                    onClick={() => setSelectedBlockId(b.id)}
                    className={`group rounded-md border ${selectedBlockId === b.id ? "border-primary" : "border-border"} ${dragOverId === b.id ? "bg-secondary" : "bg-card"} p-3 cursor-pointer flex items-center gap-2`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="text-xs uppercase text-muted-foreground">{BLOCK_LABELS[b.type]}</span>
                    <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); dupBlock(b.id); }}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="col-span-12 lg:col-span-3">
              <CardHeader><CardTitle className="text-sm">Block Settings</CardTitle></CardHeader>
              <CardContent>
                {!selectedBlock ? (
                  <div className="text-xs text-muted-foreground">Select a block to edit its content.</div>
                ) : (
                  <BlockQuickSettings block={selectedBlock} forms={forms} onChange={(p) => updateBlockData(selectedBlock.id, p)} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          <div className="rounded-md border border-border overflow-hidden bg-background">
            {(blocks.length === 0 && !form.content) ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Add content or blocks to see a live preview.
              </div>
            ) : (
              <>
                {form.content && <div className="prose max-w-none mx-auto px-4 py-6" dangerouslySetInnerHTML={{ __html: form.content }} />}
                {blocks.map((b) => (
                  <BlockRenderer key={b.id} block={b} containerWidth={1200} pageFormId={form.formId ?? null} />
                ))}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlockQuickSettings({ block, forms, onChange }: { block: PageBlock; forms: { id: string; name: string }[]; onChange: (patch: Record<string, unknown>) => void }) {
  const d = block.data as Record<string, unknown>;
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  const strOrNull = (v: unknown) => (typeof v === "string" ? v : "");

  const Field = ({ k, label, textarea, rows }: { k: string; label: string; textarea?: boolean; rows?: number }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {textarea ? (
        <Textarea rows={rows ?? 3} value={str(k)} onChange={(e) => onChange({ [k]: e.target.value })} />
      ) : (
        <Input value={str(k)} onChange={(e) => onChange({ [k]: e.target.value })} />
      )}
    </div>
  );

  switch (block.type) {
    case "hero":
      return (<div className="space-y-3"><Field k="title" label="Title" /><Field k="subtitle" label="Subtitle" textarea rows={2} /><Field k="image" label="Background image URL" /><Field k="ctaLabel" label="CTA label" /><Field k="ctaHref" label="CTA link" /></div>);
    case "text": return <Field k="html" label="HTML" textarea rows={8} />;
    case "image": return (<div className="space-y-3"><Field k="src" label="Image URL" /><Field k="alt" label="Alt" /><Field k="caption" label="Caption" /></div>);
    case "video": return <Field k="url" label="Embed URL" />;
    case "cta": return (<div className="space-y-3"><Field k="title" label="Title" /><Field k="subtitle" label="Subtitle" textarea rows={2} /><Field k="ctaLabel" label="CTA label" /><Field k="ctaHref" label="CTA link" /></div>);
    case "contact": return (<div className="space-y-3"><Field k="phone" label="Phone" /><Field k="email" label="Email" /><Field k="address" label="Address" /></div>);
    case "map": return <Field k="embed" label="Embed HTML/URL" textarea rows={4} />;
    case "html": return <Field k="html" label="Custom HTML" textarea rows={8} />;
    case "spacing": return (
      <div className="space-y-1"><Label className="text-xs">Height (px)</Label>
        <Input type="number" value={typeof d.height === "number" ? d.height : 48} onChange={(e) => onChange({ height: Number(e.target.value) })} /></div>
    );
    case "lead_form":
      return (
        <div className="space-y-3">
          <Field k="title" label="Section title" />
          <div className="space-y-1">
            <Label className="text-xs">Form</Label>
            <Select value={strOrNull(d.formId) || "inherit"} onValueChange={(v) => onChange({ formId: v === "inherit" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Use page default</SelectItem>
                {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    default:
      return <div className="text-xs text-muted-foreground">No inline settings for this block.</div>;
  }
}