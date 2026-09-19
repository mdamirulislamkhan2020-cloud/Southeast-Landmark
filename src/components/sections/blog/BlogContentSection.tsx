import { User, Calendar } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

interface BlogContentSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultBlogPosts = [
  { title: "A Practical Guide to Land Investment in Bangladesh", date: "12/02/2026", img: p1 },
  { title: "Ten Tips Before Booking Your First Residential Plot", date: "05/02/2026", img: p2 },
  { title: "How to Evaluate a Planned Township Project", date: "22/01/2026", img: p3 },
  { title: "Planning Townships for the Next Generation of Plot Owners", date: "15/01/2026", img: p2 },
  { title: "How Do You Value a Residential Land Plot?", date: "05/01/2026", img: p1 },
  { title: "Starting Your Land Investment Journey with ৳ 10 Lac", date: "20/12/2025", img: p3 },
];

export function BlogContentSection({ data, isEditable, onUpdateField }: BlogContentSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "News & Insights";
  const title = d.title ?? "Land Investment News & Township Insights";
  const subtitle =
    d.subtitle ??
    "Explore our journal for expert land investment articles, township planning updates and stories from behind the scenes at Southeast Landmark.";

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-sm font-medium text-primary">
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
          </p>
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
        <p className="text-muted-foreground leading-relaxed">
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
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {defaultBlogPosts.map((post, i) => (
          <article
            key={i}
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-16/10 overflow-hidden">
              <img
                src={post.img}
                alt={post.title}
                loading="lazy"
                width={800}
                height={500}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" /> Southeast Landmark
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {post.date}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">
                {post.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
