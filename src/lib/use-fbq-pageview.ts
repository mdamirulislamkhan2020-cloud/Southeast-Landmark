import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { fbqTrack } from "@/lib/fbq";

/**
 * Fires a Meta Pixel `PageView` on every SPA route change.
 * The initial PageView is already fired inline by `fbq('init', ...)` in
 * `index.html`, so we skip the first mount to avoid duplicates.
 */
export function useFbqPageview() {
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
    fbqTrack("PageView");
  }, [location.pathname, location.search]);
}