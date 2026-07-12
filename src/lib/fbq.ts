/**
 * Thin, safe wrapper around the Meta Pixel `fbq` global installed in
 * `index.html`. Every call is a no-op if the pixel hasn't loaded yet.
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type StandardEvent =
  | "PageView"
  | "ViewContent"
  | "Contact"
  | "Lead"
  | "CompleteRegistration"
  | "SubmitApplication"
  | "Search"
  | "InitiateCheckout"
  | "Purchase";

export function fbqTrack(event: StandardEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

export function fbqTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (params) window.fbq("trackCustom", event, params);
  else window.fbq("trackCustom", event);
}

export {};