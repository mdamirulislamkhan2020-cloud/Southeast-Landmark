import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
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

  const stickyClass = headerSettings?.sticky === false ? "" : "sticky top-0";
  const bgClass = headerSettings?.transparent ? "bg-transparent" : "bg-background/85 backdrop-blur";
  const logoSrc = headerSettings?.logo || logo;
  const ctaText = headerSettings?.ctaText ?? "Login";
  const ctaLink = headerSettings?.ctaLink ?? "#login";
  const ctaEnabled = headerSettings?.ctaEnabled ?? true;

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
    <header className={cn("z-50 border-b border-border/60", stickyClass, bgClass)}>
      {headerSettings?.showTopBar && headerSettings.topBarText && (
        <div className="border-b border-border/40 bg-secondary/40 px-4 py-1.5 text-center text-xs text-muted-foreground">
          {headerSettings.topBarText}
        </div>
      )}
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ height: headerSettings?.height ? `${headerSettings.height}px` : undefined }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSrc} alt={site.name} className="h-9 w-auto" />
          <span className="hidden font-display text-lg font-semibold tracking-wide text-gradient-gold sm:inline">
            {site.short}
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
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
        {ctaEnabled && (
          <div className="hidden md:block">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              <User className="h-4 w-4" /> {ctaText}
            </a>
          </div>
        )}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div
        className={cn(
          "border-t border-border/60 bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {mobileItems.map((item) => (
            <div key={item.id}>
              <div className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" onClick={() => setOpen(false)}>
                {renderLink(item)}
              </div>
              {item.children.map((c) => (
                <div key={c.id} className="ml-4 block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary" onClick={() => setOpen(false)}>
                  {renderLink(c)}
                </div>
              ))}
            </div>
          ))}
          {ctaEnabled && (mobileSettings?.showCta ?? true) && (
            <a
              href={ctaLink}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <User className="h-4 w-4" /> {ctaText}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}