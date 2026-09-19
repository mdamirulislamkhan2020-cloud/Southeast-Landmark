import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import heroDefault from "@/assets/brand/hero.jpg";

interface HomeHeroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
}

export const defaultHomeHeroStats = [
  { k: "14+ Years", v: "Established 2010" },
  { k: "Savar, Bonogram", v: "Prime Project Location" },
  { k: "100% Verified", v: "Safe & Planned Plots" },
];

export function HomeTitle({ title }: { title: string }) {
  if (
    title.includes("Planned Residential Plot") ||
    title.includes("Dhaka’s Most Promising Township") ||
    title.includes("Dhaka's Most Promising Township")
  ) {
    return (
      <>
        Own Your Planned <span className="text-gradient-gold">Residential Plot</span> in Dhaka’s Most Promising Township
      </>
    );
  }
  if (title.includes("Fastest Growing Land Developer")) {
    return (
      <>
        Fastest Growing <span className="text-gradient-gold">Land Developer</span> in Bangladesh — Since 2010
      </>
    );
  }
  if (title.includes("Own Your Land")) {
    return (
      <>
        Own Your <span className="text-gradient-gold">Land</span> in a Planned Township — Today and for Generations
      </>
    );
  }
  return <>{title}</>;
}

export function HomeHeroSection({ data, isEditable, onUpdateField, onOpenMedia }: HomeHeroSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Bangladesh’s Fastest-Growing Land Developer";
  const title = d.title ?? "Own Your Planned Residential Plot in Dhaka’s Most Promising Township";
  const subtitle =
    d.subtitle ??
    "Established in 2010 to make land ownership safe, transparent, and hassle-free. Discover premium residential plots in our flagship ongoing project at Savar, Bonogram — located right beside Mirpur National Zoo.";
  const ctaLabel = d.ctaLabel ?? "Explore Our Projects";
  const ctaHref = d.ctaHref ?? "/property";
  const heroImage = d.image || d.imageUrl || heroDefault;
  const statsList = Array.isArray(d.stats) && d.stats.length > 0 ? d.stats : defaultHomeHeroStats;

  return (
    <section className="relative overflow-hidden w-full">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-12 pb-6 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
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

        {/* Heading */}
        <h1 className="mx-auto max-w-3xl text-center font-display text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-semibold leading-[1.2] tracking-tight">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition block"
            >
              {title}
            </span>
          ) : (
            <HomeTitle title={title} />
          )}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-3.5 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition block"
            >
              {subtitle}
            </span>
          ) : (
            subtitle
          )}
        </p>

        {/* Hero Visual Card + Stats Sidebar */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] text-left">
          {/* Main Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 group min-h-[340px]">
            <img
              src={heroImage}
              alt="Planned residential township in Savar near Mirpur Zoo"
              width={1600}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
            {isEditable && onOpenMedia && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMedia("image");
                }}
                className="absolute top-4 right-4 bg-background/90 hover:bg-background text-foreground border border-border shadow px-3 py-1.5 rounded-lg text-xs font-medium z-10 transition opacity-0 group-hover:opacity-100"
              >
                Change Hero Image
              </button>
            )}
          </div>

          {/* Stats & Project Highlights Side Column */}
          <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-primary/20 bg-card p-8">
            {statsList.map((s: { k: string; v: string }, i: number) => (
              <div key={i}>
                <div className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...statsList];
                        updated[i] = { ...updated[i], k: e.currentTarget.textContent || "" };
                        onUpdateField?.("stats", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {s.k}
                    </span>
                  ) : (
                    s.k
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...statsList];
                        updated[i] = { ...updated[i], v: e.currentTarget.textContent || "" };
                        onUpdateField?.("stats", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {s.v}
                    </span>
                  ) : (
                    s.v
                  )}
                </div>
              </div>
            ))}

            <Link
              to={ctaHref}
              onClick={(e) => {
                if (isEditable) e.preventDefault();
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("ctaLabel", e.currentTarget.textContent || "")}
                  className="outline-none"
                >
                  {ctaLabel}
                </span>
              ) : (
                ctaLabel
              )}{" "}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
