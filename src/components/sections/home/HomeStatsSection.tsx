import { Building, CheckCircle2, MapPin, Award } from "lucide-react";

interface HomeStatsSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultStats = [
  { icon: Building, label: "Year Established", value: "2010" },
  { icon: CheckCircle2, label: "Client Satisfaction Target", value: "100%" },
  { icon: MapPin, label: "Prime Project Hub (Near Mirpur Zoo)", value: "Savar, Bonogram" },
  { icon: Award, label: "Industry Experience", value: "14+ Years" },
];

export function StatsTitle({ title }: { title: string }) {
  if (title.includes("You Book") || title.includes("We Develop")) {
    return (
      <>
        You Book, <span className="text-gradient-gold">We Develop.</span>
      </>
    );
  }
  return <>{title}</>;
}

export function HomeStatsSection({ data, isEditable, onUpdateField }: HomeStatsSectionProps) {
  const d = data || {};
  const title = d.title ?? "You Book, We Develop.";
  const subtitle =
    d.subtitle ??
    "Delivering safe accommodations, legally verified land, and planned townships across Bangladesh since 2010.";
  const rawItems = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultStats;
  const items = rawItems.map((item: any, index: number) => ({
    icon: defaultStats[index % defaultStats.length].icon,
    value: item.value || defaultStats[index % defaultStats.length].value,
    label: item.label || defaultStats[index % defaultStats.length].label,
  }));

  return (
    <section className="relative overflow-hidden bg-primary/5 py-20 border-y border-primary/10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <StatsTitle title={title} />
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
          {items.map((s: { icon: any; label: string; value: string }, i: number) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-primary/20 bg-card p-6 text-center shadow-lg shadow-primary/5"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-gradient-gold">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...items];
                        updated[i] = { ...updated[i], value: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {s.value}
                    </span>
                  ) : (
                    s.value
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...items];
                        updated[i] = { ...updated[i], label: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {s.label}
                    </span>
                  ) : (
                    s.label
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
