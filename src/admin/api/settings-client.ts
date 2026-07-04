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
const MEDIA_BUCKET = "media";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

// ---------- Supabase-backed app_settings helper ----------
async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return { ...(fallback as object), ...((data.value as object) ?? {}) } as T;
}
async function writeSetting<T extends object>(key: string, value: T): Promise<T> {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return value;
}

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
  primaryColor: "43 74% 49%",
  secondaryColor: "220 14% 96%",
  accentColor: "43 74% 49%",
  fontHeading: "Playfair Display",
  fontBody: "Inter",
  buttonStyle: "rounded",
  radius: 8,
  shadow: "md",
  headerStyle: "default",
  footerStyle: "default",
  containerWidth: 1280,
  animations: true,
};

export async function getTheme(): Promise<ThemeSettings> {
  return readSetting<ThemeSettings>("theme", DEFAULT_THEME);
}
export async function updateTheme(patch: Partial<ThemeSettings>): Promise<ThemeSettings> {
  const next = { ...(await getTheme()), ...patch };
  await writeSetting("theme", next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sel:theme-updated", { detail: next }));
  }
  return next;
}

// -------- Media --------
//
// Media Library is backed by Supabase Storage (private `media` bucket).
// The MediaFile.id is the storage path (e.g. "root/logo.png"); the URL is a
// short-lived signed URL suitable for previews and copy-to-clipboard.
//

async function signUrl(path: string): Promise<string> {
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? "";
}

async function listFolderRecursive(prefix: string): Promise<MediaFile[]> {
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(error.message);
  const files: MediaFile[] = [];
  for (const entry of data ?? []) {
    // Storage marks folders with id === null
    if (entry.id === null) {
      const nested = await listFolderRecursive(prefix ? `${prefix}/${entry.name}` : entry.name);
      files.push(...nested);
      continue;
    }
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    const folder = prefix || "root";
    const meta = entry.metadata ?? {};
    files.push({
      id: path,
      name: entry.name,
      folder,
      url: await signUrl(path),
      mime: (meta as { mimetype?: string }).mimetype ?? "application/octet-stream",
      size: Number((meta as { size?: number }).size ?? 0),
      createdAt: entry.created_at ?? new Date().toISOString(),
    });
  }
  return files;
}

export async function listMedia(): Promise<MediaFile[]> {
  return listFolderRecursive("");
}

export async function uploadMedia(file: File, folder = "root"): Promise<MediaFile> {
  const safeFolder = folder && folder !== "all" ? folder : "root";
  const path = `${safeFolder}/${Date.now()}-${file.name}`.replace(/^\/+/, "");
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return {
    id: path,
    name: file.name,
    folder: safeFolder,
    url: await signUrl(path),
    mime: file.type || "application/octet-stream",
    size: file.size,
    createdAt: new Date().toISOString(),
  };
}

export async function renameMedia(id: string, name: string): Promise<MediaFile> {
  const parts = id.split("/");
  parts[parts.length - 1] = name;
  const nextPath = parts.join("/");
  const { error } = await supabase.storage.from(MEDIA_BUCKET).move(id, nextPath);
  if (error) throw new Error(error.message);
  const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "root";
  return {
    id: nextPath,
    name,
    folder,
    url: await signUrl(nextPath),
    mime: "application/octet-stream",
    size: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([id]);
  if (error) throw new Error(error.message);
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
  return readSetting<GlobalSettings>("global", DEFAULT_GLOBAL);
}
export async function updateGlobalSettings(patch: Partial<GlobalSettings>): Promise<GlobalSettings> {
  const next = { ...(await getGlobalSettings()), ...patch };
  await writeSetting("global", next);
  return next;
}

export function permissionsFor(role: UserRole): Record<PermissionKey, boolean> {
  return { ...DEFAULT_PERMISSIONS[role] };
}