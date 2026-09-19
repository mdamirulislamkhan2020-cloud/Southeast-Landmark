import { Sparkles } from "lucide-react";
import aboutDefault from "@/assets/brand/about.jpg";
import { site } from "@/config/site";

interface AboutStorySectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  onOpenMedia?: (field: string) => void;
}

export const defaultServices = [
  "Residential Land Development",
  "Planned Township Development",
  "Residential Plot Sales",
  "Land Investment Advisory",
  "Site Visit Booking",
  "Installment Payment Support",
  "Customer Consultation",
  "After-Sales Support",
];

export function AboutStorySection({ data, isEditable, onUpdateField, onOpenMedia }: AboutStorySectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Our Story";
  const title = d.title ?? `Welcome to ${site.short}`;
  const body1 =
    d.body1 ??
    "Since 2010, Southeast Landmark Ltd. has been developing communities with a strong focus on customer needs, quality and satisfaction. Our ongoing project is located in Bonogram, Savar, close to Mirpur National Zoo.";
  const body2 =
    d.body2 ??
    "With an experienced team overseeing development, construction and services, we strive to provide safe and beautiful living environments while treating every customer as part of our family.";
  const services = Array.isArray(d.services) && d.services.length > 0 ? d.services : defaultServices;
  const image = d.image || d.imageUrl || aboutDefault;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-3xl border border-primary/20 relative group">
          <img
            src={image}
            alt="Southeast Landmark township project"
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

          <div className="mt-8 border-t border-border/60 pt-6">
            <h3 className="font-display font-semibold">Our Services & Solutions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {services.map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...services];
                        updated[i] = e.currentTarget.textContent || "";
                        onUpdateField?.("services", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {s}
                    </span>
                  ) : (
                    s
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
