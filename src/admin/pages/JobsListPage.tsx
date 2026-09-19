import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
  Sparkles,
  AlertCircle,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import {
  listJobs,
  duplicateJob,
  deleteJob,
  publishJob,
  unpublishJob,
  closeJob,
  archiveJob,
  updateJob,
  computeJobDeadlineStatus,
} from "@/admin/api/jobs-client";
import type { JobPost, JobStatus } from "@/admin/api/jobs";

export function JobsListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = useMemo(() => {
    return Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchSlug = job.slug.toLowerCase().includes(q);
        const matchDept = job.department.toLowerCase().includes(q);
        if (!matchTitle && !matchSlug && !matchDept) return false;
      }
      if (statusFilter !== "all" && job.status !== statusFilter) {
        return false;
      }
      if (deptFilter !== "all" && job.department !== deptFilter) {
        return false;
      }
      return true;
    });
  }, [jobs, search, statusFilter, deptFilter]);

  const handleDuplicate = async (id: string) => {
    try {
      setActionLoadingId(id);
      const copy = await duplicateJob(id);
      await loadData();
      alert("Job duplicated successfully.");
      navigate(`/admin/jobs/${copy.id}/edit`);
    } catch (e: any) {
      alert(e?.message || "Failed to duplicate job");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete this job?\n\n"${title}"`)) {
      return;
    }
    try {
      setActionLoadingId(id);
      await deleteJob(id);
      await loadData();
      alert("Job deleted successfully.");
    } catch (e: any) {
      alert(e?.message || "Failed to delete job");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (job: JobPost) => {
    try {
      setActionLoadingId(job.id);
      if (job.status === "published") {
        await unpublishJob(job.id);
        alert(`Job "${job.title}" is now unpublished (draft).`);
      } else {
        await publishJob(job.id);
        alert(`Job "${job.title}" is now published.`);
      }
      await loadData();
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (job: JobPost) => {
    try {
      setActionLoadingId(job.id);
      await updateJob(job.id, { featured: !job.featured });
      await loadData();
    } catch (e: any) {
      alert(e?.message || "Failed to toggle featured");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = jobs.length;
    const published = jobs.filter((j) => j.status === "published").length;
    const drafts = jobs.filter((j) => j.status === "draft").length;
    const closed = jobs.filter((j) => j.status === "closed").length;
    return { total, published, drafts, closed };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-amber-500" />
            <span>Job Postings (CMS)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, manage, edit, and publish dynamic career opportunities for Southeast Landmark Ltd.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/career"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition-colors"
          >
            <span>Live Career Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/admin/jobs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Total Positions</div>
          <div className="text-2xl font-bold font-display text-foreground mt-1">
            {metrics.total}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Published</div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.published}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Drafts</div>
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
            {metrics.drafts}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Closed / Archived</div>
          <div className="text-2xl font-bold font-display text-foreground mt-1">
            {metrics.closed}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by job title, department, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {(search || statusFilter !== "all" || deptFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDeptFilter("all");
              }}
              className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Job Title & Slug</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Location & Type</th>
                <th className="px-4 py-3.5">Status & Deadline</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Loading job positions...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No job postings match your filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const deadlineStatus = computeJobDeadlineStatus(job);
                  const isBusy = actionLoadingId === job.id;

                  return (
                    <tr key={job.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Title & Slug */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/jobs/${job.id}/edit`}
                          className="font-bold text-sm text-foreground hover:text-amber-500 transition-colors block"
                        >
                          {job.title}
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          /career/{job.slug}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-foreground">{job.department}</span>
                        <div className="text-[11px] text-muted-foreground">
                          {job.vacancy} {typeof job.vacancy === "number" && job.vacancy > 1 ? "Vacancies" : "Vacancy"}
                        </div>
                      </td>

                      {/* Location & Type */}
                      <td className="px-4 py-4">
                        <div>{job.location}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {job.employmentType} • {job.workplace}
                        </div>
                      </td>

                      {/* Status & Deadline */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              job.status === "published"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : job.status === "closed"
                                ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {job.status}
                          </span>

                          {job.status === "published" && (
                            <span className="text-[11px] text-muted-foreground">
                              ({deadlineStatus})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Deadline: {job.applicationDeadline || "None"}
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleFeatured(job)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            job.featured
                              ? "text-amber-500 bg-amber-500/15 hover:bg-amber-500/25"
                              : "text-muted-foreground hover:bg-secondary"
                          }`}
                          title={job.featured ? "Featured on career page" : "Not featured"}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Live Preview */}
                          <Link
                            to={`/career/${job.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary"
                            title="View public page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/admin/jobs/${job.id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-amber-500 rounded hover:bg-secondary"
                            title="Edit job details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDuplicate(job.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary"
                            title="Duplicate position"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Publish/Unpublish */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleStatus(job)}
                            className={`p-1.5 rounded hover:bg-secondary ${
                              job.status === "published"
                                ? "text-emerald-500 hover:text-amber-500"
                                : "text-amber-500 hover:text-emerald-500"
                            }`}
                            title={job.status === "published" ? "Unpublish to draft" : "Publish position"}
                          >
                            {job.status === "published" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(job.id, job.title)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-secondary"
                            title="Delete position"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
