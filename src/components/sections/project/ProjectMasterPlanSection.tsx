import React, { useState } from "react";
import {
  Layers,
  ZoomIn,
  Download,
  CheckCircle2,
  TreePine,
  Maximize2,
  X,
  Compass,
  Building,
  Sparkles,
  Info,
} from "lucide-react";

interface ProjectMasterPlanSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
}

export function ProjectMasterPlanSection({
  data,
  isEditable = false,
  onUpdateField,
  onOpenMedia,
}: ProjectMasterPlanSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "MASTER PLAN";
  const title = d.title ?? "Township Master Layout & Key Metrics";
  const subtitle =
    d.subtitle ??
    "Engineered with human-centric zoning, expansive green buffers, and a hierarchical road network to deliver an idyllic residential ecosystem for generations to come.";
  const customPlanImage = d.masterPlanImage || d.image || d.src || null;

  const [activeBlock, setActiveBlock] = useState<"all" | "A" | "B" | "C" | "D">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const defaultBlockDetails = {
    all: {
      title: "Comprehensive Master Township",
      description:
        "Holistic 100+ Acre master layout incorporating 4 residential sectors, central commercial frontage, 60ft main boulevard, natural lakefront promenade, and comprehensive civic reservations.",
      features: [
        "100+ Acres Planned Township",
        "60ft Boulevard Spine",
        "Central Lake & Green Spine",
        "Dedicated Civic Corridors",
      ],
      plots: "3, 5, 10 Katha & Commercial",
    },
    A: {
      title: "Block A — Executive Boulevard Frontline",
      description:
        "Direct frontage on the 60ft Grand Boulevard and central gateway. Prime zoning for premium residences, corporate offices, healthcare facilities, and prestigious commercial addresses.",
      features: [
        "Direct 60ft Grand Boulevard Access",
        "Frontline Commercial Strips",
        "High Capital Appreciation Potential",
        "Wide 40ft Internal Roads",
      ],
      plots: "5 Katha, 10 Katha & Commercial",
    },
    B: {
      title: "Block B — Lakeside & Central Park Enclave",
      description:
        "Nestled along the natural waterbody and 5-acre landscaped central park. Quiet residential cul-de-sacs with waterfront jogging trails and abundant open space.",
      features: [
        "Direct Lakefront Promenade Access",
        "Adjacent to Central Park & Children's Play Zone",
        "Exclusive Residential Street Layout",
        "No Through Traffic",
      ],
      plots: "3 Katha & 5 Katha Residential",
    },
    C: {
      title: "Block C — Family Living & Civic Community",
      description:
        "The spiritual and educational heart of Southeast City. Walking distance to the Grand Central Mosque, English-medium school campus, and neighborhood health clinic.",
      features: [
        "Grand Central Mosque Walkability",
        "Planned International Standard School",
        "Community Wellness & Clinic Hub",
        "Neighborhood Daily Market",
      ],
      plots: "3 Katha, 5 Katha & Corner Plots",
    },
    D: {
      title: "Block D — Nature Meadow & Future Expansion",
      description:
        "Spacious suburban living surrounded by lush agro-green buffers and open nature breezes. Ideal for long-term family estates and high-yield strategic investment.",
      features: [
        "Expansive Green Open Fields",
        "Low-Density Residential Layout",
        "Unobstructed Natural Airflow",
        "Flexible Installment Terms",
      ],
      plots: "3 Katha & 5 Katha Plots",
    },
  };

  const blockDetails = {
    ...defaultBlockDetails,
    ...(d.sectors || d.blockDetails || {}),
  };

  const defaultMetrics = [
    { label: "Township Footprint", value: "100+ Acres", hint: "Continuous master development" },
    { label: "Road Infrastructure", value: "28% Area", hint: "60ft, 40ft & 30ft paved roads" },
    { label: "Green & Waterbodies", value: "32% Area", hint: "Parks, lake & promenade" },
    {
      label: "Planned Plots",
      value: "3, 5, 10 Katha",
      hint: "Mutation-ready residential & commercial",
    },
  ];

  const metrics =
    Array.isArray(d.metrics) && d.metrics.length > 0
      ? d.metrics
      : Array.isArray(d.stats) && d.stats.length > 0
      ? d.stats
      : defaultMetrics;

  const selected = blockDetails[activeBlock];

  return (
    <section id="master-plan" className="w-full py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("eyebrow", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition"
                >
                  {eyebrow}
                </span>
              ) : (
                eyebrow
              )}
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
                >
                  {title}
                </span>
              ) : (
                title
              )}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
                >
                  {subtitle}
                </span>
              ) : (
                subtitle
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm hover:border-primary/50 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              <span>Full Screen Plan</span>
            </button>

            <a
              href="#site-visit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Request Layout PDF</span>
            </a>
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {(["all", "A", "B", "C", "D"] as const).map((blockKey) => (
            <button
              key={blockKey}
              type="button"
              onClick={() => setActiveBlock(blockKey)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeBlock === blockKey
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {blockKey === "all" ? "Master Township View" : `Block ${blockKey}`}
            </button>
          ))}
        </div>

        {/* Master Plan Visual & Detail Canvas */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Master Layout Architectural Visualizer */}
          <div className="lg:col-span-8 rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm flex flex-col justify-between relative group">
            {customPlanImage ? (
              <div className="relative w-full h-[460px] sm:h-[540px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={customPlanImage}
                  alt="Southeast City Master Plan Layout"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              /* Structured Architectural Vector Blueprint */
              <div className="relative w-full h-[460px] sm:h-[540px] bg-slate-900/95 overflow-hidden p-6 sm:p-8 flex flex-col justify-between text-white">
                {/* Subtle blueprint grid backdrop */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #4ade80 1px, transparent 1px), linear-gradient(to bottom, #4ade80 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Top Blueprint Bar */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-primary uppercase">
                      ARCHITECTURAL MASTER SCHEMATIC
                    </span>
                    <h4 className="font-display text-lg font-bold text-white">
                      SOUTHEAST CITY TOWNSHIP LAYOUT
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">LOCATION</span>
                    <span className="text-xs font-semibold text-white">Bonogram, Savar</span>
                  </div>
                </div>

                {/* Interactive Schematic Diagram */}
                <div className="relative z-10 my-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4">
                  {/* Sector A */}
                  <div
                    onClick={() => setActiveBlock("A")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      activeBlock === "A" || activeBlock === "all"
                        ? "border-primary bg-primary/20 shadow-lg shadow-primary/20 scale-[1.02]"
                        : "border-white/15 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary">BLOCK A</span>
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white">Executive Boulevard</p>
                    <span className="text-[10px] text-slate-300 block mt-1">60ft Road Access</span>
                    <div className="mt-3 text-[10px] font-mono text-primary font-semibold">
                      5 & 10 Katha · Commercial
                    </div>
                  </div>

                  {/* Sector B */}
                  <div
                    onClick={() => setActiveBlock("B")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      activeBlock === "B" || activeBlock === "all"
                        ? "border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/20 scale-[1.02]"
                        : "border-white/15 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">BLOCK B</span>
                      <TreePine className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white">Lakeside Enclave</p>
                    <span className="text-[10px] text-slate-300 block mt-1">Central Park View</span>
                    <div className="mt-3 text-[10px] font-mono text-cyan-300 font-semibold">
                      3 & 5 Katha Residential
                    </div>
                  </div>

                  {/* Sector C */}
                  <div
                    onClick={() => setActiveBlock("C")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      activeBlock === "C" || activeBlock === "all"
                        ? "border-amber-400 bg-amber-400/20 shadow-lg shadow-amber-400/20 scale-[1.02]"
                        : "border-white/15 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">BLOCK C</span>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white">Community & Civic Hub</p>
                    <span className="text-[10px] text-slate-300 block mt-1">
                      Mosque & School Zone
                    </span>
                    <div className="mt-3 text-[10px] font-mono text-amber-300 font-semibold">
                      3 & 5 Katha · Corner
                    </div>
                  </div>

                  {/* Sector D */}
                  <div
                    onClick={() => setActiveBlock("D")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      activeBlock === "D" || activeBlock === "all"
                        ? "border-emerald-400 bg-emerald-400/20 shadow-lg shadow-emerald-400/20 scale-[1.02]"
                        : "border-white/15 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">BLOCK D</span>
                      <Compass className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white">Nature Meadow</p>
                    <span className="text-[10px] text-slate-300 block mt-1">
                      Green Buffer Corridor
                    </span>
                    <div className="mt-3 text-[10px] font-mono text-emerald-300 font-semibold">
                      3 & 5 Katha Plots
                    </div>
                  </div>
                </div>

                {/* Central Road Spine Banner */}
                <div className="relative z-10 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold text-white">60-ft Grand Entrance Boulevard</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      — Tree-Lined Dual Carriage Central Arterial
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-300">
                    <span>40ft Secondary Roads</span>
                    <span>·</span>
                    <span>30ft Inner Loops</span>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Media Upload helper when editable */}
            {isEditable && (
              <div className="p-3 bg-muted/60 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Master Plan Image: {customPlanImage ? "Custom Uploaded" : "Vector Schematic"}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenMedia?.("masterPlanImage")}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Upload/Select Official Layout Image
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Selected Sector Details & Features */}
          <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-mono font-semibold text-primary uppercase">
                  SECTOR SPECIFICATIONS
                </span>
                <span className="text-xs font-semibold text-foreground bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {activeBlock === "all" ? "Master Township" : `Sector ${activeBlock}`}
                </span>
              </div>

              <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold text-foreground">
                {selected.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selected.description}
              </p>

              <div className="mt-6 space-y-2.5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Sector Highlights:
                </span>
                {selected.features.map((feat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground block">
                  Available Plot Sizes
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">{selected.plots}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60">
              <a
                href="#site-visit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Inquire About Block {activeBlock === "all" ? "A–D" : activeBlock}
              </a>
            </div>
          </div>
        </div>

        {/* Quantitative Layout Metrics */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m: any, idx: number) => {
            const label = m.label || m.k || "Metric";
            const val = m.value || m.v || "";
            const hint = m.hint || m.desc || "";
            return (
              <div key={idx} className="rounded-2xl border border-border/60 bg-card p-5">
                <span className="text-xs text-muted-foreground block">{label}</span>
                <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  {val}
                </p>
                {hint && (
                  <span className="text-[11px] text-primary font-medium mt-1 block">
                    {hint}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-card rounded-3xl border border-border p-6 overflow-auto">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/80 text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold mb-4">
              Southeast City Master Layout Plan
            </h3>
            <div className="rounded-2xl overflow-hidden border border-border/60 bg-slate-900 p-8 min-h-[400px] flex items-center justify-center">
              {customPlanImage ? (
                <img
                  src={customPlanImage}
                  alt="Southeast City Master Plan"
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center text-white space-y-3">
                  <Layers className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-bold text-lg">Official Master Plan Blueprint</p>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Southeast City Bonogram Savar: Blocks A, B, C, D with 60-ft Boulevard, 40-ft
                    internal roads, lakefront park, grand mosque, school and commercial sector.
                  </p>
                  <div className="pt-4">
                    <a
                      href="#site-visit"
                      onClick={() => setLightboxOpen(false)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground"
                    >
                      Book Guided Site Visit to View Physical Blueprint
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
