import type {
  Assignee, CrmLead, LeadNote, LeadStatus, LeadSubmissionInput, LeadTask, TimelineEvent, TimelineKind,
} from "./crm";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Json = Database["public"]["Tables"]["leads"]["Row"]["analytics"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type AssigneeRow = Database["public"]["Tables"]["crm_assignees"]["Row"];
const asJson = <T,>(v: T): Json => v as unknown as Json;

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function detectBrowser(ua: string) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Unknown";
}
function detectOS(ua: string) {
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function rowToLead(r: LeadRow): CrmLead {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    email: r.email,
    phone: r.phone,
    status: r.status as LeadStatus,
    score: r.score,
    assignedTo: r.assigned_to,
    formId: r.form_id,
    formName: r.form_name,
    leadPageId: r.lead_page_id,
    leadPageSlug: r.lead_page_slug,
    source: r.source,
    analytics: (r.analytics ?? {}) as CrmLead["analytics"],
    answers: (r.answers ?? {}) as Record<string, unknown>,
    notes: (r.notes ?? []) as unknown as CrmLead["notes"],
    tasks: (r.tasks ?? []) as unknown as CrmLead["tasks"],
    attachments: (r.attachments ?? []) as unknown as CrmLead["attachments"],
    communications: (r.communications ?? []) as unknown as CrmLead["communications"],
    timeline: (r.timeline ?? []) as unknown as CrmLead["timeline"],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToAssignee(r: AssigneeRow): Assignee {
  return { id: r.id, name: r.name, role: r.role as Assignee["role"], email: r.email ?? undefined };
}

export function computeScore(answers: Record<string, unknown>, source?: string): number {
  let score = 20;
  const budget = Number(answers.budget ?? answers.Budget ?? 0);
  if (budget >= 10000000) score += 30;
  else if (budget >= 5000000) score += 20;
  else if (budget >= 1000000) score += 10;
  const timeline = String(answers.timeline ?? answers.Timeline ?? "").toLowerCase();
  if (/immediate|urgent|now/.test(timeline)) score += 25;
  else if (/1-3|1–3|1 to 3|month/.test(timeline)) score += 15;
  else if (/3-6|6/.test(timeline)) score += 8;
  const filled = Object.values(answers).filter((v) => v !== undefined && v !== null && String(v).trim() !== "").length;
  score += Math.min(20, filled * 2);
  if (source && /google ads|facebook ads|landing/i.test(source)) score += 5;
  return Math.max(0, Math.min(100, score));
}

function pickField(answers: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = answers[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  for (const [k, v] of Object.entries(answers)) {
    if (keys.some((kk) => k.toLowerCase().includes(kk.toLowerCase())) && typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

let assigneesSeeded = false;
async function seedAssigneesIfEmpty() {
  if (assigneesSeeded) return;
  const { count } = await supabase.from("crm_assignees").select("id", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    await supabase.from("crm_assignees").insert([
      { name: "Admin User", role: "admin", email: "admin@southeastlandmark.com" },
      { name: "Sales Manager", role: "manager", email: "manager@southeastlandmark.com" },
      { name: "Rahim (Sales)", role: "sales", email: "rahim@southeastlandmark.com" },
      { name: "Nadia (Sales)", role: "sales", email: "nadia@southeastlandmark.com" },
    ]);
  }
  assigneesSeeded = true;
}

export async function listAssignees(): Promise<Assignee[]> {
  await seedAssigneesIfEmpty().catch(() => {});
  const { data, error } = await supabase.from("crm_assignees").select("*").order("name");
  if (error) return [];
  return (data ?? []).map(rowToAssignee);
}

export async function listCrmLeads(): Promise<CrmLead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToLead);
}

export async function getCrmLead(id: string): Promise<CrmLead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToLead(data);
}

async function fetchLead(id: string): Promise<CrmLead> {
  const l = await getCrmLead(id);
  if (!l) throw new Error("Lead not found");
  return l;
}

function pushTimeline(l: CrmLead, kind: TimelineKind, text: string, meta?: Record<string, unknown>, actor?: string) {
  const ev: TimelineEvent = { id: uid(), at: new Date().toISOString(), kind, text, meta, actor };
  l.timeline.unshift(ev);
}

async function persist(l: CrmLead): Promise<CrmLead> {
  const { error } = await supabase.from("leads").update({
    name: l.name, email: l.email, phone: l.phone, status: l.status, score: l.score,
    assigned_to: l.assignedTo, form_id: l.formId, form_name: l.formName,
    lead_page_id: l.leadPageId, lead_page_slug: l.leadPageSlug, source: l.source,
    analytics: asJson(l.analytics), answers: asJson(l.answers),
    notes: asJson(l.notes), tasks: asJson(l.tasks), attachments: asJson(l.attachments),
    communications: asJson(l.communications), timeline: asJson(l.timeline),
  }).eq("id", l.id);
  if (error) throw error;
  return fetchLead(l.id);
}

export async function submitLead(input: LeadSubmissionInput): Promise<CrmLead> {
  const answers = input.answers ?? {};
  const name = pickField(answers, ["name", "fullname", "full_name"]) || "Unnamed Lead";
  const email = pickField(answers, ["email"]);
  const phone = pickField(answers, ["phone", "mobile", "whatsapp"]);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const analytics = {
    ...(input.analytics ?? {}),
    browser: input.analytics?.browser ?? detectBrowser(ua),
    os: input.analytics?.os ?? detectOS(ua),
  };
  const source = input.source ?? (input.leadPageSlug ? `Lead Page: ${input.leadPageSlug}` : input.formName ? `Form: ${input.formName}` : "Website");
  const now = new Date().toISOString();
  const code = `LD-${Date.now().toString(36).toUpperCase()}`;
  const timeline = [{ id: uid(), at: now, kind: "submission" as TimelineKind, text: `Lead captured from ${source}` }];
  const { data, error } = await supabase.from("leads").insert({
    code, name, email, phone, status: "new", score: computeScore(answers, source),
    assigned_to: null, form_id: input.formId ?? null, form_name: input.formName ?? null,
    lead_page_id: input.leadPageId ?? null, lead_page_slug: input.leadPageSlug ?? null,
    source, analytics: asJson(analytics), answers: asJson(answers),
    notes: asJson([]), tasks: asJson([]), attachments: asJson([]), communications: asJson([]),
    timeline: asJson(timeline),
  }).select("*").single();
  if (error) throw error;
  return rowToLead(data);
}

export async function updateLeadStatus(id: string, status: LeadStatus, actor?: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  if (l.status === status) return l;
  const prev = l.status;
  l.status = status;
  pushTimeline(l, "status_change", `Status changed: ${prev} → ${status}`, { from: prev, to: status }, actor);
  return persist(l);
}

export async function assignLead(id: string, assigneeId: string | null, actor?: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.assignedTo = assigneeId;
  const assignees = await listAssignees();
  const a = assignees.find((x) => x.id === assigneeId);
  pushTimeline(l, "assignment", assigneeId ? `Assigned to ${a?.name ?? "user"}` : "Unassigned", { assigneeId }, actor);
  return persist(l);
}

export async function addNote(id: string, text: string, author = "Admin"): Promise<CrmLead> {
  const l = await fetchLead(id);
  const note: LeadNote = { id: uid(), text, author, at: new Date().toISOString() };
  l.notes.unshift(note);
  pushTimeline(l, "note", `Note added by ${author}`, { noteId: note.id });
  return persist(l);
}

export async function updateNote(id: string, noteId: string, text: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  const n = l.notes.find((x) => x.id === noteId);
  if (n) { n.text = text; n.at = new Date().toISOString(); }
  return persist(l);
}

export async function deleteNote(id: string, noteId: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.notes = l.notes.filter((n) => n.id !== noteId);
  return persist(l);
}

export async function addTask(id: string, task: Omit<LeadTask, "id" | "createdAt" | "status"> & { status?: LeadTask["status"] }): Promise<CrmLead> {
  const l = await fetchLead(id);
  const t: LeadTask = { id: uid(), createdAt: new Date().toISOString(), status: task.status ?? "pending", ...task };
  l.tasks.unshift(t);
  pushTimeline(l, "task_created", `Task created: ${t.title}`, { taskId: t.id });
  return persist(l);
}

export async function updateTaskStatus(id: string, taskId: string, status: LeadTask["status"]): Promise<CrmLead> {
  const l = await fetchLead(id);
  const t = l.tasks.find((x) => x.id === taskId);
  if (t) {
    t.status = status;
    if (status === "complete") t.completedAt = new Date().toISOString();
    pushTimeline(l, status === "complete" ? "task_completed" : "custom", `Task ${status}: ${t.title}`);
  }
  return persist(l);
}

export async function deleteTask(id: string, taskId: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.tasks = l.tasks.filter((t) => t.id !== taskId);
  return persist(l);
}

export async function addCommunication(id: string, channel: "call" | "whatsapp" | "email" | "sms" | "meeting", summary: string, by = "Admin"): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.communications.unshift({ id: uid(), channel, summary, by, at: new Date().toISOString() });
  pushTimeline(l, "custom", `${channel.toUpperCase()} — ${summary}`, { by });
  return persist(l);
}

export async function addAttachment(id: string, name: string, url?: string, size?: number): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.attachments.unshift({ id: uid(), name, url, size, at: new Date().toISOString() });
  pushTimeline(l, "attachment", `Attachment added: ${name}`);
  return persist(l);
}

export async function deleteAttachment(id: string, attId: string): Promise<CrmLead> {
  const l = await fetchLead(id);
  l.attachments = l.attachments.filter((a) => a.id !== attId);
  return persist(l);
}

export async function setScore(id: string, score: number): Promise<CrmLead> {
  const l = await fetchLead(id);
  const prev = l.score;
  l.score = Math.max(0, Math.min(100, Math.round(score)));
  pushTimeline(l, "score_change", `Score changed: ${prev} → ${l.score}`);
  return persist(l);
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Export helpers ----------

export function leadsToCsv(leads: CrmLead[]): string {
  const cols: (keyof CrmLead | string)[] = [
    "code", "name", "email", "phone", "status", "score", "source",
    "formName", "leadPageSlug", "assignedTo",
    "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
    "gclid", "fbclid", "landingUrl", "referrer", "device", "browser", "os", "ip",
    "createdAt",
  ];
  const esc = (s: unknown) => {
    const v = s == null ? "" : String(s);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const rows = leads.map((l) => cols.map((c) => {
    if (c === "utmSource") return esc(l.analytics.utmSource);
    if (c === "utmMedium") return esc(l.analytics.utmMedium);
    if (c === "utmCampaign") return esc(l.analytics.utmCampaign);
    if (c === "utmContent") return esc(l.analytics.utmContent);
    if (c === "utmTerm") return esc(l.analytics.utmTerm);
    if (c === "gclid") return esc(l.analytics.gclid);
    if (c === "fbclid") return esc(l.analytics.fbclid);
    if (c === "landingUrl") return esc(l.analytics.landingUrl);
    if (c === "referrer") return esc(l.analytics.referrer);
    if (c === "device") return esc(l.analytics.device);
    if (c === "browser") return esc(l.analytics.browser);
    if (c === "os") return esc(l.analytics.os);
    if (c === "ip") return esc(l.analytics.ip);
    return esc((l as unknown as Record<string, unknown>)[c as string]);
  }).join(","));
  return [cols.join(","), ...rows].join("\n");
}

export function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

}