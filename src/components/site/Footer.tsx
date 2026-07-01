import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import logo from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { useFooterSettings, useMenu } from "@/lib/use-navigation";

export function Footer() {
  const footerSettings = useFooterSettings();
  const footerMenu = useMenu(footerSettings?.footerMenuSlug ?? "footer");
  if (footerSettings && !footerSettings.visible) return null;

  const items = (footerMenu?.items ?? [])
    .filter((i) => i.enabled && (i.visibility === "everyone" || i.visibility === "guest") && !i.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const fallback = [
    { id: "home", label: "Home", url: "/" },
    { id: "about", label: "About", url: "/about" },
    { id: "projects", label: "Projects", url: "/property" },
    { id: "blog", label: "Blog", url: "/blog" },
    { id: "faq", label: "FAQ", url: "/faq" },
    { id: "contact", label: "Contact", url: "/contact" },
  ];
  const links = items.length > 0 ? items.map((i) => ({ id: i.id, label: i.label, url: i.url, newTab: i.newTab })) : fallback.map((f) => ({ ...f, newTab: false }));

  return (
    <footer className="mt-24 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt={site.name} className="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {site.tagline}
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-primary">
            Useful Links
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {links.map((l) => {
              const external = /^https?:\/\//i.test(l.url) || l.newTab;
              return (
                <li key={l.id}>
                  {external ? (
                    <a href={l.url} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noreferrer" : undefined} className="hover:text-primary">{l.label}</a>
                  ) : (
                    <Link to={l.url} className="hover:text-primary">{l.label}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-primary">
            Company Policy
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary">Terms &amp; Conditions</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-primary">
            Get in touch
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{site.address}</span></li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={`tel:${site.phone}`} className="hover:text-primary">{site.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a></li>
            <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{site.hours}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>{footerSettings?.copyright || `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`}</p>
          <p>Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}