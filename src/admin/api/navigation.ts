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
  backgroundColor: string;   // CSS color / hsl / oklch
  backgroundOpacity?: number; // 0 - 100
  backdropBlur?: boolean;
  height: number;            // Desktop px
  heightTablet?: number;     // Tablet px
  heightMobile?: number;     // Mobile px
  maxWidth?: number;         // Container max-width px
  paddingX?: number;         // Container padding px
  paddingY?: number;         // Vertical padding px
  borderBottom?: boolean;
  borderColor?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  zIndex?: number;
  alignment?: "left" | "center" | "space-between";
  logo: string | null;
  mobileLogo: string | null;
  logoWidth?: number;
  logoHeight?: number;
  logoFit?: "contain" | "cover" | "fill";
  logoLink?: string;
  siteTitleVisible?: boolean;
  siteTitleText?: string;
  // CTA Button
  ctaText: string;
  ctaLink: string;
  ctaEnabled: boolean;
  ctaIcon?: string | null;
  ctaBgColor?: string;
  ctaTextColor?: string;
  ctaHoverBgColor?: string;
  ctaHoverTextColor?: string;
  ctaBorder?: string;
  ctaRadius?: number;
  ctaPaddingX?: number;
  ctaPaddingY?: number;
  ctaFontSize?: number;
  ctaFontWeight?: string;
  // Menu references
  headerMenuSlug: string;
  topBarMenuSlug: string;
  showTopBar: boolean;
  topBarText: string;
  topBarBg?: string;
  topBarTextColor?: string;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  pageId?: string | null;
  newTab?: boolean;
  visible?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  type: "links" | "contact" | "newsletter" | "custom_text";
  customContent?: string;
  links?: FooterLinkItem[];
  visible: boolean;
  sortOrder: number;
}

export interface FooterSettings {
  visible: boolean;
  columns: number;
  backgroundColor: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  paddingY?: number;
  logo?: string | null;
  logoWidth?: number;
  logoHeight?: number;
  description?: string;
  copyright: string;
  bottomTagline?: string;
  footerMenuSlug: string;
  showSocials: boolean;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessHours?: string;
  socials?: Record<string, string>;
  columnsList?: FooterColumn[];
}

export interface MobileMenuSettings {
  enabled: boolean;
  hamburger: boolean;
  hamburgerColor?: string;
  mobileMenuSlug: string;
  mobileLogo?: string | null;
  mobileHeaderHeight?: number;
  menuBackground?: string;
  menuTextColor?: string;
  menuActiveColor?: string;
  itemSpacing?: number;
  submenuBehavior?: "accordion" | "dropdown";
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