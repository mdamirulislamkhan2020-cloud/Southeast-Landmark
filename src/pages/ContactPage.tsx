import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { ContactHeroSection } from "@/components/sections/contact/ContactHeroSection";
import { ContactContentSection } from "@/components/sections/contact/ContactContentSection";

export function ContactPage() {
  const blocks = useCmsPageBlocks("/contact");
  const heroBlock = blockData(blocks, "contact.hero");
  const contactBlock = blockData(blocks, "contact.info");

  return (
    <div className="w-full">
      <ContactHeroSection data={heroBlock} />
      <ContactContentSection data={contactBlock} />
      <CmsAssignedLeadForm pageSlug="/contact" />
    </div>
  );
}
