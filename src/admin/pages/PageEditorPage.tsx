import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPage, getPage, listPages, updatePage } from "../api/client";
import type { CmsPage, PageStatus } from "../api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function slugify(s: string) {
  return "/" + s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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

  const [form, setForm] = useState<Partial<CmsPage>>({
    title: "", slug: "", parentId: null, status: "draft",
    seoTitle: "", seoDescription: "", content: "", publishAt: null,
  });
  const [autoSlug, setAutoSlug] = useState(isNew);

  useEffect(() => {
    if (existing) { setForm(existing); setAutoSlug(false); }
  }, [existing]);

  useEffect(() => {
    if (autoSlug && form.title) setForm((f) => ({ ...f, slug: slugify(form.title!) }));
  }, [form.title, autoSlug]);

  const parentOptions = useMemo(
    () => allPages.filter((p) => p.id !== id),
    [allPages, id],
  );

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
      toast.error(e instanceof Error ? e.message : "Save failed");
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
                <p className="text-xs text-muted-foreground">Visual drag-and-drop builder ships in Module 3. For now, raw HTML.</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}