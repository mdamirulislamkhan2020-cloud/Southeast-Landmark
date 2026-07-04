import { PageHero } from "@/components/site/PageHero";
import { Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { blockData, CmsAssignedLeadForm, cmsList, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { useActiveFaqs } from "@/components/site/useCmsData";

export function FAQPage() {
  const blocks = useCmsPageBlocks("/faq");
  const heroBlock = blockData(blocks, "faq.hero");
  const faqBlock = blockData(blocks, "faq.content");
  const { items: dbFaqs, loading } = useActiveFaqs();
  const dbList = dbFaqs.map((f) => ({ q: f.question, a: f.answer }));
  // Manual block override wins; otherwise fall back to the FAQ table.
  const editableFaqs = cmsList<{ q: string; a: string }>(faqBlock, "items", dbList);

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
          {loading && editableFaqs.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">Loading questions…</div>
          ) : editableFaqs.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">No questions have been published yet.</div>
          ) : (
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
          )}
        </div>
      </section>
      <CmsAssignedLeadForm path="/faq" />
    </div>
  );
}
