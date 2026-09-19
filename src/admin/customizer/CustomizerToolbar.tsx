import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  RotateCcw,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ViewportMode } from "./types";
import { cn } from "@/lib/utils";

interface CustomizerToolbarProps {
  viewport: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  previewPage: string;
  onPreviewPageChange: (page: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

const PREVIEW_PAGES = [
  { label: "Home Page (/)", value: "/" },
  { label: "About Page (/about)", value: "/about" },
  { label: "Projects / Properties (/property)", value: "/property" },
  { label: "Blog (/blog)", value: "/blog" },
  { label: "FAQ (/faq)", value: "/faq" },
  { label: "Contact Us (/contact)", value: "/contact" },
];

export function CustomizerToolbar({
  viewport,
  onViewportChange,
  previewPage,
  onPreviewPageChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSave,
  isSaving,
  isDirty,
}: CustomizerToolbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 text-card-foreground select-none">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </Button>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div>
          <span className="font-display text-sm font-semibold text-foreground">
            Site Customizer
          </span>
          <span className="ml-2 hidden text-[11px] text-muted-foreground md:inline">
            Global Header, Footer & Tokens
          </span>
        </div>
      </div>

      {/* Center: Device Switcher & Page Selector */}
      <div className="flex items-center gap-3">
        {/* Page Switcher */}
        <div className="w-40 sm:w-48">
          <Select value={previewPage} onValueChange={onPreviewPageChange}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREVIEW_PAGES.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-background/50 p-0.5">
          <button
            type="button"
            title="Desktop view"
            onClick={() => onViewportChange("desktop")}
            className={cn(
              "rounded-md p-1.5 transition",
              viewport === "desktop"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Tablet view (768px)"
            onClick={() => onViewportChange("tablet")}
            className={cn(
              "rounded-md p-1.5 transition",
              viewport === "tablet"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Mobile view (390px)"
            onClick={() => onViewportChange("mobile")}
            className={cn(
              "rounded-md p-1.5 transition",
              viewport === "mobile"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 text-xs hidden lg:inline-flex"
        >
          <a href={previewPage} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Live
          </a>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          onClick={onReset}
          title="Reset to defaults"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
        </Button>

        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{isDirty ? "Save Changes" : "Saved"}</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
