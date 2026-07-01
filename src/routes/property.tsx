import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyPage } from "@/pages/PropertyPage";

export const Route = createFileRoute("/property")({
  head: () => ({
    meta: [
      { title: "Properties — Southeast Landmark Ltd" },
      { name: "description", content: "Browse residential properties by Southeast Landmark across Dhaka." },
      { property: "og:title", content: "Properties — Southeast Landmark Ltd" },
      { property: "og:url", content: "/property" },
    ],
    links: [{ rel: "canonical", href: "/property" }],
  }),
  component: () => (
    <SiteLayout>
      <PropertyPage />
    </SiteLayout>
  ),
});