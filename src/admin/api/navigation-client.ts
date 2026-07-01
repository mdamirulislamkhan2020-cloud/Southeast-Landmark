import type {
  FooterSettings,
  HeaderSettings,
  Menu,
  MenuItem,
  MenuLocation,
  MobileMenuSettings,
} from "./navigation";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_MENUS = "sel_admin_menus_v1";
const LS_HEADER = "sel_admin_header_settings_v1";
const LS_FOOTER = "sel_admin_footer_settings_v1";
const LS_MOBILE = "sel_admin_mobile_menu_v1";

const NAV_EVENT = "sel:navigation-updated";

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
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  try {
    window.dispatchEvent(new CustomEvent(NAV_EVENT));
  } catch {
    /* ignore */
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
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

function seedMenus(): Menu[] {
  const existing = readLS<Menu[] | null>(LS_MENUS, null);
  if (existing && existing.length) return existing;
  const ts = nowISO();
  const built: Menu[] = [
    { id: uid(), name: "Main Header Menu", slug: "header", location: "header", enabled: true, items: defaultHeaderItems(), createdAt: ts, updatedAt: ts },
    { id: uid(), name: "Footer Menu", slug: "footer", location: "footer", enabled: true, items: defaultFooterItems(), createdAt: ts, updatedAt: ts },
    { id: uid(), name: "Mobile Menu", slug: "mobile", location: "mobile", enabled: true, items: defaultHeaderItems(), createdAt: ts, updatedAt: ts },
    { id: uid(), name: "Top Bar Menu", slug: "topbar", location: "topbar", enabled: false, items: [], createdAt: ts, updatedAt: ts },
  ];
  writeLS(LS_MENUS, built);
  return built;
}

export async function listMenus(): Promise<Menu[]> {
  if (!USE_MOCK) return apiFetch<Menu[]>("/menus");
  return seedMenus();
}

export async function getMenu(id: string): Promise<Menu | null> {
  const all = await listMenus();
  return all.find((m) => m.id === id) ?? null;
}

export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  const all = await listMenus();
  return all.find((m) => m.slug === slug) ?? null;
}

export async function createMenu(input: Partial<Menu>): Promise<Menu> {
  const ts = nowISO();
  const menu: Menu = {
    id: uid(),
    name: input.name ?? "New Menu",
    slug: (input.slug ?? `menu-${Date.now().toString(36)}`).replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    location: input.location ?? "custom",
    description: input.description ?? "",
    enabled: input.enabled ?? true,
    items: input.items ?? [],
    createdAt: ts,
    updatedAt: ts,
  };
  if (!USE_MOCK) return apiFetch<Menu>("/menus", { method: "POST", body: JSON.stringify(menu) });
  const all = seedMenus();
  all.push(menu);
  writeLS(LS_MENUS, all);
  return menu;
}

export async function updateMenu(id: string, patch: Partial<Menu>): Promise<Menu> {
  if (!USE_MOCK) return apiFetch<Menu>(`/menus/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = seedMenus();
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) throw new Error("Menu not found");
  all[idx] = { ...all[idx], ...patch, updatedAt: nowISO() };
  writeLS(LS_MENUS, all);
  return all[idx];
}

export async function deleteMenu(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/menus/${id}`, { method: "DELETE" });
  writeLS(LS_MENUS, seedMenus().filter((m) => m.id !== id));
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
  if (!USE_MOCK) return apiFetch<HeaderSettings>("/nav/header");
  return { ...DEFAULT_HEADER, ...readLS<Partial<HeaderSettings>>(LS_HEADER, {}) };
}
export async function saveHeaderSettings(patch: Partial<HeaderSettings>): Promise<HeaderSettings> {
  const next = { ...(await getHeaderSettings()), ...patch };
  if (!USE_MOCK) return apiFetch<HeaderSettings>("/nav/header", { method: "PUT", body: JSON.stringify(next) });
  writeLS(LS_HEADER, next);
  return next;
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
  if (!USE_MOCK) return apiFetch<FooterSettings>("/nav/footer");
  return { ...DEFAULT_FOOTER, ...readLS<Partial<FooterSettings>>(LS_FOOTER, {}) };
}
export async function saveFooterSettings(patch: Partial<FooterSettings>): Promise<FooterSettings> {
  const next = { ...(await getFooterSettings()), ...patch };
  if (!USE_MOCK) return apiFetch<FooterSettings>("/nav/footer", { method: "PUT", body: JSON.stringify(next) });
  writeLS(LS_FOOTER, next);
  return next;
}

// ---------- Mobile menu settings ----------

const DEFAULT_MOBILE: MobileMenuSettings = {
  enabled: true,
  hamburger: true,
  mobileMenuSlug: "mobile",
  showCta: true,
};

export async function getMobileMenuSettings(): Promise<MobileMenuSettings> {
  if (!USE_MOCK) return apiFetch<MobileMenuSettings>("/nav/mobile");
  return { ...DEFAULT_MOBILE, ...readLS<Partial<MobileMenuSettings>>(LS_MOBILE, {}) };
}
export async function saveMobileMenuSettings(patch: Partial<MobileMenuSettings>): Promise<MobileMenuSettings> {
  const next = { ...(await getMobileMenuSettings()), ...patch };
  if (!USE_MOCK) return apiFetch<MobileMenuSettings>("/nav/mobile", { method: "PUT", body: JSON.stringify(next) });
  writeLS(LS_MOBILE, next);
  return next;
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