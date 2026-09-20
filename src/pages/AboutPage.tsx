import { CmsAssignedLeadForm, useCmsPage } from "@/components/site/useCmsPageBlocks";
import { defaultBlocksForSlug } from "@/admin/api/client";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export function AboutPage() {
  const page = useCmsPage("/about");
  const blocks = Array.isArray(page?.blocks) ? page.blocks : defaultBlocksForSlug("/about");

  return (
    <div className="w-full">
      {blocks.map((b) => (
        <SectionRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page?.formId ?? null} />
      ))}
      <CmsAssignedLeadForm pageSlug="/about" />
    </div>
  );
}
