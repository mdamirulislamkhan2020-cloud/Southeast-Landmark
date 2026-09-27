import React, { useState } from "react";
import { ChevronDown, HelpCircle, CheckCircle2 } from "lucide-react";

interface ProjectFaqSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectFaqSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectFaqSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "FREQUENTLY ASKED QUESTIONS";
  const title = d.title ?? "Essential Answers for Plot Buyers";
  const subtitle =
    d.subtitle ??
    "Everything you need to know about Southeast City's land titles, connectivity, infrastructure, and booking procedures.";

  const defaultFaqs = [
    {
      q: "Where is Southeast City located, and what is the transit time from Dhaka?",
      a: "Southeast City is situated in Bonogram, Savar—directly beside the Mirpur Embankment and Shah Ali Bridge, close to the Mirpur National Zoo. Travel time is only 10 to 15 minutes from Mirpur 1 / Gabtoli and 20 to 25 minutes from Uttara via the embankment expressway.",
    },
    {
      q: "Is Southeast City naturally elevated and flood-free?",
      a: "Yes. Unlike low-lying riverbed projects that require artificial sand filling, Southeast City is situated on natural red-soil high ground well above the 100-year highest flood watermark. This guarantees solid building foundations and zero waterlogging.",
    },
    {
      q: "What is the legal status and documentation of the land?",
      a: "Southeast Landmark Ltd. maintains complete transparency. All land is legally vetted, with 100% genuine CS, SA, RS, and BS record clearance. Plots are mutation-ready with clear title deeds, and our legal team supports every client through registration and possession.",
    },
    {
      q: "What plot sizes and installment options are available?",
      a: "We offer 3 Katha, 5 Katha, 10 Katha residential plots, as well as prime commercial plots along the 60ft Boulevard. Payment options range from upfront full-payment with instant discounts to flexible 36-to-60 month interest-free monthly installments.",
    },
    {
      q: "What infrastructure and utilities will be provided before handover?",
      a: "The master plan includes 60ft, 40ft, and 30ft paved roads, underground drainage with concrete box culverts, subsurface channels for power and water, solar streetlights, 24/7 security with perimeter boundary walls, central mosque, and lake promenade.",
    },
    {
      q: "How can I visit the project site in person?",
      a: "We provide complimentary round-trip air-conditioned transport every Saturday through Thursday from our corporate office in Mohammadpur (Ring Road), Mirpur 1, or Gabtoli. You can submit the booking form above or call our hotline at 01591-134357.",
    },
  ];

  const faqs = Array.isArray(d.items) && d.items.length > 0 ? d.items : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("eyebrow", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition"
              >
                {eyebrow}
              </span>
            ) : (
              eyebrow
            )}
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
              >
                {title}
              </span>
            ) : (
              title
            )}
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
              >
                {subtitle}
              </span>
            ) : (
              subtitle
            )}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq: any, idx: number) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <span className="text-base sm:text-lg font-display">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-6 rounded-3xl border border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold text-foreground">
            Have more questions about land registry or custom payment schedules?
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <a href="tel:01591134357" className="font-bold text-primary hover:underline">
              Call Hotline: 01591-134357
            </a>
            <span>·</span>
            <a href="#site-visit" className="font-bold text-primary hover:underline">
              Book a Site Visit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
