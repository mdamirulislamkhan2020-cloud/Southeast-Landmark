import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <HomePage />
    </SiteLayout>
  );
}
