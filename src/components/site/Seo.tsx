import { Helmet } from "react-helmet-async";
import { useSeoMeta } from "./useCmsData";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  robotsIndex?: "index" | "noindex";
  robotsFollow?: "follow" | "nofollow";
  jsonLd?: string;
  canonical?: string;
}

export function Seo({ title, description, path, ogImage, robotsIndex, robotsFollow, jsonLd, canonical }: SeoProps) {
  const robots = `${robotsIndex ?? "index"}, ${robotsFollow ?? "follow"}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <link rel="canonical" href={canonical || path} />
      {jsonLd ? <script type="application/ld+json">{jsonLd}</script> : null}
    </Helmet>
  );
}

/**
 * Reads per-page SEO overrides from the CMS (seo_entities keyed by slug),
 * falling back to the caller-supplied defaults when nothing is configured.
 * Design-agnostic: renders the same <Seo> tags either way.
 */
export function CmsSeo({ slug, defaultTitle, defaultDescription }: { slug: string; defaultTitle: string; defaultDescription: string }) {
  const { meta } = useSeoMeta(slug);
  return (
    <Seo
      title={meta.title || defaultTitle}
      description={meta.description || defaultDescription}
      path={meta.canonical || slug}
      ogImage={meta.ogImage || null}
      robotsIndex={meta.robotsIndex}
      robotsFollow={meta.robotsFollow}
      jsonLd={meta.jsonLd}
      canonical={meta.canonical || slug}
    />
  );
}