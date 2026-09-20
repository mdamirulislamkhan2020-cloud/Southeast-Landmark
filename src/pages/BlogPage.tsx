import { useEffect, useRef } from "react";
import { CmsAssignedLeadForm, useCmsPage } from "@/components/site/useCmsPageBlocks";
import { defaultBlocksForSlug } from "@/admin/api/client";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { gtmPush } from "@/lib/gtm";

export function BlogPage() {
  const page = useCmsPage("/blog");
  const blocks = Array.isArray(page?.blocks) ? page.blocks : defaultBlocksForSlug("/blog");

  const blogViewFiredRef = useRef(false);
  useEffect(() => {
    if (blogViewFiredRef.current) return;
    blogViewFiredRef.current = true;
    gtmPush("blog_view", { page_type: "blog" });
  }, []);

  return (
    <div className="w-full">
      {blocks.map((b) => (
        <SectionRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page?.formId ?? null} />
      ))}
      <CmsAssignedLeadForm pageSlug="/blog" />
    </div>
  );
}
