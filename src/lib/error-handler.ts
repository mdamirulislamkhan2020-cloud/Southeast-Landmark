import { toast } from "sonner";

/** Extracts a user-friendly message from any thrown value. */
export function toErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "object" && err && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  try { return JSON.stringify(err); } catch { return fallback; }
}

/** Log an error to the console with a stable prefix. */
export function logError(scope: string, err: unknown, extra?: Record<string, unknown>) {
  console.error(`[${scope}]`, err, extra ?? "");
}

/**
 * Wrap an async op with unified error handling.
 * Returns { ok, data, error }. Optionally toasts on failure.
 */
export async function safeAsync<T>(
  op: () => Promise<T>,
  opts: { scope?: string; toastOnError?: boolean; fallbackMessage?: string } = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const data = await op();
    return { ok: true, data };
  } catch (err) {
    const message = toErrorMessage(err, opts.fallbackMessage);
    logError(opts.scope ?? "safeAsync", err);
    if (opts.toastOnError) toast.error(message);
    return { ok: false, error: message };
  }
}

let installed = false;
/** Installs global handlers for uncaught errors and rejected promises. */
export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    // Ignore ResizeObserver noise which is a benign browser quirk.
    if (event.message && /ResizeObserver loop/i.test(event.message)) return;
    logError("window.error", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    logError("unhandledrejection", event.reason);
    // Surface a subtle toast so devs/users notice silent failures.
    try { toast.error(toErrorMessage(event.reason, "Unexpected error")); } catch { /* noop */ }
  });
}