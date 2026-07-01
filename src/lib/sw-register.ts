/**
 * Service Worker registration wrapper (scaffold — disabled by default).
 *
 * Offline / PWA support is NOT enabled yet. When you want it:
 *   1. Add `vite-plugin-pwa` with `generateSW` in `vite.config.ts`.
 *   2. Flip `SW_ENABLED` to true below.
 *   3. Call `registerServiceWorker()` from a client entry.
 *
 * This wrapper refuses to register in dev, in Lovable preview iframes, or
 * when the URL contains `?sw=off`, and it unregisters any stale `/sw.js`
 * it finds in those contexts. See the PWA skill for full guidance.
 */

const SW_ENABLED = false;
const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;

  const { hostname } = window.location;
  if (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return true;

  return false;
}

async function unregisterMatching(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL.endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
  } catch {
    // no-op
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (isRefusedContext()) {
    await unregisterMatching();
    return;
  }
  if (!SW_ENABLED) return;
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch (err) {
    console.error("[sw] registration failed", err);
  }
}