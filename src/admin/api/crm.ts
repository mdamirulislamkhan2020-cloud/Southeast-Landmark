export type LeadStatus =
  | "new" | "contacted" | "qualified" | "follow_up"
  | "negotiation" | "site_visit" | "converted" | "lost"
  | "spam" | "archived";

export const LEAD_STATUSES: { value: LeadStatus; label: string; tone: string }[] = [
  { value: "new", label: "New", tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { value: "contacted", label: "Contacted", tone: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  { value: "qualified", label: "Qualified", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { value: "follow_up", label: "Follow Up", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { value: "negotiation", label: "Negotiation", tone: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  { value: "site_visit", label: "Site Visit Scheduled", tone: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  { value: "converted", label: "Converted", tone: "bg-green-600/15 text-green-700 dark:text-green-400" },
  { value: "lost", label: "Lost", tone: "bg-red-500/15 text-red-700 dark:text-red-300" },
  { value: "spam", label: "Spam", tone: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300" },
  { value: "archived", label: "Archived", tone: "bg-zinc-400/15 text-zinc-600 dark:text-zinc-300" },
];

export type AssigneeRole = "admin" | "manager" | "sales";
export interface Assignee { id: string; name: string; role: AssigneeRole; email?: string }

export type TimelineKind =
  | "submission" | "status_change" | "assignment" | "note"
  | "task_created" | "task_completed" | "score_change" | "attachment" | "custom";

export interface TimelineEvent {
  id: string;
  at: string;
  kind: TimelineKind;
  actor?: string;
  text: string;
  meta?: Record<string, unknown>;
}

export interface LeadNote { id: string; author: string; at: string; text: string }
export interface LeadAttachment { id: string; name: string; url?: string; size?: number; at: string }

export type TaskStatus = "pending" | "complete" | "cancelled";
export interface LeadTask {
  id: string;
  title: string;
  description?: string;
  dueAt?: string | null;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string | null;
  assignee?: string | null;
}

export type CommunicationChannel = "call" | "whatsapp" | "email" | "sms" | "meeting";
export interface Communication {
  id: string;
  channel: CommunicationChannel;
  at: string;
  summary: string;
  by?: string;
}

export interface CrmAnalytics {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  landingUrl?: string;
  referrer?: string;
  device?: string;
  browser?: string;
  os?: string;
  ip?: string;
  campaign?: string;
}

export interface CrmLead {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  score: number;
  assignedTo: string | null;
  formId: string | null;
  formName: string | null;
  leadPageId: string | null;
  leadPageSlug: string | null;
  source: string;
  analytics: CrmAnalytics;
  answers: Record<string, unknown>;
  notes: LeadNote[];
  tasks: LeadTask[];
  attachments: LeadAttachment[];
  communications: Communication[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadSubmissionInput {
  formId?: string | null;
  formName?: string | null;
  answers: Record<string, unknown>;
  leadPageId?: string | null;
  leadPageSlug?: string | null;
  analytics?: CrmAnalytics;
  source?: string;
}