import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase-backed auth for the admin panel.
 *
 * Phase 2 of the migration: replaces the localStorage mock login with real
 * Supabase authentication. Session state is subscribed via onAuthStateChange
 * so any part of the admin UI can hook into it.
 */

export type AppRole = "super_admin" | "admin" | "manager" | "editor" | "sales";

export interface AuthSession {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

/**
 * Sign up + first-admin bootstrap. The Postgres RPC `bootstrap_first_admin`
 * promotes the very first signed-up user to super_admin; all later signups
 * remain roleless until an existing admin grants them one.
 */
export async function signUp(email: string, password: string, name?: string) {
  const redirectTo = `${window.location.origin}/admin`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: name ? { name } : undefined,
    },
  });
  if (error) throw error;
  // If auto-confirm is on the session is returned immediately.
  if (data.session) {
    try {
      await supabase.rpc("bootstrap_first_admin");
    } catch {
      // non-fatal: user may not be first, or roles table already seeded
    }
  }
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

async function fetchRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) return [];
  return (data ?? []).map((r) => r.role as AppRole);
}

/**
 * React hook that returns the current auth session and known roles.
 * `loading` is true until the initial session lookup resolves.
 */
export function useAuthSession() {
  const [state, setState] = useState<AuthSession>({ session: null, user: null, roles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Register listener FIRST (per Supabase best practice) so we don't miss events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ session, user: session?.user ?? null, roles: [] });
      if (session?.user) {
        // Defer role fetch to avoid deadlock inside the auth callback
        setTimeout(async () => {
          const roles = await fetchRoles(session.user.id);
          if (mounted) setState((s) => ({ ...s, roles }));
        }, 0);
      }
    });

    // THEN load any existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      const roles = user ? await fetchRoles(user.id) : [];
      if (!mounted) return;
      setState({ session, user, roles });
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { ...state, loading };
}
