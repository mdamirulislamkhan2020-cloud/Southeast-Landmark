import { useEffect } from "react";
import { DEFAULT_THEME, getTheme } from "./api/settings-client";
import type { ThemeSettings } from "./api/settings";

const LS_THEME = "sel_admin_theme_v1";

function toCssColor(v: string | undefined): string {
  const s = (v ?? "").trim();
  if (!s) return s;
  if (/^(oklch|hsl|hsla|rgb|rgba|color)\(/i.test(s)) return s;
  if (s.startsWith("#")) return s;
  // Assume bare HSL triple like "43 74% 49%" or "43, 74%, 49%"
  return `hsl(${s})`;
}

function loadGoogleFont(fontName: string) {
  if (!fontName || fontName === "Playfair Display" || fontName === "Inter") return;
  const id = `gfont-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`;
  document.head.appendChild(link);
}

function applyTheme(theme: ThemeSettings) {
  const r = document.documentElement.style;

  if (theme.primaryColor) r.setProperty("--primary", toCssColor(theme.primaryColor));
  if (theme.secondaryColor) r.setProperty("--secondary", toCssColor(theme.secondaryColor));
  if (theme.accentColor) r.setProperty("--accent", toCssColor(theme.accentColor));
  if (theme.backgroundColor) r.setProperty("--background", toCssColor(theme.backgroundColor));
  if (theme.surfaceColor) r.setProperty("--card", toCssColor(theme.surfaceColor));
  if (theme.textColor) r.setProperty("--foreground", toCssColor(theme.textColor));
  if (theme.mutedTextColor) r.setProperty("--muted-foreground", toCssColor(theme.mutedTextColor));
  if (theme.borderColor) r.setProperty("--border", toCssColor(theme.borderColor));

  if (theme.radius !== undefined) r.setProperty("--radius", `${theme.radius}px`);
  if (theme.containerWidth !== undefined) r.setProperty("--container-width", `${theme.containerWidth}px`);

  if (theme.fontHeading) {
    loadGoogleFont(theme.fontHeading);
    r.setProperty("--font-display", `"${theme.fontHeading}", Georgia, serif`);
  }
  if (theme.fontBody) {
    loadGoogleFont(theme.fontBody);
    r.setProperty("--font-sans", `"${theme.fontBody}", system-ui, sans-serif`);
  }

  if (theme.favicon) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = theme.favicon;
  }

  document.documentElement.dataset.animations = theme.animations ? "on" : "off";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Apply from local cache immediately to prevent flash
    try {
      const raw = window.localStorage.getItem(LS_THEME);
      const cached: ThemeSettings = { ...DEFAULT_THEME, ...(raw ? JSON.parse(raw) : {}) };
      applyTheme(cached);
    } catch {
      applyTheme(DEFAULT_THEME);
    }

    // 2. Fetch fresh theme from Supabase
    getTheme().then((fresh) => {
      applyTheme(fresh);
    });

    // 3. Listen for live updates
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ThemeSettings>).detail;
      if (detail) applyTheme(detail);
    };

    window.addEventListener("sel:theme-updated", onUpdate as EventListener);
    return () => window.removeEventListener("sel:theme-updated", onUpdate as EventListener);
  }, []);

  return <>{children}</>;
}
