import { useEffect, useRef } from "react";
import { blockData, CmsAssignedLeadForm, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { BlogHeroSection } from "@/components/sections/blog/BlogHeroSection";
import { BlogContentSection } from "@/components/sections/blog/BlogContentSection";
import { gtmPush } from "@/lib/gtm";

export function BlogPage() {
  const blocks = useCmsPageBlocks("/blog");
  const heroBlock = blockData(blocks, "blog.hero");
  const gridBlock = blockData(blocks, "blog.grid");

  const blogViewFiredRef = useRef(false);
  useEffect(() => {
    if (blogViewFiredRef.current) return;
    blogViewFiredRef.current = true;
    gtmPush("blog_view", { page_type: "blog" });
  }, []);

  return (
    <div className="w-full">
      <BlogHeroSection data={heroBlock} />
      <BlogContentSection data={gridBlock} />
      <CmsAssignedLeadForm pageSlug="/blog" />
    </div>
  );
}
