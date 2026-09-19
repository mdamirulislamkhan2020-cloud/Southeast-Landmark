import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { FaqHeroSection } from "@/components/sections/faq/FaqHeroSection";
import { FaqContentSection } from "@/components/sections/faq/FaqContentSection";

export function FAQPage() {
  const blocks = useCmsPageBlocks("/faq");
  const heroBlock = blockData(blocks, "faq.hero");
  const faqBlock = blockData(blocks, "faq.content");

  return (
    <div className="w-full">
      <FaqHeroSection data={heroBlock} />
      <FaqContentSection data={faqBlock} />
      <CmsAssignedLeadForm pageSlug="/faq" />
    </div>
  );
}
