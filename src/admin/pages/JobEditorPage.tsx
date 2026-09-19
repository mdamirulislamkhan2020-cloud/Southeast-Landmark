import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Eye,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
  HelpCircle,
  Copy,
} from "lucide-react";
import {
  getJobById,
  createJob,
  updateJob,
  duplicateJob,
  deleteJob,
} from "@/admin/api/jobs-client";
import type { JobPost, JobStatus, EmploymentType, WorkplaceType, GenderRequirement } from "@/admin/api/jobs";

export function JobEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active editor tab
  const [activeTab, setActiveTab] = useState<
    "basic" | "overview" | "requirements" | "responsibilities" | "skills" | "benefits" | "growth" | "seo"
  >("basic");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [department, setDepartment] = useState("Land Sales");
  const [company, setCompany] = useState("Southeast Landmark Ltd.");
  const [location, setLocation] = useState("Dhaka");
  const [employmentType, setEmploymentType] = useState<string>("Full Time");
  const [workplace, setWorkplace] = useState<string>("Work at office");
  const [gender, setGender] = useState<string>("Both Male & Female");
  const [vacancy, setVacancy] = useState<string | number>(1);
  const [minAge, setMinAge] = useState<string | number>("");
  const [maxAge, setMaxAge] = useState<string | number>("");
  const [minExp, setMinExp] = useState<string | number>(1);
  const [maxExp, setMaxExp] = useState<string | number>(3);
  const [experienceLabel, setExperienceLabel] = useState("1 to 3 years");
  const [salaryMin, setSalaryMin] = useState<string | number>("");
  const [salaryMax, setSalaryMax] = useState<string | number>("");
  const [salaryPeriod, setSalaryPeriod] = useState("Monthly");
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [publishedDate, setPublishedDate] = useState<string>("");
  const [status, setStatus] = useState<JobStatus>("published");
  const [featured, setFeatured] = useState(false);

  // Structured content lists
  const [shortDescription, setShortDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  const [education, setEducation] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState("");

  const [experienceRequirements, setExperienceRequirements] = useState<string[]>([]);
  const [newExpReq, setNewExpReq] = useState("");

  const [additionalRequirements, setAdditionalRequirements] = useState<string[]>([]);
  const [newAddReq, setNewAddReq] = useState("");

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [otherSkills, setOtherSkills] = useState<string[]>([]);
  const [newOtherSkill, setNewOtherSkill] = useState("");

  const [compensationAndBenefits, setCompensationAndBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const [incentiveInfo, setIncentiveInfo] = useState("");
  const [careerGrowth, setCareerGrowth] = useState<string[]>([]);
  const [newGrowth, setNewGrowth] = useState("");

  const [applicationInstructions, setApplicationInstructions] = useState(
    "Interested candidates who meet the requirements are invited to apply online with their detailed CV, photograph, and credentials."
  );

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      getJobById(id)
        .then((j) => {
          if (j) {
            setTitle(j.title);
            setSlug(j.slug);
            setDepartment(j.department || "Land Sales");
            setCompany(j.company || "Southeast Landmark Ltd.");
            setLocation(j.location || "Dhaka");
            setEmploymentType(j.employmentType || "Full Time");
            setWorkplace(j.workplace || "Work at office");
            setGender(j.gender || "Both Male & Female");
            setVacancy(j.vacancy ?? 1);
            setMinAge(j.minAge ?? "");
            setMaxAge(j.maxAge ?? "");
            setMinExp(j.minExperience ?? 1);
            setMaxExp(j.maxExperience ?? 3);
            setExperienceLabel(j.experienceLabel || "");
            setSalaryMin(j.salaryMin ?? "");
            setSalaryMax(j.salaryMax ?? "");
            setSalaryPeriod(j.salaryPeriod || "Monthly");
            setSalaryNegotiable(j.salaryNegotiable ?? false);
            setSalaryDisplay(j.salaryDisplay || "");
            setApplicationDeadline(j.applicationDeadline || "");
            setPublishedDate(j.publishedDate || "");
            setStatus(j.status || "draft");
            setFeatured(j.featured ?? false);

            setShortDescription(j.shortDescription || "");
            setHighlights(j.highlights || []);
            setEducation(j.education || []);
            setExperienceRequirements(j.experienceRequirements || []);
            setAdditionalRequirements(j.additionalRequirements || []);
            setResponsibilities(j.responsibilities || []);
            setSkills(j.skills || []);
            setOtherSkills(j.otherSkills || []);
            setCompensationAndBenefits(j.compensationAndBenefits || []);
            setIncentiveInfo(j.incentiveInfo || "");
            setCareerGrowth(j.careerGrowth || []);
            setApplicationInstructions(j.applicationInstructions || "");

            setSeoTitle(j.seoTitle || "");
            setSeoDescription(j.seoDescription || "");
          }
        })
        .catch((e) => setError(e?.message || "Failed to load job post"))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError("Please enter a valid Job Title.");
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<JobPost> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        department: department.trim(),
        company: company.trim(),
        location: location.trim(),
        employmentType,
        workplace,
        gender,
        vacancy: Number(vacancy) || 1,
        minAge: minAge ? Number(minAge) : null,
        maxAge: maxAge ? Number(maxAge) : null,
        minExperience: minExp ? Number(minExp) : null,
        maxExperience: maxExp ? Number(maxExp) : null,
        experienceLabel: experienceLabel.trim(),
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryPeriod,
        salaryNegotiable,
        salaryDisplay: salaryDisplay.trim() || (salaryNegotiable ? "Negotiable" : undefined),
        applicationDeadline,
        publishedDate: status === "published" ? publishedDate || new Date().toISOString().slice(0, 10) : publishedDate,
        status,
        featured,

        shortDescription: shortDescription.trim(),
        highlights,
        education,
        experienceRequirements,
        additionalRequirements,
        responsibilities,
        skills,
        otherSkills,
        compensationAndBenefits,
        incentiveInfo: incentiveInfo.trim(),
        careerGrowth,
        applicationInstructions: applicationInstructions.trim(),

        seoTitle: seoTitle.trim() || `${title} | Southeast Landmark Ltd.`,
        seoDescription: seoDescription.trim() || shortDescription.slice(0, 160),
      };

      if (isNew) {
        const created = await createJob(payload);
        setSuccessMsg("Job created successfully!");
        setTimeout(() => navigate(`/admin/jobs/${created.id}/edit`), 800);
      } else if (id) {
        await updateJob(id, payload);
        setSuccessMsg("Job updated successfully!");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save job post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateCurrent = async () => {
    if (!id || isNew) return;
    try {
      setSaving(true);
      const copy = await duplicateJob(id);
      navigate(`/admin/jobs/${copy.id}/edit`);
    } catch (e: any) {
      setError(e?.message || "Failed to duplicate job");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!id || isNew) return;
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      setSaving(true);
      await deleteJob(id);
      navigate("/admin/jobs");
    } catch (e: any) {
      setError(e?.message || "Failed to delete job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        Loading position details...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/jobs"
            className="p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              {isNew ? "Create New Position" : `Edit: ${title || "Untitled"}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {slug ? `/career/${slug}` : "Configure structured position data"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isNew && (
            <>
              <Link
                to={`/career/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-secondary text-xs font-semibold text-foreground transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </Link>

              <button
                type="button"
                onClick={handleDuplicateCurrent}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-secondary text-xs font-semibold text-foreground transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteCurrent}
                disabled={saving}
                className="p-2 rounded-lg border border-border hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-colors"
                title="Delete position"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : isNew ? "Create Position" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1 border-b border-border pb-px text-xs font-medium">
        {[
          { id: "basic", label: "Basic Info & Settings" },
          { id: "overview", label: "Overview & Highlights" },
          { id: "requirements", label: "Requirements" },
          { id: "responsibilities", label: "Responsibilities" },
          { id: "skills", label: "Skills & Tags" },
          { id: "benefits", label: "Compensation & Incentives" },
          { id: "growth", label: "Growth & Instructions" },
          { id: "seo", label: "SEO & Social" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-secondary/50 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. BASIC INFO */}
      {activeTab === "basic" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-foreground mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Executive — Land Sales"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold"
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-foreground mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono">/career/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Land Sales, Marketing, Accounts"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Job Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contractual">Contractual</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Workplace */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Workplace
              </label>
              <select
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="Work at office">Work at office</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Gender Requirement
              </label>
              <input
                type="text"
                placeholder="e.g. Only males are allowed to apply. / Both Male & Female"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Vacancy */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Vacancy Count
              </label>
              <input
                type="number"
                min="1"
                value={vacancy}
                onChange={(e) => setVacancy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Age Range */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Age Range (Min – Max)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (e.g. 24)"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="number"
                  placeholder="Max (e.g. 45)"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            {/* Experience Range */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Experience Years (Min – Max)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (e.g. 1)"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="number"
                  placeholder="Max (e.g. 7)"
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            {/* Experience Label */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Experience Display Label
              </label>
              <input
                type="text"
                placeholder="e.g. 1 to 7 years"
                value={experienceLabel}
                onChange={(e) => setExperienceLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Salary Range (Min – Max BDT)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (e.g. 25000)"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="number"
                  placeholder="Max (e.g. 40000)"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            {/* Salary Display Text */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Salary Display Text
              </label>
              <input
                type="text"
                placeholder="e.g. Tk. 25,000 – 40,000 Monthly"
                value={salaryDisplay}
                onChange={(e) => setSalaryDisplay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                Publishing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Featured toggle */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                />
                <span>Feature this job on the top of the Career Page</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. OVERVIEW & HIGHLIGHTS */}
      {activeTab === "overview" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1.5">
              Role Overview / Short Description
            </label>
            <textarea
              rows={4}
              placeholder="Provide a concise summary of the position, why it matters, and who is the ideal candidate..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold text-foreground">
                Key Highlights
              </label>
              <span className="text-[11px] text-muted-foreground">
                Eye-catching callout points for applicants
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Comprehensive Sales Training will be provided by the company."
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newHighlight.trim()) {
                    e.preventDefault();
                    setHighlights([...highlights, newHighlight.trim()]);
                    setNewHighlight("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newHighlight.trim()) {
                    setHighlights([...highlights, newHighlight.trim()]);
                    setNewHighlight("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {highlights.map((hl, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/60"
                >
                  <span className="text-foreground">{hl}</span>
                  <button
                    type="button"
                    onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. REQUIREMENTS */}
      {activeTab === "requirements" && (
        <div className="space-y-8 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          {/* Education */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-2">
              Education Requirements
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Bachelor of Business Administration (BBA) in Marketing"
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newEducation.trim()) {
                    e.preventDefault();
                    setEducation([...education, newEducation.trim()]);
                    setNewEducation("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newEducation.trim()) {
                    setEducation([...education, newEducation.trim()]);
                    setNewEducation("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5">
              {education.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/40">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Requirements */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="font-bold text-sm text-foreground mb-2">
              Experience Requirements
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Minimum 1–7 years of relevant experience in land/real estate sales."
                value={newExpReq}
                onChange={(e) => setNewExpReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newExpReq.trim()) {
                    e.preventDefault();
                    setExperienceRequirements([...experienceRequirements, newExpReq.trim()]);
                    setNewExpReq("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newExpReq.trim()) {
                    setExperienceRequirements([...experienceRequirements, newExpReq.trim()]);
                    setNewExpReq("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5">
              {experienceRequirements.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/40">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => setExperienceRequirements(experienceRequirements.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Requirements */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="font-bold text-sm text-foreground mb-2">
              Additional Requirements
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Age 24 to 45 years / Excellent communication and negotiation skills"
                value={newAddReq}
                onChange={(e) => setNewAddReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newAddReq.trim()) {
                    e.preventDefault();
                    setAdditionalRequirements([...additionalRequirements, newAddReq.trim()]);
                    setNewAddReq("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAddReq.trim()) {
                    setAdditionalRequirements([...additionalRequirements, newAddReq.trim()]);
                    setNewAddReq("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5">
              {additionalRequirements.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/40">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => setAdditionalRequirements(additionalRequirements.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESPONSIBILITIES */}
      {activeTab === "responsibilities" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              Key Responsibilities ({responsibilities.length} items)
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Add distinct bullet items describing day-to-day duties
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Generate new sales leads through various channels."
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newResponsibility.trim()) {
                  e.preventDefault();
                  setResponsibilities([...responsibilities, newResponsibility.trim()]);
                  setNewResponsibility("");
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
            <button
              type="button"
              onClick={() => {
                if (newResponsibility.trim()) {
                  setResponsibilities([...responsibilities, newResponsibility.trim()]);
                  setNewResponsibility("");
                }
              }}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-2">
            {responsibilities.map((resp, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-secondary/30 border border-border/60"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-mono font-bold text-xs mt-0.5">{i + 1}.</span>
                  <span className="text-foreground leading-relaxed">{resp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-red-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SKILLS */}
      {activeTab === "skills" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          {/* Primary Skills */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-2">
              Skills & Expertise Tags
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Sales & Marketing, Land Purchase, Client Relationship"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    e.preventDefault();
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkill.trim()) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Other Relevant Skills */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="font-bold text-sm text-foreground mb-2">
              Other Relevant Skills
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Sales Negotiation, Sales Reporting, Strategic Planning"
                value={newOtherSkill}
                onChange={(e) => setNewOtherSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newOtherSkill.trim()) {
                    e.preventDefault();
                    setOtherSkills([...otherSkills, newOtherSkill.trim()]);
                    setNewOtherSkill("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newOtherSkill.trim()) {
                    setOtherSkills([...otherSkills, newOtherSkill.trim()]);
                    setNewOtherSkill("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherSkills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card text-muted-foreground border border-border"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setOtherSkills(otherSkills.filter((_, idx) => idx !== i))}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPENSATION & INCENTIVES */}
      {activeTab === "benefits" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          {/* Repeatable Benefits */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-2">
              Compensation & Benefits Items
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Tour allowance, Mobile bill, 2 Festival bonuses"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBenefit.trim()) {
                    e.preventDefault();
                    setCompensationAndBenefits([...compensationAndBenefits, newBenefit.trim()]);
                    setNewBenefit("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBenefit.trim()) {
                    setCompensationAndBenefits([...compensationAndBenefits, newBenefit.trim()]);
                    setNewBenefit("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add Benefit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {compensationAndBenefits.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{b}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompensationAndBenefits(compensationAndBenefits.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Incentive Structure */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="font-bold text-sm text-foreground mb-2">
              Detailed Incentive Structure & Commission Policy
            </h3>
            <textarea
              rows={4}
              placeholder="e.g. One sale could earn you Tk. 1,80,000/- at Southeast Landmark Ltd. You can qualify for incentives from 5% up to 16% on independently closed sales..."
              value={incentiveInfo}
              onChange={(e) => setIncentiveInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 7. GROWTH & APPLICATION */}
      {activeTab === "growth" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          <div>
            <h3 className="font-bold text-sm text-foreground mb-2">
              Career Growth Hierarchy
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Sales Executive, Senior Executive, Team Leader"
                value={newGrowth}
                onChange={(e) => setNewGrowth(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newGrowth.trim()) {
                    e.preventDefault();
                    setCareerGrowth([...careerGrowth, newGrowth.trim()]);
                    setNewGrowth("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (newGrowth.trim()) {
                    setCareerGrowth([...careerGrowth, newGrowth.trim()]);
                    setNewGrowth("");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
              >
                Add Role
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {careerGrowth.map((cg, i) => (
                <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/40 border border-border">
                  <span>{cg}</span>
                  <button
                    type="button"
                    onClick={() => setCareerGrowth(careerGrowth.filter((_, idx) => idx !== i))}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="font-bold text-sm text-foreground mb-2">
              Application Instructions
            </h3>
            <textarea
              rows={3}
              value={applicationInstructions}
              onChange={(e) => setApplicationInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* 8. SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1.5">
              Custom Meta Title
            </label>
            <input
              type="text"
              placeholder={`${title || "Job Title"} | Southeast Landmark Ltd.`}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1.5">
              Custom Meta Description
            </label>
            <textarea
              rows={3}
              placeholder="Search engine meta description..."
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
        </div>
      )}
    </div>
  );
}
