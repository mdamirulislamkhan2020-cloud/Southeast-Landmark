import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, X, User, Sparkles, Phone, Mail, ArrowRight, Home, LogIn, Edit3 } from "lucide-react";
import logoDefault from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import type { HeaderSettings, MobileMenuSettings, Menu, MenuItem } from "../api/navigation";
import { buildTree } from "../api/navigation-client";

interface PreviewHeaderProps {
  settings: HeaderSettings;
  mobileSettings: MobileMenuSettings;
  menus: Menu[];
  onSelectSection?: (section: "header" | "logo" | "cta" | "menus" | "mobile") => void;
  isInteractive?: boolean;
}

export function PreviewHeader({
  settings,
  mobileSettings,
  menus,
  onSelectSection,
  isInteractive = true,
}: PreviewHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!settings.visible) {
    return (
      <div
        onClick={() => onSelectSection?.("header")}
        className="cursor-pointer border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-xs text-primary transition hover:bg-primary/10"
      >
        [Header is currently hidden — Click to edit settings]
      </div>
    );
  }

  const activeMenu = menus.find((m) => m.slug === (settings.headerMenuSlug || "header"));
  const headerItems = activeMenu?.items?.filter((i) => i.enabled) || [];
  const tree = buildTree(headerItems);

  const logoSrc = settings.logo || logoDefault;
  const siteTitleVisible = settings.siteTitleVisible !== false;
  const siteTitle = settings.siteTitleText || site.short;

  const headerBg = settings.transparent
    ? "transparent"
    : settings.backgroundColor || "oklch(0.14 0.005 60)";
  const headerBorder = settings.borderBottom !== false
    ? settings.borderColor || "oklch(0.30 0.02 85 / 40%)"
    : "transparent";

  const renderIcon = (name?: string | null) => {
    switch (name) {
      case "Sparkles": return <Sparkles className="h-4 w-4" />;
      case "Phone": return <Phone className="h-4 w-4" />;
      case "Mail": return <Mail className="h-4 w-4" />;
      case "ArrowRight": return <ArrowRight className="h-4 w-4" />;
      case "Home": return <Home className="h-4 w-4" />;
      case "LogIn": return <LogIn className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <header
      className={cn(
        "group/header relative z-40 border-b transition-all select-none",
        settings.backdropBlur !== false && !settings.transparent ? "backdrop-blur-md" : ""
      )}
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder,
        boxShadow: settings.shadow && settings.shadow !== "none"
          ? settings.shadow === "sm" ? "0 1px 2px 0 rgba(0,0,0,0.2)"
          : settings.shadow === "lg" ? "0 10px 15px -3px rgba(0,0,0,0.3)"
          : "0 4px 6px -1px rgba(0,0,0,0.25)"
          : undefined,
      }}
    >
      {/* Visual edit trigger overlay */}
      {isInteractive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection?.("header");
          }}
          className="absolute right-3 top-2 z-50 flex items-center gap-1 rounded bg-primary/90 px-2 py-1 text-[11px] font-medium text-primary-foreground opacity-0 shadow transition group-hover/header:opacity-100 hover:bg-primary"
        >
          <Edit3 className="h-3 w-3" /> Edit Header
        </button>
      )}

      {/* Top Bar */}
      {settings.showTopBar && settings.topBarText && (
        <div
          className="border-b px-4 py-1.5 text-center text-xs"
          style={{
            backgroundColor: settings.topBarBg || "oklch(0.20 0.01 70)",
            color: settings.topBarTextColor || "oklch(0.72 0.03 85)",
            borderColor: headerBorder,
          }}
        >
          {settings.topBarText}
        </div>
      )}

      {/* Main Bar Container */}
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          maxWidth: settings.maxWidth ? `${settings.maxWidth}px` : "1280px",
          height: settings.height ? `${settings.height}px` : "80px",
          paddingLeft: settings.paddingX ? `${settings.paddingX}px` : "24px",
          paddingRight: settings.paddingX ? `${settings.paddingX}px` : "24px",
        }}
      >
        {/* Brand / Logo */}
        <div
          onClick={(e) => {
            if (!isInteractive) return;
            e.stopPropagation();
            onSelectSection?.("logo");
          }}
          className={cn(
            "flex items-center gap-3",
            isInteractive && "cursor-pointer rounded p-1 transition hover:ring-2 hover:ring-primary/40"
          )}
          title="Click to edit logo settings"
        >
          <img
            src={logoSrc}
            alt={site.name}
            style={{
              height: settings.logoHeight ? `${settings.logoHeight}px` : "36px",
              width: settings.logoWidth ? `${settings.logoWidth}px` : "auto",
              objectFit: settings.logoFit || "contain",
            }}
          />
          {siteTitleVisible && (
            <span className="font-display text-lg font-semibold tracking-wide text-gradient-gold">
              {siteTitle}
            </span>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav
          onClick={(e) => {
            if (!isInteractive) return;
            e.stopPropagation();
            onSelectSection?.("menus");
          }}
          className={cn(
            "hidden items-center gap-7 md:flex",
            settings.alignment === "center" ? "mx-auto" : "",
            settings.alignment === "left" ? "mr-auto ml-8" : "",
            isInteractive && "cursor-pointer rounded p-1.5 transition hover:ring-2 hover:ring-primary/40"
          )}
          title="Click to edit navigation menu items"
        >
          {tree.map((item) => (
            <div key={item.id} className="relative group/nav">
              <span className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {item.label}
              </span>
              {item.children.length > 0 && (
                <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-44 rounded-md border border-border bg-card p-2 opacity-0 shadow-lg transition-all group-hover/nav:visible group-hover/nav:opacity-100">
                  {item.children.map((c) => (
                    <div key={c.id} className="px-2 py-1.5 text-sm text-foreground/80 hover:text-primary">
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Header CTA Button & Hamburger */}
        <div className="flex items-center gap-3">
          {settings.ctaEnabled && (
            <div
              onClick={(e) => {
                if (!isInteractive) return;
                e.stopPropagation();
                onSelectSection?.("cta");
              }}
              className={cn(
                "hidden md:block",
                isInteractive && "cursor-pointer rounded p-1 transition hover:ring-2 hover:ring-primary/40"
              )}
              title="Click to edit CTA button"
            >
              <div
                className="inline-flex items-center gap-2 shadow-lg transition hover:brightness-110"
                style={{
                  backgroundColor: settings.ctaBgColor || "hsl(var(--primary))",
                  color: settings.ctaTextColor || "hsl(var(--primary-foreground))",
                  borderRadius: settings.ctaRadius !== undefined ? `${settings.ctaRadius}px` : "9999px",
                  paddingLeft: settings.ctaPaddingX !== undefined ? `${settings.ctaPaddingX}px` : "20px",
                  paddingRight: settings.ctaPaddingX !== undefined ? `${settings.ctaPaddingX}px` : "20px",
                  paddingTop: settings.ctaPaddingY !== undefined ? `${settings.ctaPaddingY}px` : "10px",
                  paddingBottom: settings.ctaPaddingY !== undefined ? `${settings.ctaPaddingY}px` : "10px",
                  fontSize: settings.ctaFontSize !== undefined ? `${settings.ctaFontSize}px` : "14px",
                  fontWeight: settings.ctaFontWeight || "600",
                }}
              >
                {renderIcon(settings.ctaIcon)}
                {settings.ctaText || "Login"}
              </div>
            </div>
          )}

          {/* Mobile hamburger icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen(!mobileOpen);
              if (isInteractive) onSelectSection?.("mobile");
            }}
            className="rounded-md p-2 text-foreground md:hidden hover:bg-secondary/40 transition"
            style={{
              color: mobileSettings.hamburgerColor || undefined,
            }}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Preview */}
      {mobileOpen && (
        <div
          className="border-t border-border/60 px-4 py-4 md:hidden"
          style={{
            backgroundColor: mobileSettings.menuBackground || "hsl(var(--background))",
            color: mobileSettings.menuTextColor || undefined,
          }}
        >
          <div className="space-y-1">
            {tree.map((item) => (
              <div
                key={item.id}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/60"
                style={{ marginBottom: `${mobileSettings.itemSpacing ?? 8}px` }}
              >
                {item.label}
              </div>
            ))}
            {settings.ctaEnabled && (mobileSettings.showCta ?? true) && (
              <div
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor: settings.ctaBgColor || "hsl(var(--primary))",
                  color: settings.ctaTextColor || "hsl(var(--primary-foreground))",
                }}
              >
                {renderIcon(settings.ctaIcon)}
                {settings.ctaText || "Login"}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
