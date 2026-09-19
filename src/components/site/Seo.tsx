import type { ComponentType, ReactNode } from "react";
import * as RHA from "react-helmet-async";

interface HelmetProps {
  children?: ReactNode;
}

const HelmetModule = RHA as Record<string, unknown>;
const HelmetComponent = (HelmetModule.Helmet ||
  (HelmetModule.default as Record<string, unknown> | undefined)?.Helmet ||
  HelmetModule.default ||
  RHA) as ComponentType<HelmetProps>;

export function Seo({ title, description, path }: { title: string; description: string; path: string }) {
  const Helmet = HelmetComponent;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={path} />
    </Helmet>
  );
}