import { Link } from "react-router-dom";
import { Sparkles, MapPin, LandPlot, Layers } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

interface HomeProjectsSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultProjects = [
  {
    img: p1,
    title: "Southeast Landmark Township — Phase 1",
    location: "Savar, Bonogram (Near Mirpur Zoo)",
    price: "৳ 18 Lac/katha",
    status: "Ongoing Project",
    katha: "3 & 5",
    blocks: "A–D",
  },
  {
    img: p2,
    title: "Bonogram Green Enclave — Phase 2",
    location: "Savar, Dhaka",
    price: "৳ 22 Lac/katha",
    status: "Upcoming Community",
    katha: "3, 5 & 10",
    blocks: "A–F",
  },
  {
    img: p3,
    title: "Landmark Riverside Township",
    location: "Mirpur Zoo Link Road, Savar",
    price: "৳ 15 Lac/katha",
    status: "Upcoming Development",
    katha: "Mixed",
    blocks: "A–C",
  },
];

export function HomeProjectsSection({ data, isEditable, onUpdateField }: HomeProjectsSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Featured Projects";
  const title = d.title ?? "Ongoing & Upcoming Land Projects";
  const ctaLabel = d.ctaLabel ?? "View All Projects →";
  const ctaHref = d.ctaHref ?? "/property";

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
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
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
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
              title
            )}
          </h2>
        </div>
        <Link
          to={ctaHref}
          onClick={(e) => {
            if (isEditable) e.preventDefault();
          }}
          className="text-sm font-semibold text-primary hover:underline"
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
          )}
        </Link>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {defaultProjects.map((p, i) => (
          <article
            key={i}
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={800}
                height={600}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                {p.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{p.location}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs">
                <span className="inline-flex items-center gap-1">
                  <LandPlot className="h-3.5 w-3.5 text-primary" /> {p.katha} Katha
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Block {p.blocks}
                </span>
                <span className="font-display font-semibold text-primary">{p.price}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
