/**
 * SMTP service layer.
 *
 * All UI code MUST go through this module — never touch localStorage directly
 * and never assume the transport. Endpoints are intentionally REST-shaped so
 * the future PHP + MySQL backend can be swapped in without touching the UI:
 *
 *   GET    /api/admin/smtp/config
 *   POST   /api/admin/smtp/config            (create)
 *   PUT    /api/admin/smtp/config            (update — password optional)
 *   DELETE /api/admin/smtp/config
 *   POST   /api/admin/smtp/test              (send test email)
 *   POST   /api/admin/smtp/send              (transactional send)
 *   GET    /api/admin/smtp/logs
 *
 * When VITE_ADMIN_USE_MOCK !== "false" the requests are served from an
 * in-browser mock that mimics the PHP contract (redacted GET, write-only
 * password, structured errors, logs). Flip the env var and point
 * VITE_ADMIN_API_BASE at the PHP host and nothing else has to change.
 */
import {
  EMPTY_SMTP,
  redact,
  type ApiResult,
  type SendEmailInput,
  type SmtpConfig,
  type SmtpLog,
  type SmtpLogAction,
  type TestEmailResult,
} from "./smtp";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

const LS_CONFIG = "sel_smtp_config_v1";
const LS_LOGS = "sel_smtp_logs_v1";
const MAX_LOGS = 200;

// ---------- shared helpers ----------

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

/** Never log the password or Authorization header. */
function sanitizeForLog<T extends Record<string, unknown>>(payload: T | undefined): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== "object") return payload;
  const clone: Record<string, unknown> = { ...payload };
  if ("password" in clone) clone.password = clone.password ? "***" : "";
  return clone;
}

function currentUser(): string | null {
  try {
    const raw = window.localStorage.getItem("sel_admin_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string; name?: string };
    return parsed.email ?? parsed.name ?? null;
  } catch {
    return null;
  }
}

function pushLog(entry: Omit<SmtpLog, "id" | "at" | "user">) {
  const logs = readLS<SmtpLog[]>(LS_LOGS, []);
  logs.unshift({
    ...entry,
    id: uid(),
    at: new Date().toISOString(),
    user: currentUser(),
  });
  writeLS(LS_LOGS, logs.slice(0, MAX_LOGS));
}

// ---------- HTTP with timeout + retry ----------

async function httpFetch<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number; retries?: number } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES, ...rest } = init;
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(rest.headers ?? {}),
        },
      });
      clearTimeout(timer);
      const text = await res.text();
      const body = text ? (JSON.parse(text) as unknown) : null;
      if (!res.ok) {
        const message =
          (body && typeof body === "object" && "error" in body && typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : `Request failed with status ${res.status}`);
        // Only retry on 5xx / network — never on validation (4xx).
        if (res.status >= 500 && attempt < retries) {
          lastError = new Error(message);
          continue;
        }
        throw new Error(message);
      }
      return body as T;
    } catch (err) {
      clearTimeout(timer);
      const isAbort = (err as { name?: string } | null)?.name === "AbortError";
      lastError = isAbort ? new Error(`Request timed out after ${timeoutMs}ms`) : err;
      if (attempt >= retries) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network request failed");
}

// ---------- mock backend (localStorage) ----------

function mockGetConfig(): SmtpConfig {
  const stored = readLS<SmtpConfig | null>(LS_CONFIG, null);
  if (!stored) return { ...EMPTY_SMTP };
  return { ...EMPTY_SMTP, ...stored };
}
function mockWriteConfig(next: SmtpConfig, user: string | null) {
  const prev = mockGetConfig();
  // Never overwrite an existing password with a blank one — matches how a real
  // PHP endpoint should behave for PUT /config.
  const merged: SmtpConfig = {
    ...prev,
    ...next,
    password: next.password ? next.password : prev.password,
    hasPassword: Boolean(next.password || prev.password),
    updatedAt: new Date().toISOString(),
    updatedBy: user,
  };
  writeLS(LS_CONFIG, merged);
  return merged;
}

// ---------- public API ----------

/** GET /api/admin/smtp/config — returns config WITHOUT the password. */
export async function getSmtpConfig(): Promise<Omit<SmtpConfig, "password"> & { hasPassword: boolean }> {
  if (!USE_MOCK) return httpFetch<Omit<SmtpConfig, "password"> & { hasPassword: boolean }>("/admin/smtp/config");
  return redact(mockGetConfig());
}

/** POST /api/admin/smtp/config — create a fresh SMTP config. */
export async function createSmtpConfig(cfg: SmtpConfig): Promise<ApiResult<Omit<SmtpConfig, "password"> & { hasPassword: boolean }>> {
  const action: SmtpLogAction = "save";
  try {
    if (!USE_MOCK) {
      const data = await httpFetch<Omit<SmtpConfig, "password"> & { hasPassword: boolean }>(
        "/admin/smtp/config",
        { method: "POST", body: JSON.stringify(cfg) },
      );
      pushLog({ action, success: true, message: `SMTP configured (${cfg.host}:${cfg.port})` });
      return { ok: true, data };
    }
    const saved = mockWriteConfig(cfg, currentUser());
    pushLog({ action, success: true, message: `SMTP configured (${saved.host}:${saved.port})` });
    return { ok: true, data: redact(saved) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save SMTP configuration";
    pushLog({ action, success: false, message: "Failed to save SMTP configuration", error: message });
    return { ok: false, error: message };
  }
}

/** PUT /api/admin/smtp/config — update. Empty password preserves the stored value. */
export async function updateSmtpConfig(cfg: SmtpConfig): Promise<ApiResult<Omit<SmtpConfig, "password"> & { hasPassword: boolean }>> {
  const action: SmtpLogAction = "update";
  try {
    if (!USE_MOCK) {
      const data = await httpFetch<Omit<SmtpConfig, "password"> & { hasPassword: boolean }>(
        "/admin/smtp/config",
        { method: "PUT", body: JSON.stringify(cfg) },
      );
      pushLog({ action, success: true, message: `SMTP updated (${cfg.host}:${cfg.port})` });
      return { ok: true, data };
    }
    const saved = mockWriteConfig(cfg, currentUser());
    pushLog({ action, success: true, message: `SMTP updated (${saved.host}:${saved.port})` });
    return { ok: true, data: redact(saved) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update SMTP configuration";
    pushLog({ action, success: false, message: "Failed to update SMTP configuration", error: message });
    return { ok: false, error: message };
  }
}

/** DELETE /api/admin/smtp/config — wipe stored config. */
export async function deleteSmtpConfig(): Promise<ApiResult<null>> {
  const action: SmtpLogAction = "delete";
  try {
    if (!USE_MOCK) {
      await httpFetch<null>("/admin/smtp/config", { method: "DELETE" });
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_CONFIG);
    }
    pushLog({ action, success: true, message: "SMTP configuration reset" });
    return { ok: true, data: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset SMTP configuration";
    pushLog({ action, success: false, message: "Failed to reset SMTP configuration", error: message });
    return { ok: false, error: message };
  }
}

/** POST /api/admin/smtp/test — send a real test email via the backend. */
export async function sendTestEmail(to: string): Promise<TestEmailResult> {
  const action: SmtpLogAction = "test_email";
  const body = { to };
  try {
    if (!USE_MOCK) {
      const res = await httpFetch<{ ok: boolean; message?: string }>(
        "/admin/smtp/test",
        { method: "POST", body: JSON.stringify(body), retries: 1 },
      );
      const message = res.message ?? (res.ok ? `Test email sent to ${to}` : "Test email failed");
      pushLog({ action, success: res.ok, message, error: res.ok ? null : message });
      return { ok: res.ok, message, simulated: false };
    }
    // Mock mode — be explicit that nothing was actually sent.
    const cfg = mockGetConfig();
    const missing = !cfg.host || !cfg.fromEmail || !cfg.hasPassword;
    if (missing) {
      const msg = "SMTP is not fully configured — save host, sender email and password first.";
      pushLog({ action, success: false, message: msg, error: msg });
      return { ok: false, message: msg, simulated: true };
    }
    const msg = `Simulated: no email was sent to ${to}. Connect the backend (POST /api/admin/smtp/test) to send real messages.`;
    pushLog({ action, success: true, message: `[SIMULATED] Test to ${to}` });
    return { ok: true, message: msg, simulated: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Test email failed";
    pushLog({ action, success: false, message: "Test email failed", error: message });
    return { ok: false, message, simulated: false };
  }
}

/** POST /api/admin/smtp/send — used by public forms & system emails. */
export async function sendEmail(input: SendEmailInput): Promise<ApiResult<{ messageId?: string; simulated: boolean }>> {
  const action: SmtpLogAction = "send";
  const payload = { ...input };
  try {
    if (!USE_MOCK) {
      const data = await httpFetch<{ messageId?: string }>(
        "/admin/smtp/send",
        { method: "POST", body: JSON.stringify(payload), retries: 1 },
      );
      pushLog({
        action,
        success: true,
        message: `Sent "${input.subject}" to ${input.to} via ${input.source}`,
      });
      return { ok: true, data: { messageId: data.messageId, simulated: false } };
    }
    // Mock — do not fake a real send. Report simulated so callers can show the right UX.
    const cfg = mockGetConfig();
    if (!cfg.host || !cfg.fromEmail || !cfg.hasPassword) {
      const msg = "SMTP not configured — email was not sent.";
      pushLog({ action, success: false, message: msg, error: msg });
      return { ok: false, error: msg, code: "smtp_not_configured" };
    }
    pushLog({
      action,
      success: true,
      message: `[SIMULATED] "${input.subject}" to ${input.to} via ${input.source}`,
    });
    return { ok: true, data: { simulated: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    pushLog({ action, success: false, message: `Send failed (${input.source})`, error: message });
    return { ok: false, error: message };
  }
}

/** GET /api/admin/smtp/logs */
export async function listSmtpLogs(): Promise<SmtpLog[]> {
  if (!USE_MOCK) return httpFetch<SmtpLog[]>("/admin/smtp/logs");
  return readLS<SmtpLog[]>(LS_LOGS, []);
}

export function clearSmtpLogs() {
  writeLS(LS_LOGS, []);
}

/** Test hook — never called by the UI. */
export const __test = { sanitizeForLog };
