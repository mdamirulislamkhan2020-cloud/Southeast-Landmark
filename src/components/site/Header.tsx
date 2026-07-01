import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import logo from "@/assets/brand/logo.png";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt={site.name} className="h-9 w-auto" />
          <span className="hidden font-display text-lg font-semibold tracking-wide text-gradient-gold sm:inline">
            {site.short}
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-foreground/80",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <a
            href="#login"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            <User className="h-4 w-4" /> Login
          </a>
        </div>
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
          {site.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-primary",
                  isActive ? "text-primary" : "text-foreground/80",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="#login"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <User className="h-4 w-4" /> Login
          </a>
        </div>
      </div>
    </header>
  );
}