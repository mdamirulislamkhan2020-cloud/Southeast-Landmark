import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from "@/services/email-service";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const inFlight = useRef(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      // Backend issues the real token; frontend passes a placeholder that the
      // future PHP endpoint (POST /api/admin/smtp/send) will replace.
      const token = crypto.randomUUID();
      const res = await sendPasswordResetEmail(email.trim(), token);
      if (!res.ok) {
        toast.error(res.error ?? "We couldn't send the reset email.");
        return;
      }
      setSent(true);
      if (res.data?.simulated) {
        toast.warning("Simulated — no email was sent (backend not connected).");
      } else {
        toast.success("Reset email sent — check your inbox.");
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-gradient-gold">Reset your password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the email address on your account and we'll send a reset link.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm">If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.</p>
              <Link to="/admin/login" className="text-sm text-primary hover:underline">← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy} aria-busy={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? "Sending…" : "Send reset link"}
              </Button>
              <div className="text-center">
                <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground">Back to sign in</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
