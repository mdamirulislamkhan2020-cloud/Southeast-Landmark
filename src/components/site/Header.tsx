import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User, Sparkles, Phone, Mail, ArrowRight, Home, LogIn } from "lucide-react";
import logo from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { useHeaderSettings, useMenu, useMobileMenuSettings } from "@/lib/use-navigation";
import { buildTree } from "@/admin/api/navigation-client";
import type { MenuItem } from "@/admin/api/navigation";
import { useVisibility } from "@/lib/use-visibility";
import { decideVisibility } from "@/admin/api/visibility-client";
import { getSession } from "@/admin/api/client";

function visibleItems(items: MenuItem[] | undefined) {
  if (!items) return [] as MenuItem[];
  return items.filter((i) => i.enabled && (i.visibility === "everyone" || i.visibility === "guest"));
}

export function Header() {
  const [open, setOpen] = useState(false);
  const headerSettings = useHeaderSettings();
  const mobileSettings = useMobileMenuSettings();
  const headerMenu = useMenu(headerSettings?.headerMenuSlug ?? "header");
  const mobileMenu = useMenu(mobileSettings?.mobileMenuSlug ?? headerSettings?.headerMenuSlug ?? "mobile");
  const visibility = useVisibility();
  const isAuthed = !!getSession();

  const filterByVisibility = (items: MenuItem[]) => {
    if (!visibility.hideFromNav) return items;
    return items.filter((it) => {
      if (/^https?:\/\//i.test(it.url)) return true;
      const d = decideVisibility(it.url, visibility, isAuthed);
      return d.action === "allow";
    });
  };

  const desktopTree = useMemo(() => buildTree(filterByVisibility(visibleItems(headerMenu?.items))), [headerMenu, visibility, isAuthed]);
  const mobileTree = useMemo(() => buildTree(filterByVisibility(visibleItems(mobileMenu?.items ?? headerMenu?.items))), [mobileMenu, headerMenu, visibility, isAuthed]);

  const fallbackNav = site.nav.map((n) => ({ id: n.to, label: n.label, url: n.to, newTab: false, children: [] as { id: string; label: string; url: string; newTab: boolean }[] }));
  const desktopItems = desktopTree.length > 0
    ? desktopTree.map((n) => ({ id: n.id, label: n.label, url: n.url, newTab: n.newTab, children: n.children.map((c) => ({ id: c.id, label: c.label, url: c.url, newTab: c.newTab })) }))
    : fallbackNav;
  const mobileItems = mobileTree.length > 0
    ? mobileTree.map((n) => ({ id: n.id, label: n.label, url: n.url, newTab: n.newTab, children: n.children.map((c) => ({ id: c.id, label: c.label, url: c.url, newTab: c.newTab })) }))
    : desktopItems;

  if (headerSettings && !headerSettings.visible) return null;

  const stickyClass = headerSettings?.sticky === false ? "relative" : "sticky top-0";
  const logoSrc = headerSettings?.logo || logo;
  const logoLink = headerSettings?.logoLink || "/";
  const siteTitleVisible = headerSettings?.siteTitleVisible !== false;
  const siteTitle = headerSettings?.siteTitleText || site.short;

  const ctaText = headerSettings?.ctaText ?? "Login";
  const ctaLink = headerSettings?.ctaLink ?? "#login";
  const ctaEnabled = headerSettings?.ctaEnabled ?? true;

  // Custom styling calculations
  const headerBg = headerSettings?.transparent
    ? "transparent"
    : headerSettings?.backgroundColor || "hsl(var(--background) / 0.9)";
  const headerBorder = headerSettings?.borderBottom !== false
    ? headerSettings?.borderColor || "oklch(0.30 0.02 85 / 40%)"
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

  const renderLink = (item: { label: string; url: string; newTab: boolean }) => {
    const isExternal = /^https?:\/\//i.test(item.url) || item.newTab;
    if (isExternal) {
      return (
        <a
          href={item.url}
          target={item.newTab ? "_blank" : undefined}
          rel={item.newTab ? "noreferrer" : undefined}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
        >
          {item.label}
        </a>
      );
    }
    return (
      <NavLink
        to={item.url}
        end={item.url === "/"}
        className={({ isActive }) =>
          cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-foreground/80")
        }
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <header
      className={cn("z-50 border-b", stickyClass, headerSettings?.backdropBlur !== false && !headerSettings?.transparent ? "backdrop-blur-md" : "")}
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder,
        boxShadow: headerSettings?.shadow && headerSettings.shadow !== "none"
          ? headerSettings.shadow === "sm" ? "0 1px 2px 0 rgba(0,0,0,0.2)"
          : headerSettings.shadow === "lg" ? "0 10px 15px -3px rgba(0,0,0,0.3)"
          : "0 4px 6px -1px rgba(0,0,0,0.25)"
          : undefined,
      }}
    >
      {headerSettings?.showTopBar && headerSettings.topBarText && (
        <div
          className="border-b px-4 py-1.5 text-center text-xs"
          style={{
            backgroundColor: headerSettings.topBarBg || "oklch(0.20 0.01 70)",
            color: headerSettings.topBarTextColor || "oklch(0.72 0.03 85)",
            borderColor: headerBorder,
          }}
        >
          {headerSettings.topBarText}
        </div>
      )}
      <div
        className="mx-auto flex items-center justify-between transition-all"
        style={{
          maxWidth: headerSettings?.maxWidth ? `${headerSettings.maxWidth}px` : "1280px",
          height: headerSettings?.height ? `${headerSettings.height}px` : "80px",
          paddingLeft: headerSettings?.paddingX ? `${headerSettings.paddingX}px` : "24px",
          paddingRight: headerSettings?.paddingX ? `${headerSettings.paddingX}px` : "24px",
        }}
      >
        {/* Logo and Brand Title */}
        <Link to={logoLink} className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt={site.name}
            className="w-auto"
            style={{
              height: headerSettings?.logoHeight ? `${headerSettings.logoHeight}px` : "36px",
              width: headerSettings?.logoWidth ? `${headerSettings.logoWidth}px` : "auto",
              objectFit: headerSettings?.logoFit || "contain",
            }}
          />
          {siteTitleVisible && (
            <span className="hidden font-display text-lg font-semibold tracking-wide text-gradient-gold sm:inline">
              {siteTitle}
            </span>
          )}
        </Link>

        {/* Desktop Navigation Menu */}
        <nav
          className={cn(
            "hidden items-center gap-8 md:flex",
            headerSettings?.alignment === "center" ? "mx-auto" : "",
            headerSettings?.alignment === "left" ? "mr-auto ml-8" : ""
          )}
        >
          {desktopItems.map((item) => (
            <div key={item.id} className="group relative">
              {renderLink(item)}
              {item.children.length > 0 && (
                <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-44 rounded-md border border-border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {item.children.map((c) => (
                    <div key={c.id} className="px-2 py-1.5 text-sm">
                      {renderLink(c)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Header CTA / Login Button */}
        <div className="flex items-center gap-3">
          {ctaEnabled && (
            <div className="hidden md:block">
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 shadow-lg transition hover:brightness-110"
                style={{
                  backgroundColor: headerSettings?.ctaBgColor || "hsl(var(--primary))",
                  color: headerSettings?.ctaTextColor || "hsl(var(--primary-foreground))",
                  borderRadius: headerSettings?.ctaRadius !== undefined ? `${headerSettings.ctaRadius}px` : "9999px",
                  paddingLeft: headerSettings?.ctaPaddingX !== undefined ? `${headerSettings.ctaPaddingX}px` : "20px",
                  paddingRight: headerSettings?.ctaPaddingX !== undefined ? `${headerSettings.ctaPaddingX}px` : "20px",
                  paddingTop: headerSettings?.ctaPaddingY !== undefined ? `${headerSettings.ctaPaddingY}px` : "10px",
                  paddingBottom: headerSettings?.ctaPaddingY !== undefined ? `${headerSettings.ctaPaddingY}px` : "10px",
                  fontSize: headerSettings?.ctaFontSize !== undefined ? `${headerSettings.ctaFontSize}px` : "14px",
                  fontWeight: headerSettings?.ctaFontWeight || "600",
                }}
              >
                {renderIcon(headerSettings?.ctaIcon)}
                {ctaText}
              </a>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-foreground md:hidden hover:bg-secondary/40 transition"
            style={{
              color: mobileSettings?.hamburgerColor || undefined,
            }}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "border-t border-border/60 md:hidden",
          open ? "block" : "hidden"
        )}
        style={{
          backgroundColor: mobileSettings?.menuBackground || "hsl(var(--background))",
          color: mobileSettings?.menuTextColor || undefined,
        }}
      >
        <div className="space-y-1 px-4 py-4">
          {mobileItems.map((item) => (
            <div key={item.id} style={{ marginBottom: `${mobileSettings?.itemSpacing ?? 8}px` }}>
              <div className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/60 transition" onClick={() => setOpen(false)}>
                {renderLink(item)}
              </div>
              {item.children.map((c) => (
                <div key={c.id} className="ml-4 block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/60 transition" onClick={() => setOpen(false)}>
                  {renderLink(c)}
                </div>
              ))}
            </div>
          ))}
          {ctaEnabled && (mobileSettings?.showCta ?? true) && (
            <a
              href={ctaLink}
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition"
              style={{
                backgroundColor: headerSettings?.ctaBgColor || "hsl(var(--primary))",
                color: headerSettings?.ctaTextColor || "hsl(var(--primary-foreground))",
              }}
            >
              {renderIcon(headerSettings?.ctaIcon)}
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
