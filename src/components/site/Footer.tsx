import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import logo from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { useFooterSettings, useMenu } from "@/lib/use-navigation";
import { NewsletterForm } from "./NewsletterForm";
import { useVisibility } from "@/lib/use-visibility";
import { decideVisibility } from "@/admin/api/visibility-client";
import { getSession } from "@/admin/api/client";
import type { FooterColumn } from "@/admin/api/navigation";

export function Footer() {
  const footerSettings = useFooterSettings();
  const footerMenu = useMenu(footerSettings?.footerMenuSlug ?? "footer");
  const visibility = useVisibility();
  const isAuthed = !!getSession();

  if (footerSettings && !footerSettings.visible) return null;

  const items = (footerMenu?.items ?? [])
    .filter((i) => i.enabled && (i.visibility === "everyone" || i.visibility === "guest") && !i.parentId)
    .filter((i) => {
      if (!visibility.hideFromNav) return true;
      if (/^https?:\/\//i.test(i.url)) return true;
      return decideVisibility(i.url, visibility, isAuthed).action === "allow";
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const fallback = [
    { id: "home", label: "Home", url: "/" },
    { id: "about", label: "About", url: "/about" },
    { id: "projects", label: "Projects", url: "/property" },
    { id: "blog", label: "Blog", url: "/blog" },
    { id: "faq", label: "FAQ", url: "/faq" },
    { id: "contact", label: "Contact", url: "/contact" },
  ];
  const links = items.length > 0
    ? items.map((i) => ({ id: i.id, label: i.label, url: i.url, newTab: i.newTab }))
    : fallback.map((f) => ({ ...f, newTab: false }));

  // Custom styling
  const bgColor = footerSettings?.backgroundColor || "hsl(var(--card))";
  const textColor = footerSettings?.textColor || "hsl(var(--muted-foreground))";
  const accentColor = footerSettings?.accentColor || "hsl(var(--primary))";
  const borderColor = footerSettings?.borderColor || "oklch(0.30 0.02 85 / 40%)";
  const paddingY = footerSettings?.paddingY !== undefined ? `${footerSettings.paddingY}px` : "64px";

  const logoSrc = footerSettings?.logo || logo;
  const description = footerSettings?.description ?? site.tagline;
  const address = footerSettings?.address || site.address;
  const phone = footerSettings?.phone || site.phone;
  const email = footerSettings?.email || site.email;
  const hours = footerSettings?.businessHours || site.hours;
  const copyright = footerSettings?.copyright || `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`;
  const bottomTagline = footerSettings?.bottomTagline || "Crafted with care.";

  const columnsList: FooterColumn[] = footerSettings?.columnsList && footerSettings.columnsList.length > 0
    ? footerSettings.columnsList.filter((c) => c.visible !== false).sort((a, b) => a.sortOrder - b.sortOrder)
    : [
        {
          id: "col-links",
          title: "Useful Links",
          type: "links",
          visible: true,
          sortOrder: 0,
          links: links.map((l) => ({ ...l, visible: true })),
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
      className="border-t transition-colors"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      <div
        className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: paddingY,
          paddingBottom: paddingY,
          gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        }}
      >
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt={site.name}
              className="w-auto"
              style={{
                height: footerSettings?.logoHeight ? `${footerSettings.logoHeight}px` : "40px",
                width: footerSettings?.logoWidth ? `${footerSettings.logoWidth}px` : "auto",
              }}
            />
          </Link>
          <p className="text-sm leading-relaxed" style={{ color: textColor }}>
            {description}
          </p>
          {footerSettings?.showSocials !== false && footerSettings?.socials && (
            <div className="flex items-center gap-3 pt-2">
              {Object.entries(footerSettings.socials).map(([net, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={net}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full border hover:bg-white/10 transition"
                    style={{ borderColor, color: accentColor }}
                    aria-label={net}
                  >
                    {renderSocialIcon(net)}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Custom Columns */}
        {columnsList.map((col) => {
          if (col.type === "links") {
            const colLinks = col.links && col.links.length > 0 ? col.links : links;
            return (
              <div key={col.id}>
                <h4 className="mb-4 font-display text-base font-semibold" style={{ color: accentColor }}>
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {colLinks.map((l) => {
                    if ("visible" in l && l.visible === false) return null;
                    const external = /^https?:\/\//i.test(l.url) || l.newTab;
                    return (
                      <li key={l.id}>
                        {external ? (
                          <a
                            href={l.url}
                            target={l.newTab ? "_blank" : undefined}
                            rel={l.newTab ? "noreferrer" : undefined}
                            className="hover:underline transition-colors"
                            style={{ color: textColor }}
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link to={l.url} className="hover:underline transition-colors" style={{ color: textColor }}>
                            {l.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          if (col.type === "contact") {
            return (
              <div key={col.id}>
                <h4 className="mb-4 font-display text-base font-semibold" style={{ color: accentColor }}>
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                    <span style={{ color: textColor }}>{address}</span>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                    <a href={`tel:${phone}`} className="hover:underline" style={{ color: textColor }}>{phone}</a>
                  </li>
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                    <a href={`mailto:${email}`} className="hover:underline" style={{ color: textColor }}>{email}</a>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                    <span style={{ color: textColor }}>{hours}</span>
                  </li>
                </ul>

                {footerSettings?.showNewsletter !== false && (
                  <div className="mt-6">
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                      {footerSettings?.newsletterTitle || "Newsletter"}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: textColor }}>
                      {footerSettings?.newsletterSubtitle || "Project launches & investment updates."}
                    </p>
                    <div className="mt-2">
                      <NewsletterForm />
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (col.type === "newsletter") {
            return (
              <div key={col.id}>
                <h4 className="mb-4 font-display text-base font-semibold" style={{ color: accentColor }}>
                  {col.title}
                </h4>
                <p className="mb-3 text-xs" style={{ color: textColor }}>
                  {col.customContent || footerSettings?.newsletterSubtitle || "Subscribe for investment alerts and project updates."}
                </p>
                <NewsletterForm />
              </div>
            );
          }

          if (col.type === "custom_text") {
            return (
              <div key={col.id}>
                <h4 className="mb-4 font-display text-base font-semibold" style={{ color: accentColor }}>
                  {col.title}
                </h4>
                <div className="text-sm leading-relaxed" style={{ color: textColor }}>
                  {col.customContent || ""}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t" style={{ borderColor }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p style={{ color: textColor }}>{copyright}</p>
          <p style={{ color: textColor }}>{bottomTagline}</p>
        </div>
      </div>
    </footer>
  );
}
