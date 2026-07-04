import type { IntegrationConfig, IntegrationKey, IntegrationLog, DataLayerEntry, TrackingEvent } from "./integrations";
import { INTEGRATION_DEFINITIONS } from "./integrations";
import { supabase } from "@/integrations/supabase/client";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const LS_LOGS = "sel_admin_integrations_logs_v1";
const LS_DL = "sel_admin_integrations_datalayer_v1";
const MAX_LOGS = 200;
const MAX_DL = 100;
const SETTINGS_KEY = "integrations";

function readLS<T>(k: string, f: T): T { if (typeof window === "undefined") return f; try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : f; } catch { return f; } }
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

export function pushLog(entry: Omit<IntegrationLog, "id" | "at">) {
  const logs = readLS<IntegrationLog[]>(LS_LOGS, []);
  logs.unshift({ ...entry, id: uid(), at: new Date().toISOString() });
  writeLS(LS_LOGS, logs.slice(0, MAX_LOGS));
}
export function listLogs(key?: IntegrationKey | "global"): IntegrationLog[] {
  const logs = readLS<IntegrationLog[]>(LS_LOGS, []);
  return key ? logs.filter((l) => l.key === key) : logs;
}
export function clearLogs(key?: IntegrationKey | "global") {
  const logs = readLS<IntegrationLog[]>(LS_LOGS, []);
  writeLS(LS_LOGS, key ? logs.filter((l) => l.key !== key) : []);
}

export function listDataLayer(): DataLayerEntry[] { return readLS<DataLayerEntry[]>(LS_DL, []); }
export function clearDataLayer() { writeLS(LS_DL, []); }
function pushDataLayer(event: string, params: Record<string, unknown>) {
  const list = readLS<DataLayerEntry[]>(LS_DL, []);
  list.unshift({ id: uid(), event, params, at: new Date().toISOString() });
  writeLS(LS_DL, list.slice(0, MAX_DL));
}

function defaults(): Record<IntegrationKey, IntegrationConfig> {
  const map = {} as Record<IntegrationKey, IntegrationConfig>;
  INTEGRATION_DEFINITIONS.forEach((d) => {
    const values: Record<string, string> = {};
    d.fields.forEach((f) => { if (f.defaultValue !== undefined) values[f.id] = f.defaultValue; });
    map[d.key] = { key: d.key, enabled: false, values, lastTestedAt: null, lastTestOk: null, lastSyncAt: null, lastError: null };
  });
  return map;
}

async function dbLoad(): Promise<Record<IntegrationKey, IntegrationConfig>> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  const base = defaults();
  if (!data) return base;
  const stored = (data.value as Partial<Record<IntegrationKey, IntegrationConfig>>) ?? {};
  (Object.keys(stored) as IntegrationKey[]).forEach((k) => {
    if (base[k]) base[k] = { ...base[k], ...stored[k]!, values: { ...base[k].values, ...(stored[k]!.values ?? {}) } };
  });
  cachedIntegrations = base;
  return base;
}
async function dbSave(map: Record<IntegrationKey, IntegrationConfig>) {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: map as never }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  cachedIntegrations = map;
}

export async function listIntegrations(): Promise<Record<IntegrationKey, IntegrationConfig>> {
  if (!USE_MOCK) return apiFetch<Record<IntegrationKey, IntegrationConfig>>("/integrations");
  return dbLoad();
}

export async function saveIntegration(key: IntegrationKey, patch: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
  if (!USE_MOCK) return apiFetch<IntegrationConfig>(`/integrations/${key}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = await dbLoad();
  all[key] = { ...all[key], ...patch, values: { ...all[key].values, ...(patch.values ?? {}) }, lastSyncAt: new Date().toISOString() };
  await dbSave(all);
  pushLog({ key, level: "info", action: "save", message: `${key} configuration saved` });
  return all[key];
}

export async function deleteIntegration(key: IntegrationKey): Promise<void> {
  const all = await dbLoad();
  const values: Record<string, string> = {};
  const def = INTEGRATION_DEFINITIONS.find((d) => d.key === key);
  def?.fields.forEach((f) => { if (f.defaultValue !== undefined) values[f.id] = f.defaultValue; });
  all[key] = { key, enabled: false, values, lastTestedAt: null, lastTestOk: null, lastSyncAt: null, lastError: null };
  await dbSave(all);
  pushLog({ key, level: "warn", action: "delete", message: `${key} configuration reset` });
}

export async function resetAllIntegrations(): Promise<void> {
  await supabase.from("app_settings").delete().eq("key", SETTINGS_KEY);
  cachedIntegrations = null;
  clearLogs();
  clearDataLayer();
  pushLog({ key: "global", level: "warn", action: "reset", message: "All integrations reset" });
}

export async function testIntegration(key: IntegrationKey): Promise<{ ok: boolean; message: string }> {
  const all = await dbLoad();
  const cfg = all[key];
  const def = INTEGRATION_DEFINITIONS.find((d) => d.key === key);
  if (!def) return { ok: false, message: "Unknown integration" };
  const missing = def.fields
    .filter((f) => f.kind !== "switch" && !f.helper?.startsWith("optional"))
    .filter((f) => !cfg.values[f.id]);
  const ok = missing.length === 0;
  const now = new Date().toISOString();
  const message = ok ? "Connection looks good (mock)." : `Missing: ${missing.map((m) => m.label).join(", ")}`;
  all[key] = { ...cfg, lastTestedAt: now, lastTestOk: ok, lastError: ok ? null : message };
  await dbSave(all);
  pushLog({ key, level: ok ? "success" : "error", action: "test", message });
  return { ok, message };
}

export async function sendTestEmail(to: string): Promise<{ ok: boolean; message: string }> {
  const cfg = (await dbLoad()).smtp;
  const ok = !!(cfg.enabled && cfg.values.host && cfg.values.fromEmail && to);
  const message = ok ? `Mock test email queued to ${to}` : "SMTP not configured or recipient missing";
  pushLog({ key: "smtp", level: ok ? "success" : "error", action: "test_email", message });
  return { ok, message };
}

export async function sendTestWebhook(): Promise<{ ok: boolean; message: string }> {
  const cfg = (await dbLoad()).webhook;
  if (!cfg.enabled || !cfg.values.url) {
    pushLog({ key: "webhook", level: "error", action: "test", message: "Webhook not configured" });
    return { ok: false, message: "Webhook not configured" };
  }
  try {
    await fetch(cfg.values.url, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json", ...(cfg.values.authHeader ? { Authorization: cfg.values.authHeader } : {}) },
      body: JSON.stringify({ event: "test_webhook", at: new Date().toISOString() }),
    });
  } catch { /* no-cors */ }
  pushLog({ key: "webhook", level: "success", action: "test", message: `Test payload dispatched to ${cfg.values.url}` });
  return { ok: true, message: "Test webhook dispatched (no-cors)." };
}

// ---------- Runtime tracking hook (safe placeholder) ----------

let cachedIntegrations: Record<IntegrationKey, IntegrationConfig> | null = null;
export function primeIntegrationCache(map: Record<IntegrationKey, IntegrationConfig>) { cachedIntegrations = map; }
export function getIntegrationCache() { return cachedIntegrations ?? defaults(); }

export function trackEvent(event: TrackingEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const map = getIntegrationCache();
  pushDataLayer(event, params);
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
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json", ...(map.webhook.values.authHeader ? { Authorization: map.webhook.values.authHeader } : {}) },
        body: JSON.stringify({ event, params, at: new Date().toISOString() }),
      }).catch(() => undefined);
    } catch { /* ignore */ }
  }
}