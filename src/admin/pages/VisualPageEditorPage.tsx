import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPage, updatePage, createPage, listPages } from "../api/client";
import { listForms } from "../api/forms-client";
import type { CmsPage, PageStatus } from "../api/types";
import type { PageBlock } from "../api/lead-pages";
import { VisualElementsDrawer } from "../visual-builder/VisualElementsDrawer";
import { VisualCanvas } from "../visual-builder/VisualCanvas";
import { VisualInspectorSidebar } from "../visual-builder/VisualInspectorSidebar";
import { MediaPickerDialog } from "../visual-builder/MediaPickerDialog";
import { createBlockFromDefinition, type VisualElementDefinition } from "../visual-builder/VisualBuilderElements";
import { Button } from "@/components/ui/button";
import { PageStatusBadge } from "../components/PageStatusBadge";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Send,
  Globe,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  Settings2,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/error-handler";

const MAX_HISTORY = 30;

export function VisualPageEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading: isPageLoading } = useQuery({
    queryKey: ["page", id],
    queryFn: () => getPage(id!),
    enabled: !isNew,
  });

  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });

  // Page State
  const [form, setForm] = useState<Partial<CmsPage>>({
    title: "",
    slug: "",
    parentId: null,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonical: "",
    ogImage: null,
    content: "",
    publishAt: null,
    formId: null,
    blocks: [],
    showInNav: true,
    template: "builder",
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canvasMediaPicker, setCanvasMediaPicker] = useState<{
    open: boolean;
    blockId: string | null;
    field: string;
  }>({ open: false, blockId: null, field: "image" });
  const lastHydratedPageId = useRef<string | null>(null);
  const bypassGuardRef = useRef(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<PageBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Snapshot for dirty state tracking
  const snapshotOf = useCallback(
    (f: Partial<CmsPage>) =>
      JSON.stringify({
        title: f.title ?? "",
        slug: f.slug ?? "",
        status: f.status ?? "draft",
        seoTitle: f.seoTitle ?? "",
        seoDescription: f.seoDescription ?? "",
        seoKeywords: f.seoKeywords ?? "",
        ogImage: f.ogImage ?? null,
        formId: f.formId ?? null,
        blocks: f.blocks ?? [],
        template: f.template ?? "builder",
      }),
    [],
  );

  const [baseline, setBaseline] = useState<string>("");
  const isDirty = useMemo(() => baseline !== "" && snapshotOf(form) !== baseline, [form, baseline, snapshotOf]);

  // Hydrate Page from Supabase
  useEffect(() => {
    if (existing && existing.id !== lastHydratedPageId.current) {
      const hydrated: Partial<CmsPage> = {
        blocks: [],
        showInNav: true,
        template: "builder",
        formId: null,
        seoKeywords: "",
        ogImage: null,
        canonical: "",
        ...existing,
      };
      setForm(hydrated);
      setBaseline(snapshotOf(hydrated));
      lastHydratedPageId.current = existing.id;

      // Initialize history stack
      const initialBlocks = (hydrated.blocks || []) as PageBlock[];
      setHistory([initialBlocks]);
      setHistoryIndex(0);
    }
  }, [existing, snapshotOf]);

  // Push new state to history stack
  const pushBlocksWithHistory = (nextBlocks: PageBlock[]) => {
    setForm((prev) => ({ ...prev, blocks: nextBlocks }));

    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, nextBlocks];
      if (updated.length > MAX_HISTORY) {
        return updated.slice(updated.length - MAX_HISTORY);
      }
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const targetBlocks = history[newIndex];
      setForm((prev) => ({ ...prev, blocks: targetBlocks }));
      toast.info("Undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const targetBlocks = history[newIndex];
      setForm((prev) => ({ ...prev, blocks: targetBlocks }));
      toast.info("Redo");
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save("draft");
      } else if (e.key === "Escape") {
        setSelectedBlockId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  // Unsaved Changes Navigation Guards
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleLinkClick = (e: MouseEvent) => {
      if (bypassGuardRef.current) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      const ok = window.confirm("You have unsaved changes. Leave without saving?");
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [isDirty]);

  // BLOCK MANIPULATION HANDLERS
  const currentBlocks: PageBlock[] = form.blocks || [];

  const handleAddElement = (def: VisualElementDefinition) => {
    const newBlock = createBlockFromDefinition(def);
    const next = [...currentBlocks, newBlock];
    pushBlocksWithHistory(next);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${def.label}`);
  };

  const handleInsertElementAtIndex = (def: VisualElementDefinition, index: number) => {
    const newBlock = createBlockFromDefinition(def);
    const next = [...currentBlocks];
    next.splice(index, 0, newBlock);
    pushBlocksWithHistory(next);
    setSelectedBlockId(newBlock.id);
    toast.success(`Inserted ${def.label}`);
  };

  const handleUpdateBlockData = (blockId: string, patch: Record<string, unknown>) => {
    const next = currentBlocks.map((b) =>
      b.id === blockId ? { ...b, data: { ...b.data, ...patch } } : b,
    );
    pushBlocksWithHistory(next);
  };

  const handleDeleteBlock = (blockId: string) => {
    const target = currentBlocks.find((b) => b.id === blockId);
    const next = currentBlocks.filter((b) => b.id !== blockId);
    pushBlocksWithHistory(next);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    toast.success(`Removed ${target?.type || "block"}`);
  };

  const handleDuplicateBlock = (blockId: string) => {
    const srcIndex = currentBlocks.findIndex((b) => b.id === blockId);
    if (srcIndex < 0) return;
    const src = currentBlocks[srcIndex];
    const uid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const copy: PageBlock = {
      ...src,
      id: uid,
      data: JSON.parse(JSON.stringify(src.data)),
    };
    const next = [...currentBlocks];
    next.splice(srcIndex + 1, 0, copy);
    pushBlocksWithHistory(next);
    setSelectedBlockId(copy.id);
    toast.success("Duplicated block");
  };

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const from = currentBlocks.findIndex((b) => b.id === blockId);
    if (from < 0) return;
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= currentBlocks.length) return;

    const list = [...currentBlocks];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    pushBlocksWithHistory(list);
  };

  const handleReorderBlocks = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= currentBlocks.length) return;
    const list = [...currentBlocks];
    const [moved] = list.splice(fromIndex, 1);
    const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
    list.splice(insertAt, 0, moved);
    pushBlocksWithHistory(list);
  };

  const handleDragStartFromDrawer = (e: React.DragEvent, def: VisualElementDefinition) => {
    e.dataTransfer.setData("application/json", JSON.stringify(def));
  };

  // PERSISTENCE & PUBLISHING
  const save = async (status?: PageStatus, opts?: { silent?: boolean; successMessage?: string }) => {
    if (saving) return;
    try {
      setSaving(true);
      const payload = { ...form, ...(status ? { status } : {}) };
      if (!payload.title) {
        toast.error("Page Title is required");
        return null;
      }
      if (!payload.slug) {
        toast.error("URL Slug is required");
        return null;
      }

      if (isNew) {
        const created = await createPage(payload);
        setForm(created);
        setBaseline(snapshotOf(created));
        lastHydratedPageId.current = created.id;
        toast.success(opts?.successMessage ?? "Page created");
        qc.invalidateQueries({ queryKey: ["pages"] });
        bypassGuardRef.current = true;
        nav(`/admin/pages/${created.id}/edit`, { replace: true });
        return created;
      } else {
        const saved = await updatePage(id!, payload);
        setForm(saved);
        setBaseline(snapshotOf(saved));
        lastHydratedPageId.current = saved.id;
        if (opts?.successMessage) toast.success(opts.successMessage);
        else if (!opts?.silent) toast.success("Draft saved successfully");

        qc.setQueryData(["page", id], saved);
        qc.invalidateQueries({ queryKey: ["pages"] });
        qc.invalidateQueries({ queryKey: ["page", id] });
        return saved;
      }
    } catch (e) {
      toast.error(toErrorMessage(e));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const doPublish = async () => {
    await save("published", { successMessage: "Page published — live on website! 🎉" });
  };

  const doUnpublish = async () => {
    await save("draft", { successMessage: "Reverted to Draft" });
  };

  const selectedBlock = currentBlocks.find((b) => b.id === selectedBlockId) ?? null;

  if (isPageLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading Visual Page Builder...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none">
      {/* TOP NAVIGATION BAR */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-40">
        {/* Left Side: Back & Page Title */}
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost" className="h-8 px-2.5">
            <Link to="/admin/pages">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Pages</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm max-w-[200px] truncate text-foreground">
              {form.title || "Untitled Page"}
            </span>
            <PageStatusBadge status={(form.status ?? "draft") as PageStatus} />
            {isDirty && (
              <span className="text-[11px] font-medium text-amber-500 uppercase tracking-wide flex items-center gap-1">
                ● Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Center: Undo/Redo & Responsive Viewport Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-secondary/40 p-0.5 rounded-lg border border-border/60">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-0.5 bg-secondary/40 p-0.5 rounded-lg border border-border/60">
            <Button
              size="sm"
              variant={viewport === "desktop" ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setViewport("desktop")}
              title="Desktop View (100%)"
            >
              <Monitor className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden md:inline">Desktop</span>
            </Button>
            <Button
              size="sm"
              variant={viewport === "tablet" ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setViewport("tablet")}
              title="Tablet View (768px)"
            >
              <Tablet className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden md:inline">Tablet</span>
            </Button>
            <Button
              size="sm"
              variant={viewport === "mobile" ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setViewport("mobile")}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden md:inline">Mobile</span>
            </Button>
          </div>
        </div>

        {/* Right Side: Preview & Save / Publish Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Clean Preview */}
          <Button
            size="sm"
            variant={previewMode ? "secondary" : "outline"}
            className="h-8 text-xs px-2.5"
            onClick={() => {
              setPreviewMode(!previewMode);
              if (!previewMode) setSelectedBlockId(null);
            }}
            title={previewMode ? "Exit Preview" : "Live Preview Mode"}
          >
            {previewMode ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            <span className="hidden lg:inline">{previewMode ? "Editing" : "Preview"}</span>
          </Button>

          {/* View Live Public URL */}
          {!isNew && form.slug && (
            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs hidden sm:inline-flex">
              <a href={form.slug} target="_blank" rel="noreferrer">
                <Globe className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                <span className="hidden lg:inline">Live Page</span>
              </a>
            </Button>
          )}

          {/* Save Draft */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => save("draft")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            <span>Save Draft</span>
          </Button>

          {/* Publish / Unpublish */}
          {form.status === "published" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs border-amber-500/50 text-amber-500 hover:text-amber-400"
              onClick={doUnpublish}
              disabled={saving}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>Unpublish</span>
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
              onClick={doPublish}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              <span>Publish</span>
            </Button>
          )}
        </div>
      </header>

      {/* MAIN BUILDER WORKSPACE (Left Drawer | Live Canvas | Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Elements Library Drawer */}
        {!previewMode && leftDrawerOpen && (
          <VisualElementsDrawer
            onAddElement={handleAddElement}
            onDragStart={handleDragStartFromDrawer}
          />
        )}

        {/* Center Live Interactive Canvas */}
        <VisualCanvas
          blocks={currentBlocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlockData={handleUpdateBlockData}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onMoveBlock={handleMoveBlock}
          onReorderBlocks={handleReorderBlocks}
          onInsertElementAtIndex={handleInsertElementAtIndex}
          onOpenMediaPicker={(blockId, field) => {
            setSelectedBlockId(blockId);
            setCanvasMediaPicker({ open: true, blockId, field });
          }}
          viewport={viewport}
          previewMode={previewMode}
          pageFormId={form.formId}
        />

        {/* Right Inspector & Settings Sidebar */}
        {!previewMode && rightDrawerOpen && (
          <VisualInspectorSidebar
            page={form}
            onUpdatePage={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            selectedBlock={selectedBlock}
            onUpdateBlockData={handleUpdateBlockData}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveBlock={handleMoveBlock}
            onDeselect={() => setSelectedBlockId(null)}
            forms={forms}
          />
        )}
      </div>

      {/* Direct Canvas Media Picker */}
      <MediaPickerDialog
        open={canvasMediaPicker.open}
        onOpenChange={(open) => setCanvasMediaPicker((prev) => ({ ...prev, open }))}
        onSelect={(url) => {
          if (canvasMediaPicker.blockId && url) {
            handleUpdateBlockData(canvasMediaPicker.blockId, { [canvasMediaPicker.field]: url });
            toast.success("Image updated successfully");
          }
        }}
      />
    </div>
  );
}
