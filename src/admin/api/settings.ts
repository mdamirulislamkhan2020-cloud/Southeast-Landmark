export type UserRole = "super_admin" | "admin" | "manager" | "editor" | "sales";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  editor: "Editor",
  sales: "Sales Executive",
};

export const PERMISSION_KEYS = [
  "dashboard",
  "cms",
  "properties",
  "blog",
  "faq",
  "testimonials",
  "lead_forms",
  "crm",
  "analytics",
  "seo",
  "integrations",
  "settings",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: "Dashboard",
  cms: "CMS",
  properties: "Properties",
  blog: "Blog",
  faq: "FAQ",
  testimonials: "Testimonials",
  lead_forms: "Lead Forms",
  crm: "CRM",
  analytics: "Analytics",
  seo: "SEO",
  integrations: "Integrations",
  settings: "Settings",
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  avatar?: string | null;
  permissions: Partial<Record<PermissionKey, boolean>>;
  lastLogin?: string | null;
  createdAt: string;
}

export interface ButtonCustomStyle {
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  radius?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  fontWeight?: string;
}

export interface ThemeSettings {
  logo: string | null;
  favicon: string | null;
  // Brand / Design Tokens
  primaryColor: string; // e.g. "oklch(0.78 0.14 85)" or "#D4AF37"
  secondaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  successColor?: string;
  errorColor?: string;
  // Typography
  fontHeading: string;
  fontBody: string;
  h1Size?: string;
  h2Size?: string;
  h3Size?: string;
  h4Size?: string;
  bodySize?: string;
  smallSize?: string;
  h1Weight?: string;
  h2Weight?: string;
  bodyWeight?: string;
  lineHeightHeading?: string;
  lineHeightBody?: string;
  letterSpacingHeading?: string;
  // Buttons
  buttonStyle: "rounded" | "square" | "pill";
  primaryButton?: ButtonCustomStyle;
  secondaryButton?: ButtonCustomStyle;
  outlineButton?: ButtonCustomStyle;
  // Layout & Global
  radius: number; // px
  shadow: "none" | "sm" | "md" | "lg";
  headerStyle: "default" | "minimal" | "centered";
  footerStyle: "default" | "compact" | "expanded";
  containerWidth: number; // px
  animations: boolean;
}

export interface MediaFile {
  id: string;
  name: string;
  folder: string;
  url: string;
  mime: string;
  mimeType?: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface GlobalSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  officeHours: string;
  socials: { facebook: string; instagram: string; linkedin: string; youtube: string; twitter: string };
  copyright: string;
  seo: { title: string; description: string; keywords: string };
  og: { title: string; description: string; image: string };
  mapsEmbed: string;
  smtp: { host: string; port: string; user: string; password: string; fromEmail: string; fromName: string };
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  super_admin: PERMISSION_KEYS.reduce((a, k) => ({ ...a, [k]: true }), {} as Record<PermissionKey, boolean>),
  admin: PERMISSION_KEYS.reduce((a, k) => ({ ...a, [k]: k !== "integrations" }), {} as Record<PermissionKey, boolean>),
  manager: { dashboard: true, cms: true, properties: true, blog: true, faq: true, testimonials: true, lead_forms: true, crm: true, analytics: true, seo: false, integrations: false, settings: false },
  editor: { dashboard: true, cms: true, properties: false, blog: true, faq: true, testimonials: true, lead_forms: false, crm: false, analytics: false, seo: true, integrations: false, settings: false },
  sales: { dashboard: true, cms: false, properties: true, blog: false, faq: false, testimonials: false, lead_forms: true, crm: true, analytics: true, seo: false, integrations: false, settings: false },
};