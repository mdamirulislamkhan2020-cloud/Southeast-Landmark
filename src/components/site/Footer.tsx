import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import logo from "@/assets/brand/logo.png";
import { site } from "@/config/site";

export function Footer() {
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
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/property" className="hover:text-primary">Property</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
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
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}