import { supabase } from "@/integrations/supabase/client";
import type {
  JobPost,
  JobStatus,
  JobFilterOptions,
  ComputedDeadlineStatus,
  JobApplication,
  JobApplicationStatus,
  ApplicationSubmissionInput,
  ApplicationAttachment,
} from "./jobs";

const LS_JOBS = "sel_admin_jobs_v1";
const LS_APPLICATIONS = "sel_admin_job_applications_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write error", e);
  }
}

// -----------------------------------------------------------------------------
// Seed: Senior Executive — Land Sales (Special Job from Section 27)
// -----------------------------------------------------------------------------
export const INITIAL_SPECIAL_JOB: JobPost = {
  id: "job-senior-executive-land-sales",
  slug: "senior-executive-land-sales",
  title: "Senior Executive — Land Sales",
  department: "Land Sales",
  company: "Southeast Landmark Ltd.",
  location: "Dhaka",
  employmentType: "Full Time",
  workplace: "Work at office",
  gender: "Only males are allowed to apply.",
  vacancy: 20,
  minAge: 24,
  maxAge: 45,
  minExperience: 1,
  maxExperience: 7,
  experienceLabel: "1 to 7 years",
  salaryMin: 25000,
  salaryMax: 40000,
  salaryPeriod: "Monthly",
  salaryNegotiable: false,
  salaryDisplay: "Tk. 25,000 – 40,000 Monthly",
  applicationDeadline: "2026-09-30",
  publishedDate: "2026-08-31",
  status: "published",
  featured: true,

  shortDescription:
    "Southeast Landmark Ltd. is recruiting ambitious Senior Executives for our flagship Land Sales division in Dhaka. Drive high-value residential plot sales in our prestigious planned township near Mirpur National Zoo, backed by comprehensive training, verified leads, and industry-leading performance commissions up to 16%.",

  highlights: [
    "Comprehensive Sales Training will be provided by the company.",
    "Successful completion of the training will lead to job confirmation.",
    "Attractive career growth and performance-based incentives.",
  ],

  education: [
    "Bachelor of Business Administration (BBA) in Brand Management",
    "Master of Business Administration (MBA) in Marketing",
    "Bachelor of Arts (BA)",
    "Master of Commerce (MCom)",
    "Master of Arts (MA)",
    "Bachelor's/Masters Degree in any discipline",
    "Candidates with relevant educational backgrounds in Business, Marketing, or Management will be preferred.",
  ],

  experienceRequirements: [
    "1 to 7 years",
    "Experience in Developer, Land Management, Property Management & Preservation Services, or Real Estate",
    "Minimum 1–7 years of relevant experience in land/real estate sales.",
    "Candidates with proven sales performance will be given preference.",
    "Candidates from real estate background (Land sales, plot sales, flat sales & others) are highly encouraged to apply.",
    "Candidates having experience in corporate sales, banking, insurance, automobile, premium products sales are also encouraged to apply.",
  ],

  additionalRequirements: [
    "Age 24 to 45 years",
    "Only Male",
    "Excellent communication and negotiation skills.",
    "Strong client-handling and convincing ability.",
    "Target-oriented, energetic, and self-motivated.",
    "Good knowledge of the real estate/land market will be an advantage.",
    "Willingness to travel for client meetings and site visits.",
  ],

  responsibilities: [
    "Generate new sales leads through various channels.",
    "Develop and maintain a strong client database.",
    "Promote company land projects and investment opportunities.",
    "Contact prospective clients and understand their requirements.",
    "Arrange and conduct client meetings and site visits.",
    "Present project details, location, pricing, and payment plans.",
    "Follow up regularly with leads and prospective buyers.",
    "Negotiate with clients and close sales effectively.",
    "Achieve assigned monthly, quarterly, and annual sales targets.",
    "Maintain long-term relationships with existing and new clients.",
    "Handle customer queries and provide appropriate solutions.",
    "Assist clients with booking, payment, and documentation procedures.",
    "Coordinate with Accounts, Documentation, and other departments for smooth transactions.",
    "Collect and maintain accurate customer and sales information.",
    "Prepare daily/weekly/monthly sales and follow-up reports.",
    "Monitor competitors, market trends, and land prices.",
    "Identify new business opportunities and potential market segments.",
    "Participate in promotional campaigns, exhibitions, and sales events.",
    "Provide regular feedback to management regarding market demand and customer preferences.",
    "Support and guide junior sales team members when required.",
  ],

  skills: [
    "Consumer Durables - Sales & Marketing",
    "Land Purchase",
    "Sales & Marketing",
    "Sales Target Achievement",
    "Strategic Planning",
  ],

  otherSkills: [
    "Real Estate Marketing",
    "Land Sales",
    "Client Relationship",
    "Sales Target Achievement",
    "Sales Negotiation",
    "Sales Reporting",
  ],

  compensationAndBenefits: [
    "Tour allowance",
    "Mobile bill",
    "Performance bonus",
    "Yearly salary review",
    "2 festival bonuses",
    "Regular leads",
    "Clear sales system",
    "Closing support",
    "Additional rewards for exceeding agreed targets",
    "Potential career growth toward Team Leader, Deputy Sales Manager or Sales Manager",
  ],

  incentiveInfo:
    "One sale could earn you Tk. 1,80,000/- at Southeast Landmark Ltd. You can qualify for incentives from 5% up to 16% on independently closed sales, depending on the project. For example, a Tk. 36 lakh sale at 5% earns you Tk. 1,80,000/-, paid immediately after we receive the client's payment.",

  careerGrowth: [
    "Sales Executive",
    "Senior Executive",
    "Team Leader",
    "Deputy Sales Manager",
    "Sales Manager",
  ],

  applicationInstructions:
    "Interested candidates who meet the requirements are invited to apply online with their detailed CV, photograph, and credentials. Shortlisted candidates will be contacted for comprehensive training and interviews.",

  seoTitle: "Senior Executive — Land Sales | Southeast Landmark Ltd.",
  seoDescription:
    "Join Southeast Landmark Ltd. as Senior Executive — Land Sales in Dhaka. Tk. 25,000–40,000/mo plus incentives up to 16%. 20 vacancies. Apply by 30 Sep 2026.",

  createdAt: "2026-08-31T09:00:00.000Z",
  updatedAt: "2026-08-31T09:00:00.000Z",
};

// -----------------------------------------------------------------------------
// Deadline Logic Helper
// -----------------------------------------------------------------------------
export function computeJobDeadlineStatus(job: JobPost): ComputedDeadlineStatus {
  if (job.status === "draft") return "Draft";
  if (job.status === "archived") return "Archived";
  if (job.status === "closed") return "Closed";

  if (!job.applicationDeadline) return "Open";

  try {
    const deadlineDate = new Date(job.applicationDeadline);
    // End of deadline day (23:59:59)
    deadlineDate.setHours(23, 59, 59, 999);
    const now = new Date();

    if (now.getTime() > deadlineDate.getTime()) {
      return "Closed";
    }

    const diffDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      return "Closing Soon";
    }

    return "Open";
  } catch {
    return "Open";
  }
}

// -----------------------------------------------------------------------------
// Jobs CRUD and Supabase Sync
// -----------------------------------------------------------------------------
function filterOutDeletedJobs(jobs: JobPost[]): JobPost[] {
  return jobs.filter(
    (j) =>
      j.id !== "job-digital-marketing-specialist" &&
      j.slug !== "digital-marketing-specialist" &&
      !j.title.toLowerCase().includes("digital marketing specialist")
  );
}

export function getInitialJobs(): JobPost[] {
  const cached = readLS<JobPost[] | null>(LS_JOBS, null);
  if (cached !== null && Array.isArray(cached)) {
    const cleaned = filterOutDeletedJobs(cached);
    if (cleaned.length !== cached.length) {
      writeLS(LS_JOBS, cleaned);
    }
    return cleaned;
  }
  const defaultSeeds = [INITIAL_SPECIAL_JOB];
  writeLS(LS_JOBS, defaultSeeds);
  return defaultSeeds;
}

export async function listJobs(filters?: JobFilterOptions): Promise<JobPost[]> {
  let jobs: JobPost[] = getInitialJobs();

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "cms_jobs_collection")
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      const dbJobs = filterOutDeletedJobs(data.value as unknown as JobPost[]);
      jobs = dbJobs;
      writeLS(LS_JOBS, jobs);
    }
  } catch (err) {
    console.warn("[JobsClient] Fallback to cached jobs:", err);
  }

  // Apply filters
  if (!filters) return jobs;

  return jobs.filter((job) => {
    // Search
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchDept = job.department.toLowerCase().includes(q);
      const matchLocation = job.location.toLowerCase().includes(q);
      const matchSkills = job.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDept && !matchLocation && !matchSkills) {
        return false;
      }
    }

    // Department
    if (filters.department && filters.department !== "all") {
      if (job.department.toLowerCase() !== filters.department.toLowerCase()) {
        return false;
      }
    }

    // Location
    if (filters.location && filters.location !== "all") {
      if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Employment Type
    if (filters.employmentType && filters.employmentType !== "all") {
      if (job.employmentType.toLowerCase() !== filters.employmentType.toLowerCase()) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      const computed = computeJobDeadlineStatus(job).toLowerCase().replace(/\s+/g, "_");
      if (filters.status === "open" && computed !== "open") return false;
      if (filters.status === "closing_soon" && computed !== "closing_soon") return false;
      if (filters.status === "closed" && computed !== "closed") return false;
    }

    return true;
  });
}

export async function getJobById(id: string): Promise<JobPost | null> {
  const jobs = await listJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

export async function getJobBySlug(slug: string): Promise<JobPost | null> {
  const cleanSlug = slug.toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");
  const jobs = await listJobs();
  return jobs.find((j) => j.slug.toLowerCase() === cleanSlug) ?? null;
}

async function persistJobsToSupabase(jobs: JobPost[]) {
  writeLS(LS_JOBS, jobs);
  try {
    const { error } = await supabase.from("app_settings").upsert({
      key: "cms_jobs_collection",
      value: jobs as unknown as any,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn("[JobsClient] persistJobsToSupabase Supabase error:", error);
    }
  } catch (err) {
    console.warn("[JobsClient] persistJobsToSupabase exception:", err);
  }
}

export async function saveJob(job: JobPost): Promise<JobPost> {
  const jobs = await listJobs();
  const existingIdx = jobs.findIndex((j) => j.id === job.id);
  const now = new Date().toISOString();

  let updatedJobs: JobPost[];
  if (existingIdx >= 0) {
    job.updatedAt = now;
    updatedJobs = [...jobs];
    updatedJobs[existingIdx] = job;
  } else {
    job.createdAt = job.createdAt || now;
    job.updatedAt = now;
    updatedJobs = [job, ...jobs];
  }

  await persistJobsToSupabase(updatedJobs);
  return job;
}

export async function createJob(input: Partial<JobPost>): Promise<JobPost> {
  const now = new Date().toISOString();
  const rawTitle = input.title?.trim() || "Untitled Position";
  const slug = (input.slug?.trim() || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");

  const newJob: JobPost = {
    id: `job-${uid()}`,
    slug: slug || `position-${Date.now()}`,
    title: rawTitle,
    department: input.department || "Sales",
    company: input.company || "Southeast Landmark Ltd.",
    location: input.location || "Dhaka",
    employmentType: input.employmentType || "Full Time",
    workplace: input.workplace || "Work at office",
    gender: input.gender || "Both Male & Female",
    vacancy: input.vacancy ?? 1,
    minAge: input.minAge ?? null,
    maxAge: input.maxAge ?? null,
    minExperience: input.minExperience ?? 1,
    maxExperience: input.maxExperience ?? 3,
    experienceLabel: input.experienceLabel || "1 to 3 years",
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    salaryPeriod: input.salaryPeriod || "Monthly",
    salaryNegotiable: input.salaryNegotiable ?? false,
    salaryDisplay: input.salaryDisplay || "Negotiable",
    applicationDeadline: input.applicationDeadline || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    publishedDate: input.status === "published" ? now.slice(0, 10) : null,
    status: (input.status as JobStatus) || "draft",
    featured: input.featured ?? false,

    shortDescription: input.shortDescription || "",
    highlights: input.highlights || [],
    education: input.education || [],
    experienceRequirements: input.experienceRequirements || [],
    additionalRequirements: input.additionalRequirements || [],
    responsibilities: input.responsibilities || [],
    skills: input.skills || [],
    otherSkills: input.otherSkills || [],
    compensationAndBenefits: input.compensationAndBenefits || [],
    incentiveInfo: input.incentiveInfo || "",
    careerGrowth: input.careerGrowth || [],
    applicationInstructions: input.applicationInstructions || "Apply online with your detailed CV.",

    seoTitle: input.seoTitle || `${rawTitle} | Southeast Landmark Ltd.`,
    seoDescription: input.seoDescription || `Apply for ${rawTitle} at Southeast Landmark Ltd.`,

    createdAt: now,
    updatedAt: now,
  };

  return saveJob(newJob);
}

export async function updateJob(id: string, patch: Partial<JobPost>): Promise<JobPost> {
  const existing = await getJobById(id);
  if (!existing) throw new Error("Job not found");

  const updated: JobPost = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  if (patch.status === "published" && !existing.publishedDate) {
    updated.publishedDate = new Date().toISOString().slice(0, 10);
  }

  return saveJob(updated);
}

export async function duplicateJob(id: string): Promise<JobPost> {
  const source = await getJobById(id);
  if (!source) throw new Error("Source job not found");

  const now = new Date().toISOString();
  const copySlug = `${source.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;

  const copy: JobPost = {
    ...source,
    id: `job-${uid()}`,
    slug: copySlug,
    title: `${source.title} (Copy)`,
    status: "draft",
    publishedDate: null,
    createdAt: now,
    updatedAt: now,
    seoTitle: `${source.title} (Copy) | Southeast Landmark Ltd.`,
  };

  return saveJob(copy);
}

export async function deleteJob(id: string): Promise<void> {
  // Inspect existing applicant applications before deletion to maintain data integrity
  try {
    const apps = await listJobApplications({ jobId: id });
    if (apps.length > 0) {
      throw new Error(
        `Cannot delete job post because ${apps.length} candidate application(s) exist for this position. Please archive or close the position instead.`
      );
    }
  } catch (err: any) {
    if (err.message?.includes("Cannot delete job post")) {
      throw err;
    }
  }

  const jobs = await listJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  await persistJobsToSupabase(filtered);
}

export async function publishJob(id: string): Promise<JobPost> {
  return updateJob(id, {
    status: "published",
    publishedDate: new Date().toISOString().slice(0, 10),
  });
}

export async function unpublishJob(id: string): Promise<JobPost> {
  return updateJob(id, { status: "draft" });
}

export async function closeJob(id: string): Promise<JobPost> {
  return updateJob(id, { status: "closed" });
}

export async function archiveJob(id: string): Promise<JobPost> {
  return updateJob(id, { status: "archived" });
}

// -----------------------------------------------------------------------------
// Job Applications Management
// -----------------------------------------------------------------------------
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function submitJobApplication(input: ApplicationSubmissionInput): Promise<JobApplication> {
  const now = new Date().toISOString();
  const code = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = uid();

  let attachment: ApplicationAttachment | undefined = undefined;

  if (input.resumeFile) {
    const file = input.resumeFile;
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storagePath = `resumes/${cleanFileName}`;

    let publicUrl: string | undefined = undefined;
    let dataUrl: string | undefined = undefined;

    // Try reading as Data URL for reliable client preview/download
    try {
      dataUrl = await fileToBase64(file);
    } catch {
      /* ignore */
    }

    // Try uploading to Supabase Storage
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("attachments")
        .upload(storagePath, file, { contentType: file.type, upsert: true });

      if (!uploadErr && uploadData?.path) {
        const { data: pubData } = supabase.storage.from("attachments").getPublicUrl(uploadData.path);
        publicUrl = pubData?.publicUrl;
      }
    } catch (storageErr) {
      console.warn("[JobsClient] Storage upload fallback:", storageErr);
    }

    attachment = {
      name: file.name,
      path: storagePath,
      size: file.size,
      type: file.type,
      url: publicUrl || dataUrl,
      dataUrl,
    };
  }

  const newApp: JobApplication = {
    id,
    code,
    jobId: input.jobId,
    jobTitle: input.jobTitle,
    jobSlug: input.jobSlug,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    currentLocation: input.currentLocation,
    experienceYears: input.experienceYears,
    currentCompany: input.currentCompany || "N/A",
    currentPosition: input.currentPosition || "N/A",
    expectedSalary: input.expectedSalary || "Negotiable",
    noticePeriod: input.noticePeriod || "Immediate",
    linkedinUrl: input.linkedinUrl || "",
    portfolioUrl: input.portfolioUrl || "",
    coverLetter: input.coverLetter || "",
    resumeAttachment: attachment,
    status: "new",
    notes: [],
    timeline: [
      {
        id: uid(),
        kind: "submission",
        text: `Application submitted for position: ${input.jobTitle}`,
        at: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save to local storage cache
  const existingApps = readLS<JobApplication[]>(LS_APPLICATIONS, []);
  existingApps.unshift(newApp);
  writeLS(LS_APPLICATIONS, existingApps);

  // 2. Save directly into Supabase 'leads' table
  try {
    await supabase.from("leads").insert({
      code,
      name: input.fullName,
      email: input.email,
      phone: input.phone,
      status: "new",
      score: 85,
      source: "Job Application",
      form_name: input.jobTitle,
      lead_page_slug: `/career/${input.jobSlug}`,
      answers: {
        jobId: input.jobId,
        jobTitle: input.jobTitle,
        jobSlug: input.jobSlug,
        currentLocation: input.currentLocation,
        experienceYears: input.experienceYears,
        currentCompany: input.currentCompany,
        currentPosition: input.currentPosition,
        expectedSalary: input.expectedSalary,
        noticePeriod: input.noticePeriod,
        linkedinUrl: input.linkedinUrl,
        portfolioUrl: input.portfolioUrl,
        coverLetter: input.coverLetter,
        resumeAttachment: attachment,
        consentConfirmed: input.consentConfirmed,
      },
      attachments: attachment ? [attachment] : [],
      timeline: newApp.timeline,
      notes: [],
      tasks: [],
      communications: [],
      analytics: {
        submittedAt: now,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Web",
      },
    } as any);
  } catch (err) {
    console.warn("[JobsClient] Supabase leads insert fallback:", err);
  }

  return newApp;
}

export async function listJobApplications(filters?: {
  jobId?: string;
  status?: JobApplicationStatus;
  search?: string;
}): Promise<JobApplication[]> {
  let apps = readLS<JobApplication[]>(LS_APPLICATIONS, []);

  // Sync from Supabase leads if available
  try {
    const { data: dbLeads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("source", "Job Application")
      .order("created_at", { ascending: false });

    if (!error && dbLeads && dbLeads.length > 0) {
      const mapped: JobApplication[] = dbLeads.map((row) => {
        const answers = (row.answers || {}) as Record<string, any>;
        const att = Array.isArray(row.attachments) && row.attachments.length > 0
          ? (row.attachments[0] as unknown as ApplicationAttachment)
          : answers.resumeAttachment;

        return {
          id: row.id,
          code: row.code,
          jobId: answers.jobId || "",
          jobTitle: answers.jobTitle || row.form_name || "Job Position",
          jobSlug: answers.jobSlug || row.lead_page_slug?.replace(/^\/career\//, "") || "",
          fullName: row.name,
          email: row.email,
          phone: row.phone,
          currentLocation: answers.currentLocation || "Dhaka",
          experienceYears: answers.experienceYears || "1",
          currentCompany: answers.currentCompany || "N/A",
          currentPosition: answers.currentPosition || "N/A",
          expectedSalary: answers.expectedSalary || "Negotiable",
          noticePeriod: answers.noticePeriod || "Immediate",
          linkedinUrl: answers.linkedinUrl || "",
          portfolioUrl: answers.portfolioUrl || "",
          coverLetter: answers.coverLetter || "",
          resumeAttachment: att,
          status: (row.status as JobApplicationStatus) || "new",
          assignedRecruiterId: row.assigned_to,
          notes: Array.isArray(row.notes) ? (row.notes as any) : [],
          timeline: Array.isArray(row.timeline) ? (row.timeline as any) : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });

      // Merge avoiding duplicates
      const seen = new Set(mapped.map((m) => m.code));
      apps = [...mapped, ...apps.filter((a) => !seen.has(a.code))];
      writeLS(LS_APPLICATIONS, apps);
    }
  } catch (err) {
    console.warn("[JobsClient] listJobApplications Supabase fallback:", err);
  }

  // Filter
  return apps.filter((app) => {
    if (filters?.jobId && filters.jobId !== "all" && app.jobId !== filters.jobId) {
      return false;
    }
    if (filters?.status && (filters.status as string) !== "all" && app.status !== (filters.status as any)) {
      return false;
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchName = app.fullName.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchPhone = app.phone.includes(q);
      const matchJob = app.jobTitle.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchJob) return false;
    }
    return true;
  });
}

export async function updateJobApplicationStatus(
  id: string,
  status: JobApplicationStatus,
  noteText?: string,
  actor = "Admin"
): Promise<JobApplication> {
  const apps = readLS<JobApplication[]>(LS_APPLICATIONS, []);
  const idx = apps.findIndex((a) => a.id === id || a.code === id);
  if (idx < 0) throw new Error("Application not found");

  const app = apps[idx];
  const oldStatus = app.status;
  app.status = status;
  app.updatedAt = new Date().toISOString();

  app.timeline.unshift({
    id: uid(),
    kind: "status_change",
    text: `Status updated from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
    at: app.updatedAt,
    actor,
  });

  if (noteText && noteText.trim()) {
    app.notes.unshift({
      id: uid(),
      author: actor,
      text: noteText.trim(),
      createdAt: app.updatedAt,
    });
  }

  apps[idx] = app;
  writeLS(LS_APPLICATIONS, apps);

  // Sync back to Supabase
  try {
    await supabase
      .from("leads")
      .update({
        status,
        timeline: app.timeline as any,
        notes: app.notes as any,
        updated_at: app.updatedAt,
      })
      .eq("code", app.code);
  } catch (err) {
    console.warn("[JobsClient] updateJobApplicationStatus Supabase sync error:", err);
  }

  return app;
}

export async function assignJobApplicationRecruiter(
  id: string,
  recruiterId: string | null,
  recruiterName?: string,
  actor = "Admin"
): Promise<JobApplication> {
  const apps = readLS<JobApplication[]>(LS_APPLICATIONS, []);
  const idx = apps.findIndex((a) => a.id === id || a.code === id);
  if (idx < 0) throw new Error("Application not found");

  const app = apps[idx];
  app.assignedRecruiterId = recruiterId;
  app.assignedRecruiterName = recruiterName || null;
  app.updatedAt = new Date().toISOString();

  app.timeline.unshift({
    id: uid(),
    kind: "recruiter_assigned",
    text: recruiterId ? `Assigned to recruiter: ${recruiterName || "Staff"}` : "Recruiter unassigned",
    at: app.updatedAt,
    actor,
  });

  apps[idx] = app;
  writeLS(LS_APPLICATIONS, apps);

  try {
    await supabase
      .from("leads")
      .update({
        assigned_to: recruiterId,
        timeline: app.timeline as any,
        updated_at: app.updatedAt,
      })
      .eq("code", app.code);
  } catch {
    /* ignore */
  }

  return app;
}

export async function addJobApplicationNote(id: string, text: string, author = "Admin"): Promise<JobApplication> {
  const apps = readLS<JobApplication[]>(LS_APPLICATIONS, []);
  const idx = apps.findIndex((a) => a.id === id || a.code === id);
  if (idx < 0) throw new Error("Application not found");

  const app = apps[idx];
  const now = new Date().toISOString();

  app.notes.unshift({
    id: uid(),
    author,
    text,
    createdAt: now,
  });

  app.timeline.unshift({
    id: uid(),
    kind: "note",
    text: `Internal note added by ${author}`,
    at: now,
    actor: author,
  });

  app.updatedAt = now;
  apps[idx] = app;
  writeLS(LS_APPLICATIONS, apps);

  try {
    await supabase
      .from("leads")
      .update({
        notes: app.notes as any,
        timeline: app.timeline as any,
        updated_at: now,
      })
      .eq("code", app.code);
  } catch {
    /* ignore */
  }

  return app;
}

export async function deleteJobApplication(id: string): Promise<void> {
  const apps = readLS<JobApplication[]>(LS_APPLICATIONS, []);
  const target = apps.find((a) => a.id === id || a.code === id);
  const remaining = apps.filter((a) => a.id !== id && a.code !== id);
  writeLS(LS_APPLICATIONS, remaining);

  if (target?.code) {
    try {
      await supabase.from("leads").delete().eq("code", target.code);
    } catch {
      /* ignore */
    }
  }
}
