import { useEffect } from "react";
import { DEFAULT_THEME } from "./api/settings-client";
import type { ThemeSettings } from "./api/settings";

const LS_THEME = "sel_admin_theme_v1";

function apply(theme: ThemeSettings) {
  const r = document.documentElement.style;
  r.setProperty("--primary", theme.primaryColor);
  r.setProperty("--secondary", theme.secondaryColor);
  r.setProperty("--accent", theme.accentColor);
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