import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updatePassword } from "@/admin/api/auth";

export function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase parses the URL hash on load; wait for a session or PASSWORD_RECOVERY event.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Password updated. You're signed in.");
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-gradient-gold">Set a new password</CardTitle>
          <p className="text-sm text-muted-foreground">Choose a new password for your admin account.</p>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Waiting for a valid reset link…</p>
              <Link to="/admin/forgot-password" className="text-sm text-primary hover:underline">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
              </div>
              {err && <div className="text-sm text-destructive">{err}</div>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}