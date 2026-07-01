import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BlogPage } from "@/pages/BlogPage";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Southeast Landmark Ltd" },
      { name: "description", content: "News, insights and stories from Southeast Landmark." },
      { property: "og:title", content: "Blog — Southeast Landmark Ltd" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: () => (
    <SiteLayout>
      <BlogPage />
    </SiteLayout>
  ),
});