import { useState } from "react";
import { MapPin, Mail, Phone, Loader2 } from "lucide-react";
import { site } from "@/config/site";
import { toast } from "sonner";
import { sendAppEmail } from "@/services/email-service";
import { fbqTrackWithId, newEventId, setFbqAdvancedMatching, splitName } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

interface ContactContentSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ContactContentSection({ data, isEditable, onUpdateField }: ContactContentSectionProps) {
  const d = data || {};
  const formTitle = d.formTitle ?? "Book a Site Visit or Project Inquiry";
  const formSubtitle = d.formSubtitle ?? "Share your details and our land consultant will get in touch.";
  const buttonLabel = d.buttonLabel ?? "Book Your Plot Consultation";
  const phone = d.phone ?? "01591-134357";
  const email = d.email ?? "info@southeastlandmark.com";
  const address = d.address ?? "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207";

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isEditable) return;
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
        toast.success("Thank you! Our land consultant will contact you shortly.");
      }
      const eventId = newEventId("Lead");
      const { firstName, lastName } = splitName(payload.name);
      setFbqAdvancedMatching({
        firstName,
        lastName,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
      });
      fbqTrackWithId("Lead", eventId, {
        content_name: "Contact Page Form",
        content_category: "Lead Form",
      });
      gtmPush("generate_lead", {
        event_id: eventId,
        form_name: "Contact Page Form",
        lead_source: "contact_page",
      });
      form.reset();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact info side */}
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Get in Touch Directly</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Interested in learning more about Southeast Landmark Ltd.’s ongoing project in Savar Bonogram near Mirpur Zoo? Have questions about plot prices, flexible installment schedules, or want to schedule a guided site tour?
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Corporate Office</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateField?.("address", e.currentTarget.textContent || "")}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {address}
                    </span>
                  ) : (
                    address
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Helpline & Site Visits</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateField?.("phone", e.currentTarget.textContent || "")}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {phone}
                    </span>
                  ) : (
                    <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-primary transition">
                      {phone}
                    </a>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Saturday – Thursday: 9:00 AM – 7:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Email Us</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateField?.("email", e.currentTarget.textContent || "")}
                      className="outline-none hover:bg-primary/10 px-1 rounded transition"
                    >
                      {email}
                    </span>
                  ) : (
                    <a href={`mailto:${email}`} className="hover:text-primary transition">
                      {email}
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Form */}
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
          <h3 className="font-display text-2xl font-semibold">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("formTitle", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition"
              >
                {formTitle}
              </span>
            ) : (
              formTitle
            )}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("formSubtitle", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition"
              >
                {formSubtitle}
              </span>
            ) : (
              formSubtitle
            )}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Full Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Mohammad Rahim"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mobile Number *
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-project" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interested Project
                </label>
                <select
                  id="contact-project"
                  name="project"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Savar Bonogram Township (Phase 1)">Savar Bonogram Township (Phase 1)</option>
                  <option value="Bonogram Green Enclave (Phase 2)">Bonogram Green Enclave (Phase 2)</option>
                  <option value="Mirpur Zoo Link Road Project">Mirpur Zoo Link Road Project</option>
                  <option value="Other / General Inquiry">Other / General Inquiry</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-plot-size" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preferred Plot Size
                </label>
                <select
                  id="contact-plot-size"
                  name="plotSize"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="3 Katha">3 Katha</option>
                  <option value="5 Katha">5 Katha</option>
                  <option value="10 Katha">10 Katha</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message or Site Visit Preference
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                placeholder="Let us know if you want a Friday/Saturday site tour..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateField?.("buttonLabel", e.currentTarget.textContent || "")}
                  className="outline-none"
                >
                  {buttonLabel}
                </span>
              ) : (
                buttonLabel
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
