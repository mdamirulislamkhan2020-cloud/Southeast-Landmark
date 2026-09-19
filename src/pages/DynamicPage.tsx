import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPageByPath } from "@/admin/api/client";
import type { CmsPage } from "@/admin/api/types";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Seo } from "@/components/site/Seo";
import { Button } from "@/components/ui/button";

/**
 * Fallback route handler for any URL that does not match a built-in page.
 * Looks up a published CMS page by its slug and renders content + blocks.
 */
export function DynamicPage() {
  const location = useLocation();
  const [page, setPage] = useState<CmsPage | null | "notfound">(null);

  useEffect(() => {
    let alive = true;
    getPageByPath(location.pathname)
      .then((p) => {
        if (alive) setPage(p ?? "notfound");
      })
      .catch(() => {
        if (alive) setPage("notfound");
      });
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (page === null) {
    return <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (page === "notfound") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  const blocks = page.blocks ?? [];
  return (
    <>
      <Seo title={page.seoTitle || page.title} description={page.seoDescription || ""} path={page.slug} />
      {page.content && (
        <div className="prose max-w-none mx-auto px-4 py-8" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      {blocks.map((b) => (
        <SectionRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page.formId ?? null} />
      ))}
      {/* If a form is assigned but there is no lead_form block, auto-render it at the bottom */}
      {page.formId && !blocks.some((b) => b.type === "lead_form") && (
        <SectionRenderer
          block={{ id: "auto-form", type: "lead_form", data: { formId: page.formId } }}
          containerWidth={1200}
          pageFormId={page.formId}
        />
      )}
    </>
  );
}
