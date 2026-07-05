import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLeadPageBySlug } from "@/admin/api/lead-pages-client";
import type { LeadPage as LeadPageT } from "@/admin/api/lead-pages";
import { BlockRenderer } from "@/admin/components/BlockRenderer";
import { Seo } from "@/components/site/Seo";
import { Button } from "@/components/ui/button";

function captureAnalytics() {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const p = url.searchParams;
  return {
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
    utm_content: p.get("utm_content") ?? undefined,
    utm_term: p.get("utm_term") ?? undefined,
    gclid: p.get("gclid") ?? undefined,
    fbclid: p.get("fbclid") ?? undefined,
    landing_url: window.location.href,
    referrer: document.referrer || undefined,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    browser: navigator.userAgent,
  };
}

export function LeadPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LeadPageT | null | "notfound">(null);

  useEffect(() => {
    if (!slug) return;
    getLeadPageBySlug(slug).then((p) => setPage(p ?? "notfound"));
    try { sessionStorage.setItem(`lead:${slug}:analytics`, JSON.stringify(captureAnalytics())); } catch { /* ignore */ }
  }, [slug]);

  if (page === null) return <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (page === "notfound") return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">This lead page is unavailable or has been archived.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );

  return (
    <>
      <Seo title={page.seo.title || page.title} description={page.seo.description || page.shortDescription} path={`/lead/${page.slug}`} />
      <div style={{ background: page.design.background }}>
        {page.banner && <img src={page.banner} alt="" decoding="async" fetchPriority="high" className="w-full h-64 md:h-80 object-cover" />}
        {page.blocks.map((b) => <BlockRenderer key={b.id} block={b} containerWidth={page.design.sectionWidth} pageFormId={page.formId} />)}
      </div>
    </>
  );
}