import { useEffect, useState, type ReactNode } from "react";
import { getPageByPath } from "@/admin/api/client";
import type { CmsPage } from "@/admin/api/types";
import { BlockRenderer } from "@/admin/components/BlockRenderer";

/**
 * Renders CMS-managed blocks for a given URL path when the page has any.
 * If the CMS page has zero blocks (or does not exist), falls back to the
 * static `children` so the existing hardcoded design keeps working.
 */
export function CmsPageContent({ path, children }: { path: string; children: ReactNode }) {
  const [page, setPage] = useState<CmsPage | null | "loading">("loading");

  useEffect(() => {
    let alive = true;
    getPageByPath(path)
      .then((p) => { if (alive) setPage(p ?? null); })
      .catch(() => { if (alive) setPage(null); });
    return () => { alive = false; };
  }, [path]);

  if (page === "loading") return <>{children}</>;
  const blocks = page?.blocks ?? [];
  if (blocks.length === 0) return <>{children}</>;

  return (
    <>
      {page?.content && (
        <div className="prose max-w-none mx-auto px-4 py-8" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      {blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} containerWidth={1200} pageFormId={page?.formId ?? null} />
      ))}
      {page?.formId && !blocks.some((b) => b.type === "lead_form") && (
        <BlockRenderer
          block={{ id: "auto-form", type: "lead_form", data: { formId: page.formId } }}
          containerWidth={1200}
          pageFormId={page.formId}
        />
      )}
    </>
  );
}