import { useEffect, useState } from "react";
import {
  getFooterSettings, getHeaderSettings, getMenuBySlug, getMobileMenuSettings,
  NAV_UPDATE_EVENT,
} from "@/admin/api/navigation-client";
import type { FooterSettings, HeaderSettings, Menu, MobileMenuSettings } from "@/admin/api/navigation";

export function useMenu(slug: string): Menu | null {
  const [menu, setMenu] = useState<Menu | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => { getMenuBySlug(slug).then((m) => { if (alive) setMenu(m); }).catch(() => { /* ignore */ }); };
    load();
    const onUpd = () => load();
    window.addEventListener(NAV_UPDATE_EVENT, onUpd);
    window.addEventListener("storage", onUpd);
    return () => { alive = false; window.removeEventListener(NAV_UPDATE_EVENT, onUpd); window.removeEventListener("storage", onUpd); };
  }, [slug]);
  return menu;
}

export function useHeaderSettings(): HeaderSettings | null {
  const [data, setData] = useState<HeaderSettings | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => { getHeaderSettings().then((d) => { if (alive) setData(d); }).catch(() => { /* ignore */ }); };
    load();
    const onUpd = () => load();
    window.addEventListener(NAV_UPDATE_EVENT, onUpd);
    window.addEventListener("storage", onUpd);
    return () => { alive = false; window.removeEventListener(NAV_UPDATE_EVENT, onUpd); window.removeEventListener("storage", onUpd); };
  }, []);
  return data;
}

export function useFooterSettings(): FooterSettings | null {
  const [data, setData] = useState<FooterSettings | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => { getFooterSettings().then((d) => { if (alive) setData(d); }).catch(() => { /* ignore */ }); };
    load();
    const onUpd = () => load();
    window.addEventListener(NAV_UPDATE_EVENT, onUpd);
    window.addEventListener("storage", onUpd);
    return () => { alive = false; window.removeEventListener(NAV_UPDATE_EVENT, onUpd); window.removeEventListener("storage", onUpd); };
  }, []);
  return data;
}

export function useMobileMenuSettings(): MobileMenuSettings | null {
  const [data, setData] = useState<MobileMenuSettings | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => { getMobileMenuSettings().then((d) => { if (alive) setData(d); }).catch(() => { /* ignore */ }); };
    load();
    const onUpd = () => load();
    window.addEventListener(NAV_UPDATE_EVENT, onUpd);
    window.addEventListener("storage", onUpd);
    return () => { alive = false; window.removeEventListener(NAV_UPDATE_EVENT, onUpd); window.removeEventListener("storage", onUpd); };
  }, []);
  return data;
}