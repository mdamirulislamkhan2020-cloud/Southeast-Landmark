import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Image, Palette, LogOut, ExternalLink, Building2, Newspaper, HelpCircle, MessageSquareQuote, Settings, UserCog, FormInput, BarChart3, Search, Plug, Menu as MenuIcon, Mail, Eye, History, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/admin/auth/AuthContext";
import { ROLE_LABELS, type PermissionKey } from "@/admin/api/settings";

type NavItem = { to: string; end?: boolean; label: string; icon: typeof LayoutDashboard; permission?: PermissionKey };
const nav: NavItem[] = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { to: "/admin/pages", label: "Pages (CMS)", icon: FileText, permission: "cms" },
  { to: "/admin/properties", label: "Properties", icon: Building2, permission: "properties" },
  { to: "/admin/blog", label: "Blog", icon: Newspaper, permission: "blog" },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, permission: "faq" },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "testimonials" },
  { to: "/admin/forms", label: "Lead Forms", icon: FormInput, permission: "lead_forms" },
  { to: "/admin/leads", label: "Leads", icon: Users, permission: "crm" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics" },
  { to: "/admin/seo", label: "SEO Manager", icon: Search, permission: "seo" },
  { to: "/admin/integrations", label: "Integrations", icon: Plug, permission: "integrations" },
  { to: "/admin/smtp", label: "SMTP / Email", icon: Mail, permission: "settings" },
  { to: "/admin/navigation", label: "Navigation", icon: MenuIcon, permission: "cms" },
  { to: "/admin/visibility", label: "Visibility", icon: Eye, permission: "settings" },
  { to: "/admin/users", label: "Users & Roles", icon: UserCog, permission: "settings" },
  { to: "/admin/audit", label: "Audit Logs", icon: History, permission: "settings" },
  { to: "/admin/media", label: "Media Library", icon: Image, permission: "cms" },
  { to: "/admin/theme", label: "Theme", icon: Palette, permission: "settings" },
  { to: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { profile, role, hasPermission, signOut } = useAuth();
  const visibleNav = nav.filter((item) => !item.permission || hasPermission(item.permission));
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-lg font-display font-semibold text-gradient-gold">Southeast Admin</div>
          <div className="text-xs text-muted-foreground mt-0.5">Enterprise CMS</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          {profile && (
            <div className="rounded-md px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 font-medium text-foreground truncate">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="truncate">{profile.name || profile.email}</span>
              </div>
              {role && <div className="mt-0.5">{ROLE_LABELS[role]}</div>}
            </div>
          )}
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
            <ExternalLink className="h-4 w-4" /> View site
          </a>
          <button
            onClick={async () => { await signOut(); navigate("/admin/login"); }}
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
            {profile && <span className="hidden sm:inline">Signed in as {profile.email}{role ? ` • ${ROLE_LABELS[role]}` : ""}</span>}
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}