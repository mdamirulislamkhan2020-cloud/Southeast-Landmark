import { PageHero } from "@/components/site/PageHero";
import { Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { blockData, CmsAssignedLeadForm, cmsList, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";

const faqs = [
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

export function FAQPage() {
  const blocks = useCmsPageBlocks("/faq");
  const heroBlock = blockData(blocks, "faq.hero");
  const faqBlock = blockData(blocks, "faq.content");
  const editableFaqs = cmsList<{ q: string; a: string }>(faqBlock, "items", faqs);

  return (
    <div>
      <PageHero title={cmsString(heroBlock, "title", "FAQ")} crumb={cmsString(heroBlock, "crumb", "FAQ")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> {cmsString(faqBlock, "eyebrow", "Frequently Asked Questions")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(faqBlock, "title", "Answers to the Questions We Hear Most")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {cmsString(faqBlock, "subtitle", "If you can’t find what you’re looking for below, our team is happy to help — reach out through the contact page and we’ll get back within one business day.")}
            </p>
          </div>
          <Accordion type="single" collapsible defaultValue="q-0" className="space-y-3">
            {editableFaqs.map((f, i) => (
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
      <CmsAssignedLeadForm path="/faq" />
    </div>
  );
}
