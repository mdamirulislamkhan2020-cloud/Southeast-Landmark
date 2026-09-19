import React, { useState, useRef } from "react";
import type { PageBlock } from "../api/lead-pages";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  Flame,
  Type,
  Image,
  CheckSquare,
  Hash,
  HelpCircle,
  MessageSquare,
  Building,
  FileText,
  ClipboardList,
  Phone,
  MapPin,
  Sparkles,
  Layers,
  Edit3,
} from "lucide-react";
import { type VisualElementDefinition } from "./VisualBuilderElements";

interface VisualCanvasProps {
  blocks: PageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlockData: (blockId: string, patch: Record<string, unknown>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: "up" | "down") => void;
  onReorderBlocks: (fromIndex: number, toIndex: number) => void;
  onInsertElementAtIndex: (def: VisualElementDefinition, index: number) => void;
  onOpenMediaPicker?: (blockId: string, field: string) => void;
  viewport: "desktop" | "tablet" | "mobile";
  previewMode: boolean;
  pageFormId?: string | null;
}

const BLOCK_TYPE_LABELS: Record<string, { label: string; icon: typeof Layers }> = {
  hero: { label: "Hero Section", icon: Flame },
  text: { label: "Text & Headings", icon: Type },
  image: { label: "Image", icon: Image },
  features: { label: "Features Grid", icon: CheckSquare },
  counter: { label: "Stats Counter", icon: Hash },
  faq: { label: "FAQ Accordion", icon: HelpCircle },
  testimonials: { label: "Testimonials", icon: MessageSquare },
  cta: { label: "Call to Action", icon: Sparkles },
  property_grid: { label: "Property Grid", icon: Building },
  blog_grid: { label: "Blog Grid", icon: FileText },
  lead_form: { label: "Lead Form", icon: ClipboardList },
  contact: { label: "Contact Info", icon: Phone },
  map: { label: "Google Map", icon: MapPin },
  gallery: { label: "Image Gallery", icon: Image },
  video: { label: "Video", icon: Flame },
  html: { label: "HTML Code", icon: Layers },
  spacing: { label: "Spacer", icon: Layers },
  divider: { label: "Divider", icon: Layers },
};

export function VisualCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlockData,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onReorderBlocks,
  onInsertElementAtIndex,
  onOpenMediaPicker,
  viewport,
  previewMode,
  pageFormId,
}: VisualCanvasProps) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingBlockIndex, setDraggingBlockIndex] = useState<number | null>(null);
  const [inlineEditingField, setInlineEditingField] = useState<string | null>(null);

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px] shadow-2xl border-x border-border/80 my-4 rounded-xl min-h-[800px]";
      case "tablet":
        return "max-w-[768px] shadow-xl border-x border-border/80 my-4 rounded-lg min-h-[900px]";
      case "desktop":
      default:
        return "w-full max-w-full";
    }
  };

  const handleDragOverZone = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleDropOnZone = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    // If dropped from element drawer
    const elementData = e.dataTransfer.getData("application/json");
    if (elementData) {
      try {
        const def = JSON.parse(elementData) as VisualElementDefinition;
        onInsertElementAtIndex(def, index);
        return;
      } catch {}
    }

    // If reordering existing block
    if (draggingBlockIndex !== null) {
      onReorderBlocks(draggingBlockIndex, index);
      setDraggingBlockIndex(null);
    }
  };

  return (
    <div
      className="flex-1 h-full overflow-y-auto bg-muted/20 flex flex-col items-center relative select-text"
      onClick={(e) => {
        // If clicking on the background canvas, deselect
        if (e.target === e.currentTarget) {
          onSelectBlock("");
        }
      }}
    >
      <div
        className={`transition-all duration-300 bg-background relative flex flex-col ${getViewportWidthClass()}`}
        style={{ minHeight: "100%" }}
      >
        {/* Top Drop Zone */}
        {!previewMode && (
          <div
            onDragOver={(e) => handleDragOverZone(e, 0)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => handleDropOnZone(e, 0)}
            className={`transition-all ${
              dragOverIndex === 0 ? "h-10 bg-primary/20 border-2 border-dashed border-primary rounded m-2 flex items-center justify-center text-xs font-semibold text-primary" : "h-2"
            }`}
          >
            {dragOverIndex === 0 && "+ Drop element at the very top"}
          </div>
        )}

        {/* Empty Canvas State */}
        {blocks.length === 0 && !previewMode && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-12 border-2 border-dashed border-border/80 rounded-2xl mx-8 bg-card/50">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Your page canvas is currently empty
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Drag elements from the left panel or click any category to build your layout.
            </p>
          </div>
        )}

        {/* Rendered Block List with Elementor-Style Overlays */}
        {blocks.map((block, index) => {
          const isSelected = selectedBlockId === block.id && !previewMode;
          const isHovered = hoveredBlockId === block.id && !previewMode && !isSelected;
          const meta = BLOCK_TYPE_LABELS[block.type] || { label: block.type, icon: Layers };
          const Icon = meta.icon;
          const customStyles = (block.data?.customStyles ?? {}) as Record<string, any>;

          // Apply responsive visibility styles in preview if simulated
          const hideInViewport =
            (viewport === "desktop" && customStyles.showDesktop === false) ||
            (viewport === "tablet" && customStyles.showTablet === false) ||
            (viewport === "mobile" && customStyles.showMobile === false);

          if (previewMode && hideInViewport) {
            return null;
          }

          return (
            <React.Fragment key={block.id}>
              <div
                id={`canvas-block-${block.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBlock(block.id);
                }}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                className={`relative transition-all duration-150 ${
                  previewMode
                    ? ""
                    : isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-20"
                    : isHovered
                    ? "ring-1 ring-primary/40 ring-offset-1 ring-offset-background z-10"
                    : ""
                }`}
                style={{
                  opacity: hideInViewport ? 0.4 : 1,
                  backgroundColor: customStyles.bgColor || undefined,
                  color: customStyles.textColor || undefined,
                  paddingTop: customStyles.paddingY !== undefined ? `${customStyles.paddingY}px` : undefined,
                  paddingBottom: customStyles.paddingY !== undefined ? `${customStyles.paddingY}px` : undefined,
                  borderRadius: customStyles.borderRadius ? `${customStyles.borderRadius}px` : undefined,
                }}
              >
                {/* FLOATING ACTION TOOLBAR ON SELECTED BLOCK */}
                {isSelected && (
                  <div className="absolute -top-9 left-2 z-30 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-t-md shadow-md text-xs select-none">
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggingBlockIndex(index);
                        e.dataTransfer.setData("text/plain", block.id);
                      }}
                      className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-primary-foreground/20 rounded mr-1"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    <span className="font-semibold">{meta.label}</span>

                    <div className="h-3 w-px bg-primary-foreground/30 mx-1" />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "up");
                      }}
                      className="p-1 hover:bg-primary-foreground/20 rounded"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "down");
                      }}
                      className="p-1 hover:bg-primary-foreground/20 rounded"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateBlock(block.id);
                      }}
                      className="p-1 hover:bg-primary-foreground/20 rounded"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="p-1 hover:bg-destructive/80 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* HOVER BADGE ON UNSELECTED BLOCK */}
                {isHovered && !isSelected && (
                  <div className="absolute top-1 left-2 z-20 flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-[11px] font-medium shadow pointer-events-none select-none">
                    <Icon className="h-3 w-3" />
                    <span>{meta.label}</span>
                  </div>
                )}

                {/* ACTUAL BLOCK RENDERING */}
                <div className="relative">
                  <SectionRenderer
                    block={block}
                    isEditable={!previewMode}
                    onUpdateField={(field, value) => onUpdateBlockData(block.id, { [field]: value })}
                    onOpenMedia={(field) => onOpenMediaPicker?.(block.id, field)}
                    containerWidth={customStyles.maxWidth || 1200}
                    pageFormId={pageFormId ?? null}
                  />

                  {/* INLINE EDITABLE OVERLAY FOR COMMON TEXT BLOCKS (Double-click or click to edit in-place) */}
                  {isSelected && (block.type === "hero" || block.type === "text" || block.type === "cta") && (
                    <div className="absolute top-3 right-3 z-30 bg-background/90 backdrop-blur-xs border border-border/80 shadow-md rounded-md px-2.5 py-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Edit3 className="h-3 w-3 text-primary" />
                      <span>Edit values in right panel or inline</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inter-block Drop Zone */}
              {!previewMode && (
                <div
                  onDragOver={(e) => handleDragOverZone(e, index + 1)}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => handleDropOnZone(e, index + 1)}
                  className={`transition-all ${
                    dragOverIndex === index + 1
                      ? "h-10 bg-primary/20 border-2 border-dashed border-primary rounded m-2 flex items-center justify-center text-xs font-semibold text-primary"
                      : "h-2 hover:h-4"
                  }`}
                >
                  {dragOverIndex === index + 1 && "+ Drop element here"}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
