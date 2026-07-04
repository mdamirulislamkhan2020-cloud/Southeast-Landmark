import { supabase } from "@/integrations/supabase/client";
import type {
  FooterSettings,
  HeaderSettings,
  Menu,
  MenuItem,
  MenuLocation,
  MobileMenuSettings,
} from "./navigation";

const NAV_EVENT = "sel:navigation-updated";

function emitUpdate() {
  if (typeof window === "undefined") return;
  try { window.dispatchEvent(new CustomEvent(NAV_EVENT)); } catch { /* ignore */ }
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const NAV_UPDATE_EVENT = NAV_EVENT;

function nowISO() { return new Date().toISOString(); }

function defaultItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: uid(),
    parentId: null,
    label: overrides.label ?? "New Item",
    linkType: overrides.linkType ?? "internal",
    url: overrides.url ?? "/",
    pageId: overrides.pageId ?? null,
    icon: overrides.icon ?? null,
    newTab: overrides.newTab ?? false,
    visibility: overrides.visibility ?? "everyone",
    enabled: overrides.enabled ?? true,
    sortOrder: overrides.sortOrder ?? 0,
    cssClass: overrides.cssClass ?? "",
  };
}

function defaultHeaderItems(): MenuItem[] {
  const base: Partial<MenuItem>[] = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Projects", url: "/property" },
    { label: "Blog", url: "/blog" },
    { label: "FAQ", url: "/faq" },
    { label: "Contact", url: "/contact" },
  ];
  return base.map((b, i) => defaultItem({ ...b, sortOrder: i }));
}

function defaultFooterItems(): MenuItem[] {
  const base: Partial<MenuItem>[] = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Projects", url: "/property" },
    { label: "Blog", url: "/blog" },
    { label: "FAQ", url: "/faq" },
    { label: "Contact", url: "/contact" },
  ];
  return base.map((b, i) => defaultItem({ ...b, sortOrder: i }));
}

type MenuRow = {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string | null;
  enabled: boolean;
  items: unknown;
  created_at: string;
  updated_at: string;
};

function rowToMenu(r: MenuRow): Menu {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    location: (r.location as MenuLocation) ?? "custom",
    description: r.description ?? "",
    enabled: r.enabled,
    items: Array.isArray(r.items) ? (r.items as MenuItem[]) : [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

let _seededOnce = false;
async function seedIfEmpty(): Promise<void> {
  if (_seededOnce) return;
  _seededOnce = true;
  const { data, error } = await supabase.from("menus").select("id").limit(1);
  if (error || (data && data.length > 0)) return;
  const seeds = [
    { name: "Main Header Menu", slug: "header", location: "header", enabled: true, items: defaultHeaderItems() },
    { name: "Footer Menu", slug: "footer", location: "footer", enabled: true, items: defaultFooterItems() },
    { name: "Mobile Menu", slug: "mobile", location: "mobile", enabled: true, items: defaultHeaderItems() },
    { name: "Top Bar Menu", slug: "topbar", location: "topbar", enabled: false, items: [] as MenuItem[] },
  ];
  // Best-effort; if RLS blocks (not an admin), silently continue.
  await supabase.from("menus").insert(seeds.map((s) => ({ ...s, description: "", items: s.items as unknown as MenuItem[] })));
}

export async function listMenus(): Promise<Menu[]> {
  const { data, error } = await supabase.from("menus").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) {
    await seedIfEmpty();
    const { data: d2, error: e2 } = await supabase.from("menus").select("*").order("created_at", { ascending: true });
    if (e2) throw e2;
    return (d2 ?? []).map((r) => rowToMenu(r as MenuRow));
  }
  return data.map((r) => rowToMenu(r as MenuRow));
}

export async function getMenu(id: string): Promise<Menu | null> {
  const { data, error } = await supabase.from("menus").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToMenu(data as MenuRow) : null;
}

export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  const { data, error } = await supabase.from("menus").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (data) return rowToMenu(data as MenuRow);
  // Auto-seed default menus once so the public site has navigation
  await seedIfEmpty();
  const { data: d2 } = await supabase.from("menus").select("*").eq("slug", slug).maybeSingle();
  return d2 ? rowToMenu(d2 as MenuRow) : null;
}

export async function createMenu(input: Partial<Menu>): Promise<Menu> {
  const payload = {
    name: input.name ?? "New Menu",
    slug: (input.slug ?? `menu-${Date.now().toString(36)}`).replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    location: input.location ?? "custom",
    description: input.description ?? "",
    enabled: input.enabled ?? true,
    items: (input.items ?? []) as unknown as MenuItem[],
  };
  const { data, error } = await supabase.from("menus").insert(payload).select("*").single();
  if (error) throw error;
  emitUpdate();
  return rowToMenu(data as MenuRow);
}

export async function updateMenu(id: string, patch: Partial<Menu>): Promise<Menu> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.slug !== undefined) dbPatch.slug = patch.slug;
  if (patch.location !== undefined) dbPatch.location = patch.location;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.enabled !== undefined) dbPatch.enabled = patch.enabled;
  if (patch.items !== undefined) dbPatch.items = patch.items;
  const { data, error } = await supabase.from("menus").update(dbPatch).eq("id", id).select("*").single();
  if (error) throw error;
  emitUpdate();
  return rowToMenu(data as MenuRow);
}

export async function deleteMenu(id: string): Promise<void> {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw error;
  emitUpdate();
}

export async function duplicateMenu(id: string): Promise<Menu> {
  const src = await getMenu(id);
  if (!src) throw new Error("Menu not found");
  return createMenu({
    ...src,
    name: `${src.name} (Copy)`,
    slug: `${src.slug}-copy-${Date.now().toString(36)}`,
    location: "custom",
    items: src.items.map((it) => ({ ...it, id: uid() })),
  });
}

export function newMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return defaultItem(overrides);
}

// ---------- Settings helpers (key/value backed by nav_settings) ----------

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from("nav_settings").select("value").eq("key", key).maybeSingle();
  if (error) return fallback;
  if (!data) return fallback;
  return { ...fallback, ...(data.value as object) } as T;
}

async function saveSetting<T extends object>(key: string, value: T): Promise<T> {
  const { error } = await supabase
    .from("nav_settings")
    .upsert({ key, value: value as unknown as Record<string, unknown> }, { onConflict: "key" });
  if (error) throw error;
  emitUpdate();
  return value;
}

// ---------- Header settings ----------

const DEFAULT_HEADER: HeaderSettings = {
  visible: true,
  sticky: true,
  transparent: false,
  backgroundColor: "hsl(var(--background))",
  height: 80,
  logo: null,
  mobileLogo: null,
  ctaText: "Login",
  ctaLink: "#login",
  ctaEnabled: true,
  headerMenuSlug: "header",
  topBarMenuSlug: "topbar",
  showTopBar: false,
  topBarText: "",
};

export async function getHeaderSettings(): Promise<HeaderSettings> {
  return getSetting<HeaderSettings>("header", DEFAULT_HEADER);
}
export async function saveHeaderSettings(patch: Partial<HeaderSettings>): Promise<HeaderSettings> {
  const next = { ...(await getHeaderSettings()), ...patch };
  return saveSetting("header", next);
}

// ---------- Footer settings ----------

const DEFAULT_FOOTER: FooterSettings = {
  visible: true,
  columns: 4,
  backgroundColor: "hsl(var(--card))",
  copyright: "",
  footerMenuSlug: "footer",
  showSocials: true,
};

export async function getFooterSettings(): Promise<FooterSettings> {
  return getSetting<FooterSettings>("footer", DEFAULT_FOOTER);
}
export async function saveFooterSettings(patch: Partial<FooterSettings>): Promise<FooterSettings> {
  const next = { ...(await getFooterSettings()), ...patch };
  return saveSetting("footer", next);
}

// ---------- Mobile menu settings ----------

const DEFAULT_MOBILE: MobileMenuSettings = {
  enabled: true,
  hamburger: true,
  mobileMenuSlug: "mobile",
  showCta: true,
};

export async function getMobileMenuSettings(): Promise<MobileMenuSettings> {
  return getSetting<MobileMenuSettings>("mobile", DEFAULT_MOBILE);
}
export async function saveMobileMenuSettings(patch: Partial<MobileMenuSettings>): Promise<MobileMenuSettings> {
  const next = { ...(await getMobileMenuSettings()), ...patch };
  return saveSetting("mobile", next);
}

// ---------- Helpers ----------

export interface MenuItemNode extends MenuItem {
  children: MenuItemNode[];
  depth: number;
}

export function buildTree(items: MenuItem[]): MenuItemNode[] {
  const byId = new Map<string, MenuItemNode>();
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  sorted.forEach((it) => byId.set(it.id, { ...it, children: [], depth: 0 }));
  const roots: MenuItemNode[] = [];
  sorted.forEach((it) => {
    const node = byId.get(it.id)!;
    if (it.parentId && byId.has(it.parentId)) {
      const parent = byId.get(it.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}