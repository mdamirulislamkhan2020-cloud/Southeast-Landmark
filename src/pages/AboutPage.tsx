import { PageHero } from "@/components/site/PageHero";
import { Wallet, ShieldCheck, FileText, Headphones, Sparkles } from "lucide-react";
import about from "@/assets/brand/about.jpg";
import { site } from "@/config/site";

const features = [
  { icon: Wallet, title: "Easy Installments", body: "Flexible monthly installment support to make plot ownership accessible." },
  { icon: ShieldCheck, title: "Verified Land", body: "Every project is legally cleared, mutation-ready and independently verified." },
  { icon: FileText, title: "Transparent Papers", body: "Full land documentation and approvals accessible for every plot owner." },
  { icon: Headphones, title: "Dedicated Support", body: "A dedicated project team supports you from site visit to registration." },
];

export function AboutPage() {
  return (
    <div>
      <PageHero title="About" crumb="About" />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Grow the Value of Your Land Portfolio
            </h2>
          </div>
          <p className="text-muted-foreground">
            Southeast Landmark Ltd. is a land development company on a mission
            to make planned, secure land ownership accessible. Our teams
            combine urban planning, civil engineering and land expertise to
            deliver residential plots and townships that stand out for their
            infrastructure, clean papers and long-term value.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-primary/20">
            <img src={about} alt="Southeast Landmark township project" loading="lazy" width={1200} height={900} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Our Story
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Welcome to {site.short}</h2>
            <p className="mt-4 text-muted-foreground">{site.tagline}</p>
            <p className="mt-3 text-muted-foreground">
              From land acquisition and layout approval to plot registration
              and handover, we work transparently and on schedule — so that
              families and land investors alike can trust the plot they book
              today will stand strong for generations.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Residential Land Development",
                "Planned Township Development",
                "Residential Plot Sales",
                "Land Investment Advisory",
                "Site Visit Booking",
                "Installment Payment Support",
                "Customer Consultation",
                "After-Sales Support",
              ].map((s) => (
                <div key={s} className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground/85">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}