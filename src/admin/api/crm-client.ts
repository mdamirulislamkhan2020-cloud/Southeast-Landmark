import type {
  Assignee, CrmLead, LeadNote, LeadStatus, LeadSubmissionInput, LeadTask, TimelineEvent, TimelineKind,
} from "./crm";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";

const LS_CRM = "sel_admin_crm_leads_v1";
const LS_ASSIGNEES = "sel_admin_crm_assignees_v1";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function readLS<T>(k: string, dflt: T): T {
  if (typeof window === "undefined") return dflt;
  try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : dflt; } catch { return dflt; }
}
function writeLS<T>(k: string, v: T) { if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v)); }

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

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

function seedAssignees(): Assignee[] {
  const existing = readLS<Assignee[] | null>(LS_ASSIGNEES, null);
  if (existing) return existing;
  const list: Assignee[] = [
    { id: uid(), name: "Admin User", role: "admin", email: "admin@southeastlandmark.com" },
    { id: uid(), name: "Sales Manager", role: "manager", email: "manager@southeastlandmark.com" },
    { id: uid(), name: "Rahim (Sales)", role: "sales", email: "rahim@southeastlandmark.com" },
    { id: uid(), name: "Nadia (Sales)", role: "sales", email: "nadia@southeastlandmark.com" },
  ];
  writeLS(LS_ASSIGNEES, list);
  return list;
}

function seedLeads() {
  const existing = readLS<CrmLead[] | null>(LS_CRM, null);
  if (existing) return existing;
  const assignees = seedAssignees();
  const sources = ["Website Form", "Facebook Ads", "Google Ads", "Landing Page", "Referral"];
  const campaigns = ["Summer-2026", "Ramadan-Special", "Investor-Series", "Plot-Owner-Q3", ""];
  const utmSources = ["google", "facebook", "instagram", "direct", "newsletter"];
  const names = ["Ayesha Khan", "Rafiq Islam", "Tania Rahman", "Sabbir Ahmed", "Nadia Chowdhury", "Imran Hossain", "Mou Akter", "Jahid Karim"];
  const statuses: LeadStatus[] = ["new", "contacted", "qualified", "follow_up", "converted", "lost"];
  const seeded: CrmLead[] = Array.from({ length: 18 }).map((_, i) => {
    const now = new Date(); now.setDate(now.getDate() - Math.floor(Math.random() * 30));
    const iso = now.toISOString();
    const assignee = assignees[i % assignees.length];
    const status = statuses[i % statuses.length];
    const answers: Record<string, unknown> = {
      name: names[i % names.length],
      email: `lead${i + 1}@example.com`,
      phone: `+8801${(500000000 + i * 137).toString().slice(0, 9)}`,
      message: "Interested in a plot near Mohammadpur.",
      budget: Math.round(3000000 + Math.random() * 12000000),
      timeline: ["Immediate", "1-3 months", "3-6 months", "Just exploring"][i % 4],
    };
    const score = computeScore(answers, sources[i % sources.length]);
    return {
      id: uid(),
      code: `LD-${(1000 + i).toString()}`,
      name: names[i % names.length],
      email: answers.email as string,
      phone: answers.phone as string,
      status,
      score,
      assignedTo: assignee.id,
      formId: null,
      formName: "Contact Form",
      leadPageId: null,
      leadPageSlug: null,
      source: sources[i % sources.length],
      analytics: {
        utmSource: utmSources[i % utmSources.length],
        utmMedium: i % 2 ? "cpc" : "organic",
        utmCampaign: campaigns[i % campaigns.length] || undefined,
        landingUrl: "/",
        referrer: i % 3 === 0 ? "https://google.com" : undefined,
        device: i % 2 ? "mobile" : "desktop",
        browser: "Chrome",
        os: i % 2 ? "Android" : "Windows",
        ip: `103.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 5) % 255}`,
        campaign: campaigns[i % campaigns.length] || undefined,
      },
      answers,
      notes: [],
      tasks: [],
      attachments: [],
      communications: [],
      timeline: [
        { id: uid(), at: iso, kind: "submission", text: `Lead captured from ${sources[i % sources.length]}` },
        { id: uid(), at: iso, kind: "assignment", text: `Assigned to ${assignee.name}` },
      ],
      createdAt: iso,
      updatedAt: iso,
    };
  });
  writeLS(LS_CRM, seeded);
  return seeded;
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

function pushTimeline(lead: CrmLead, kind: TimelineKind, text: string, meta?: Record<string, unknown>, actor?: string) {
  const ev: TimelineEvent = { id: uid(), at: new Date().toISOString(), kind, text, meta, actor };
  lead.timeline.unshift(ev);
  lead.updatedAt = ev.at;
}

// ---------- Public API ----------

export async function listAssignees(): Promise<Assignee[]> {
  if (!USE_MOCK) return apiFetch<Assignee[]>("/crm/assignees");
  return seedAssignees();
}

export async function listCrmLeads(): Promise<CrmLead[]> {
  if (!USE_MOCK) return apiFetch<CrmLead[]>("/crm/leads");
  return seedLeads();
}

export async function getCrmLead(id: string): Promise<CrmLead | null> {
  if (!USE_MOCK) return apiFetch<CrmLead>(`/crm/leads/${id}`);
  seedLeads();
  return readLS<CrmLead[]>(LS_CRM, []).find((l) => l.id === id) ?? null;
}

function saveAll(list: CrmLead[]) { writeLS(LS_CRM, list); }

function mutate<T>(id: string, fn: (l: CrmLead) => T): T {
  const all = readLS<CrmLead[]>(LS_CRM, []);
  const idx = all.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Lead not found");
  const res = fn(all[idx]);
  saveAll(all);
  return res;
}

export async function submitLead(input: LeadSubmissionInput): Promise<CrmLead> {
  const all = seedLeads();
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
  const code = `LD-${1000 + all.length + 1}`;
  const lead: CrmLead = {
    id: uid(), code, name, email, phone,
    status: "new",
    score: computeScore(answers, source),
    assignedTo: null,
    formId: input.formId ?? null,
    formName: input.formName ?? null,
    leadPageId: input.leadPageId ?? null,
    leadPageSlug: input.leadPageSlug ?? null,
    source,
    analytics,
    answers,
    notes: [], tasks: [], attachments: [], communications: [],
    timeline: [{ id: uid(), at: now, kind: "submission", text: `Lead captured from ${source}` }],
    createdAt: now, updatedAt: now,
  };
  all.unshift(lead);
  saveAll(all);
  if (!USE_MOCK) { try { await apiFetch("/crm/leads", { method: "POST", body: JSON.stringify(lead) }); } catch { /* keep local */ } }
  return lead;
}

export async function updateLeadStatus(id: string, status: LeadStatus, actor?: string): Promise<CrmLead> {
  return mutate(id, (l) => {
    const prev = l.status;
    if (prev === status) return l;
    l.status = status;
    pushTimeline(l, "status_change", `Status changed: ${prev} → ${status}`, { from: prev, to: status }, actor);
    return l;
  });
}

export async function assignLead(id: string, assigneeId: string | null, actor?: string): Promise<CrmLead> {
  return mutate(id, (l) => {
    l.assignedTo = assigneeId;
    const a = seedAssignees().find((x) => x.id === assigneeId);
    pushTimeline(l, "assignment", assigneeId ? `Assigned to ${a?.name ?? "user"}` : "Unassigned", { assigneeId }, actor);
    return l;
  });
}

export async function addNote(id: string, text: string, author = "Admin"): Promise<CrmLead> {
  return mutate(id, (l) => {
    const note: LeadNote = { id: uid(), text, author, at: new Date().toISOString() };
    l.notes.unshift(note);
    pushTimeline(l, "note", `Note added by ${author}`, { noteId: note.id });
    return l;
  });
}

export async function updateNote(id: string, noteId: string, text: string): Promise<CrmLead> {
  return mutate(id, (l) => {
    const n = l.notes.find((x) => x.id === noteId);
    if (n) { n.text = text; n.at = new Date().toISOString(); }
    return l;
  });
}

export async function deleteNote(id: string, noteId: string): Promise<CrmLead> {
  return mutate(id, (l) => { l.notes = l.notes.filter((n) => n.id !== noteId); return l; });
}

export async function addTask(id: string, task: Omit<LeadTask, "id" | "createdAt" | "status"> & { status?: LeadTask["status"] }): Promise<CrmLead> {
  return mutate(id, (l) => {
    const t: LeadTask = { id: uid(), createdAt: new Date().toISOString(), status: task.status ?? "pending", ...task };
    l.tasks.unshift(t);
    pushTimeline(l, "task_created", `Task created: ${t.title}`, { taskId: t.id });
    return l;
  });
}

export async function updateTaskStatus(id: string, taskId: string, status: LeadTask["status"]): Promise<CrmLead> {
  return mutate(id, (l) => {
    const t = l.tasks.find((x) => x.id === taskId);
    if (t) {
      t.status = status;
      if (status === "complete") t.completedAt = new Date().toISOString();
      pushTimeline(l, status === "complete" ? "task_completed" : "custom", `Task ${status}: ${t.title}`);
    }
    return l;
  });
}

export async function deleteTask(id: string, taskId: string): Promise<CrmLead> {
  return mutate(id, (l) => { l.tasks = l.tasks.filter((t) => t.id !== taskId); return l; });
}

export async function addCommunication(id: string, channel: "call" | "whatsapp" | "email" | "sms" | "meeting", summary: string, by = "Admin"): Promise<CrmLead> {
  return mutate(id, (l) => {
    l.communications.unshift({ id: uid(), channel, summary, by, at: new Date().toISOString() });
    pushTimeline(l, "custom", `${channel.toUpperCase()} — ${summary}`, { by });
    return l;
  });
}

export async function addAttachment(id: string, name: string, url?: string, size?: number): Promise<CrmLead> {
  return mutate(id, (l) => {
    l.attachments.unshift({ id: uid(), name, url, size, at: new Date().toISOString() });
    pushTimeline(l, "attachment", `Attachment added: ${name}`);
    return l;
  });
}

export async function deleteAttachment(id: string, attId: string): Promise<CrmLead> {
  return mutate(id, (l) => { l.attachments = l.attachments.filter((a) => a.id !== attId); return l; });
}

export async function setScore(id: string, score: number): Promise<CrmLead> {
  return mutate(id, (l) => {
    const prev = l.score;
    l.score = Math.max(0, Math.min(100, Math.round(score)));
    pushTimeline(l, "score_change", `Score changed: ${prev} → ${l.score}`);
    return l;
  });
}

export async function deleteLead(id: string): Promise<void> {
  writeLS(LS_CRM, readLS<CrmLead[]>(LS_CRM, []).filter((l) => l.id !== id));
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