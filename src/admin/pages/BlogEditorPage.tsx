import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBlogPost, getBlogPost, updateBlogPost } from "../api/content-client";
import type { BlogPost, BlogStatus } from "../api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Bold, Italic, List, Heading2, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

function RichToolbar({ onInsert }: { onInsert: (before: string, after?: string) => void }) {
  const btn = "h-8 w-8 inline-flex items-center justify-center rounded hover:bg-secondary";
  return (
    <div className="flex flex-wrap gap-1 border-b border-border p-1 bg-secondary/30">
      <button type="button" className={btn} title="Heading" onClick={() => onInsert("<h2>", "</h2>")}><Heading2 className="h-4 w-4" /></button>
      <button type="button" className={btn} title="Bold" onClick={() => onInsert("<strong>", "</strong>")}><Bold className="h-4 w-4" /></button>
      <button type="button" className={btn} title="Italic" onClick={() => onInsert("<em>", "</em>")}><Italic className="h-4 w-4" /></button>
      <button type="button" className={btn} title="List" onClick={() => onInsert("<ul>\n  <li>", "</li>\n</ul>")}><List className="h-4 w-4" /></button>
      <button type="button" className={btn} title="Link" onClick={() => {
        const url = prompt("URL"); if (url) onInsert(`<a href="${url}">`, "</a>");
      }}><LinkIcon className="h-4 w-4" /></button>
      <button type="button" className={btn} title="Image" onClick={() => {
        const url = prompt("Image URL"); if (url) onInsert(`<img src="${url}" alt="" />`);
      }}><ImageIcon className="h-4 w-4" /></button>
    </div>
  );
}

export function BlogEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogPost(id!),
    enabled: !isNew,
  });

  const [form, setForm] = useState<Partial<BlogPost>>({
    title: "", slug: "", excerpt: "", content: "", featuredImage: null, author: "Editorial Team",
    categories: [], tags: [], status: "draft", publishAt: null,
    seo: { title: "", description: "", keywords: "" },
    og: { title: "", description: "", image: null },
  });
  const [autoSlug, setAutoSlug] = useState(isNew);

  useEffect(() => { if (existing) { setForm(existing); setAutoSlug(false); } }, [existing]);
  useEffect(() => { if (autoSlug && form.title) setForm((f) => ({ ...f, slug: slugify(form.title!) })); }, [form.title, autoSlug]);

  const set = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (status?: BlogStatus) => {
    try {
      const payload = { ...form, ...(status ? { status } : {}) };
      if (!payload.title) return toast.error("Title is required");
      if (!payload.slug) return toast.error("Slug is required");
      if (isNew) {
        const created = await createBlogPost(payload);
        toast.success("Post created");
        qc.invalidateQueries({ queryKey: ["blog"] });
        nav(`/admin/blog/${created.id}`, { replace: true });
      } else {
        await updateBlogPost(id!, payload);
        toast.success("Post saved");
        qc.invalidateQueries({ queryKey: ["blog"] });
        qc.invalidateQueries({ queryKey: ["blog", id] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const insertAtCursor = (before: string, after = "") => {
    const ta = document.getElementById("blog-content") as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const current = form.content ?? "";
    const selected = current.slice(start, end);
    const next = current.slice(0, start) + before + selected + after + current.slice(end);
    set("content", next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const uploadFeatured = async (file: File | null) => {
    if (!file) return;
    const url = await fileToDataUrl(file);
    set("featuredImage", url);
    if (!form.og?.image) setForm((f) => ({ ...f, og: { ...(f.og ?? { title: "", description: "", image: null }), image: url } }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost"><Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <h1 className="font-display text-2xl">{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        <div className="flex items-center gap-2">
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
                <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <div className="flex gap-2">
                  <Input value={form.slug ?? ""} onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }} placeholder="post-url" />
                  <Button type="button" variant="outline" onClick={() => { setAutoSlug(true); if (form.title) set("slug", slugify(form.title)); }}>Auto</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea rows={2} value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short summary shown in listings" />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <div className="rounded-md border border-input overflow-hidden">
                  <RichToolbar onInsert={insertAtCursor} />
                  <Textarea id="blog-content" rows={16} value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} placeholder="<p>Write your story...</p>" className="font-mono text-xs border-0 rounded-none focus-visible:ring-0" />
                </div>
                <p className="text-xs text-muted-foreground">Estimated reading time updates on save.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta title</Label>
                <Input value={form.seo?.title ?? ""} onChange={(e) => set("seo", { ...(form.seo ?? { title: "", description: "", keywords: "" }), title: e.target.value })} maxLength={60} />
                <p className="text-xs text-muted-foreground">{(form.seo?.title ?? "").length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Textarea rows={3} value={form.seo?.description ?? ""} onChange={(e) => set("seo", { ...(form.seo ?? { title: "", description: "", keywords: "" }), description: e.target.value })} maxLength={160} />
                <p className="text-xs text-muted-foreground">{(form.seo?.description ?? "").length}/160</p>
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input value={form.seo?.keywords ?? ""} onChange={(e) => set("seo", { ...(form.seo ?? { title: "", description: "", keywords: "" }), keywords: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Open Graph / Social</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OG title</Label>
                <Input value={form.og?.title ?? ""} onChange={(e) => set("og", { ...(form.og ?? { title: "", description: "", image: null }), title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>OG description</Label>
                <Textarea rows={2} value={form.og?.description ?? ""} onChange={(e) => set("og", { ...(form.og ?? { title: "", description: "", image: null }), description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>OG image URL</Label>
                <Input value={form.og?.image ?? ""} onChange={(e) => set("og", { ...(form.og ?? { title: "", description: "", image: null }), image: e.target.value || null })} placeholder="https://..." />
                {form.og?.image && <img src={form.og.image} alt="" className="mt-2 max-h-32 rounded" />}
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
                <Select value={form.status ?? "draft"} onValueChange={(v) => set("status", v as BlogStatus)}>
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
                  <Input type="datetime-local" value={form.publishAt ? form.publishAt.slice(0, 16) : ""} onChange={(e) => set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Featured image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.featuredImage ? (
                <div className="relative group">
                  <img src={form.featuredImage} alt="" className="w-full rounded-md object-cover aspect-video" />
                  <Button type="button" size="sm" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => set("featuredImage", null)}>Remove</Button>
                </div>
              ) : (
                <div className="aspect-video rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">No image</div>
              )}
              <Input type="file" accept="image/*" onChange={(e) => uploadFeatured(e.target.files?.[0] ?? null)} />
              <Input value={form.featuredImage ?? ""} onChange={(e) => set("featuredImage", e.target.value || null)} placeholder="or paste image URL" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
            <CardContent>
              <TagInput value={form.categories ?? []} onChange={(v) => set("categories", v)} placeholder="Add category" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
            <CardContent>
              <TagInput value={form.tags ?? []} onChange={(v) => set("tags", v)} placeholder="Add tag" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}