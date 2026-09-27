import React from "react";
import heroImg from "@/assets/brand/hero.jpg";
import { ArrowDown, MapPin, Compass, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ProjectHeroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
}

export function ProjectHeroSection({
  data,
  isEditable = false,
  onUpdateField,
  onOpenMedia,
}: ProjectHeroSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "SOUTHEAST CITY";
  const title = d.title ?? "Southeast City Master Layout";
  const subtitle =
    d.subtitle ??
    "A safe, modern, and nature-surrounded township in Bonogram, Savar—adjacent to the Mirpur Embankment and Shah Ali Bridge.";
  const image = d.image || heroImg;

  const ctaLabel = d.ctaLabel !== undefined ? d.ctaLabel : "Explore Master Plan";
  const ctaHref = d.ctaHref ?? "#master-plan";
  const secondaryCtaLabel =
    d.secondaryCtaLabel !== undefined ? d.secondaryCtaLabel : "Book a Site Visit";
  const secondaryCtaHref = d.secondaryCtaHref ?? "#site-visit";
  const tertiaryCtaLabel =
    d.tertiaryCtaLabel !== undefined ? d.tertiaryCtaLabel : "View Plot Options →";
  const tertiaryCtaHref = d.tertiaryCtaHref ?? "#plot-options";

  const showPrimaryCta =
    d.showPrimaryCta !== false && Boolean(ctaLabel && String(ctaLabel).trim().length > 0);
  const showSecondaryCta =
    d.showSecondaryCta !== false &&
    Boolean(secondaryCtaLabel && String(secondaryCtaLabel).trim().length > 0);
  const showTertiaryCta =
    d.showTertiaryCta !== false &&
    Boolean(tertiaryCtaLabel && String(tertiaryCtaLabel).trim().length > 0);

  const defaultStats = [
    { label: "Total Area", value: "100+ Acres", desc: "Master-Planned Township" },
    { label: "Road Network", value: "60ft & 40ft", desc: "Boulevard & Internal Avenues" },
    { label: "Elevation", value: "Flood-Free", desc: "Naturally Elevated Red Soil" },
    { label: "Transit Gateway", value: "Shah Ali Bridge", desc: "Direct Mirpur & Uttara Link" },
  ];

  const stats = Array.isArray(d.stats) && d.stats.length > 0 ? d.stats : defaultStats;

  const handleCtaClick = (target: string) => {
    if (isEditable) return;
    if (target.startsWith("#")) {
      const id = target.replace("#", "");
      const elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.location.href = target;
    }
  };

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] w-full overflow-hidden bg-background text-foreground flex items-center justify-center">
      {/* Background Media with Depth Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={image}
          alt="Southeast City Master Layout Aerial Township View"
          className="h-full w-full object-cover object-center filter brightness-[0.45] contrast-[1.05]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase backdrop-blur-md mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("eyebrow", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/20 px-1 rounded transition"
            >
              {eyebrow}
            </span>
          ) : (
            eyebrow
          )}
        </div>

        {/* Main Heading */}
        <h1 className="max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance leading-[1.15]">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/20 px-1 rounded transition inline-block"
            >
              {title}
            </span>
          ) : (
            title
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed text-balance">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/20 px-1 rounded transition inline-block"
            >
              {subtitle}
            </span>
          ) : (
            subtitle
          )}
        </p>

        {/* CTA Buttons */}
        {(showPrimaryCta || showSecondaryCta || showTertiaryCta) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {showPrimaryCta && (
              <button
                type="button"
                onClick={() => handleCtaClick(ctaHref)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEditable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateField?.("ctaLabel", e.currentTarget.textContent || "")}
                    className="outline-none hover:bg-primary/20 px-1 rounded transition"
                  >
                    {ctaLabel}
                  </span>
                ) : (
                  ctaLabel
                )}
              </button>
            )}

            {showSecondaryCta && (
              <button
                type="button"
                onClick={() => handleCtaClick(secondaryCtaHref)}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEditable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onUpdateField?.("secondaryCtaLabel", e.currentTarget.textContent || "")
                    }
                    className="outline-none hover:bg-white/20 px-1 rounded transition"
                  >
                    {secondaryCtaLabel}
                  </span>
                ) : (
                  secondaryCtaLabel
                )}
              </button>
            )}

            {showTertiaryCta && (
              <button
                type="button"
                onClick={() => handleCtaClick(tertiaryCtaHref)}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {isEditable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onUpdateField?.("tertiaryCtaLabel", e.currentTarget.textContent || "")
                    }
                    className="outline-none hover:bg-white/10 px-1 rounded transition"
                  >
                    {tertiaryCtaLabel}
                  </span>
                ) : (
                  tertiaryCtaLabel
                )}
              </button>
            )}
          </div>
        )}

        {/* Key Trust & Dimensional Highlights */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-4xl border-t border-white/15 pt-8 text-left">
          {stats.map((st: any, idx: number) => {
            const label = st.label || st.k || "Metric";
            const val = st.value || st.v || "";
            const desc = st.desc || "";
            return (
              <div key={idx} className="space-y-1">
                <span className="text-xs text-slate-400 block">{label}</span>
                <p className="font-display text-xl sm:text-2xl font-bold text-white tabular-nums">
                  {val}
                </p>
                {desc && <span className="text-[11px] text-slate-400">{desc}</span>}
              </div>
            );
          })}
        </div>

        {isEditable && (
          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenMedia?.("image")}
              className="text-xs bg-card/80 text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-card transition"
            >
              Change Hero Image
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
