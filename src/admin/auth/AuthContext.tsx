import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PERMISSIONS, type PermissionKey, type UserRole } from "@/admin/api/settings";
import { logActivity } from "@/admin/api/activity-log-client";

/**
 * Central auth + authorization context for the admin panel.
 *
 * - Subscribes once to Supabase auth state.
 * - Loads profile (active flag + per-user permission overrides) and roles.
 * - Records login events to activity_log + profiles.last_login.
 * - Exposes hasPermission() so UI can gate modules by permission.
 */

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  active: boolean;
  avatar: string | null;
  permissions: Partial<Record<PermissionKey, boolean>>;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AdminProfile | null;
  role: UserRole | null;
  roles: UserRole[];
  permissions: Record<PermissionKey, boolean>;
  loading: boolean;
  hasPermission: (key: PermissionKey) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  signOut: () => Promise<void>;
}

const ROLE_ORDER: UserRole[] = ["super_admin", "admin", "manager", "editor", "sales"];
const EMPTY_PERMS = Object.freeze({}) as Record<PermissionKey, boolean>;

const AuthContext = createContext<AuthContextValue | null>(null);

function pickPrimaryRole(rs: UserRole[]): UserRole | null {
  if (!rs.length) return null;
  return [...rs].sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b))[0];
}

function mergePermissions(role: UserRole | null, overrides: Partial<Record<PermissionKey, boolean>>): Record<PermissionKey, boolean> {
  const base = role ? { ...DEFAULT_PERMISSIONS[role] } : ({} as Record<PermissionKey, boolean>);
  return { ...base, ...overrides } as Record<PermissionKey, boolean>;
}

async function fetchAuthState(userId: string) {
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("id,name,email,active,avatar,permissions").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const profile: AdminProfile | null = profileRes.data
    ? {
        id: profileRes.data.id,
        name: profileRes.data.name ?? "",
        email: profileRes.data.email ?? "",
        active: profileRes.data.active ?? true,
        avatar: profileRes.data.avatar ?? null,
        permissions: (profileRes.data.permissions as Partial<Record<PermissionKey, boolean>>) ?? {},
      }
    : null;
  const roles = (rolesRes.data ?? []).map((r) => r.role as UserRole);
  return { profile, roles };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const loggedLoginFor = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrate = async (s: Session | null, event?: string) => {
      setSession(s);
      if (!s?.user) {
        setProfile(null);
        setRoles([]);
        return;
      }
      const { profile: p, roles: r } = await fetchAuthState(s.user.id);
      if (!mounted) return;
      setProfile(p);
      setRoles(r);

      // Record login exactly once per session id (survives StrictMode double-mount).
      if (event === "SIGNED_IN" && loggedLoginFor.current !== s.access_token) {
        loggedLoginFor.current = s.access_token;
        void supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", s.user.id);
        void logActivity({
          action: "user.login",
          entity: "auth",
          entityId: s.user.id,
          message: `${s.user.email ?? "User"} signed in`,
          metadata: { userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "" },
        });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // defer async work outside the callback per Supabase best practice
      setTimeout(() => { void hydrate(s, event); }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      hydrate(s).finally(() => { if (mounted) setLoading(false); });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role = useMemo(() => pickPrimaryRole(roles), [roles]);
  const permissions = useMemo(
    () => mergePermissions(role, profile?.permissions ?? {}),
    [role, profile],
  );

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    role,
    roles,
    permissions: role ? permissions : EMPTY_PERMS,
    loading,
    hasPermission: (key) => {
      if (role === "super_admin") return true;
      return !!permissions[key];
    },
    hasRole: (...want) => want.some((r) => roles.includes(r)),
    signOut: async () => {
      const email = session?.user?.email;
      const uid = session?.user?.id;
      // Best-effort audit BEFORE we drop the session so RLS still lets us insert.
      if (uid) {
        await logActivity({
          action: "user.logout",
          entity: "auth",
          entityId: uid,
          message: `${email ?? "User"} signed out`,
        });
      }
      await supabase.auth.signOut();
    },
  }), [session, profile, role, roles, permissions, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
