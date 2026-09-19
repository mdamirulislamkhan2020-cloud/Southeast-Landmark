import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Building2,
  Award,
  GraduationCap,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { getJobBySlug, computeJobDeadlineStatus } from "@/admin/api/jobs-client";
import type { JobPost } from "@/admin/api/jobs";
import { JobApplicationModal } from "@/components/career/JobApplicationModal";

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    setLoading(true);
    getJobBySlug(slug)
      .then((data) => {
        // Draft or archived jobs should not be publicly accessible
        if (data && (data.status === "draft" || data.status === "archived")) {
          setJob(null);
        } else {
          setJob(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching job details:", err);
        setJob(null);
        setLoading(false);
      });
  }, [slug]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Job Opportunity at Southeast Landmark Ltd: ${job?.title}\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="text-center max-w-md p-8 rounded-2xl border border-border bg-card">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-foreground">
            Position Not Found
          </h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
            The job opening you are looking for may have expired, been filled, or is temporarily unlisted.
          </p>
          <Link
            to="/career"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore All Openings</span>
          </Link>
        </div>
      </div>
    );
  }

  const deadlineStatus = computeJobDeadlineStatus(job);
  const isClosed = deadlineStatus === "Closed";
  const isClosingSoon = deadlineStatus === "Closing Soon";

  const formattedDeadline = (() => {
    try {
      if (!job.applicationDeadline) return "Open until filled";
      const d = new Date(job.applicationDeadline);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return job.applicationDeadline;
    }
  })();

  // Build JSON-LD JobPosting schema
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.shortDescription || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: job.company || "Southeast Landmark Ltd.",
      value: job.id,
    },
    datePosted: job.publishedDate || job.createdAt.slice(0, 10),
    validThrough: job.applicationDeadline || undefined,
    employmentType: job.employmentType === "Full Time" ? "FULL_TIME" : "PART_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Southeast Landmark Ltd.",
      sameAs: "https://southeastlandmark.com",
      logo: "https://southeastlandmark.com/assets/brand/logo.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Dhaka",
        addressRegion: "Dhaka",
        addressCountry: "BD",
      },
    },
    baseSalary: job.salaryMin
      ? {
          "@type": "MonetaryAmount",
          currency: "BDT",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax || job.salaryMin,
            unitText: "MONTH",
          },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-32">
      <Seo
        title={job.seoTitle || `${job.title} | Southeast Landmark Ltd.`}
        description={
          job.seoDescription ||
          job.shortDescription ||
          `Apply for ${job.title} at Southeast Landmark Ltd. in Dhaka.`
        }
        path={`/career/${job.slug}`}
      />
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      {/* Breadcrumb Bar */}
      <div className="border-b border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link
            to="/career"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Positions</span>
          </Link>
          <span>Department: <strong className="text-foreground">{job.department}</strong></span>
        </div>
      </div>

      {/* TOP HEADER SECTION */}
      <section className="border-b border-border/50 bg-gradient-to-b from-secondary/30 via-card/50 to-background py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {job.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured Position
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {job.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/80 text-muted-foreground">
              {job.workplace}
            </span>

            {/* Status */}
            {isClosed ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                Application Closed
              </span>
            ) : isClosingSoon ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                Closing Soon (Deadline: {formattedDeadline})
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Open Position
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
                {job.title}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-medium">
                {job.company || "Southeast Landmark Ltd."} • {job.location}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>

              <button
                type="button"
                id="header-apply-now-btn"
                onClick={() => setIsApplyModalOpen(true)}
                disabled={isClosed}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 text-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{isClosed ? "Applications Closed" : "Apply For This Position"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 p-4 rounded-xl bg-card border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block">Location</span>
              <strong className="text-foreground">{job.location}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Employment Type</span>
              <strong className="text-foreground">{job.employmentType}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Experience</span>
              <strong className="text-foreground">
                {job.experienceLabel || `${job.minExperience || 1}–${job.maxExperience || 3} Years`}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Salary</span>
              <strong className="text-foreground">
                {job.salaryDisplay || (job.salaryMin ? `Tk. ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString() || ""}` : "Negotiable")}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Vacancies</span>
              <strong className="text-foreground">{job.vacancy} Openings</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Deadline</span>
              <strong className="text-amber-600 dark:text-amber-400">{formattedDeadline}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Structured Job Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Job Highlights */}
            {job.highlights && job.highlights.length > 0 && (
              <div className="p-6 md:p-8 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
                <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-4 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Job Highlights</span>
                </div>
                <div className="space-y-3">
                  {job.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview / Short Description */}
            {job.shortDescription && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold font-display text-foreground">
                  Role Overview
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {job.shortDescription}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-500" />
                  <span>Responsibilities & Key Deliverables</span>
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education Requirements */}
            {job.education && job.education.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-500" />
                  <span>Education Requirements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {job.education.map((edu, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience Requirements */}
            {job.experienceRequirements && job.experienceRequirements.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  <span>Experience Requirements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {job.experienceRequirements.map((exp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Requirements */}
            {job.additionalRequirements && job.additionalRequirements.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground">
                  Additional Requirements
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {job.additionalRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills & Expertise */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Other Relevant Skills */}
            {job.otherSkills && job.otherSkills.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Other Relevant Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.otherSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-card text-muted-foreground border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compensation & Benefits */}
            {job.compensationAndBenefits && job.compensationAndBenefits.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Compensation & Benefits</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {job.compensationAndBenefits.map((ben, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-card border border-border/60"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{ben}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incentive Information Callout */}
            {job.incentiveInfo && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Incentive & Bonus Policy</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {job.incentiveInfo}
                </p>
              </div>
            )}

            {/* Workplace & Employment Status */}
            <div className="p-5 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Workplace:</span>
                <strong className="text-foreground">{job.workplace}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Employment Status:</span>
                <strong className="text-foreground">{job.employmentType}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Gender:</span>
                <strong className="text-foreground">{job.gender}</strong>
              </div>
            </div>

            {/* Career Growth Opportunity */}
            {job.careerGrowth && job.careerGrowth.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xl font-bold font-display text-foreground">
                  Career Growth Pathway
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {job.careerGrowth.map((role, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">
                        {role}
                      </span>
                      {i < job.careerGrowth.length - 1 && (
                        <span className="text-amber-500 font-bold">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Instructions */}
            {job.applicationInstructions && (
              <div className="p-6 rounded-2xl bg-secondary/40 border border-border space-y-2">
                <h4 className="text-sm font-bold font-display text-foreground">
                  Application Instructions
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {job.applicationInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
                <h3 className="text-lg font-bold font-display text-foreground pb-4 border-b border-border">
                  Job Summary
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Company</span>
                    <strong className="text-foreground text-right">{job.company || "Southeast Landmark Ltd."}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Department</span>
                    <strong className="text-foreground text-right">{job.department}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Location</span>
                    <strong className="text-foreground text-right">{job.location}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Workplace</span>
                    <strong className="text-foreground text-right">{job.workplace}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Employment</span>
                    <strong className="text-foreground text-right">{job.employmentType}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Experience</span>
                    <strong className="text-foreground text-right">
                      {job.experienceLabel || `${job.minExperience || 1} to ${job.maxExperience || 7} years`}
                    </strong>
                  </div>

                  {job.minAge && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-muted-foreground">Age Limit</span>
                      <strong className="text-foreground text-right">{job.minAge} to {job.maxAge || 45} years</strong>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Gender</span>
                    <strong className="text-foreground text-right">{job.gender}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Vacancies</span>
                    <strong className="text-foreground text-right">{job.vacancy}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Salary</span>
                    <strong className="text-foreground text-right font-bold text-amber-600 dark:text-amber-400">
                      {job.salaryDisplay || (job.salaryMin ? `Tk. ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString() || ""}` : "Negotiable")}
                    </strong>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground">Deadline</span>
                    <strong className="text-foreground text-right font-bold">{formattedDeadline}</strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <span>
                      {isClosed ? (
                        <span className="text-red-500 font-semibold">Closed</span>
                      ) : isClosingSoon ? (
                        <span className="text-amber-500 font-semibold">Closing Soon</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">Open</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Primary Apply Button */}
                <button
                  type="button"
                  id="sidebar-apply-now-btn"
                  onClick={() => setIsApplyModalOpen(true)}
                  disabled={isClosed}
                  className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isClosed ? "Applications Closed" : "Apply For Position"}
                </button>

                {/* Social Sharing Section */}
                <div className="pt-4 border-t border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    Share this position:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      title="Copy URL"
                      className="p-2.5 rounded-lg border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      title="Share to WhatsApp"
                      className="p-2.5 rounded-lg border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-emerald-500 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareLinkedIn}
                      title="Share to LinkedIn"
                      className="p-2.5 rounded-lg border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-sky-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      title="Share to Facebook"
                      className="p-2.5 rounded-lg border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Info Box */}
              <div className="p-5 rounded-2xl border border-border/60 bg-secondary/20 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Southeast Landmark Ltd.</span>
                </div>
                <p className="leading-relaxed">
                  Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207.
                </p>
                <p>Phone: 01591-134357 • info@southeastlandmark.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY APPLY BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-4 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-foreground line-clamp-1">
            {job.title}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Deadline: {formattedDeadline}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          disabled={isClosed}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs shadow-md disabled:opacity-50"
        >
          {isClosed ? "Closed" : "Apply Now"}
        </button>
      </div>

      {/* Direct Application Modal */}
      <JobApplicationModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}

export { JobDetailPage };
