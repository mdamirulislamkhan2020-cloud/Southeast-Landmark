import { useEffect } from "react";
import { DEFAULT_THEME } from "./api/settings-client";
import type { ThemeSettings } from "./api/settings";

const LS_THEME = "sel_admin_theme_v1";

// Theme values may be stored as bare HSL triples ("H S% L%") for legacy
// reasons. The design system's CSS custom properties are consumed directly by
// Tailwind v4 (`--color-primary: var(--primary)`), so they MUST resolve to a
// full CSS color. Wrap bare triples in `hsl(...)`; leave already-valid color
// expressions (oklch/hsl/rgb/hex) untouched so admins can paste any format.
function toCssColor(v: string): string {
  const s = (v ?? "").trim();
  if (!s) return s;
  if (/^(oklch|hsl|hsla|rgb|rgba|color)\(/i.test(s)) return s;
  if (s.startsWith("#")) return s;
  // Assume bare HSL triple like "43 74% 49%" or "43, 74%, 49%"
  return `hsl(${s})`;
}

function apply(theme: ThemeSettings) {
  const r = document.documentElement.style;
  r.setProperty("--primary", toCssColor(theme.primaryColor));
  r.setProperty("--secondary", toCssColor(theme.secondaryColor));
  r.setProperty("--accent", toCssColor(theme.accentColor));
  r.setProperty("--radius", `${theme.radius}px`);
  r.setProperty("--container-width", `${theme.containerWidth}px`);
  if (theme.favicon) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = theme.favicon;
  }
  document.documentElement.dataset.animations = theme.animations ? "on" : "off";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_THEME);
      const theme: ThemeSettings = { ...DEFAULT_THEME, ...(raw ? JSON.parse(raw) : {}) };
      apply(theme);
    } catch { /* ignore */ }
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ThemeSettings>).detail;
      if (detail) apply(detail);
    };
    window.addEventListener("sel:theme-updated", onUpdate as EventListener);
    return () => window.removeEventListener("sel:theme-updated", onUpdate as EventListener);
  }, []);
  return <>{children}</>;
}