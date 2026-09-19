import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Award,
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Shield,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { JobCard } from "@/components/career/JobCard";
import { JobFilters } from "@/components/career/JobFilters";
import { JobApplicationModal } from "@/components/career/JobApplicationModal";
import { listJobs } from "@/admin/api/jobs-client";
import type { JobPost, JobFilterOptions } from "@/admin/api/jobs";
import { useCmsPageBlocks, blockData, cmsString, cmsList } from "@/components/site/useCmsPageBlocks";

export function CareerPage() {
  const blocks = useCmsPageBlocks("/career");

  // CMS overridable texts
  const heroData = blockData(blocks, "career.hero");
  const valuesData = blockData(blocks, "career.values");
  const salesData = blockData(blocks, "career.sales_culture");
  const growthData = blockData(blocks, "career.growth_path");

  const heroEyebrow = cmsString(heroData, "eyebrow", "BUILD YOUR CAREER WITH SOUTHEAST LANDMARK");
  const heroTitle = cmsString(heroData, "title", "Build a Career Where Your Ambition Has No Ceiling");
  const heroSubtitle = cmsString(
    heroData,
    "subtitle",
    "Join a growing real estate company where performance, trust, learning and long-term growth are valued."
  );

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPost | null>(null);

  const [filters, setFilters] = useState<JobFilterOptions>({
    search: "",
    department: "all",
    location: "all",
    employmentType: "all",
    status: "all",
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listJobs()
      .then((data) => {
        if (alive) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Filtered jobs
  const departments = useMemo(() => {
    const set = new Set(jobs.map((j) => j.department).filter(Boolean));
    return Array.from(set);
  }, [jobs]);

  const locations = useMemo(() => {
    const set = new Set(jobs.map((j) => j.location).filter(Boolean));
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Don't show drafts or archived jobs on public site unless published
      if (job.status !== "published" && job.status !== "closed") {
        return false;
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchDept = job.department.toLowerCase().includes(q);
        const matchLoc = job.location.toLowerCase().includes(q);
        const matchSkills = job.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDept && !matchLoc && !matchSkills) return false;
      }

      if (filters.department && filters.department !== "all") {
        if (job.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      }

      if (filters.location && filters.location !== "all") {
        if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }

      if (filters.employmentType && filters.employmentType !== "all") {
        if (job.employmentType.toLowerCase() !== filters.employmentType.toLowerCase()) return false;
      }

      return true;
    });
  }, [jobs, filters]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Careers & Opportunities — Southeast Landmark Ltd."
        description="Build a high-reward career in real estate land sales and development with Southeast Landmark Ltd. in Dhaka. Explore open positions, generous incentives, and career growth."
        path="/career"
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-background via-secondary/20 to-background border-b border-border/40">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{heroEyebrow}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              id="hero-view-positions-cta"
              type="button"
              onClick={() => scrollToSection("open-positions")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
            >
              <span>View Open Positions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-why-join-us-cta"
              type="button"
              onClick={() => scrollToSection("why-join-us")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card/60 hover:bg-secondary text-foreground font-semibold transition-colors"
            >
              <span>Why Join Us</span>
            </button>
          </div>

          {/* Key Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-12 border-t border-border/50 text-left">
            <div className="p-4 rounded-xl bg-card/50 border border-border/40">
              <div className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
                14+
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Years in Land Development
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/50 border border-border/40">
              <div className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
                5% – 16%
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Sales Commissions
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/50 border border-border/40">
              <div className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
                2,500+
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Satisfied Plot Owners
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/50 border border-border/40">
              <div className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
                100%
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Sales Training Provided
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUES / WHY JOIN US */}
      <section id="why-join-us" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {cmsString(valuesData, "eyebrow", "Why Choose Southeast Landmark")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground mt-2">
            {cmsString(valuesData, "title", "Why Join Southeast Landmark Ltd.")}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
            {cmsString(
              valuesData,
              "subtitle",
              "We believe in recognizing ambition, rewarding performance, and developing leadership from within."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: TrendingUp,
              title: "Career Growth",
              description:
                "Clear pathways for advancement from Executive to Senior, Team Lead, and Management roles based on merit and performance.",
            },
            {
              icon: Award,
              title: "Performance Rewards",
              description:
                "Attractive commission and project bonuses from 5% to 16% on independently closed sales with immediate payout upon client payment.",
            },
            {
              icon: GraduationCap,
              title: "Professional Training",
              description:
                "Structured sales and real estate training programs to sharpen your presentation, negotiation, and closing skills from day one.",
            },
            {
              icon: Building2,
              title: "Real Estate Experience",
              description:
                "Direct exposure to high-demand land development, township planning, and large-scale residential projects in Dhaka.",
            },
            {
              icon: Users,
              title: "Leadership Opportunities",
              description:
                "Opportunities to guide, mentor, and build your own sales teams as the company expands new project phases.",
            },
            {
              icon: Briefcase,
              title: "Supportive Sales Environment",
              description:
                "Regular verified leads, seasoned closing support, transparent documentation, and a culture that treats you like family.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 md:p-8 rounded-xl border border-border/60 bg-card hover:border-amber-500/40 transition-all duration-300 group hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHY SALES AT SOUTHEAST LANDMARK */}
      <section className="py-16 md:py-24 bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {cmsString(salesData, "eyebrow", "Why Sales at Southeast Landmark")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-foreground leading-tight">
                {cmsString(salesData, "title", "Thrive in High-Value Land & Property Sales")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cmsString(
                  salesData,
                  "body1",
                  "At Southeast Landmark Ltd., our sales executives are empowered with genuine, verified land plots that clients genuinely want. Founded in 2010, our transparent documentation and prime township location in Savar, Bonogram give you the confidence to present high-value assets that sell."
                )}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cmsString(
                  salesData,
                  "body2",
                  "You are not working in isolation. You receive active management support, qualified prospective buyer leads, scheduled project transport for site visits, and instant commission disbursement upon client payment confirmation."
                )}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Verified titles and transparent land documentation that builds buyer trust",
                  "Dedicated AC microbuses for daily client site visits from Ring Road to Savar",
                  "Incentive structures designed to let high performers earn life-changing income",
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Card / Highlight */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-amber-500/30 bg-card p-6 md:p-8 shadow-xl shadow-amber-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-display text-foreground">
                      Real Commission Example
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Transparent & immediate payout policy
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-secondary/60 border border-border/60 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Plot Sale Value:</span>
                    <span className="font-semibold text-foreground">Tk. 36,00,000/-</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Incentive Rate:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">5% to 16%</span>
                  </div>
                  <div className="h-px bg-border/60" />
                  <div className="flex justify-between items-center text-sm font-bold text-foreground pt-1">
                    <span>Executive Commission:</span>
                    <span className="text-base text-emerald-600 dark:text-emerald-400">
                      Tk. 1,80,000+
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  &ldquo;One sale could earn you Tk. 1,80,000/- at Southeast Landmark Ltd.
                  Paid immediately after we receive the client&apos;s payment.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAREER GROWTH ROADMAP */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {cmsString(growthData, "eyebrow", "Organizational Pathway")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground mt-2">
            {cmsString(growthData, "title", "Your Growth Roadmap")}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
            {cmsString(
              growthData,
              "subtitle",
              "Performance-driven advancement across our commercial sales and land management hierarchy."
            )}
          </p>
        </div>

        {/* Growth Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {[
            {
              step: "01",
              role: "Sales Executive",
              desc: "Master project details, lead generation, and client site visit coordination.",
            },
            {
              step: "02",
              role: "Senior Executive",
              desc: "Drive high-ticket plot negotiations, mentor junior associates, and achieve quarterly targets.",
            },
            {
              step: "03",
              role: "Team Leader",
              desc: "Manage a dedicated sales squad, oversee site visits, and coordinate pipeline deals.",
            },
            {
              step: "04",
              role: "Deputy Sales Manager",
              desc: "Formulate regional sales tactics, drive campaign goals, and optimize conversion ratios.",
            },
            {
              step: "05",
              role: "Sales Manager",
              desc: "Lead strategic commercial operations, new project launches, and division revenue.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border/60 bg-card hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {item.step}
                </span>
                <h3 className="text-base font-bold font-display text-foreground mt-2 mb-2">
                  {item.role}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border/40 flex items-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span>Merit Promotion</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8 italic">
          * Progression is based on individual sales performance, leadership readiness, and organizational opportunity.
        </p>
      </section>

      {/* 5. OPEN POSITIONS SECTION */}
      <section id="open-positions" className="py-20 md:py-28 bg-secondary/20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Vacancies
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground mt-2">
              Open Positions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-3">
              Explore opportunities and find where your skills can make an impact.
            </p>
          </div>

          {/* Job Filters */}
          <JobFilters
            filters={filters}
            onChange={setFilters}
            departments={departments}
            locations={locations}
            totalResults={filteredJobs.length}
          />

          {/* Jobs Listing */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading active job positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/40">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold font-display text-foreground">
                No matching positions found
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                We couldn&apos;t find any open roles matching your current filter criteria.
                Try adjusting your search terms or view all departments.
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: "",
                    department: "all",
                    location: "all",
                    employmentType: "all",
                    status: "all",
                  })
                }
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onQuickApply={(j) => setSelectedJobForModal(j)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. TALENT ACQUISITION CTA */}
      <section className="py-16 md:py-20 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
            Don&apos;t See the Right Fit Today?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We are always interested in meeting exceptional sales leaders, land acquisition experts, and customer relations professionals. Drop your CV to our talent database.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-500" />
              <span>HR Desk: 01591-134357</span>
            </div>
            <div className="hidden sm:inline">•</div>
            <div>Corporate Office: Ring Road, Adabor, Mohammadpur, Dhaka</div>
          </div>
        </div>
      </section>

      {/* Quick Application Modal */}
      {selectedJobForModal && (
        <JobApplicationModal
          job={selectedJobForModal}
          isOpen={true}
          onClose={() => setSelectedJobForModal(null)}
        />
      )}
    </div>
  );
}

export default CareerPage;
