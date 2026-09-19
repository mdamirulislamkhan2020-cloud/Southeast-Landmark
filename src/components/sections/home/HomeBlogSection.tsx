import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight, Calendar, User } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

interface HomeBlogSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultBlogs = [
  {
    title: "Why Savar Bonogram is Dhaka's Next Big Residential Hub",
    author: "Market Trends",
    date: "12 Feb 2026",
    img: p1,
  },
  {
    title: "Important Things to Check Before Buying a Residential Plot in Bangladesh",
    author: "Buyer's Guide",
    date: "05 Feb 2026",
    img: p2,
  },
  {
    title: "How Southeast Landmark Ensures Safe & Transparent Land Handover",
    author: "Company News",
    date: "22 Jan 2026",
    img: p3,
  },
];

export function HomeBlogSection({ data, isEditable, onUpdateField }: HomeBlogSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Latest Updates";
  const title = d.title ?? "Stay Informed with Our Latest Stories";
  const ctaLabel = d.ctaLabel ?? "View All Blogs →";
  const ctaHref = d.ctaHref ?? "/blog";

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

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {defaultBlogs.map((b, i) => (
          <article
            key={i}
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-16/10 overflow-hidden">
              <img
                src={b.img}
                alt={b.title}
                loading="lazy"
                width={800}
                height={500}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" /> {b.author}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {b.date}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">
                {b.title}
              </h3>
              <Link
                to="/blog"
                onClick={(e) => {
                  if (isEditable) e.preventDefault();
                }}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Read article <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
