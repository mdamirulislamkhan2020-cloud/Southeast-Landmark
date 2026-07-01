import { PageHero } from "@/components/site/PageHero";
import { MapPin, Mail, Phone } from "lucide-react";
import { site } from "@/config/site";

export function ContactPage() {
  return (
    <div>
      <PageHero title="Contact Us" crumb="Contact Us" />
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
            <h2 className="font-display text-2xl font-semibold text-primary">Book a Site Visit or Project Inquiry</h2>
            <p className="mt-1 text-sm text-muted-foreground">Share your details and our land consultant will get in touch.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full Name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                <input required type="tel" placeholder="Mobile Number" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="email" placeholder="Email Address" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Interested Project</option>
                  <option>Landmark City — Purbachal</option>
                  <option>Riverside Township — Keraniganj</option>
                  <option>Skyline Green Enclave — Savar</option>
                  <option>Any Ongoing / Upcoming Project</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Plot Size Interest</option>
                  <option>3 Katha</option>
                  <option>5 Katha</option>
                  <option>7.5 Katha</option>
                  <option>10 Katha or above</option>
                </select>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Purpose</option>
                  <option>Own Residence</option>
                  <option>Land Investment</option>
                  <option>Site Visit Booking</option>
                  <option>Installment Information</option>
                </select>
              </div>
              <textarea placeholder="Message (any specific project or plot requirement)" rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <button type="submit" className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                Book Your Plot Consultation
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}` },
            { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
            { icon: MapPin, label: "Address", value: site.address, href: "#" },
          ].map((c) => (
            <a key={c.label} href={c.href} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/50">
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
    </div>
  );
}