import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Linkedin, Youtube, Twitter, Edit3 } from "lucide-react";
import logoDefault from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import type { FooterSettings, Menu, FooterColumn } from "../api/navigation";

interface PreviewFooterProps {
  settings: FooterSettings;
  menus: Menu[];
  onSelectSection?: (section: "footer" | "menus") => void;
  isInteractive?: boolean;
}

export function PreviewFooter({
  settings,
  menus,
  onSelectSection,
  isInteractive = true,
}: PreviewFooterProps) {
  if (!settings.visible) {
    return (
      <div
        onClick={() => onSelectSection?.("footer")}
        className="cursor-pointer border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-xs text-primary transition hover:bg-primary/10"
      >
        [Footer is currently hidden — Click to edit settings]
      </div>
    );
  }

  const bgColor = settings.backgroundColor || "hsl(var(--card))";
  const textColor = settings.textColor || "hsl(var(--muted-foreground))";
  const accentColor = settings.accentColor || "hsl(var(--primary))";
  const borderColor = settings.borderColor || "oklch(0.30 0.02 85 / 40%)";
  const paddingY = settings.paddingY !== undefined ? `${settings.paddingY}px` : "64px";

  const logoSrc = settings.logo || logoDefault;
  const description = settings.description ?? site.tagline;
  const address = settings.address || site.address;
  const phone = settings.phone || site.phone;
  const email = settings.email || site.email;
  const hours = settings.businessHours || site.hours;
  const copyright = settings.copyright || `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`;
  const bottomTagline = settings.bottomTagline || "Crafted with care.";

  const activeMenu = menus.find((m) => m.slug === (settings.footerMenuSlug || "footer"));
  const fallbackLinks = (activeMenu?.items || []).filter((i) => i.enabled).map((i) => ({
    id: i.id,
    label: i.label,
    url: i.url,
    visible: true,
  }));

  const columnsList: FooterColumn[] = settings.columnsList && settings.columnsList.length > 0
    ? settings.columnsList.filter((c) => c.visible !== false).sort((a, b) => a.sortOrder - b.sortOrder)
    : [
        {
          id: "col-links",
          title: "Useful Links",
          type: "links",
          visible: true,
          sortOrder: 0,
          links: fallbackLinks.length > 0 ? fallbackLinks : [
            { id: "1", label: "Home", url: "/", visible: true },
            { id: "2", label: "About", url: "/about", visible: true },
            { id: "3", label: "Projects", url: "/property", visible: true },
            { id: "4", label: "Blog", url: "/blog", visible: true },
            { id: "5", label: "FAQ", url: "/faq", visible: true },
            { id: "6", label: "Contact", url: "/contact", visible: true },
          ],
        },
        {
          id: "col-policy",
          title: "Company Policy",
          type: "links",
          visible: true,
          sortOrder: 1,
          links: [
            { id: "p-1", label: "Privacy Policy", url: "#privacy", visible: true },
            { id: "p-2", label: "Terms & Conditions", url: "#terms", visible: true },
          ],
        },
        {
          id: "col-contact",
          title: "Get in touch",
          type: "contact",
          visible: true,
          sortOrder: 2,
        },
      ];

  const renderSocialIcon = (network: string) => {
    const cls = "h-4 w-4 hover:opacity-80 transition";
    switch (network.toLowerCase()) {
      case "facebook": return <Facebook className={cls} />;
      case "instagram": return <Instagram className={cls} />;
      case "linkedin": return <Linkedin className={cls} />;
      case "youtube": return <Youtube className={cls} />;
      case "twitter": return <Twitter className={cls} />;
      default: return null;
    }
  };

  return (
    <footer
      className="group/footer relative border-t select-none transition-colors"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      {/* Visual edit trigger overlay */}
      {isInteractive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection?.("footer");
          }}
          className="absolute right-3 top-3 z-50 flex items-center gap-1 rounded bg-primary/90 px-2 py-1 text-[11px] font-medium text-primary-foreground opacity-0 shadow transition group-hover/footer:opacity-100 hover:bg-primary"
        >
          <Edit3 className="h-3 w-3" /> Edit Footer
        </button>
      )}

      <div
        className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: paddingY,
          paddingBottom: paddingY,
          gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        }}
      >
        {/* Brand & Description Column */}
        <div
          onClick={() => isInteractive && onSelectSection?.("footer")}
          className={cn(
            "space-y-4",
            isInteractive && "cursor-pointer rounded p-2 transition hover:ring-2 hover:ring-primary/40"
          )}
        >
          <img
            src={logoSrc}
            alt={site.name}
            style={{
              height: settings.logoHeight ? `${settings.logoHeight}px` : "40px",
              width: settings.logoWidth ? `${settings.logoWidth}px` : "auto",
            }}
          />
          <p className="text-sm leading-relaxed" style={{ color: textColor }}>
            {description}
          </p>
          {settings.showSocials !== false && settings.socials && (
            <div className="flex items-center gap-2 pt-2">
              {Object.entries(settings.socials).map(([net, url]) => {
                if (!url) return null;
                return (
                  <div
                    key={net}
                    className="p-2 rounded-full border hover:bg-white/10 transition"
                    style={{ borderColor, color: accentColor }}
                  >
                    {renderSocialIcon(net)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Column Builder Columns */}
        {columnsList.map((col) => (
          <div
            key={col.id}
            onClick={() => isInteractive && onSelectSection?.("footer")}
            className={cn(
              isInteractive && "cursor-pointer rounded p-2 transition hover:ring-2 hover:ring-primary/40"
            )}
          >
            <h4 className="mb-4 font-display text-base font-semibold" style={{ color: accentColor }}>
              {col.title}
            </h4>

            {col.type === "links" && (
              <ul className="space-y-2 text-sm">
                {(col.links || []).map((l) => (
                  <li key={l.id} className="hover:underline transition-colors" style={{ color: textColor }}>
                    {l.label}
                  </li>
                ))}
              </ul>
            )}

            {col.type === "contact" && (
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                  <span style={{ color: textColor }}>{address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                  <span style={{ color: textColor }}>{phone}</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                  <span style={{ color: textColor }}>{email}</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                  <span style={{ color: textColor }}>{hours}</span>
                </li>
              </ul>
            )}

            {col.type === "newsletter" && (
              <div>
                <p className="mb-3 text-xs" style={{ color: textColor }}>
                  {col.customContent || settings.newsletterSubtitle || "Subscribe for updates."}
                </p>
                <div className="flex max-w-md gap-2">
                  <input
                    type="email"
                    disabled
                    placeholder="name@example.com"
                    className="flex-1 rounded-md border bg-background/50 px-3 py-2 text-xs"
                    style={{ borderColor }}
                  />
                  <button
                    type="button"
                    disabled
                    className="rounded-md px-3 py-2 text-xs font-semibold"
                    style={{ backgroundColor: accentColor, color: "black" }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            )}

            {col.type === "custom_text" && (
              <div className="text-sm leading-relaxed" style={{ color: textColor }}>
                {col.customContent || ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Copyright Bar */}
      <div className="border-t" style={{ borderColor }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p style={{ color: textColor }}>{copyright}</p>
          <p style={{ color: textColor }}>{bottomTagline}</p>
        </div>
      </div>
    </footer>
  );
}
