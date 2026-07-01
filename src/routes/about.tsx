import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Southeast Landmark Ltd" },
      { name: "description", content: "Learn about Southeast Landmark Ltd, a Dhaka real estate company dedicated to comfortable, lasting living spaces." },
      { property: "og:title", content: "About — Southeast Landmark Ltd" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <SiteLayout>
      <AboutPage />
    </SiteLayout>
  ),
});