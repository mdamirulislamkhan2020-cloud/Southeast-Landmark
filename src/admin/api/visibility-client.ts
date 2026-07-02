import { DEFAULT_VISIBILITY, type PageVisibility, type VisibilitySettings } from "./visibility";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_KEY = "sel_admin_visibility_v1";
export const VISIBILITY_UPDATE_EVENT = "sel:visibility-updated";

function readLS(): VisibilitySettings {
  if (typeof window === "undefined") return DEFAULT_VISIBILITY;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_VISIBILITY;
    const parsed = JSON.parse(raw) as Partial<VisibilitySettings>;
    return { ...DEFAULT_VISIBILITY, ...parsed, comingSoon: { ...DEFAULT_VISIBILITY.comingSoon, ...(parsed.comingSoon ?? {}) }, maintenance: { ...DEFAULT_VISIBILITY.maintenance, ...(parsed.maintenance ?? {}) } };
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

function writeLS(v: VisibilitySettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(v));
  try {
    window.dispatchEvent(new CustomEvent(VISIBILITY_UPDATE_EVENT));
  } catch { /* ignore */ }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export async function getVisibility(): Promise<VisibilitySettings> {
  if (!USE_MOCK) return apiFetch<VisibilitySettings>("/visibility");
  return readLS();
}

export async function updateVisibility(patch: Partial<VisibilitySettings>): Promise<VisibilitySettings> {
  const next: VisibilitySettings = { ...(await getVisibility()), ...patch, updatedAt: new Date().toISOString() };
  if (!USE_MOCK) return apiFetch<VisibilitySettings>("/visibility", { method: "PUT", body: JSON.stringify(next) });
  writeLS(next);
  return next;
}

export async function resetVisibility(): Promise<VisibilitySettings> {
  const next = { ...DEFAULT_VISIBILITY, updatedAt: new Date().toISOString() };
  if (!USE_MOCK) return apiFetch<VisibilitySettings>("/visibility/reset", { method: "POST" });
  writeLS(next);
  return next;
}

/** Normalize a path for matching (strip trailing slash except root, lowercase). */
export function normalizePath(p: string): string {
  if (!p) return "/";
  let s = p.trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s.toLowerCase();
}

/** Check if a path matches any whitelist entry (prefix match). */
export function isWhitelisted(path: string, whitelist: string[]): boolean {
  const p = normalizePath(path);
  return whitelist.some((w) => {
    const n = normalizePath(w);
    return p === n || p.startsWith(n + "/");
  });
}

export interface VisibilityDecision {
  allowed: boolean;
  reason?: "mode" | "page";
  action: "allow" | "404" | "redirect" | "coming_soon" | "maintenance";
  redirectTo?: string;
  noindex: boolean;
}

/**
 * Decide what should happen for a given path under current settings and auth.
 * `isAuthenticated` covers members/admin visibility.
 */
export function decideVisibility(
  path: string,
  settings: VisibilitySettings,
  isAuthenticated: boolean,
): VisibilityDecision {
  const p = normalizePath(path);

  // Always allow whitelist (login, admin, assets, api, etc.)
  if (isWhitelisted(p, settings.whitelist)) return { allowed: true, action: "allow", noindex: false };

  // Mode-level gates
  if (settings.mode === "maintenance") {
    return { allowed: false, reason: "mode", action: "maintenance", noindex: true };
  }
  if (settings.mode === "coming_soon") {
    return { allowed: false, reason: "mode", action: "coming_soon", noindex: true };
  }
  if (settings.mode === "single") {
    if (p === normalizePath(settings.singlePagePath)) {
      return { allowed: true, action: "allow", noindex: false };
    }
    return buildBlocked(settings);
  }
  if (settings.mode === "multi") {
    const allowedPaths = settings.multiPagePaths.map(normalizePath);
    if (allowedPaths.includes(p)) return { allowed: true, action: "allow", noindex: false };
    return buildBlocked(settings);
  }

  // Normal mode: check per-page visibility
  const v = (settings.pageVisibility[p] ?? "public") as PageVisibility;
  if (v === "public") return { allowed: true, action: "allow", noindex: false };
  if (v === "members" && isAuthenticated) return { allowed: true, action: "allow", noindex: false };
  if (v === "admin" && isAuthenticated) return { allowed: true, action: "allow", noindex: false };
  // hidden / members-not-logged / admin-not-logged
  return buildBlocked(settings);
}

function buildBlocked(settings: VisibilitySettings): VisibilityDecision {
  const noindex = settings.seoNoIndexBlocked;
  switch (settings.blockedRedirect) {
    case "home":
      return { allowed: false, reason: "page", action: "redirect", redirectTo: "/", noindex };
    case "selected":
      return { allowed: false, reason: "page", action: "redirect", redirectTo: settings.redirectTarget || "/", noindex };
    case "coming_soon":
      return { allowed: false, reason: "page", action: "coming_soon", noindex };
    case "404":
    default:
      return { allowed: false, reason: "page", action: "404", noindex };
  }
}