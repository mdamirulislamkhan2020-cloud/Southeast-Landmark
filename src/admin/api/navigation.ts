export type MenuLocation = "header" | "footer" | "mobile" | "topbar" | "custom";
export type MenuVisibility = "everyone" | "auth" | "guest" | "admin";
export type MenuLinkType = "internal" | "external" | "anchor";

export interface MenuItem {
  id: string;
  parentId: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string;              // full URL or path
  pageId?: string | null;   // reference to a CMS page id
  icon?: string | null;     // lucide icon name
  newTab: boolean;
  visibility: MenuVisibility;
  enabled: boolean;
  sortOrder: number;
  cssClass?: string;
}

export interface Menu {
  id: string;
  name: string;             // internal name e.g. "Main Header Menu"
  slug: string;             // stable slug e.g. "main"
  location: MenuLocation;   // where it renders
  description?: string;
  enabled: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HeaderSettings {
  visible: boolean;
  sticky: boolean;
  transparent: boolean;
  backgroundColor: string;   // CSS color / hsl
  height: number;            // px
  logo: string | null;
  mobileLogo: string | null;
  ctaText: string;
  ctaLink: string;
  ctaEnabled: boolean;
  headerMenuSlug: string;
  topBarMenuSlug: string;
  showTopBar: boolean;
  topBarText: string;
}

export interface FooterSettings {
  visible: boolean;
  columns: number;
  backgroundColor: string;
  copyright: string;
  footerMenuSlug: string;
  showSocials: boolean;
}

export interface MobileMenuSettings {
  enabled: boolean;
  hamburger: boolean;
  mobileMenuSlug: string;
  showCta: boolean;
}

export const VISIBILITY_LABELS: Record<MenuVisibility, string> = {
  everyone: "Everyone",
  auth: "Logged-in users",
  guest: "Guests only",
  admin: "Admin only",
};

export const LOCATION_LABELS: Record<MenuLocation, string> = {
  header: "Header",
  footer: "Footer",
  mobile: "Mobile",
  topbar: "Top bar",
  custom: "Custom",
};