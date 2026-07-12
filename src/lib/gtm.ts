/**
 * Central helper for GTM `dataLayer` pushes. Container is loaded once by
 * the snippet in `index.html`, which also initialises `window.dataLayer`.
 * Every push here is safe if the container fails to load (ad-blocker,
 * offline, CSP): we still write to `window.dataLayer` so the events are
 * captured when GTM eventually initialises.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type Params = Record<string, unknown>;

function pageContext(): Params {
  if (typeof window === "undefined") return {};
  return {
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
    page_title: typeof document !== "undefined" ? document.title : "",
  };
}

export function gtmPush(event: string, params?: Params) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...pageContext(),
    timestamp: new Date().toISOString(),
    ...(params ?? {}),
  });
}

export {};