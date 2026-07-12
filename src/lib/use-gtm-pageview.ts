import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gtmPush } from "@/lib/gtm";

function pageTypeFor(path: string): string {
  if (path === "/" || path === "") return "home";
  if (path.startsWith("/property")) return "property";
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/seminar")) return "seminar";
  if (path.startsWith("/about")) return "about";
  if (path.startsWith("/faq")) return "faq";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/lead")) return "lead";
  return "other";
}

/**
 * Fires a GTM `page_view` event on every SPA route change.
 * - Same-path re-entries (Back/Forward to a path already tracked in this
 *   session) are deduplicated via a ref.
 * - React StrictMode double-invoke is safe: refs persist across the dev
 *   remount, so the second run sees `lastPath === path` and skips.
 * - The initial hard load has its own page_view fired by GTM's built-in
 *   trigger; we skip the first mount to avoid duplicating it.
 */
export function useGtmPageview() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);
  const skippedInitial = useRef(false);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (!skippedInitial.current) {
      skippedInitial.current = true;
      lastPath.current = path;
      return;
    }
    if (lastPath.current === path) return;
    lastPath.current = path;
    gtmPush("page_view", { page_type: pageTypeFor(location.pathname), source: "spa_navigation" });
  }, [location.pathname, location.search]);
}