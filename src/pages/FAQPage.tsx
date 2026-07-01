import { PageHero } from "@/components/site/PageHero";
import { Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can invest with Southeast Landmark?",
    a: "Any adult resident or non-resident Bangladeshi with valid identification and a compliant source of funds is eligible. Our team will guide you through the documentation step by step.",
  },
  {
    q: "Is Southeast Landmark a long-term commitment?",
    a: "Our residences are designed for long-term ownership. That said, plot owners are free to resell, lease or transfer their units according to their own timelines.",
  },
  {
    q: "How does pricing work?",
    a: "Every project has a transparent price schedule based on unit size, floor level and finishing package. There are no hidden fees — you see the full breakdown before you commit.",
  },
  {
    q: "What after-sales support do you provide?",
    a: "For a full year after handover we cover routine maintenance and any construction-related defects. Beyond that, our facility team is available on a service-contract basis.",
  },
  {
    q: "Can I visit a project in person?",
    a: "Absolutely. Schedule a site visit through our contact page or by phone and we will arrange a guided walk-through at a time that suits you.",
  },
];

export function FAQPage() {
  return (
    <div>
      <PageHero title="FAQ" crumb="FAQ" />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Frequently Asked Questions
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Answers to the Questions We Hear Most
            </h2>
            <p className="mt-4 text-muted-foreground">
              If you can’t find what you’re looking for below, our team is happy
              to help — reach out through the contact page and we’ll get back
              within one business day.
            </p>
          </div>
          <Accordion type="single" collapsible defaultValue="q-0" className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="rounded-2xl border border-border/60 bg-card px-5">
                <AccordionTrigger className="text-left font-display text-base font-semibold text-primary hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}