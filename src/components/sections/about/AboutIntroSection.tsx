import { Wallet, ShieldCheck, FileText, Headphones } from "lucide-react";

interface AboutIntroSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultAboutFeatures = [
  { icon: Wallet, title: "Easy Installments", body: "Flexible monthly installment support to make plot ownership accessible." },
  { icon: ShieldCheck, title: "Verified Land", body: "Every project is legally cleared, mutation-ready and independently verified." },
  { icon: FileText, title: "Transparent Papers", body: "Full land documentation and approvals accessible for every plot owner." },
  { icon: Headphones, title: "Dedicated Support", body: "A dedicated project team supports you from site visit to registration." },
];

export function AboutIntroSection({ data, isEditable, onUpdateField }: AboutIntroSectionProps) {
  const d = data || {};
  const title = d.title ?? "Grow the Value of Your Land Portfolio";
  const body =
    d.body ??
    "Southeast Landmark Ltd., established in 2010, is a fast-growing land developer in Bangladesh focused on creating safe, well-planned communities that meet the needs of our valued clients.";
  
  const rawItems = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultAboutFeatures;
  const items = rawItems.map((item: any, index: number) => ({
    icon: defaultAboutFeatures[index % defaultAboutFeatures.length].icon,
    title: item.title || defaultAboutFeatures[index % defaultAboutFeatures.length].title,
    body: item.body || item.text || defaultAboutFeatures[index % defaultAboutFeatures.length].body,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
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
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("body", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition block"
            >
              {body}
            </span>
          ) : (
            body
          )}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f: { icon: any; title: string; body: string }, i: number) => {
          const Icon = f.icon;
          return (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
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
              <p className="mt-2 text-sm text-muted-foreground">
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
