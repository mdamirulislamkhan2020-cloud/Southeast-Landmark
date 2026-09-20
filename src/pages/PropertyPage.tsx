import { useEffect, useRef } from "react";
import { CmsAssignedLeadForm, useCmsPage } from "@/components/site/useCmsPageBlocks";
import { defaultBlocksForSlug } from "@/admin/api/client";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { fbqTrack } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

export function PropertyPage() {
  const page = useCmsPage("/property");
  const blocks = Array.isArray(page?.blocks) ? page.blocks : defaultBlocksForSlug("/property");

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
      {blocks.map((b) => (
        <SectionRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page?.formId ?? null} />
      ))}
      <CmsAssignedLeadForm pageSlug="/property" />
    </div>
  );
}
