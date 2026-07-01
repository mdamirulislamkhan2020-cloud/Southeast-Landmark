import type { IntegrationConfig, IntegrationKey, TrackingEvent } from "./integrations";
import { INTEGRATION_DEFINITIONS } from "./integrations";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const LS = "sel_admin_integrations_v1";

function readLS<T>(k: string, f: T): T { if (typeof window === "undefined") return f; try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : f; } catch { return f; } }
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

function seed(): Record<IntegrationKey, IntegrationConfig> {
  const existing = readLS<Record<IntegrationKey, IntegrationConfig> | null>(LS, null);
  if (existing) return existing;
  const map = {} as Record<IntegrationKey, IntegrationConfig>;
  INTEGRATION_DEFINITIONS.forEach((d) => { map[d.key] = { key: d.key, enabled: false, values: {}, lastTestedAt: null, lastTestOk: null }; });
  writeLS(LS, map);
  return map;
}

export async function listIntegrations(): Promise<Record<IntegrationKey, IntegrationConfig>> {
  if (!USE_MOCK) return apiFetch<Record<IntegrationKey, IntegrationConfig>>("/integrations");
  return seed();
}

export async function saveIntegration(key: IntegrationKey, patch: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
  if (!USE_MOCK) return apiFetch<IntegrationConfig>(`/integrations/${key}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = seed();
  all[key] = { ...all[key], ...patch, values: { ...all[key].values, ...(patch.values ?? {}) } };
  writeLS(LS, all);
  return all[key];
}

export async function testIntegration(key: IntegrationKey): Promise<{ ok: boolean; message: string }> {
  const all = seed();
  const cfg = all[key];
  const def = INTEGRATION_DEFINITIONS.find((d) => d.key === key);
  if (!def) return { ok: false, message: "Unknown integration" };
  const missing = def.fields.filter((f) => !cfg.values[f.id]);
  const ok = missing.length === 0;
  const now = new Date().toISOString();
  all[key] = { ...cfg, lastTestedAt: now, lastTestOk: ok };
  writeLS(LS, all);
  return { ok, message: ok ? "Connection looks good (mock)." : `Missing: ${missing.map((m) => m.label).join(", ")}` };
}

// ---------- Runtime tracking hook (safe placeholder) ----------

let cachedIntegrations: Record<IntegrationKey, IntegrationConfig> | null = null;
export function primeIntegrationCache(map: Record<IntegrationKey, IntegrationConfig>) { cachedIntegrations = map; }
export function getIntegrationCache() { return cachedIntegrations ?? seed(); }

export function trackEvent(event: TrackingEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const map = getIntegrationCache();
  // GA4 / GTM dataLayer push (no-op when script not loaded)
  const w = window as unknown as { dataLayer?: unknown[]; fbq?: (...args: unknown[]) => void };
  if (map.gtm?.enabled || map.ga4?.enabled) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  }
  if (map.facebook_pixel?.enabled && typeof w.fbq === "function") {
    try { w.fbq("trackCustom", event, params); } catch { /* ignore */ }
  }
  // Webhook (best-effort)
  if (map.webhook?.enabled && map.webhook.values.url) {
    try {
      fetch(map.webhook.values.url, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, params, at: new Date().toISOString() }),
      }).catch(() => undefined);
    } catch { /* ignore */ }
  }
}