import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { CmsAssignedLeadForm, useCmsPage } from "@/components/site/useCmsPageBlocks";
import { defaultBlocksForSlug } from "@/admin/api/client";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Seo } from "@/components/site/Seo";
import { fbqTrack } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

export function ProjectsPage() {
  const location = useLocation();
  // Support both /projects and /property
  const pageProjects = useCmsPage("/projects");
  const pageProperty = useCmsPage("/property");
  const page = pageProjects || pageProperty;

  const defaultBlocks = defaultBlocksForSlug("/projects");
  const blocks = page && Array.isArray(page.blocks) ? page.blocks : defaultBlocks;

  // Analytics
  const viewContentFiredRef = useRef(false);
  useEffect(() => {
    if (viewContentFiredRef.current) return;
    viewContentFiredRef.current = true;
    fbqTrack("ViewContent", {
      content_type: "product_group",
      content_category: "Master Plan & Projects",
      content_name: "Southeast City Master Layout",
      page_title: typeof document !== "undefined" ? document.title : "",
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
    gtmPush("project_view", {
      project_name: "Southeast City Master Plan",
      page_type: "project_master_plan",
    });
  }, []);

  // Smooth scroll to hash on load or change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const elem = document.getElementById(id);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [location.hash]);

  const seoTitle = page?.seoTitle || "Southeast City Master Layout | Southeast Landmark Ltd.";
  const seoDescription =
    page?.seoDescription ||
    "Explore the Southeast City master layout in Bonogram, Savar, including strategic connectivity, block-wise planning, road networks, amenities, plot options, and site visit opportunities.";

  return (
    <div className="w-full min-h-screen">
      <Seo title={seoTitle} description={seoDescription} path={location.pathname} />
      {page?.content && (
        <div
          className="prose max-w-none mx-auto px-4 py-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
      {blocks
        .filter((b) => (b.data?.customStyles as Record<string, any>)?.hidden !== true)
        .map((b) => (
          <SectionRenderer
            key={b.id}
            block={b}
            containerWidth={1280}
            pageFormId={page?.formId ?? null}
          />
        ))}
      <CmsAssignedLeadForm path="/projects" />
    </div>
  );
}
