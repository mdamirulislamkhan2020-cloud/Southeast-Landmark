import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  FileText,
  Headphones,
  Sparkles,
  Users,
  Building2,
  Award,
  TrendingUp,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
} from "lucide-react";
import { site } from "@/config/site";
import hero from "@/assets/brand/hero.jpg";
import about from "@/assets/brand/about.jpg";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

const features = [
  { icon: Wallet, title: "Passive Income", body: "Earn steady rental returns with quarterly distributions." },
  { icon: ShieldCheck, title: "Secure & Compliant", body: "Every project is legally structured and independently audited." },
  { icon: FileText, title: "Transparency", body: "Consult the complete documentation for every property, on demand." },
  { icon: Headphones, title: "Support", body: "A dedicated team on call 24 hours a day, 7 days a week." },
];

const stats = [
  { icon: Users, label: "Members", value: "10,000+" },
  { icon: Building2, label: "Investors", value: "3,000+" },
  { icon: Award, label: "Years Experience", value: "25" },
  { icon: TrendingUp, label: "Returns Up To", value: "30%" },
];

const properties = [
  { img: p1, title: "The Landmark Residences", location: "Gulshan, Dhaka", price: "৳ 1.85 Cr", beds: 3, baths: 3, sqft: 2100 },
  { img: p2, title: "Riverside Villa Estate", location: "Bashundhara R/A, Dhaka", price: "৳ 3.20 Cr", beds: 4, baths: 4, sqft: 3400 },
  { img: p3, title: "Skyline Tower Condominium", location: "Dhanmondi, Dhaka", price: "৳ 92 Lac", beds: 2, baths: 2, sqft: 1450 },
];

const testimonials = [
  { name: "Rafiq Ahmed", role: "Business Owner", body: "Southeast Landmark handled every detail with professionalism. The handover was smooth and the space is exactly as promised." },
  { name: "Nasrin Kabir", role: "Architect", body: "Their attention to material quality and finish stands out. I recommend them to every client looking for long-term value." },
  { name: "Imran Hossain", role: "Investor", body: "Clear documentation, honest timelines, real returns. Exactly what a modern property partner should be." },
  { name: "Sadia Rahman", role: "Homeowner", body: "From the first visit to key handover, the team was responsive and transparent. My family feels at home." },
];

const blogs = [
  { title: "A Practical Guide to Real Estate Investing in 2026", author: "Editorial", date: "12 Feb 2026" },
  { title: "Ten Tips for Launching Your Property Portfolio", author: "Editorial", date: "05 Feb 2026" },
  { title: "How to Evaluate a Turn-Key Property Purchase", author: "Editorial", date: "22 Jan 2026" },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-5xl text-center font-display text-4xl leading-tight font-semibold sm:text-6xl">
            Unlock the <span className="text-gradient-gold">Door</span> to your
            Dream Property Today and Forever
          </h1>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10">
              <img
                src={hero}
                alt="Luxury residence at dusk"
                width={1600}
                height={1024}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
            </div>
            <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-primary/20 bg-card p-8">
              {[
                { k: "8k+", v: "Happy Clients" },
                { k: "31k+", v: "5-Star Reviews" },
                { k: "৳ 34L", v: "Welcome Package" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-4xl font-semibold text-gradient-gold">
                    {s.k}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
                </div>
              ))}
              <Link
                to="/property"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Start Exploring <ArrowUpRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Boost the Potential of Your Property Portfolio
          </h2>
          <p className="mt-4 text-muted-foreground">
            Discover the qualities that make Southeast Landmark the preferred
            partner for owners and investors seeking sustainable, comfortable
            living spaces.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 overflow-hidden rounded-3xl border border-primary/20 lg:order-1">
            <img src={about} alt="About Southeast Landmark" loading="lazy" width={1200} height={900} className="h-full w-full object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> About Us
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Welcome to {site.short}
            </h2>
            <h3 className="mt-4 font-display text-lg text-primary">
              Building Landmarks You Can Call Home
            </h3>
            <p className="mt-4 text-muted-foreground">
              Southeast Landmark Ltd. is a Dhaka-based real estate company
              dedicated to designing and delivering residences that combine
              craftsmanship, comfort, and lasting value. Every project is guided
              by a single principle — the best possible functionality of space
              for our valued plot owners.
            </p>
            <p className="mt-3 text-muted-foreground">
              From plot acquisition to final handover, we work transparently and
              on schedule, so that families and investors alike can trust the
              home they choose today will stand strong for generations.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Discover More <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Featured Properties
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              All Property Spotlight
            </h2>
          </div>
          <Link to="/property" className="text-sm font-semibold text-primary hover:underline">
            View all properties →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {p.price}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> {p.location}
                </p>
                <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary" /> {p.beds} Beds</span>
                  <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary" /> {p.baths} Baths</span>
                  <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> {p.sqft} sqft</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> Testimonials
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Trust, Quality and Service in Every Handover
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">“{t.body}”</p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 font-display text-sm font-semibold text-primary">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${hero})` }}
        />
        <div className="absolute inset-0 -z-10 bg-background/85" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              You Invest. <span className="text-gradient-gold">We Do The Rest.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Focus on what matters. Southeast Landmark manages design, delivery
              and property care so your investment quietly compounds in value.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-primary/25 bg-card/70 p-6 text-center backdrop-blur">
                <s.icon className="mx-auto h-8 w-8 text-primary" />
                <div className="mt-4 font-display text-4xl font-semibold text-gradient-gold">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> News &amp; Insights
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Stay Informed with Our Latest Stories
            </h2>
          </div>
          <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">View all posts →</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {blogs.map((b, i) => (
            <article key={b.title} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={[p1, p2, p3][i]} alt="" loading="lazy" width={1024} height={640} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>By {b.author}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {b.date}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{b.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}