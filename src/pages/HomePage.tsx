import { Link } from "react-router-dom";
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
  LandPlot,
  Ruler,
  Layers,
  Calendar,
} from "lucide-react";
import { site } from "@/config/site";
import hero from "@/assets/brand/hero.jpg";
import about from "@/assets/brand/about.jpg";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";
import { blockData, CmsAssignedLeadForm, cmsList, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { usePublishedBlogPosts, usePublishedProperties, useActiveTestimonials } from "@/components/site/useCmsData";
import { formatBdtShort, formatShortDate } from "@/lib/format";

const features = [
  { icon: Wallet, title: "Easy Installments", body: "Flexible monthly installment facilities to make land ownership accessible." },
  { icon: ShieldCheck, title: "Clean & Verified Land", body: "Every plot is legally cleared, mutation-ready and independently verified." },
  { icon: FileText, title: "Transparent Documentation", body: "Full land papers, layout plans and approvals — accessible on request." },
  { icon: Headphones, title: "Dedicated Support", body: "A dedicated project team guides you from site visit to plot handover." },
];

const stats = [
  { icon: Users, label: "Plot Owners", value: "10,000+" },
  { icon: Building2, label: "Land Investors", value: "3,000+" },
  { icon: Award, label: "Years Experience", value: "25" },
  { icon: TrendingUp, label: "Land Value Growth", value: "30%" },
];

const fallbackBlogImages = [p1, p2, p3];

const heroStats = [
  { k: "8k+", v: "Plot Owners" },
  { k: "31k+", v: "Katha Delivered" },
  { k: "৳ 34L", v: "Starting Plot Price" },
];

function HomeTitle({ title }: { title: string }) {
  if (title === "Own Your Land in a Planned Township — Today and for Generations") {
    return <>Own Your <span className="text-gradient-gold">Land</span> in a Planned Township — Today and for Generations</>;
  }
  return <>{title}</>;
}

function StatsTitle({ title }: { title: string }) {
  if (title === "You Book. We Develop.") {
    return <>You Book. <span className="text-gradient-gold">We Develop.</span></>;
  }
  return <>{title}</>;
}

export function HomePage() {
  const blocks = useCmsPageBlocks("/");
  const heroBlock = blockData(blocks, "home.hero");
  const featuresBlock = blockData(blocks, "home.features");
  const aboutBlock = blockData(blocks, "home.about");
  const projectsBlock = blockData(blocks, "home.projects");
  const testimonialsBlock = blockData(blocks, "home.testimonials");
  const statsBlock = blockData(blocks, "home.stats");
  const blogBlock = blockData(blocks, "home.blog");
  const { items: propertyItems } = usePublishedProperties(3);
  const { items: testimonialItems } = useActiveTestimonials();
  const { items: blogItems } = usePublishedBlogPosts(3);

  const editableFeatures = cmsList<{ title?: string; body?: string; text?: string }>(
    featuresBlock,
    "items",
    features.map(({ title, body }) => ({ title, body })),
  ).map((item, index) => ({
    icon: features[index % features.length].icon,
    title: item.title || features[index % features.length].title,
    body: item.body || item.text || features[index % features.length].body,
  }));
  const editableHeroStats = cmsList<{ k: string; v: string }>(heroBlock, "stats", heroStats);
  const dbTestimonials = testimonialItems.slice(0, 4).map((t) => ({ name: t.name, role: [t.position, t.company].filter(Boolean).join(" · "), body: t.review }));
  const editableTestimonials = cmsList<{ name: string; role: string; body: string }>(testimonialsBlock, "items", dbTestimonials);
  const editableStats = cmsList<{ value: string; label: string }>(
    statsBlock,
    "items",
    stats.map(({ value, label }) => ({ value, label })),
  ).map((item, index) => ({
    icon: stats[index % stats.length].icon,
    value: item.value || stats[index % stats.length].value,
    label: item.label || stats[index % stats.length].label,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-5xl text-center font-display text-4xl leading-tight font-semibold sm:text-6xl">
            <HomeTitle title={cmsString(heroBlock, "title", "Own Your Land in a Planned Township — Today and for Generations")} />
          </h1>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10">
              <img
                src={hero}
                alt="Planned residential township at dusk"
                width={1600}
                height={1024}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
            </div>
            <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-primary/20 bg-card p-8">
              {editableHeroStats.map((s) => (
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
                {cmsString(heroBlock, "ctaLabel", "Explore Projects")} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {cmsString(featuresBlock, "title", "Grow the Value of Your Land Portfolio")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {cmsString(featuresBlock, "subtitle", "Discover why plot buyers and land investors trust Southeast Landmark for planned township development, clean documentation and long-term appreciation.")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {editableFeatures.map((f) => (
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
              <Sparkles className="h-4 w-4" /> {cmsString(aboutBlock, "eyebrow", "About Us")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(aboutBlock, "title", `Welcome to ${site.short}`)}
            </h2>
            <h3 className="mt-4 font-display text-lg text-primary">
              {cmsString(aboutBlock, "subtitle", "Planned Townships. Verified Land. Trusted Handover.")}
            </h3>
            <p className="mt-4 text-muted-foreground">
              {cmsString(aboutBlock, "body1", "Southeast Landmark Ltd. is a Dhaka-based land development company dedicated to planning and delivering residential plots and township projects that combine strong infrastructure, clean documentation and lasting land value for every plot owner.")}
            </p>
            <p className="mt-3 text-muted-foreground">
              {cmsString(aboutBlock, "body2", "From land acquisition and layout approval to plot registration and handover, we work transparently and on schedule so families and investors can trust that the plot they book today will stand strong for generations.")}
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              {cmsString(aboutBlock, "ctaLabel", "Learn About Us")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> {cmsString(projectsBlock, "eyebrow", "Featured Projects")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(projectsBlock, "title", "Ongoing & Upcoming Land Projects")}
            </h2>
          </div>
          <Link to="/property" className="text-sm font-semibold text-primary hover:underline">
            {cmsString(projectsBlock, "ctaLabel", "Explore all projects →")}
          </Link>
        </div>
        {propertyItems.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propertyItems.map((p, i) => {
              const img = p.featuredImage || [p1, p2, p3][i % 3];
              const loc = [p.location.area, p.location.city].filter(Boolean).join(", ");
              const price = formatBdtShort(p.pricing.price, p.pricing.currency);
              return (
                <Link
                  key={p.id}
                  to={`/property/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={img} alt={p.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {price && (
                      <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {price}
                      </div>
                    )}
                    <div className="absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-primary capitalize">
                      {p.listingStatus}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" /> {loc || "—"}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><LandPlot className="h-4 w-4 text-primary" /> {p.details.areaSqft || 0} sqft</span>
                      <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> {p.category}</span>
                      <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> {p.type}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> {cmsString(testimonialsBlock, "eyebrow", "Testimonials")}
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(testimonialsBlock, "title", "Trust, Planning and Service in Every Plot Handover")}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {editableTestimonials.map((t) => (
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
              <StatsTitle title={cmsString(statsBlock, "title", "You Book. We Develop.")} />
            </h2>
            <p className="mt-4 text-muted-foreground">
              {cmsString(statsBlock, "subtitle", "Focus on what matters. Southeast Landmark manages land planning, approvals, infrastructure and handover so your plot investment quietly appreciates in value.")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {editableStats.map((s) => (
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
              <Sparkles className="h-4 w-4" /> {cmsString(blogBlock, "eyebrow", "News & Insights")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {cmsString(blogBlock, "title", "Stay Informed with Our Latest Stories")}
            </h2>
          </div>
          <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">{cmsString(blogBlock, "ctaLabel", "View all posts →")}</Link>
        </div>
        {blogItems.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {blogItems.map((b, i) => {
              const img = b.featuredImage || fallbackBlogImages[i % fallbackBlogImages.length];
              const date = formatShortDate(b.publishedAt || b.publishAt || b.updatedAt);
              return (
                <Link key={b.id} to={`/blog/${b.slug}`} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={img} alt="" loading="lazy" width={1024} height={640} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {b.author || "Editorial"}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{b.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <CmsAssignedLeadForm path="/" />
    </div>
  );
}
