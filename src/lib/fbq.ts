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

/**
 * Fire a standard Meta Pixel event with an `eventID` for CAPI
 * deduplication. The exact same `eventID` must be reused by a future
 * server-side Conversions API call for Meta to deduplicate.
 */
export function fbqTrackWithId(event: StandardEvent, eventID: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const payload = params ?? {};
  window.fbq("track", event, payload, { eventID });
}

export function fbqTrackCustomWithId(event: string, eventID: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const payload = params ?? {};
  window.fbq("trackCustom", event, payload, { eventID });
}

/**
 * CAPI-compatible event ID. Format: `<event>.<uuid>` so server-side code
 * can log/inspect the event type without parsing. UUIDs are unique per
 * user action, preventing duplicate credit if the same handler somehow
 * runs twice (StrictMode, retries, etc. — we still guard those, but the
 * ID gives Meta a final dedupe key).
 */
export function newEventId(event: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${event}.${uuid}`;
}

/**
 * Meta Advanced Matching. Re-initialises the pixel with normalised user
 * data so subsequent events send matching signals to Meta. The Pixel
 * library hashes these fields client-side before transmission — we only
 * need to lowercase / trim / strip formatting.
 *
 * Only call this AFTER a successful, user-consented form submission.
 */
export const META_PIXEL_ID = "844834324705906";

type AdvancedMatching = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string; // ISO 3166-1 alpha-2, lowercase
};

function normalizePhone(raw: string, defaultCountry = "88"): string {
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  // Bangladesh local format 01XXXXXXXXX → prepend country code
  if (digits.startsWith("0") && !digits.startsWith("00")) return defaultCountry + digits.slice(1);
  return digits;
}

export function setFbqAdvancedMatching(data: AdvancedMatching) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const am: Record<string, string> = {};
  if (data.email) {
    const em = data.email.trim().toLowerCase();
    if (em) am.em = em;
  }
  if (data.phone) {
    const ph = normalizePhone(data.phone);
    if (ph) am.ph = ph;
  }
  if (data.firstName) {
    const fn = data.firstName.trim().toLowerCase();
    if (fn) am.fn = fn;
  }
  if (data.lastName) {
    const ln = data.lastName.trim().toLowerCase();
    if (ln) am.ln = ln;
  }
  if (data.country) {
    const country = data.country.trim().toLowerCase();
    if (country) am.country = country;
  }
  if (Object.keys(am).length === 0) return;
  window.fbq("init", META_PIXEL_ID, am);
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}