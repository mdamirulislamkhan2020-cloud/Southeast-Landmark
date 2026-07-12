import { PageHero } from "@/components/site/PageHero";
import { MapPin, Mail, Phone, Loader2 } from "lucide-react";
import { site } from "@/config/site";
import { useState } from "react";
import { toast } from "sonner";
import { sendAppEmail } from "@/services/email-service";
import { blockData, CmsAssignedLeadForm, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { fbqTrackWithId, newEventId, setFbqAdvancedMatching, splitName } from "@/lib/fbq";

export function ContactPage() {
  const blocks = useCmsPageBlocks("/contact");
  const heroBlock = blockData(blocks, "contact.hero");
  const contactBlock = blockData(blocks, "contact.info");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;
    if (!payload.name || !payload.phone) {
      toast.error("Please provide your name and mobile number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendAppEmail({
        to: site.email,
        subject: `New inquiry from ${payload.name}`,
        source: "contact_form",
        replyTo: payload.email || undefined,
        text: [
          `Name: ${payload.name}`,
          `Phone: ${payload.phone}`,
          `Email: ${payload.email ?? "—"}`,
          `Project: ${payload.project ?? "—"}`,
          `Plot size: ${payload.plotSize ?? "—"}`,
          `Purpose: ${payload.purpose ?? "—"}`,
          "",
          payload.message ?? "",
        ].join("\n"),
        meta: { source: "contact_page" },
      });
      if (!res.ok) {
        toast.error(res.error ?? "We couldn't submit your inquiry. Please try again.");
        return;
      }
      if (res.data?.simulated) {
        toast.warning("Inquiry recorded (email backend not connected yet).");
      } else {
        toast.success("Thanks — our land consultant will reach out shortly.");
      }
      // Meta Advanced Matching — set before firing so the Contact event
      // includes normalised user data provided in the form.
      const { firstName, lastName } = splitName(payload.name ?? "");
      setFbqAdvancedMatching({
        email: payload.email || undefined,
        phone: payload.phone,
        firstName,
        lastName,
        country: "bd",
      });
      fbqTrackWithId("Contact", newEventId("Contact"), {
        content_name: "Contact Form",
        source: "Website",
        page_location: typeof window !== "undefined" ? window.location.href : "",
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
      });
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHero title={cmsString(heroBlock, "title", "Contact Us")} crumb={cmsString(heroBlock, "crumb", "Contact Us")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <iframe
              title="Southeast Landmark location"
              src="https://www.google.com/maps?q=Adabor,Mohammadpur,Dhaka&output=embed"
              className="h-full min-h-[420px] w-full"
              loading="lazy"
            />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-8">
            <h2 className="font-display text-2xl font-semibold text-primary">{cmsString(contactBlock, "formTitle", "Book a Site Visit or Project Inquiry")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{cmsString(contactBlock, "formSubtitle", "Share your details and our land consultant will get in touch.")}</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder="Full Name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                <input name="phone" required type="tel" placeholder="Mobile Number" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="email" type="email" placeholder="Email Address" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                <select name="project" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Interested Project</option>
                  <option>Landmark City — Purbachal</option>
                  <option>Riverside Township — Keraniganj</option>
                  <option>Skyline Green Enclave — Savar</option>
                  <option>Any Ongoing / Upcoming Project</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select name="plotSize" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Plot Size Interest</option>
                  <option>3 Katha</option>
                  <option>5 Katha</option>
                  <option>7.5 Katha</option>
                  <option>10 Katha or above</option>
                </select>
                <select name="purpose" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Purpose</option>
                  <option>Own Residence</option>
                  <option>Land Investment</option>
                  <option>Site Visit Booking</option>
                  <option>Installment Information</option>
                </select>
              </div>
              <textarea name="message" placeholder="Message (any specific project or plot requirement)" rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <button type="submit" disabled={submitting} aria-busy={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-70">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending…" : cmsString(contactBlock, "buttonLabel", "Book Your Plot Consultation")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Phone, label: "Phone", value: cmsString(contactBlock, "phone", site.phone), href: `tel:${cmsString(contactBlock, "phone", site.phone)}` },
            { icon: Mail, label: "Email", value: cmsString(contactBlock, "email", site.email), href: `mailto:${cmsString(contactBlock, "email", site.email)}` },
            { icon: MapPin, label: "Address", value: cmsString(contactBlock, "address", site.address), href: "#" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              onClick={() => {
                if (c.href.startsWith("tel:") || c.href.startsWith("mailto:")) {
                  fbqTrackWithId("Contact", newEventId("Contact"), {
                    content_name: c.href.startsWith("tel:") ? "Phone Click" : "Email Click",
                    source: "Contact Page",
                    page_location: typeof window !== "undefined" ? window.location.href : "",
                    page_path: typeof window !== "undefined" ? window.location.pathname : "",
                  });
                }
              }}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/50"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">{c.label}</div>
                <div className="mt-1 text-sm text-foreground/90">{c.value}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
      <CmsAssignedLeadForm path="/contact" />
    </div>
  );
}
