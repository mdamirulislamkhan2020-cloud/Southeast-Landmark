import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Layers, Grid, Sparkles, Database } from "lucide-react";
import { VISUAL_ELEMENTS, type VisualElementDefinition } from "./VisualBuilderElements";

interface VisualElementsDrawerProps {
  onAddElement: (def: VisualElementDefinition) => void;
  onDragStart: (e: React.DragEvent, def: VisualElementDefinition) => void;
}

export function VisualElementsDrawer({ onAddElement, onDragStart }: VisualElementsDrawerProps) {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Layout" | "Basic" | "Content" | "Dynamic">("All");

  const categories = ["All", "Layout", "Basic", "Content", "Dynamic"] as const;

  const filtered = useMemo(() => {
    return VISUAL_ELEMENTS.filter((el) => {
      if (activeTab !== "All" && el.category !== activeTab) return false;
      if (q && !(el.label + el.description + el.category).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, activeTab]);

  return (
    <div className="w-80 h-full border-r border-border bg-card flex flex-col select-none shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm tracking-tight text-foreground">Elements</h2>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {VISUAL_ELEMENTS.length} Blocks
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveTab(c)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeTab === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            No matching elements found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((el) => {
              const Icon = el.icon;
              return (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, el)}
                  onClick={() => onAddElement(el)}
                  className="group relative flex flex-col items-center justify-center p-3.5 rounded-lg border border-border/70 bg-background hover:border-primary/60 hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-all text-center shadow-xs"
                >
                  <div className="h-9 w-9 rounded-md bg-secondary/60 group-hover:bg-primary/10 flex items-center justify-center text-foreground group-hover:text-primary transition-colors mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground tracking-tight line-clamp-1">
                    {el.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground scale-90 line-clamp-1 opacity-75">
                    {el.category}
                  </span>

                  {/* Plus Icon On Hover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded p-0.5 shadow">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Helper */}
      <div className="p-3 border-t border-border bg-secondary/15 text-[11px] text-muted-foreground flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>Click or drag elements onto the canvas to insert.</span>
      </div>
    </div>
  );
}
