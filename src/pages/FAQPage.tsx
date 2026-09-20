import { CmsAssignedLeadForm, useCmsPage } from "@/components/site/useCmsPageBlocks";
import { defaultBlocksForSlug } from "@/admin/api/client";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export function FAQPage() {
  const page = useCmsPage("/faq");
  const blocks = Array.isArray(page?.blocks) ? page.blocks : defaultBlocksForSlug("/faq");

  return (
    <div className="w-full">
      {blocks.map((b) => (
        <SectionRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page?.formId ?? null} />
      ))}
      <CmsAssignedLeadForm pageSlug="/faq" />
    </div>
  );
}
