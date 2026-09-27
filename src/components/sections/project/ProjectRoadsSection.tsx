import React from "react";
import {
  Route,
  ShieldCheck,
  Zap,
  Droplets,
  Sun,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface ProjectRoadsSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectRoadsSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectRoadsSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "INFRASTRUCTURE";
  const title = d.title ?? "Engineered Road Network & Modern Utilities";
  const subtitle =
    d.subtitle ??
    "Civil-engineered with comprehensive sub-surface drainage, underground utility ducts, and generous street widths to prevent future road cuts and traffic bottlenecks.";

  const defaultRoadTiers = [
    {
      width: "60 FT",
      tier: "Grand Entrance Boulevard",
      role: "Central Town Arterial",
      description:
        "Dual-carriageway main avenue welcoming residents into Southeast City. Features a landscaped central median, solar-powered LED street lights, wide pedestrian walkways, and tree-lined verges.",
      details: [
        "Dual 24ft driving lanes",
        "6ft landscaped median",
        "Dedicated pedestrian walkways",
        "Integrated underground storm drains",
      ],
    },
    {
      width: "40 FT",
      tier: "Secondary Connecting Avenues",
      role: "Inter-Sector Thoroughfare",
      description:
        "Spacious arterial roadways connecting Blocks A, B, C, and D smoothly. Designed to handle two-way vehicular traffic, service vehicles, and emergency access without roadside congestion.",
      details: [
        "Two-way seamless transit",
        "Side walkway pavement",
        "Underground utility channels",
        "Generous intersection turning radii",
      ],
    },
    {
      width: "30 FT",
      tier: "Inner Residential Access Loops",
      role: "Neighborhood Living Streets",
      description:
        "Tranquil, pedestrian-first residential streets servicing individual plots. Built with durable high-grade brick paving or asphalt macadam, speed-calmed for children's safety.",
      details: [
        "Direct residential plot access",
        "Calmed traffic design",
        "Rainwater curb channels",
        "Zero through-traffic noise",
      ],
    },
  ];

  const roadTiers =
    Array.isArray(d.roadTiers) && d.roadTiers.length > 0
      ? d.roadTiers
      : Array.isArray(d.items) && d.items.length > 0
      ? d.items
      : defaultRoadTiers;

  const defaultUtilityHighlights = [
    {
      icon: Droplets,
      title: "Engineered Stormwater Drainage",
      text: "Pre-cast concrete box culverts and gravity drainage network designed to channel monsoon runoff directly to natural retention reservoirs, preventing waterlogging.",
    },
    {
      icon: Zap,
      title: "Underground Utility Reservation",
      text: "Designated subsurface utility ducts for electricity, municipal water lines, and high-speed fiber internet—preventing uncoordinated road excavation in the future.",
    },
    {
      icon: Sun,
      title: "Solar-Powered LED Streetlights",
      text: "Energy-efficient automatic solar street lighting installed along all boulevards and residential intersections for reliable nighttime illumination and safety.",
    },
    {
      icon: ShieldCheck,
      title: "24/7 Gated Security & Perimeter Surveillance",
      text: "Manned security checkposts at all township entry gates, boundary security wall, regular vehicle patrols, and central CCTV monitoring across all sectors.",
    },
  ];

  const utilityHighlights =
    Array.isArray(d.utilityHighlights) && d.utilityHighlights.length > 0
      ? d.utilityHighlights
      : defaultUtilityHighlights;

  return (
    <section className="w-full py-16 sm:py-24 bg-background">
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

        {/* 3 Road Hierarchy Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {roadTiers.map((tier, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-primary tabular-nums">
                    {tier.width}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {tier.role}
                  </span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  {tier.tier}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tier.description}
                </p>

                <div className="mt-6 space-y-2 border-t border-border/50 pt-4">
                  {tier.details.map((detail: any, dIdx: number) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs text-foreground/85">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Infrastructure & Utility Highlights */}
        <div className="mt-12 rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-10">
          <div className="mb-6">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Master Utility & Civil Standards
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Complete civil planning executed ahead of plot handovers to guarantee hassle-free home
              building.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {utilityHighlights.map((util, uIdx) => {
              const Icon = util.icon;
              return (
                <div key={uIdx} className="space-y-2">
                  <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{util.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{util.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
