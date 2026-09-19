import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { JobPost } from "@/admin/api/jobs";
import { computeJobDeadlineStatus } from "@/admin/api/jobs-client";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobPost;
  onQuickApply?: (job: JobPost) => void;
}

export function JobCard({ job, onQuickApply }: JobCardProps) {
  const deadlineStatus = computeJobDeadlineStatus(job);

  const isClosed = deadlineStatus === "Closed";
  const isClosingSoon = deadlineStatus === "Closing Soon";

  // Format date nicely (e.g. "30 Sep 2026")
  const formattedDeadline = (() => {
    try {
      if (!job.applicationDeadline) return "Not specified";
      const d = new Date(job.applicationDeadline);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return job.applicationDeadline;
    }
  })();

  return (
    <div
      id={`job-card-${job.slug}`}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-card p-6 md:p-8 transition-all duration-300",
        "border-border/60 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5",
        job.featured ? "ring-1 ring-amber-500/30 bg-gradient-to-b from-amber-500/[0.03] to-transparent" : ""
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {job.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Featured Position
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {job.department}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/80 text-muted-foreground">
              {job.workplace}
            </span>
          </div>

          {/* Deadline Status Badge */}
          <div className="flex items-center">
            {isClosed ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                Application Closed
              </span>
            ) : isClosingSoon ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                Closing Soon
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Open Position
              </span>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <div className="mb-4">
          <Link
            to={`/career/${job.slug}`}
            className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
          >
            <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">
              {job.title}
            </h3>
          </Link>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {job.company || "Southeast Landmark Ltd."}
          </p>
        </div>

        {/* Short Description */}
        {job.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
            {job.shortDescription}
          </p>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-lg bg-secondary/40 border border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{job.employmentType}</span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{job.experienceLabel || `${job.minExperience || 1}–${job.maxExperience || 3} Years`}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate font-semibold text-foreground">
              {job.salaryDisplay || (job.salaryMin ? `Tk. ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString() || ""}` : "Negotiable")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{job.vacancy} {typeof job.vacancy === "number" && job.vacancy > 1 ? "Vacancies" : "Vacancy"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Deadline: {formattedDeadline}</span>
          </div>
        </div>

        {/* Highlights Preview */}
        {job.highlights && job.highlights.length > 0 && (
          <div className="mb-6 space-y-1.5">
            {job.highlights.slice(0, 2).map((hl, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{hl}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/40 mt-auto">
        <span className="text-xs text-muted-foreground">
          Published: {job.publishedDate || "Recently"}
        </span>

        <div className="flex items-center gap-2">
          {onQuickApply && !isClosed && (
            <button
              id={`quick-apply-btn-${job.slug}`}
              type="button"
              onClick={() => onQuickApply(job)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              Apply
            </button>
          )}

          <Link
            to={`/career/${job.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
          >
            <span>View Position</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
