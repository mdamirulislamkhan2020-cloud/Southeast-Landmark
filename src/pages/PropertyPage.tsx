import { useEffect, useRef } from "react";
import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { PropertyHeroSection } from "@/components/sections/property/PropertyHeroSection";
import { PropertyContentSection } from "@/components/sections/property/PropertyContentSection";
import { fbqTrack } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

export function PropertyPage() {
  const blocks = useCmsPageBlocks("/property");
  const heroBlock = blockData(blocks, "property.hero");
  const gridBlock = blockData(blocks, "property.grid");

  // Analytics
  const viewContentFiredRef = useRef(false);
  useEffect(() => {
    if (viewContentFiredRef.current) return;
    viewContentFiredRef.current = true;
    fbqTrack("ViewContent", {
      content_type: "product_group",
      content_category: "Projects",
      page_title: typeof document !== "undefined" ? document.title : "",
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
    gtmPush("property_view", {
      property_name: "Projects Overview",
      page_type: "property",
    });
  }, []);

  return (
    <div className="w-full">
      <PropertyHeroSection data={heroBlock} />
      <PropertyContentSection data={gridBlock} />
      <CmsAssignedLeadForm pageSlug="/property" />
    </div>
  );
}
