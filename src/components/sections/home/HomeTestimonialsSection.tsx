import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface HomeTestimonialsSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultTestimonials = [
  {
    name: "Our Mission",
    role: "Space Usability & Functionality",
    body: "Deliver optimum space usage and functional living for every plot owner, valuing our customers every step of the way.",
  },
  {
    name: "Our Vision",
    role: "Premium Living Standards",
    body: "Provide finest plots and residential spaces at premium standards, setting the benchmark for quality and luxurious living across Bangladesh.",
  },
  {
    name: "Customer-First",
    role: "Treating You Like Family",
    body: "We believe open communication and genuine care build lasting trust. Our team is with you at every milestone, before and after handover.",
  },
  {
    name: "Safe Accommodation",
    role: "Accessible & Affordable",
    body: "Delivering safe, beautiful, and legally cleared land within your financial capacity to make plot ownership smooth and accessible.",
  },
];

export function HomeTestimonialsSection({ data, isEditable, onUpdateField }: HomeTestimonialsSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Our Commitment";
  const title = d.title ?? "Built on Trust, Delivered with Precision";
  const rawItems = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultTestimonials;
  const items = rawItems.map((item: any, index: number) => ({
    name: item.name || defaultTestimonials[index % defaultTestimonials.length].name,
    role: item.role || defaultTestimonials[index % defaultTestimonials.length].role,
    body: item.body || item.text || defaultTestimonials[index % defaultTestimonials.length].body,
  }));

  return (
    <section className="bg-secondary/20 py-20 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((t: { name: string; role: string; body: string }, i: number) => (
            <div key={i} className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {isEditable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updated = [...items];
                      updated[i] = { ...updated[i], body: e.currentTarget.textContent || "" };
                      onUpdateField?.("items", updated);
                    }}
                    className="outline-none hover:bg-primary/10 px-1 rounded transition"
                  >
                    “{t.body}”
                  </span>
                ) : (
                  `“${t.body}”`
                )}
              </p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="font-display font-semibold">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...items];
                        updated[i] = { ...updated[i], name: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {t.name}
                    </span>
                  ) : (
                    t.name
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...items];
                        updated[i] = { ...updated[i], role: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {t.role}
                    </span>
                  ) : (
                    t.role
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/about"
            onClick={(e) => {
              if (isEditable) e.preventDefault();
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Learn more about our company mission <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
