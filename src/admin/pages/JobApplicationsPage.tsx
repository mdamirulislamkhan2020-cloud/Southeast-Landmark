import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Calendar,
  ChevronRight,
  X,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  listJobApplications,
  updateJobApplicationStatus,
  addJobApplicationNote,
  assignJobApplicationRecruiter,
  deleteJobApplication,
  listJobs,
} from "@/admin/api/jobs-client";
import type { JobApplication, JobApplicationStatus, JobPost } from "@/admin/api/jobs";

export function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");

  // Selected Application for Drawer/Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        listJobApplications(),
        listJobs(),
      ]);
      setApplications(appsData);
      setJobs(jobsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = app.fullName.toLowerCase().includes(q);
        const matchEmail = app.email.toLowerCase().includes(q);
        const matchPhone = app.phone.includes(q);
        const matchCode = app.code.toLowerCase().includes(q);
        const matchCompany = app.currentCompany?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCode && !matchCompany) {
          return false;
        }
      }
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }
      if (jobFilter !== "all" && app.jobId !== jobFilter) {
        return false;
      }
      return true;
    });
  }, [applications, search, statusFilter, jobFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const newCount = applications.filter((a) => a.status === "new").length;
    const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
    const interview = applications.filter((a) => a.status === "interview").length;
    const selected = applications.filter((a) => a.status === "selected").length;
    return { total, newCount, shortlisted, interview, selected };
  }, [applications]);

  const handleStatusChange = async (appId: string, newStatus: JobApplicationStatus) => {
    try {
      setSavingAction(true);
      const updated = await updateJobApplicationStatus(appId, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(updated);
      }
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    } finally {
      setSavingAction(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNoteText.trim()) return;
    try {
      setSavingAction(true);
      const updated = await addJobApplicationNote(selectedApp.id, newNoteText.trim());
      setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? updated : a)));
      setSelectedApp(updated);
      setNewNoteText("");
    } catch (e: any) {
      alert(e?.message || "Failed to add note");
    } finally {
      setSavingAction(false);
    }
  };

  const handleDelete = async (appId: string, name: string) => {
    if (!window.confirm(`Delete application from ${name}?`)) return;
    try {
      setSavingAction(true);
      await deleteJobApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
    } catch (e: any) {
      alert(e?.message || "Failed to delete application");
    } finally {
      setSavingAction(false);
    }
  };

  const getStatusBadgeClass = (status: JobApplicationStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "screening":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "shortlisted":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "interview":
        return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "selected":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "rejected":
        return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
      case "withdrawn":
        return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-amber-500" />
            <span>Job Applications</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review candidate resumes, manage hiring stages, track recruiter notes, and interview pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Total Received</div>
          <div className="text-2xl font-bold font-display text-foreground mt-1">
            {metrics.total}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03]">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">New Submissions</div>
          <div className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400 mt-1">
            {metrics.newCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Shortlisted</div>
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
            {metrics.shortlisted}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03]">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Interviewing</div>
          <div className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.interview}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Selected / Hired</div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.selected}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search applicants by name, email, phone, code, or company..."
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
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none"
          >
            <option value="all">All Positions</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {(search || statusFilter !== "all" || jobFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setJobFilter("all");
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Candidate & Ref</th>
                <th className="px-4 py-3.5">Position Applied</th>
                <th className="px-4 py-3.5">Experience & Background</th>
                <th className="px-4 py-3.5">Stage / Status</th>
                <th className="px-4 py-3.5">Resume / CV</th>
                <th className="px-4 py-3.5">Submitted</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No job applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    {/* Candidate */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-foreground">
                        {app.fullName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {app.email} • {app.phone}
                      </div>
                      <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                        {app.code}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-4 font-medium text-foreground">
                      {app.jobTitle}
                    </td>

                    {/* Background */}
                    <td className="px-4 py-4">
                      <div className="text-foreground">
                        {app.currentPosition || "Candidate"}
                        {app.currentCompany && ` @ ${app.currentCompany}`}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Exp: {app.experienceYears} • Loc: {app.currentLocation}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Resume */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {app.resumeAttachment?.url || app.resumeAttachment?.dataUrl ? (
                        <a
                          href={app.resumeAttachment.url || app.resumeAttachment.dataUrl}
                          download={app.resumeAttachment.name || "Resume.pdf"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium border border-border"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-500" />
                          <span>Download CV</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">No file</span>
                      )}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-4 py-4 text-muted-foreground text-xs">
                      {new Date(app.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 text-muted-foreground hover:text-amber-500 rounded hover:bg-secondary"
                          title="View application details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(app.id, app.fullName)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-secondary"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  {selectedApp.code}
                </span>
                <h2 className="text-xl font-bold font-display text-foreground mt-0.5">
                  {selectedApp.fullName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Applied for: <strong className="text-foreground">{selectedApp.jobTitle}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Stage Selector */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                <label className="block font-semibold text-foreground">
                  Update Candidate Stage
                </label>
                <select
                  value={selectedApp.status}
                  onChange={(e) =>
                    handleStatusChange(selectedApp.id, e.target.value as JobApplicationStatus)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-semibold"
                >
                  <option value="new">New Application</option>
                  <option value="screening">Screening</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="selected">Selected / Hired</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-card border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email</span>
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="text-foreground font-semibold hover:text-amber-500"
                    >
                      {selectedApp.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone</span>
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="text-foreground font-semibold hover:text-amber-500"
                    >
                      {selectedApp.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Location</span>
                    <span className="text-foreground font-medium">{selectedApp.currentLocation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Notice Period</span>
                    <span className="text-foreground font-medium">{selectedApp.noticePeriod}</span>
                  </div>
                </div>
              </div>

              {/* Professional Profile */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Professional Profile
                </h3>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-card border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Total Experience</span>
                    <span className="text-foreground font-semibold">{selectedApp.experienceYears}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Expected Salary</span>
                    <span className="text-foreground font-semibold">{selectedApp.expectedSalary}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Current Organization</span>
                    <span className="text-foreground font-medium">{selectedApp.currentCompany || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Current Designation</span>
                    <span className="text-foreground font-medium">{selectedApp.currentPosition || "N/A"}</span>
                  </div>
                  {selectedApp.linkedinUrl && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[11px]">LinkedIn</span>
                      <a
                        href={selectedApp.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>{selectedApp.linkedinUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Download */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Curriculum Vitae / Resume
                </h3>
                {selectedApp.resumeAttachment ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.04]">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-amber-500" />
                      <div>
                        <div className="font-semibold text-foreground">
                          {selectedApp.resumeAttachment.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {selectedApp.resumeAttachment.size
                            ? `${(selectedApp.resumeAttachment.size / (1024 * 1024)).toFixed(2)} MB`
                            : "Document"}
                        </div>
                      </div>
                    </div>

                    <a
                      href={selectedApp.resumeAttachment.url || selectedApp.resumeAttachment.dataUrl}
                      download={selectedApp.resumeAttachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No CV file attached.</p>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cover Letter / Notes from Candidate
                  </h3>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border text-foreground leading-relaxed">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Internal HR Notes */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Internal HR & Interview Notes
                </h3>

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Add interviewer feedback, screening assessment, or salary discussion..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingAction || !newNoteText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border disabled:opacity-50"
                    >
                      Add Note
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-1">
                  {selectedApp.notes && selectedApp.notes.length > 0 ? (
                    selectedApp.notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-lg bg-card border border-border/60 text-xs space-y-1"
                      >
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <strong className="text-foreground">{n.author}</strong>
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs italic">No internal notes added yet.</p>
                  )}
                </div>
              </div>

              {/* Timeline Audit Log */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Activity Timeline
                </h3>
                <div className="space-y-2">
                  {selectedApp.timeline && selectedApp.timeline.length > 0 ? (
                    selectedApp.timeline.map((ev) => (
                      <div key={ev.id} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-foreground">{ev.text}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ev.at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs italic">No events logged.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
