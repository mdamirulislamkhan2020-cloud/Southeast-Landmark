import { Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FaqContentSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultFaqs = [
  {
    q: "Who can book a plot with Southeast Landmark?",
    a: "Any adult resident or non-resident Bangladeshi with valid identification and a compliant source of funds can book a residential plot in our projects. Our team will guide you through booking, installments and registration step by step.",
  },
  {
    q: "Is a land plot a long-term commitment?",
    a: "Our residential plots are designed for long-term ownership and land value appreciation. That said, plot owners are free to resell, transfer or gift their plot according to their own timelines.",
  },
  {
    q: "How does plot pricing and installment work?",
    a: "Every project has a transparent per-katha price schedule, along with down-payment and monthly installment options. There are no hidden fees — you see the full breakdown, including registration and utility charges, before you book.",
  },
  {
    q: "What after-sales support do you provide?",
    a: "After plot handover we support mutation, registration follow-up and project infrastructure upkeep such as roads, drainage and boundary walls. Our customer team stays available for any post-booking assistance you need.",
  },
  {
    q: "Can I book a site visit to a project?",
    a: "Absolutely. Book a site visit through our contact page or by phone and we will arrange a guided project tour, layout walk-through and plot selection at a time that suits you.",
  },
];

export function FaqContentSection({ data, isEditable, onUpdateField }: FaqContentSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "Frequently Asked Questions";
  const title = d.title ?? "Answers to the Questions We Hear Most";
  const subtitle =
    d.subtitle ??
    "If you can’t find what you’re looking for below, our team is happy to help — reach out through the contact page and we’ll get back within one business day.";
  const rawItems = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultFaqs;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
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

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {rawItems.map((faq: { q: string; a: string }, i: number) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-display font-medium hover:text-primary">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...rawItems];
                        updated[i] = { ...updated[i], q: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {faq.q}
                    </span>
                  ) : (
                    faq.q
                  )}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updated = [...rawItems];
                        updated[i] = { ...updated[i], a: e.currentTarget.textContent || "" };
                        onUpdateField?.("items", updated);
                      }}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition block"
                    >
                      {faq.a}
                    </span>
                  ) : (
                    faq.a
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
