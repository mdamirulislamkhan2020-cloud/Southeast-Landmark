import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPage, listPages } from "../api/client";
import type { CmsPage } from "../api/types";
import type { BlockType, PageBlock } from "../api/lead-pages";
import { newBlock } from "../api/lead-pages-client";
import { listForms } from "../api/forms-client";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/error-handler";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type TemplateKey = NonNullable<CmsPage["template"]>;

export const PAGE_TEMPLATES: { key: TemplateKey; label: string; description: string }[] = [
  { key: "blank",      label: "Blank",         description: "Empty canvas — no starter blocks." },
  { key: "standard",   label: "Standard Page", description: "Hero + content section." },
  { key: "landing",    label: "Landing Page",  description: "Hero, features, CTA, lead form." },
  { key: "contact",    label: "Contact Page",  description: "Hero, contact block, lead form." },
  { key: "blog",       label: "Blog Layout",   description: "Hero + blog grid." },
  { key: "full_width", label: "Full Width",    description: "Hero, gallery, CTA." },
];

function blocksForTemplate(t: TemplateKey): PageBlock[] {
  const make = (types: BlockType[]) => types.map((x) => newBlock(x));
  switch (t) {
    case "blank":      return [];
    case "landing":    return make(["hero", "features", "cta", "lead_form"]);
    case "contact":    return make(["hero", "contact", "lead_form"]);
    case "blog":       return make(["hero", "blog_grid"]);
    case "full_width": return make(["hero", "gallery", "cta"]);
    case "builder":
    case "standard":
    default:           return make(["hero", "text"]);
  }
}

function slugify(s: string) {
  const base = s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base ? `/${base}` : "";
}

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

export function NewPageDialog({ open, onOpenChange }: Props) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: allPages = [] } = useQuery({ queryKey: ["pages"], queryFn: listPages });
  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [template, setTemplate] = useState<TemplateKey>("standard");
  const [parentId, setParentId] = useState<string | "none">("none");
  const [showInNav, setShowInNav] = useState(true);
  const [formId, setFormId] = useState<string | "none">("none");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(""); setSlug(""); setAutoSlug(true);
    setTemplate("standard"); setParentId("none");
    setShowInNav(true); setFormId("none"); setSeoTitle(""); setSeoDescription("");
  }, [open]);

  useEffect(() => {
    if (autoSlug) setSlug(title ? slugify(title) : "");
  }, [title, autoSlug]);

  const tplDescription = useMemo(
    () => PAGE_TEMPLATES.find((t) => t.key === template)?.description ?? "",
    [template],
  );

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const created = await createPage({
        title: title.trim(),
        slug: slug || slugify(title),
        template,
        parentId: parentId === "none" ? null : parentId,
        status: "draft",
        showInNav,
        formId: formId === "none" ? null : formId,
        seoTitle: seoTitle.trim() || title.trim(),
        seoDescription: seoDescription.trim(),
        blocks: blocksForTemplate(template),
      });
      toast.success("Draft created — publish it when you're ready");
      qc.invalidateQueries({ queryKey: ["pages"] });
      onOpenChange(false);
      nav(`/admin/pages/${created.id}`);
    } catch (e) {
      toast.error(toErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new page</DialogTitle>
          <DialogDescription>
            Configure the basics. You can refine content, SEO and blocks in the Page Builder.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Page title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. About Our Land Bank" autoFocus />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>URL slug</Label>
            <div className="flex gap-2">
              <Input
                value={slug}
                onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
                placeholder="/about"
              />
              <Button type="button" variant="outline" onClick={() => { setAutoSlug(true); setSlug(slugify(title)); }}>
                Auto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={(v) => setTemplate(v as TemplateKey)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_TEMPLATES.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{tplDescription}</p>
          </div>

          <div className="space-y-2">
            <Label>Parent page</Label>
            <Select value={parentId} onValueChange={(v) => setParentId(v as typeof parentId)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {allPages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Publish status</Label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground border border-border">Draft</span>
              <span className="text-xs text-muted-foreground">New pages are saved as drafts. Publish from the editor when ready.</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned Lead Form</Label>
            <Select value={formId} onValueChange={(v) => setFormId(v as typeof formId)}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border border-input p-3 md:col-span-2">
            <div>
              <Label>Show in Navigation</Label>
              <p className="text-xs text-muted-foreground">Make this page available in the Navigation Manager.</p>
            </div>
            <Switch checked={showInNav} onCheckedChange={setShowInNav} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>SEO title <span className="text-muted-foreground">(optional)</span></Label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={60} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Meta description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={160} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !title.trim()}>
            {saving ? "Creating…" : "Create Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}