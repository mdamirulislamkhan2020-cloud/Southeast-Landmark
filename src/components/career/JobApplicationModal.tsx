import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import type { JobPost, JobApplication } from "@/admin/api/jobs";
import { submitJobApplication } from "@/admin/api/jobs-client";

interface JobApplicationModalProps {
  job: JobPost;
  isOpen: boolean;
  onClose: () => void;
}

export function JobApplicationModal({
  job,
  isOpen,
  onClose,
}: JobApplicationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("Dhaka");
  const [experienceYears, setExperienceYears] = useState("2");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("15 Days");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file size must be less than 10MB.");
      return;
    }
    const validExts = [".pdf", ".doc", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      setError("Please upload a PDF, DOC, or DOCX document.");
      return;
    }
    setError(null);
    setResumeFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill out your full name, email, and phone number.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your CV / Resume to submit your application.");
      return;
    }

    if (!consentConfirmed) {
      setError("Please confirm that the information provided is accurate.");
      return;
    }

    try {
      setSubmitting(true);
      const app = await submitJobApplication({
        jobId: job.id,
        jobTitle: job.title,
        jobSlug: job.slug,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        currentLocation: currentLocation.trim(),
        experienceYears,
        currentCompany: currentCompany.trim(),
        currentPosition: currentPosition.trim(),
        expectedSalary: expectedSalary.trim(),
        noticePeriod,
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        coverLetter: coverLetter.trim(),
        resumeFile,
        consentConfirmed,
      });

      setSubmittedApp(app);
    } catch (err: any) {
      setError(err?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="job-application-modal-content"
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Direct Application</span>
            </div>
            <h2 className="text-xl font-bold font-display text-foreground">
              {job.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job.company || "Southeast Landmark Ltd."} • {job.location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          {submittedApp ? (
            /* Success State */
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold font-display text-foreground">
                Application Submitted Successfully!
              </h3>

              <div className="inline-block px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-mono text-foreground font-semibold">
                Application Reference: {submittedApp.code}
              </div>

              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you for applying for the position of{" "}
                <span className="font-semibold text-foreground">
                  {job.title}
                </span>{" "}
                at Southeast Landmark Ltd. Our recruitment team is reviewing your
                profile. Shortlisted candidates will be contacted via phone or
                email for the interview round.
              </p>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuzur Rahman"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. candidate@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +880 1712-345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Current Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohammadpur, Dhaka"
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Experience */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Professional Background
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Total Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    >
                      <option value="Fresher">Fresher (&lt; 1 Year)</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3-5 Years">3–5 Years</option>
                      <option value="5-7 Years">5–7 Years</option>
                      <option value="7+ Years">7+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Expected Monthly Salary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tk. 35,000 / Negotiable"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Current Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABC Real Estate Ltd."
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Current Position / Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Executive, Sales"
                      value={currentPosition}
                      onChange={(e) => setCurrentPosition(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Notice Period
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    >
                      <option value="Immediate">Immediate Joining</option>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Resume / CV Upload */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    3. Resume / Curriculum Vitae <span className="text-red-500">*</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    PDF, DOC, DOCX up to 10MB
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                {resumeFile ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {resumeFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border hover:border-amber-500/50 hover:bg-secondary/40"
                    }`}
                  >
                    <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      Click to upload or drag & drop your CV
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Support for PDF, DOC, DOCX files
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-2 pt-4 border-t border-border/40 text-xs">
                <label className="block font-medium text-foreground">
                  Cover Note / Why do you want to join Southeast Landmark? (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a brief note about your career achievements, motivation, or relevant sales accomplishments..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-border text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    I confirm that the information provided is accurate and authentic.
                    I consent to Southeast Landmark Ltd. processing my application details
                    for recruitment and evaluation purposes.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-medium rounded-xl border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
