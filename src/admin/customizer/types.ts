import type {
  HeaderSettings,
  FooterSettings,
  MobileMenuSettings,
  Menu,
  MenuItem,
  FooterColumn,
} from "../api/navigation";
import type { ThemeSettings, GlobalSettings } from "../api/settings";

export type CustomizerSection =
  | "header"
  | "logo"
  | "cta"
  | "menus"
  | "mobile"
  | "footer"
  | "colors"
  | "typography"
  | "site";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export interface CustomizerState {
  header: HeaderSettings;
  footer: FooterSettings;
  mobile: MobileMenuSettings;
  theme: ThemeSettings;
  global: GlobalSettings;
  menus: Menu[];
}
