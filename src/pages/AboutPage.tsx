import { PageHero } from "@/components/site/PageHero";
import { Wallet, ShieldCheck, FileText, Headphones, Sparkles } from "lucide-react";
import about from "@/assets/brand/about.jpg";
import { site } from "@/config/site";

const features = [
  { icon: Wallet, title: "Passive Income", body: "Earn steady rental income with quarterly distributions." },
  { icon: ShieldCheck, title: "Secure & Compliant", body: "Every project is legally structured and independently audited." },
  { icon: FileText, title: "Transparency", body: "Complete documentation for every property, always accessible." },
  { icon: Headphones, title: "Support", body: "A dedicated team on call 24 hours a day, 7 days a week." },
];

export function AboutPage() {
  return (
    <div>
      <PageHero title="About" crumb="About" />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Boost the Potential of Your Property Portfolio
            </h2>
          </div>
          <p className="text-muted-foreground">
            Southeast Landmark Ltd. exists to make quality living accessible.
            Our teams combine architecture, engineering and hospitality thinking
            to deliver residences that stand out for their comfort, durability
            and long-term value.
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
            <img src={about} alt="Southeast Landmark residence" loading="lazy" width={1200} height={900} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Our Story
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Welcome to {site.short}</h2>
            <p className="mt-4 text-muted-foreground">{site.tagline}</p>
            <p className="mt-3 text-muted-foreground">
              From plot acquisition to final handover we work transparently and
              on schedule, so that families and investors alike can trust the
              home they choose today will stand strong for generations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}