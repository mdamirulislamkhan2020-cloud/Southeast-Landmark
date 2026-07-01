import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Image, Menu, Palette, LogOut, ExternalLink, Building2, Newspaper, HelpCircle, MessageSquareQuote } from "lucide-react";
import { logout } from "./api/client";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pages", label: "Pages (CMS)", icon: FileText },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/media", label: "Media", icon: Image, disabled: true },
  { to: "/admin/menus", label: "Navigation", icon: Menu, disabled: true },
  { to: "/admin/theme", label: "Theme", icon: Palette, disabled: true },
];

export function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-lg font-display font-semibold text-gradient-gold">Southeast Admin</div>
          <div className="text-xs text-muted-foreground mt-0.5">Enterprise CMS</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  item.disabled && "opacity-50 pointer-events-none",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.disabled && <span className="ml-auto text-[10px] uppercase">soon</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
            <ExternalLink className="h-4 w-4" /> View site
          </a>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Admin Panel</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Signed in</span>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}