import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactPage } from "@/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Southeast Landmark Ltd" },
      { name: "description", content: "Get in touch with the Southeast Landmark team in Mohammadpur, Dhaka." },
      { property: "og:title", content: "Contact — Southeast Landmark Ltd" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <SiteLayout>
      <ContactPage />
    </SiteLayout>
  ),
});