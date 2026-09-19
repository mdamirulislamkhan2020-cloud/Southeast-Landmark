import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import aboutDefault from "@/assets/brand/about.jpg";

interface HomeAboutSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
}

export function HomeAboutSection({ data, isEditable, onUpdateField, onOpenMedia }: HomeAboutSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "About Us";
  const title = d.title ?? "Welcome to Southeast Landmark Ltd. – Building Safe & Beautiful Communities Since 2010";
  const body1 =
    d.body1 ??
    "Southeast Landmark Ltd. was established in 2010 to resolve client inconveniences and uncertainties in land development. Over the past 14+ years, we have assembled top planning, engineering, and client-service talent to deliver residential projects that set new benchmarks for quality and reliability.";
  const body2 =
    d.body2 ??
    "Our ongoing flagship project in Savar, Bonogram (close to Mirpur National Zoo) exemplifies our commitment to community living. By combining prime geographic accessibility with planned infrastructure and flexible payment plans within your capacity, we ensure every family can own a safe, beautiful accommodation.";
  const ctaLabel = d.ctaLabel ?? "Learn More About Us";
  const ctaHref = d.ctaHref ?? "/about";
  const image = d.image || d.imageUrl || aboutDefault;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* About Image */}
        <div className="order-2 overflow-hidden rounded-3xl border border-primary/20 lg:order-1 relative group">
          <img
            src={image}
            alt="About Southeast Landmark Ltd"
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover min-h-[300px]"
          />
          {isEditable && onOpenMedia && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMedia("image");
              }}
              className="absolute top-4 right-4 bg-background/90 hover:bg-background text-foreground border border-border shadow px-3 py-1.5 rounded-lg text-xs font-medium z-10 transition opacity-0 group-hover:opacity-100"
            >
              Change Image
            </button>
          )}
        </div>

        {/* Content */}
        <div className="order-1 lg:order-2">
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

          <p className="mt-4 text-muted-foreground leading-relaxed">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("body1", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition block"
              >
                {body1}
              </span>
            ) : (
              body1
            )}
          </p>

          <p className="mt-3 text-muted-foreground leading-relaxed">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("body2", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition block"
              >
                {body2}
              </span>
            ) : (
              body2
            )}
          </p>

          <div className="mt-6">
            <Link
              to={ctaHref}
              onClick={(e) => {
                if (isEditable) e.preventDefault();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
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
          </div>
        </div>
      </div>
    </section>
  );
}
