import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQPage } from "@/pages/FAQPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Southeast Landmark Ltd" },
      { name: "description", content: "Answers to the questions we hear most about our properties and process." },
      { property: "og:title", content: "FAQ — Southeast Landmark Ltd" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: () => (
    <SiteLayout>
      <FAQPage />
    </SiteLayout>
  ),
});