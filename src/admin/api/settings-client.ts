import {
  DEFAULT_PERMISSIONS,
  type AdminUser,
  type GlobalSettings,
  type MediaFile,
  type PermissionKey,
  type ThemeSettings,
  type UserRole,
} from "./settings";
import { supabase } from "@/integrations/supabase/client";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_USERS = "sel_admin_users_v1";
const LS_THEME = "sel_admin_theme_v1";
const LS_MEDIA = "sel_admin_media_v1";
const LS_GLOBAL = "sel_admin_global_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeLS<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

// -------- Users --------
function seedUsers() {
  if (readLS<AdminUser[] | null>(LS_USERS, null) !== null) return;
  const now = new Date().toISOString();
  const seeds: Array<Partial<AdminUser> & { role: UserRole; name: string; email: string }> = [
    { name: "Rahim Uddin", email: "super@southeastlandmark.com", role: "super_admin" },
    { name: "Nadia Chowdhury", email: "admin@southeastlandmark.com", role: "admin" },
    { name: "Imran Hossain", email: "manager@southeastlandmark.com", role: "manager" },
    { name: "Sabbir Ahmed", email: "editor@southeastlandmark.com", role: "editor" },
    { name: "Tania Rahman", email: "sales@southeastlandmark.com", role: "sales" },
  ];
  const built: AdminUser[] = seeds.map((s) => ({
    id: uid(),
    name: s.name,
    email: s.email,
    phone: "+8801700000000",
    role: s.role,
    active: true,
    avatar: null,
    permissions: { ...DEFAULT_PERMISSIONS[s.role] },
    lastLogin: now,
    createdAt: now,
  }));
  writeLS(LS_USERS, built);
}

export async function listUsers(): Promise<AdminUser[]> {
  if (!USE_MOCK) return apiFetch<AdminUser[]>("/users");
  seedUsers();
  return readLS<AdminUser[]>(LS_USERS, []);
}
export async function createUser(input: Partial<AdminUser>): Promise<AdminUser> {
  const role = (input.role ?? "editor") as UserRole;
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: uid(),
    name: input.name ?? "Unnamed",
    email: input.email ?? "",
    phone: input.phone ?? "",
    role,
    active: input.active ?? true,
    avatar: input.avatar ?? null,
    permissions: input.permissions ?? { ...DEFAULT_PERMISSIONS[role] },
    lastLogin: null,
    createdAt: now,
  };
  if (!USE_MOCK) return apiFetch<AdminUser>("/users", { method: "POST", body: JSON.stringify(user) });
  const all = readLS<AdminUser[]>(LS_USERS, []);
  all.unshift(user);
  writeLS(LS_USERS, all);
  return user;
}
export async function updateUser(id: string, patch: Partial<AdminUser>): Promise<AdminUser> {
  if (!USE_MOCK) return apiFetch<AdminUser>(`/users/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<AdminUser[]>(LS_USERS, []);
  const i = all.findIndex((u) => u.id === id);
  if (i < 0) throw new Error("User not found");
  all[i] = { ...all[i], ...patch };
  writeLS(LS_USERS, all);
  return all[i];
}
export async function deleteUser(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
  writeLS(LS_USERS, readLS<AdminUser[]>(LS_USERS, []).filter((u) => u.id !== id));
}
export async function resetUserPassword(id: string): Promise<{ tempPassword: string }> {
  const temp = Math.random().toString(36).slice(2, 10);
  if (!USE_MOCK) return apiFetch(`/users/${id}/reset-password`, { method: "POST" });
  return { tempPassword: temp };
}

// -------- Theme --------
export const DEFAULT_THEME: ThemeSettings = {
  logo: null,
  favicon: null,
  primaryColor: "oklch(0.78 0.14 85)",
  secondaryColor: "oklch(0.22 0.01 70)",
  accentColor: "oklch(0.86 0.12 88)",
  backgroundColor: "oklch(0.14 0.005 60)",
  surfaceColor: "oklch(0.18 0.008 70)",
  textColor: "oklch(0.96 0.02 90)",
  mutedTextColor: "oklch(0.72 0.03 85)",
  borderColor: "oklch(0.30 0.02 85 / 40%)",
  successColor: "oklch(0.65 0.17 145)",
  errorColor: "oklch(0.577 0.245 27.325)",
  fontHeading: "Playfair Display",
  fontBody: "Inter",
  h1Size: "3.5rem",
  h2Size: "2.5rem",
  h3Size: "1.75rem",
  h4Size: "1.25rem",
  bodySize: "1rem",
  smallSize: "0.875rem",
  lineHeightHeading: "1.2",
  lineHeightBody: "1.6",
  letterSpacingHeading: "-0.02em",
  buttonStyle: "rounded",
  radius: 10,
  shadow: "md",
  headerStyle: "default",
  footerStyle: "default",
  containerWidth: 1280,
  animations: true,
};

export async function getTheme(): Promise<ThemeSettings> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "theme_settings")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged = { ...DEFAULT_THEME, ...(data.value as Partial<ThemeSettings>) };
      writeLS(LS_THEME, merged);
      return merged;
    }
  } catch (err) {
    console.warn("[Settings] getTheme fallback:", err);
  }

  return { ...DEFAULT_THEME, ...readLS<Partial<ThemeSettings>>(LS_THEME, {}) };
}

export async function updateTheme(patch: Partial<ThemeSettings>): Promise<ThemeSettings> {
  const prev = await getTheme();
  const next: ThemeSettings = { ...prev, ...patch };

  const { error } = await supabase.from("app_settings").upsert({
    key: "theme_settings",
    value: next as unknown as any,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[Settings] updateTheme Supabase upsert error:", error);
    throw new Error(`Failed to save theme settings: ${error.message}`);
  }

  writeLS(LS_THEME, next);
  try {
    window.dispatchEvent(new CustomEvent("sel:theme-updated", { detail: next }));
  } catch {
    /* ignore */
  }
  return next;
}

// -------- Media --------
const DEFAULT_MEDIA: MediaFile[] = [
  {
    id: "seed-hero",
    name: "hero.jpg",
    folder: "root",
    url: "/assets/hero.jpg",
    mime: "image/jpeg",
    mimeType: "image/jpeg",
    size: 245000,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "seed-about",
    name: "about.jpg",
    folder: "root",
    url: "/assets/about.jpg",
    mime: "image/jpeg",
    mimeType: "image/jpeg",
    size: 198000,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "seed-prop1",
    name: "property-1.jpg",
    folder: "properties",
    url: "/assets/property-1.jpg",
    mime: "image/jpeg",
    mimeType: "image/jpeg",
    size: 320000,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "seed-prop2",
    name: "property-2.jpg",
    folder: "properties",
    url: "/assets/property-2.jpg",
    mime: "image/jpeg",
    mimeType: "image/jpeg",
    size: 310000,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "seed-prop3",
    name: "property-3.jpg",
    folder: "properties",
    url: "/assets/property-3.jpg",
    mime: "image/jpeg",
    mimeType: "image/jpeg",
    size: 295000,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export async function listMedia(): Promise<MediaFile[]> {
  if (!USE_MOCK) {
    try {
      const res = await apiFetch<MediaFile[]>("/media");
      if (Array.isArray(res) && res.length > 0) {
        return res.map((item) => ({
          ...item,
          mime: item.mime || item.mimeType || "image/jpeg",
          mimeType: item.mimeType || item.mime || "image/jpeg",
        }));
      }
    } catch {
      // Fallback
    }
  }

  const raw = readLS<MediaFile[] | null>(LS_MEDIA, null);
  if (!raw || raw.length === 0) {
    writeLS(LS_MEDIA, DEFAULT_MEDIA);
    return DEFAULT_MEDIA;
  }
  return raw.map((item) => ({
    ...item,
    mime: item.mime || item.mimeType || "image/jpeg",
    mimeType: item.mimeType || item.mime || "image/jpeg",
  }));
}

export async function uploadMedia(file: File, folder = "root"): Promise<MediaFile> {
  let publicUrl = "";
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${folder}/${Date.now()}-${cleanName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(uploadData.path || filePath);
      if (publicUrlData?.publicUrl) {
        publicUrl = publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn("Supabase storage upload fallback:", err);
  }

  let finalUrl = publicUrl;
  if (!finalUrl) {
    finalUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  const mimeType = file.type || "image/jpeg";
  const m: MediaFile = {
    id: uid(),
    name: file.name,
    folder,
    url: finalUrl,
    mime: mimeType,
    mimeType: mimeType,
    size: file.size,
    createdAt: new Date().toISOString(),
  };

  if (!USE_MOCK) {
    try {
      return await apiFetch<MediaFile>("/media", { method: "POST", body: JSON.stringify(m) });
    } catch {
      // Fallback to local storage
    }
  }

  const all = readLS<MediaFile[]>(LS_MEDIA, []);
  all.unshift(m);
  writeLS(LS_MEDIA, all);
  return m;
}
export async function renameMedia(id: string, name: string): Promise<MediaFile> {
  if (!USE_MOCK) return apiFetch(`/media/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
  const all = readLS<MediaFile[]>(LS_MEDIA, []);
  const i = all.findIndex((m) => m.id === id);
  if (i < 0) throw new Error("Not found");
  all[i] = { ...all[i], name };
  writeLS(LS_MEDIA, all);
  return all[i];
}
export async function deleteMedia(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch(`/media/${id}`, { method: "DELETE" });
  writeLS(LS_MEDIA, readLS<MediaFile[]>(LS_MEDIA, []).filter((m) => m.id !== id));
}
export async function listMediaFolders(): Promise<string[]> {
  const files = await listMedia();
  return Array.from(new Set(["root", ...files.map((f) => f.folder)]));
}

// -------- Global Settings --------
export const DEFAULT_GLOBAL: GlobalSettings = {
  companyName: "Southeast Landmark Ltd",
  address: "19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207",
  phone: "01591-134357",
  email: "info@southeastlandmark.com",
  whatsapp: "8801591134357",
  officeHours: "Sat – Thu 9:00 – 6:00, Friday CLOSED",
  socials: { facebook: "", instagram: "", linkedin: "", youtube: "", twitter: "" },
  copyright: "© Southeast Landmark Ltd. All rights reserved.",
  seo: { title: "Southeast Landmark Ltd", description: "Building landmarks you can call home.", keywords: "real estate, dhaka, plots, apartments" },
  og: { title: "Southeast Landmark Ltd", description: "Building landmarks you can call home.", image: "" },
  mapsEmbed: "",
  smtp: { host: "", port: "587", user: "", password: "", fromEmail: "", fromName: "" },
};

export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged = { ...DEFAULT_GLOBAL, ...(data.value as Partial<GlobalSettings>) };
      writeLS(LS_GLOBAL, merged);
      return merged;
    }
  } catch (err) {
    console.warn("[Settings] getGlobalSettings fallback:", err);
  }

  return { ...DEFAULT_GLOBAL, ...readLS<Partial<GlobalSettings>>(LS_GLOBAL, {}) };
}

export async function updateGlobalSettings(patch: Partial<GlobalSettings>): Promise<GlobalSettings> {
  const prev = await getGlobalSettings();
  const next: GlobalSettings = { ...prev, ...patch };

  const { error } = await supabase.from("app_settings").upsert({
    key: "site_settings",
    value: next as unknown as any,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[Settings] updateGlobalSettings Supabase upsert error:", error);
    throw new Error(`Failed to save site settings: ${error.message}`);
  }

  writeLS(LS_GLOBAL, next);
  return next;
}

export function permissionsFor(role: UserRole): Record<PermissionKey, boolean> {
  return { ...DEFAULT_PERMISSIONS[role] };
}