import React from "react";
import {
  Building2,
  Compass,
  Layers,
  ShieldCheck,
  TreePine,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface ProjectBlocksSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectBlocksSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectBlocksSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "ZONING & SECTORS";
  const title = d.title ?? "Block-Wise Planning Architecture";
  const subtitle =
    d.subtitle ??
    "Every block is master-planned with distinct architectural zoning, dedicated road reservations, and easy access to neighborhood social infrastructure.";
  const blockCtaLabel = d.ctaLabel !== undefined ? d.ctaLabel : "Inquire";
  const blockCtaHref = d.ctaHref ?? "#site-visit";
  const showBlockCta =
    d.showCta !== false && (d.ctaLabel === undefined || Boolean(d.ctaLabel && String(d.ctaLabel).trim().length > 0));

  const defaultBlocks = [
    {
      code: "BLOCK A",
      name: "Executive Boulevard & Commercial Frontage",
      highlight: "Frontline 60-ft Road Access",
      color: "border-primary/50 text-primary",
      bgBadge: "bg-primary/10 text-primary",
      description:
        "Positioned right at the grand township entrance along the 60-ft boulevard. Features prime residential plots and dedicated commercial strips suitable for brand outlets, offices, and clinics.",
      specs: [
        { label: "Plot Sizes", value: "5 Katha, 10 Katha & Commercial" },
        { label: "Front Road Width", value: "60-ft Main Boulevard" },
        { label: "Internal Roads", value: "40-ft Paved Avenues" },
        { label: "Orientation", value: "North & South Facing" },
      ],
      features: [
        "Direct grand entrance connectivity",
        "Commercial and retail arcade frontage",
        "Underground cabling & drainage",
        "Prime capital value growth",
      ],
    },
    {
      code: "BLOCK B",
      name: "Lakeside & Central Parkside Enclave",
      highlight: "Waterfront Serenity & Parks",
      color: "border-cyan-500/50 text-cyan-500",
      bgBadge: "bg-cyan-500/10 text-cyan-500",
      description:
        "Surrounded by the natural lake promenade and a 5-acre central green park. Quiet residential cul-de-sacs designed specifically for families desiring fresh air and waterfront lifestyle.",
      specs: [
        { label: "Plot Sizes", value: "3 Katha & 5 Katha Residential" },
        { label: "Front Road Width", value: "40-ft Connecting Avenue" },
        { label: "Internal Roads", value: "30-ft Residential Loops" },
        { label: "Orientation", value: "Lakeview East & South Facing" },
      ],
      features: [
        "Direct lake walkway & jogging track",
        "Adjacent to central children’s playground",
        "Zero through-traffic residential privacy",
        "Abundant morning sunlight and breeze",
      ],
    },
    {
      code: "BLOCK C",
      name: "Civic Community & Educational Hub",
      highlight: "Mosque & School Walkability",
      color: "border-amber-500/50 text-amber-500",
      bgBadge: "bg-amber-500/10 text-amber-500",
      description:
        "The social heart of Southeast City. Perfectly situated within comfortable walking distance of the Grand Central Mosque, English-medium school, and neighborhood healthcare center.",
      specs: [
        { label: "Plot Sizes", value: "3 Katha, 5 Katha & Corner" },
        { label: "Front Road Width", value: "40-ft Community Boulevard" },
        { label: "Internal Roads", value: "30-ft Paved Streets" },
        { label: "Orientation", value: "Multiple Corner & Open Plot Options" },
      ],
      features: [
        "Walking distance to Grand Central Mosque",
        "Integrated school and playground zone",
        "Neighborhood primary healthcare clinic",
        "Daily community bazaar complex",
      ],
    },
    {
      code: "BLOCK D",
      name: "Nature Meadow & Extended Township",
      highlight: "Low-Density Green Living",
      color: "border-emerald-500/50 text-emerald-500",
      bgBadge: "bg-emerald-500/10 text-emerald-500",
      description:
        "Spacious residential sector bordered by open green landscape and future expansion reserves. Unmatched quietness, expansive plot layouts, and highly flexible payment structures.",
      specs: [
        { label: "Plot Sizes", value: "3 Katha & 5 Katha Plots" },
        { label: "Front Road Width", value: "40-ft Perimeter Avenue" },
        { label: "Internal Roads", value: "30-ft Tree-Lined Streets" },
        { label: "Orientation", value: "Unobstructed Nature Facing" },
      ],
      features: [
        "Lush agro-green buffer boundary",
        "Low-density spacious master layout",
        "Flexible 60-month installment plans",
        "High long-term investment yield",
      ],
    },
  ];

  const blocks =
    Array.isArray(d.blocks) && d.blocks.length > 0
      ? d.blocks
      : Array.isArray(d.items) && d.items.length > 0
      ? d.items
      : defaultBlocks;

  return (
    <section className="w-full py-16 sm:py-24 bg-card/30 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
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
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
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

        {/* 4 Block Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {blocks.map((block, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono font-bold tracking-wider ${block.color}`}>
                    {block.code}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full ${block.bgBadge}`}
                  >
                    {block.highlight}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  {block.name}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {block.description}
                </p>

                {/* Specs Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs">
                  {block.specs.map((spec: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-0.5">
                      <span className="text-[11px] text-muted-foreground block">{spec.label}</span>
                      <span className="font-semibold text-foreground block">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Features list */}
                <div className="mt-6 space-y-2">
                  {block.features.map((feat: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Booking & Installment open</span>
                {showBlockCta && (
                  <a
                    href={block.ctaHref || blockCtaHref}
                    className="inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {block.ctaLabel || `${blockCtaLabel} ${block.code}`}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
