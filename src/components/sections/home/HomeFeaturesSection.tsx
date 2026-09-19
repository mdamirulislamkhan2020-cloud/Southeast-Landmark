import { ShieldCheck, MapPin, Ruler, Headphones } from "lucide-react";

interface HomeFeaturesSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultFeatures = [
  {
    icon: ShieldCheck,
    title: "Clear Ownership & Transparent Docs",
    body: "Every plot is thoroughly vetted, legally cleared, and mutation-ready. We provide complete paperwork and layout approvals upfront so your investment is 100% secure.",
  },
  {
    icon: MapPin,
    title: "Prime Location (Savar Bonogram)",
    body: "Situated in Savar, Bonogram, our flagship project enjoys immediate connectivity to central Dhaka near Mirpur National Zoo with flood-free elevation.",
  },
  {
    icon: Ruler,
    title: "Modern Infrastructure & Amenities",
    body: "Master-planned with wide internal roads, dedicated utility reservations, drainage networks, and open green zones for maximum living functionality and comfort.",
  },
  {
    icon: Headphones,
    title: "Dedicated Customer Support",
    body: "We treat every client as a lifelong family member. Our experienced team supports you through site visits, flexible installment plans, registration, and handover.",
  },
];

export function HomeFeaturesSection({ data, isEditable, onUpdateField }: HomeFeaturesSectionProps) {
  const d = data || {};
  const title = d.title ?? "Grow the Value of Your Land Portfolio";
  const subtitle = d.subtitle ?? "Why choose Southeast Landmark Ltd. for your future home and investment.";
  
  const rawItems = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultFeatures;
  const items = rawItems.map((item: any, index: number) => ({
    icon: defaultFeatures[index % defaultFeatures.length].icon,
    title: item.title || defaultFeatures[index % defaultFeatures.length].title,
    body: item.body || item.text || defaultFeatures[index % defaultFeatures.length].body,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition"
            >
              {title}
            </span>
          ) : (
            title
          )}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition"
            >
              {subtitle}
            </span>
          ) : (
            subtitle
          )}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f: { icon: any; title: string; body: string }, i: number) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">
                {isEditable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updated = [...items];
                      updated[i] = { ...updated[i], title: e.currentTarget.textContent || "" };
                      onUpdateField?.("items", updated);
                    }}
                    className="outline-none hover:bg-primary/10 px-1 rounded transition"
                  >
                    {f.title}
                  </span>
                ) : (
                  f.title
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
                    {f.body}
                  </span>
                ) : (
                  f.body
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
