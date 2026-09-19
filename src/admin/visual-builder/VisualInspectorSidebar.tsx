import { useState } from "react";
import type { CmsPage } from "../api/types";
import type { PageBlock } from "../api/lead-pages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Sliders,
  Type,
  Palette,
  Eye,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Plus,
  Code,
  Sparkles,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { MediaPickerDialog } from "./MediaPickerDialog";
import type { LeadForm } from "../api/forms";

interface VisualInspectorSidebarProps {
  page: Partial<CmsPage>;
  onUpdatePage: (patch: Partial<CmsPage>) => void;
  selectedBlock: PageBlock | null;
  onUpdateBlockData: (blockId: string, patch: Record<string, unknown>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: "up" | "down") => void;
  onDeselect: () => void;
  forms: LeadForm[];
}

export function VisualInspectorSidebar({
  page,
  onUpdatePage,
  selectedBlock,
  onUpdateBlockData,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onDeselect,
  forms,
}: VisualInspectorSidebarProps) {
  const [activeTab, setActiveTab] = useState<"content" | "style" | "advanced">("content");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string>("image");

  const blockData = (selectedBlock?.data ?? {}) as Record<string, any>;

  const updateData = (patch: Record<string, unknown>) => {
    if (!selectedBlock) return;
    onUpdateBlockData(selectedBlock.id, patch);
  };

  const updateStyle = (stylePatch: Record<string, unknown>) => {
    if (!selectedBlock) return;
    const currentStyles = (blockData.customStyles ?? {}) as Record<string, unknown>;
    onUpdateBlockData(selectedBlock.id, {
      customStyles: {
        ...currentStyles,
        ...stylePatch,
      },
    });
  };

  const openMediaFor = (target: string) => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (!url || typeof url !== "string") return;
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    if (!selectedBlock) {
      if (mediaPickerTarget === "ogImage") {
        onUpdatePage({ ogImage: cleanUrl });
      }
      return;
    }

    if (mediaPickerTarget === "image" || mediaPickerTarget === "src") {
      updateData({ [mediaPickerTarget]: cleanUrl });
    } else if (mediaPickerTarget === "bgImage") {
      updateStyle({ backgroundImage: cleanUrl });
    } else if (typeof mediaPickerTarget === "string" && mediaPickerTarget.startsWith("gallery-")) {
      const idx = parseInt(mediaPickerTarget.replace("gallery-", ""), 10);
      const currentImages = Array.isArray(blockData.images) ? [...blockData.images] : [];
      if (isNaN(idx) || idx >= currentImages.length) {
        currentImages.push(cleanUrl);
      } else {
        currentImages[idx] = cleanUrl;
      }
      updateData({ images: currentImages });
    }
  };

  // If no element is selected, show PAGE SETTINGS
  if (!selectedBlock) {
    return (
      <div className="w-80 h-full border-l border-border bg-card flex flex-col shrink-0 select-none overflow-y-auto">
        <div className="p-4 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm tracking-tight text-foreground">Page Settings</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Configure global page settings and SEO metadata.
          </p>
        </div>

        <div className="p-4 space-y-5 text-xs flex-1">
          {/* General */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">General</h3>
            
            <div className="space-y-1">
              <Label className="text-xs">Page Title</Label>
              <Input
                value={page.title || ""}
                onChange={(e) => onUpdatePage({ title: e.target.value })}
                placeholder="e.g. About Us"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">URL Slug</Label>
              <Input
                value={page.slug || ""}
                onChange={(e) => onUpdatePage({ slug: e.target.value })}
                placeholder="/about"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Template</Label>
              <Select
                value={page.template || "standard"}
                onValueChange={(v) => onUpdatePage({ template: v as any })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="builder">Visual Builder</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="blank">Blank Canvas</SelectItem>
                  <SelectItem value="contact">Contact Layout</SelectItem>
                  <SelectItem value="blog">Blog Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Attach Lead Form</Label>
              <Select
                value={page.formId || "none"}
                onValueChange={(v) => onUpdatePage({ formId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">SEO & Social</h3>
            
            <div className="space-y-1">
              <Label className="text-xs">Meta Title</Label>
              <Input
                value={page.seoTitle || ""}
                onChange={(e) => onUpdatePage({ seoTitle: e.target.value })}
                placeholder="Meta title for Google"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Meta Description</Label>
              <Textarea
                rows={3}
                value={page.seoDescription || ""}
                onChange={(e) => onUpdatePage({ seoDescription: e.target.value })}
                placeholder="150-160 characters summary..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Keywords</Label>
              <Input
                value={page.seoKeywords || ""}
                onChange={(e) => onUpdatePage({ seoKeywords: e.target.value })}
                placeholder="plots, real estate, dhaka"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">OG Share Image</Label>
              <div className="flex gap-2">
                <Input
                  value={page.ogImage || ""}
                  onChange={(e) => onUpdatePage({ ogImage: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => openMediaFor("ogImage")}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          onSelect={handleMediaSelect}
          currentValue={page.ogImage || ""}
        />
      </div>
    );
  }

  const customStyles = (blockData.customStyles ?? {}) as Record<string, any>;

  return (
    <div className="w-80 h-full border-l border-border bg-card flex flex-col shrink-0 select-none">
      {/* Header with selected block type and actions */}
      <div className="p-3.5 border-b border-border bg-secondary/15 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground capitalize">
              {selectedBlock.type.replace("_", " ")} Block
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              #{selectedBlock.id.slice(0, 5)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            title="Move Up"
            onClick={() => onMoveBlock(selectedBlock.id, "up")}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            title="Move Down"
            onClick={() => onMoveBlock(selectedBlock.id, "down")}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-primary"
            title="Duplicate"
            onClick={() => onDuplicateBlock(selectedBlock.id)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title="Delete Block"
            onClick={() => onDeleteBlock(selectedBlock.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs: Content | Style | Advanced */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 mx-3 my-2 h-8">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
        </TabsList>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="flex-1 overflow-y-auto p-4 space-y-4 text-xs mt-0">
          {/* HERO BLOCK */}
          {selectedBlock.type === "hero" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Breadcrumb / Eyebrow</Label>
                <Input
                  value={blockData.crumb || ""}
                  onChange={(e) => updateData({ crumb: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Main Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subtitle</Label>
                <Textarea
                  rows={2}
                  value={blockData.subtitle || ""}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hero Background Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={blockData.image || ""}
                    onChange={(e) => updateData({ image: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openMediaFor("image")}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">CTA Button Label</Label>
                  <Input
                    value={blockData.ctaLabel || ""}
                    onChange={(e) => updateData({ ctaLabel: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CTA URL Link</Label>
                  <Input
                    value={blockData.ctaHref || ""}
                    onChange={(e) => updateData({ ctaHref: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TEXT BLOCK */}
          {selectedBlock.type === "text" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Eyebrow Tag</Label>
                <Input
                  value={blockData.eyebrow || ""}
                  onChange={(e) => updateData({ eyebrow: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Heading Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={blockData.subtitle || ""}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Body Paragraphs</Label>
                {blockData.body1 !== undefined || blockData.body2 !== undefined ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Paragraph 1</span>
                      <Textarea
                        rows={3}
                        value={blockData.body1 || ""}
                        onChange={(e) => updateData({ body1: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Paragraph 2</span>
                      <Textarea
                        rows={3}
                        value={blockData.body2 || ""}
                        onChange={(e) => updateData({ body2: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    rows={5}
                    value={blockData.body || ""}
                    onChange={(e) => updateData({ body: e.target.value })}
                    className="text-xs"
                  />
                )}
              </div>
              {(blockData.image !== undefined || blockData.imageUrl !== undefined || blockData.key?.includes("about") || blockData.key?.includes("story")) && (
                <div className="space-y-1">
                  <Label className="text-xs">Side Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={blockData.image || blockData.imageUrl || ""}
                      onChange={(e) => updateData({ image: e.target.value })}
                      placeholder="https://..."
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => openMediaFor("image")}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={blockData.ctaLabel || ""}
                    onChange={(e) => updateData({ ctaLabel: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Button URL</Label>
                  <Input
                    value={blockData.ctaHref || ""}
                    onChange={(e) => updateData({ ctaHref: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* IMAGE BLOCK */}
          {selectedBlock.type === "image" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Image Source</Label>
                <div className="flex gap-2">
                  <Input
                    value={blockData.src || ""}
                    onChange={(e) => updateData({ src: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openMediaFor("src")}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {blockData.src && (
                <div className="rounded border border-border overflow-hidden aspect-video bg-muted">
                  <img src={blockData.src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Alt Text</Label>
                <Input
                  value={blockData.alt || ""}
                  onChange={(e) => updateData({ alt: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Caption</Label>
                <Input
                  value={blockData.caption || ""}
                  onChange={(e) => updateData({ caption: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* FEATURES BLOCK */}
          {selectedBlock.type === "features" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Section Eyebrow</Label>
                <Input
                  value={blockData.eyebrow || ""}
                  onChange={(e) => updateData({ eyebrow: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Section Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Section Subtitle</Label>
                <Input
                  value={blockData.subtitle || ""}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Feature Cards</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      const items = Array.isArray(blockData.items) ? [...blockData.items] : [];
                      items.push({ title: "New Feature", text: "Description of feature." });
                      updateData({ items });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {(Array.isArray(blockData.items) ? blockData.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded border border-border/70 bg-secondary/20 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Card #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-destructive"
                        onClick={() => {
                          const items = [...blockData.items];
                          items.splice(idx, 1);
                          updateData({ items });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={item.title || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], title: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="Title"
                      className="h-7 text-xs"
                    />
                    <Textarea
                      rows={2}
                      value={item.text || item.body || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], text: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="Description"
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COUNTER BLOCK */}
          {selectedBlock.type === "counter" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Section Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Stats Counters</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      const items = Array.isArray(blockData.items) ? [...blockData.items] : [];
                      items.push({ value: "100+", label: "New Stat" });
                      updateData({ items });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {(Array.isArray(blockData.items) ? blockData.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2 rounded border border-border/70 bg-secondary/20 flex items-center gap-2">
                    <Input
                      value={item.value || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], value: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="100+"
                      className="h-7 text-xs w-20 font-bold"
                    />
                    <Input
                      value={item.label || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], label: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="Label"
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => {
                        const items = [...blockData.items];
                        items.splice(idx, 1);
                        updateData({ items });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ BLOCK */}
          {selectedBlock.type === "faq" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Q&A Questions</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      const items = Array.isArray(blockData.items) ? [...blockData.items] : [];
                      items.push({ q: "New Question?", a: "Answer text goes here." });
                      updateData({ items });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {(Array.isArray(blockData.items) ? blockData.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded border border-border/70 bg-secondary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Q#{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-destructive"
                        onClick={() => {
                          const items = [...blockData.items];
                          items.splice(idx, 1);
                          updateData({ items });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={item.q || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], q: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="Question"
                      className="h-7 text-xs font-medium"
                    />
                    <Textarea
                      rows={2}
                      value={item.a || ""}
                      onChange={(e) => {
                        const items = [...blockData.items];
                        items[idx] = { ...items[idx], a: e.target.value };
                        updateData({ items });
                      }}
                      placeholder="Answer"
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA BLOCK */}
          {selectedBlock.type === "cta" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Banner Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subtitle</Label>
                <Textarea
                  rows={2}
                  value={blockData.subtitle || ""}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={blockData.ctaLabel || ""}
                    onChange={(e) => updateData({ ctaLabel: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Button URL</Label>
                  <Input
                    value={blockData.ctaHref || ""}
                    onChange={(e) => updateData({ ctaHref: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LEAD FORM BLOCK */}
          {selectedBlock.type === "lead_form" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Form Header Title</Label>
                <Input
                  value={blockData.title || ""}
                  onChange={(e) => updateData({ title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Select Lead Form</Label>
                <Select
                  value={blockData.formId || "none"}
                  onValueChange={(v) => updateData({ formId: v === "none" ? null : v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose a form..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default Form</SelectItem>
                    {forms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* SPACING BLOCK */}
          {selectedBlock.type === "spacing" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Height (pixels)</Label>
                  <span className="text-xs font-mono font-bold text-primary">
                    {blockData.height || 48}px
                  </span>
                </div>
                <Slider
                  min={12}
                  max={200}
                  step={4}
                  value={[blockData.height || 48]}
                  onValueChange={([v]) => updateData({ height: v })}
                />
              </div>
            </div>
          )}

          {/* GALLERY BLOCK */}
          {selectedBlock.type === "gallery" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Gallery Images</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[11px] px-2"
                  onClick={() => {
                    const images = Array.isArray(blockData.images) ? [...blockData.images] : [];
                    openMediaFor(`gallery-${images.length}`);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Image
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Array.isArray(blockData.images) ? blockData.images : []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded border border-border overflow-hidden bg-muted group">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const images = [...blockData.images];
                        images.splice(idx, 1);
                        updateData({ images });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HTML BLOCK */}
          {selectedBlock.type === "html" && (
            <div className="space-y-2">
              <Label className="text-xs">Raw HTML Code</Label>
              <Textarea
                rows={8}
                value={blockData.html || ""}
                onChange={(e) => updateData({ html: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          )}
        </TabsContent>

        {/* STYLE TAB */}
        <TabsContent value="style" className="flex-1 overflow-y-auto p-4 space-y-4 text-xs mt-0">
          {/* Typography */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-primary" /> Typography
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Font Size</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {customStyles.fontSize ? `${customStyles.fontSize}px` : "Default"}
                </span>
              </div>
              <Slider
                min={12}
                max={72}
                step={2}
                value={[customStyles.fontSize || 16]}
                onValueChange={([v]) => updateStyle({ fontSize: v })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Font Weight</Label>
              <Select
                value={customStyles.fontWeight || "normal"}
                onValueChange={(v) => updateStyle({ fontWeight: v })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semibold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extra Bold (800)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Text Align</Label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                  { value: "justify", icon: AlignJustify },
                ].map((a) => (
                  <Button
                    key={a.value}
                    type="button"
                    variant={customStyles.textAlign === a.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 p-0"
                    onClick={() => updateStyle({ textAlign: a.value })}
                  >
                    <a.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-primary" /> Colors & Background
            </h4>

            <div className="space-y-1">
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={customStyles.textColor || "#0f172a"}
                  onChange={(e) => updateStyle({ textColor: e.target.value })}
                  className="h-7 w-7 rounded cursor-pointer border border-border"
                />
                <Input
                  value={customStyles.textColor || ""}
                  onChange={(e) => updateStyle({ textColor: e.target.value })}
                  placeholder="#0f172a"
                  className="h-7 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Background Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={customStyles.bgColor || "#ffffff"}
                  onChange={(e) => updateStyle({ bgColor: e.target.value })}
                  className="h-7 w-7 rounded cursor-pointer border border-border"
                />
                <Input
                  value={customStyles.bgColor || ""}
                  onChange={(e) => updateStyle({ bgColor: e.target.value })}
                  placeholder="#ffffff or transparent"
                  className="h-7 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Spacing (Padding & Margin)
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Vertical Padding</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {customStyles.paddingY ? `${customStyles.paddingY}px` : "Default"}
                </span>
              </div>
              <Slider
                min={0}
                max={120}
                step={8}
                value={[customStyles.paddingY || 48]}
                onValueChange={([v]) => updateStyle({ paddingY: v })}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Corner Radius</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {customStyles.borderRadius ? `${customStyles.borderRadius}px` : "0px"}
                </span>
              </div>
              <Slider
                min={0}
                max={48}
                step={4}
                value={[customStyles.borderRadius || 0]}
                onValueChange={([v]) => updateStyle({ borderRadius: v })}
              />
            </div>
          </div>
        </TabsContent>

        {/* ADVANCED TAB */}
        <TabsContent value="advanced" className="flex-1 overflow-y-auto p-4 space-y-4 text-xs mt-0">
          <div className="space-y-3">
            <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" /> Responsive Visibility
            </h4>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Show on Desktop</span>
              <Switch
                checked={customStyles.showDesktop !== false}
                onCheckedChange={(v) => updateStyle({ showDesktop: v })}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Show on Tablet</span>
              <Switch
                checked={customStyles.showTablet !== false}
                onCheckedChange={(v) => updateStyle({ showTablet: v })}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Show on Mobile</span>
              <Switch
                checked={customStyles.showMobile !== false}
                onCheckedChange={(v) => updateStyle({ showMobile: v })}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-primary" /> Custom Styling
            </h4>

            <div className="space-y-1">
              <Label className="text-xs">CSS Class Name</Label>
              <Input
                value={customStyles.className || ""}
                onChange={(e) => updateStyle({ className: e.target.value })}
                placeholder="my-custom-section"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Container Max-Width (px)</Label>
              <Input
                type="number"
                value={customStyles.maxWidth || 1200}
                onChange={(e) => updateStyle({ maxWidth: parseInt(e.target.value, 10) || 1200 })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
