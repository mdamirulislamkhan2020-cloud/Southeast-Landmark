import { supabase } from "@/integrations/supabase/client";
import type {
  FooterColumn,
  FooterSettings,
  HeaderSettings,
  Menu,
  MenuItem,
  MenuLocation,
  MobileMenuSettings,
} from "./navigation";
import { site } from "@/config/site";

const LS_MENUS = "sel_admin_menus_v1";
const LS_HEADER = "sel_admin_header_settings_v1";
const LS_FOOTER = "sel_admin_footer_settings_v1";
const LS_MOBILE = "sel_admin_mobile_menu_v1";

const NAV_EVENT = "sel:navigation-updated";
export const FOOTER_EVENT = "sel:footer-updated";

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

function writeLS<T>(key: string, value: T, eventName = NAV_EVENT) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
  } catch {
    /* ignore */
  }
}

export const NAV_UPDATE_EVENT = NAV_EVENT;

function nowISO() {
  return new Date().toISOString();
}

export function defaultItem(overrides: Partial<MenuItem> = {}): MenuItem {
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

export function defaultHeaderItems(): MenuItem[] {
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

export function defaultFooterItems(): MenuItem[] {
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

function initialSeedMenus(): Menu[] {
  const ts = nowISO();
  return [
    {
      id: uid(),
      name: "Main Header Menu",
      slug: "header",
      location: "header",
      enabled: true,
      items: defaultHeaderItems(),
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uid(),
      name: "Footer Menu",
      slug: "footer",
      location: "footer",
      enabled: true,
      items: defaultFooterItems(),
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uid(),
      name: "Mobile Menu",
      slug: "mobile",
      location: "mobile",
      enabled: true,
      items: defaultHeaderItems(),
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uid(),
      name: "Top Bar Menu",
      slug: "topbar",
      location: "topbar",
      enabled: false,
      items: [],
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

// ---------- MENUS CRUD (Supabase with LS fallback) ----------

export async function listMenus(): Promise<Menu[]> {
  try {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped: Menu[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        location: (row.location as MenuLocation) || "custom",
        description: row.description || "",
        enabled: row.enabled ?? true,
        items: (Array.isArray(row.items) ? row.items : []) as unknown as MenuItem[],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      writeLS(LS_MENUS, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("[Navigation] listMenus Supabase read fallback:", err);
  }

  // Fallback to local cache or seed
  const cached = readLS<Menu[] | null>(LS_MENUS, null);
  if (cached && cached.length > 0) return cached;

  const seeds = initialSeedMenus();
  writeLS(LS_MENUS, seeds);

  // Attempt to save to Supabase asynchronously if authenticated admin
  try {
    for (const m of seeds) {
      await supabase.from("menus").upsert({
        name: m.name,
        slug: m.slug,
        location: m.location,
        description: m.description,
        enabled: m.enabled,
        items: m.items as unknown as any,
      });
    }
  } catch {
    /* ignore seed error if unauthenticated */
  }

  return seeds;
}

export async function getMenu(id: string): Promise<Menu | null> {
  const all = await listMenus();
  return all.find((m) => m.id === id) ?? null;
}

export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  try {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        location: (data.location as MenuLocation) || "custom",
        description: data.description || "",
        enabled: data.enabled ?? true,
        items: (Array.isArray(data.items) ? data.items : []) as unknown as MenuItem[],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    console.warn("[Navigation] getMenuBySlug fallback for slug:", slug, err);
  }

  const all = await listMenus();
  return all.find((m) => m.slug === slug) ?? null;
}

export async function createMenu(input: Partial<Menu>): Promise<Menu> {
  const ts = nowISO();
  const slug = (input.slug ?? `menu-${Date.now().toString(36)}`).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const menu: Menu = {
    id: uid(),
    name: input.name ?? "New Menu",
    slug,
    location: input.location ?? "custom",
    description: input.description ?? "",
    enabled: input.enabled ?? true,
    items: input.items ?? [],
    createdAt: ts,
    updatedAt: ts,
  };

  try {
    const { data, error } = await supabase
      .from("menus")
      .insert({
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        description: menu.description,
        enabled: menu.enabled,
        items: menu.items as unknown as any,
      })
      .select()
      .single();

    if (!error && data) {
      menu.id = data.id;
    }
  } catch (err) {
    console.warn("[Navigation] createMenu Supabase insert fallback:", err);
  }

  const all = await listMenus();
  all.push(menu);
  writeLS(LS_MENUS, all);
  return menu;
}

export async function updateMenu(id: string, patch: Partial<Menu>): Promise<Menu> {
  const ts = nowISO();

  try {
    await supabase
      .from("menus")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
        ...(patch.location !== undefined ? { location: patch.location } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
        ...(patch.items !== undefined ? { items: patch.items as unknown as any } : {}),
        updated_at: ts,
      })
      .eq("id", id);
  } catch (err) {
    console.warn("[Navigation] updateMenu Supabase update fallback:", err);
  }

  const all = await listMenus();
  const idx = all.findIndex((m) => m.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch, updatedAt: ts };
    writeLS(LS_MENUS, all);
    return all[idx];
  }
  return { id, name: patch.name ?? "", slug: patch.slug ?? "", location: patch.location ?? "custom", enabled: true, items: patch.items ?? [], createdAt: ts, updatedAt: ts };
}

export async function saveMenu(menu: Menu): Promise<Menu> {
  if (!menu.id) return createMenu(menu);
  return updateMenu(menu.id, menu);
}

export async function deleteMenu(id: string): Promise<void> {
  try {
    await supabase.from("menus").delete().eq("id", id);
  } catch (err) {
    console.warn("[Navigation] deleteMenu Supabase error:", err);
  }
  const all = (await listMenus()).filter((m) => m.id !== id);
  writeLS(LS_MENUS, all);
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

// ---------- HEADER SETTINGS ----------

export const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  visible: true,
  sticky: true,
  transparent: false,
  backgroundColor: "oklch(0.14 0.005 60)",
  backgroundOpacity: 90,
  backdropBlur: true,
  height: 80,
  heightTablet: 72,
  heightMobile: 64,
  maxWidth: 1280,
  paddingX: 24,
  paddingY: 0,
  borderBottom: true,
  borderColor: "oklch(0.30 0.02 85 / 40%)",
  shadow: "none",
  zIndex: 50,
  alignment: "space-between",
  logo: null,
  mobileLogo: null,
  logoWidth: 140,
  logoHeight: 40,
  logoFit: "contain",
  logoLink: "/",
  siteTitleVisible: true,
  siteTitleText: site.short,
  ctaText: "Login",
  ctaLink: "#login",
  ctaEnabled: true,
  ctaIcon: "User",
  ctaBgColor: "",
  ctaTextColor: "",
  ctaHoverBgColor: "",
  ctaHoverTextColor: "",
  ctaBorder: "1px solid",
  ctaRadius: 9999,
  ctaPaddingX: 18,
  ctaPaddingY: 8,
  ctaFontSize: 14,
  ctaFontWeight: "600",
  headerMenuSlug: "header",
  topBarMenuSlug: "topbar",
  showTopBar: false,
  topBarText: "",
  topBarBg: "",
  topBarTextColor: "",
};

export async function getHeaderSettings(): Promise<HeaderSettings> {
  try {
    const { data, error } = await supabase
      .from("nav_settings")
      .select("value")
      .eq("key", "header_settings")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged = { ...DEFAULT_HEADER_SETTINGS, ...(data.value as Partial<HeaderSettings>) };
      writeLS(LS_HEADER, merged);
      return merged;
    }
  } catch (err) {
    console.warn("[Navigation] getHeaderSettings fallback:", err);
  }

  const cached = readLS<Partial<HeaderSettings>>(LS_HEADER, {});
  return { ...DEFAULT_HEADER_SETTINGS, ...cached };
}

export async function saveHeaderSettings(patch: Partial<HeaderSettings>): Promise<HeaderSettings> {
  const prev = await getHeaderSettings();
  const next: HeaderSettings = { ...prev, ...patch };

  try {
    await supabase.from("nav_settings").upsert({
      key: "header_settings",
      value: next as unknown as any,
      updated_at: nowISO(),
    });
  } catch (err) {
    console.warn("[Navigation] saveHeaderSettings Supabase upsert error:", err);
  }

  writeLS(LS_HEADER, next);
  return next;
}

// ---------- FOOTER SETTINGS ----------

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  visible: true,
  columns: 4,
  backgroundColor: "oklch(0.18 0.008 70)",
  textColor: "oklch(0.72 0.03 85)",
  accentColor: "oklch(0.78 0.14 85)",
  borderColor: "oklch(0.30 0.02 85 / 40%)",
  paddingY: 64,
  logo: null,
  logoWidth: 140,
  logoHeight: 40,
  description: site.tagline,
  copyright: `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`,
  bottomTagline: "Crafted with care.",
  footerMenuSlug: "footer",
  showSocials: true,
  showNewsletter: true,
  newsletterTitle: "Newsletter",
  newsletterSubtitle: "Project launches & investment updates.",
  address: site.address,
  phone: site.phone,
  email: site.email,
  businessHours: site.hours,
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    whatsapp: "01591-134357",
  },
  columnsList: [
    {
      id: "col-links",
      title: "Useful Links",
      type: "links",
      visible: true,
      sortOrder: 0,
      links: [
        { id: "l-1", label: "Home", url: "/", visible: true },
        { id: "l-2", label: "About", url: "/about", visible: true },
        { id: "l-3", label: "Projects", url: "/property", visible: true },
        { id: "l-4", label: "Blog", url: "/blog", visible: true },
        { id: "l-5", label: "FAQ", url: "/faq", visible: true },
        { id: "l-6", label: "Contact", url: "/contact", visible: true },
      ],
    },
    {
      id: "col-policy",
      title: "Company Policy",
      type: "links",
      visible: true,
      sortOrder: 1,
      links: [
        { id: "p-1", label: "Privacy Policy", url: "#privacy", visible: true },
        { id: "p-2", label: "Terms & Conditions", url: "#terms", visible: true },
      ],
    },
    {
      id: "col-contact",
      title: "Get in touch",
      type: "contact",
      visible: true,
      sortOrder: 2,
    },
  ],
};

export async function getFooterSettings(): Promise<FooterSettings> {
  try {
    const { data, error } = await supabase
      .from("nav_settings")
      .select("value")
      .eq("key", "footer_settings")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged = { ...DEFAULT_FOOTER_SETTINGS, ...(data.value as Partial<FooterSettings>) };
      writeLS(LS_FOOTER, merged, FOOTER_EVENT);
      return merged;
    }
  } catch (err) {
    console.warn("[Navigation] getFooterSettings fallback:", err);
  }

  const cached = readLS<Partial<FooterSettings>>(LS_FOOTER, {});
  return { ...DEFAULT_FOOTER_SETTINGS, ...cached };
}

export async function saveFooterSettings(patch: Partial<FooterSettings>): Promise<FooterSettings> {
  const prev = await getFooterSettings();
  const next: FooterSettings = { ...prev, ...patch };

  try {
    await supabase.from("nav_settings").upsert({
      key: "footer_settings",
      value: next as unknown as any,
      updated_at: nowISO(),
    });
  } catch (err) {
    console.warn("[Navigation] saveFooterSettings Supabase upsert error:", err);
  }

  writeLS(LS_FOOTER, next, FOOTER_EVENT);
  return next;
}

// ---------- MOBILE MENU SETTINGS ----------

export const DEFAULT_MOBILE_SETTINGS: MobileMenuSettings = {
  enabled: true,
  hamburger: true,
  hamburgerColor: "",
  mobileMenuSlug: "mobile",
  mobileLogo: null,
  mobileHeaderHeight: 64,
  menuBackground: "",
  menuTextColor: "",
  menuActiveColor: "",
  itemSpacing: 8,
  submenuBehavior: "accordion",
  showCta: true,
};

export async function getMobileMenuSettings(): Promise<MobileMenuSettings> {
  try {
    const { data, error } = await supabase
      .from("nav_settings")
      .select("value")
      .eq("key", "mobile_menu_settings")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged = { ...DEFAULT_MOBILE_SETTINGS, ...(data.value as Partial<MobileMenuSettings>) };
      writeLS(LS_MOBILE, merged);
      return merged;
    }
  } catch (err) {
    console.warn("[Navigation] getMobileMenuSettings fallback:", err);
  }

  const cached = readLS<Partial<MobileMenuSettings>>(LS_MOBILE, {});
  return { ...DEFAULT_MOBILE_SETTINGS, ...cached };
}

export async function saveMobileMenuSettings(patch: Partial<MobileMenuSettings>): Promise<MobileMenuSettings> {
  const prev = await getMobileMenuSettings();
  const next: MobileMenuSettings = { ...prev, ...patch };

  try {
    await supabase.from("nav_settings").upsert({
      key: "mobile_menu_settings",
      value: next as unknown as any,
      updated_at: nowISO(),
    });
  } catch (err) {
    console.warn("[Navigation] saveMobileMenuSettings Supabase upsert error:", err);
  }

  writeLS(LS_MOBILE, next);
  return next;
}

// ---------- TREE BUILDER ----------

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
