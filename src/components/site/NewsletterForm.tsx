import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { subscribeToNewsletter } from "@/services/email-service";

/** Newsletter subscription — routes through the centralised SMTP service. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error("Enter a valid email address");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      const res = await subscribeToNewsletter(clean);
      if (!res.ok) {
        toast.error(res.error ?? "Subscription failed");
        return;
      }
      if (res.data?.simulated) toast.warning("Subscribed — email backend not connected yet.");
      else toast.success("Thanks — you're subscribed.");
      setEmail("");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 flex gap-2" aria-label="Newsletter subscription">
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <div className="relative flex-1">
        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 pl-8 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
