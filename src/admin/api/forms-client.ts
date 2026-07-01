import type { FieldType, FormField, LeadForm } from "./forms";

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? "/api";
const USE_MOCK = (import.meta.env.VITE_ADMIN_USE_MOCK as string | undefined) !== "false";
const LS_FORMS = "sel_admin_forms_v1";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function writeLS<T>(key: string, value: T) { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value)); }

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export function newField(type: FieldType): FormField {
  const id = uid();
  const base: FormField = { id, type, label: "", name: `field_${id.slice(0, 6)}`, width: "full", step: 0 };
  switch (type) {
    case "text": return { ...base, label: "Text Field", placeholder: "Enter text" };
    case "email": return { ...base, label: "Email", placeholder: "you@example.com", required: true };
    case "phone": return { ...base, label: "Phone", placeholder: "+880…" };
    case "number": return { ...base, label: "Number", placeholder: "0" };
    case "textarea": return { ...base, label: "Message", placeholder: "Write your message…" };
    case "dropdown":
    case "multiselect":
    case "radio":
    case "checkbox":
      return { ...base, label: type[0].toUpperCase() + type.slice(1), options: [{ label: "Option 1", value: "opt1" }, { label: "Option 2", value: "opt2" }] };
    case "toggle": return { ...base, label: "Toggle" };
    case "date": return { ...base, label: "Date" };
    case "time": return { ...base, label: "Time" };
    case "rating": return { ...base, label: "Rating", validation: { min: 1, max: 5 } };
    case "slider": return { ...base, label: "Budget", validation: { min: 0, max: 10000000 } };
    case "file": return { ...base, label: "File Upload" };
    case "image": return { ...base, label: "Image Upload" };
    case "signature": return { ...base, label: "Signature" };
    case "hidden": return { ...base, label: "Hidden Field", defaultValue: "" };
    case "heading": return { ...base, label: "Section Heading" };
    case "paragraph": return { ...base, label: "Paragraph text goes here." };
    case "divider": return { ...base, label: "" };
  }
}

function seed() {
  if (readLS<LeadForm[] | null>(LS_FORMS, null) !== null) return;
  const now = new Date().toISOString();
  const step0 = uid();
  const contact: LeadForm = {
    id: uid(),
    name: "Contact Form",
    multiStep: false,
    showProgress: true,
    steps: [{ id: step0, title: "Contact", description: "We'll get back within 24 hours." }],
    fields: [
      { ...newField("text"), label: "Full Name", name: "name", required: true, step: 0 },
      { ...newField("email"), name: "email", required: true, step: 0 },
      { ...newField("phone"), name: "phone", step: 0 },
      { ...newField("textarea"), label: "Message", name: "message", step: 0 },
    ],
    design: { background: "#ffffff", containerWidth: 640, inputStyle: "outline", labelPosition: "top", buttonStyle: "rounded", radius: 8, spacing: 16, successMessage: "Thanks! We received your message.", errorMessage: "Something went wrong. Please try again." },
    settings: { slug: "contact", seoTitle: "Contact Us", seoDescription: "Get in touch with Southeast Landmark.", thankYou: "Thanks — we'll be in touch.", redirectUrl: "", whatsappRedirect: "", notifyEmail: "leads@southeastlandmark.com", autoReplyEmail: "no-reply@southeastlandmark.com", status: "published" },
    createdAt: now, updatedAt: now,
  };
  writeLS(LS_FORMS, [contact]);
}

export async function listForms(): Promise<LeadForm[]> {
  if (!USE_MOCK) return apiFetch<LeadForm[]>("/forms");
  seed();
  return readLS<LeadForm[]>(LS_FORMS, []);
}
export async function getForm(id: string): Promise<LeadForm | null> {
  if (!USE_MOCK) return apiFetch<LeadForm>(`/forms/${id}`);
  seed();
  return readLS<LeadForm[]>(LS_FORMS, []).find((f) => f.id === id) ?? null;
}
export async function createForm(name = "Untitled Form"): Promise<LeadForm> {
  const now = new Date().toISOString();
  const stepId = uid();
  const form: LeadForm = {
    id: uid(), name, multiStep: false, showProgress: true,
    steps: [{ id: stepId, title: "Step 1", description: "" }],
    fields: [],
    design: { background: "#ffffff", containerWidth: 640, inputStyle: "outline", labelPosition: "top", buttonStyle: "rounded", radius: 8, spacing: 16, successMessage: "Thanks!", errorMessage: "Something went wrong." },
    settings: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), seoTitle: name, seoDescription: "", thankYou: "Thanks!", redirectUrl: "", whatsappRedirect: "", notifyEmail: "", autoReplyEmail: "", status: "draft" },
    createdAt: now, updatedAt: now,
  };
  if (!USE_MOCK) return apiFetch<LeadForm>("/forms", { method: "POST", body: JSON.stringify(form) });
  const all = readLS<LeadForm[]>(LS_FORMS, []);
  all.unshift(form);
  writeLS(LS_FORMS, all);
  return form;
}
export async function updateForm(id: string, patch: Partial<LeadForm>): Promise<LeadForm> {
  if (!USE_MOCK) return apiFetch<LeadForm>(`/forms/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  const all = readLS<LeadForm[]>(LS_FORMS, []);
  const i = all.findIndex((f) => f.id === id);
  if (i < 0) throw new Error("Form not found");
  all[i] = { ...all[i], ...patch, updatedAt: new Date().toISOString() };
  writeLS(LS_FORMS, all);
  return all[i];
}
export async function deleteForm(id: string): Promise<void> {
  if (!USE_MOCK) return apiFetch<void>(`/forms/${id}`, { method: "DELETE" });
  writeLS(LS_FORMS, readLS<LeadForm[]>(LS_FORMS, []).filter((f) => f.id !== id));
}
export async function duplicateForm(id: string): Promise<LeadForm> {
  const src = await getForm(id);
  if (!src) throw new Error("Form not found");
  const copy = { ...src, id: undefined as unknown as string, name: `${src.name} (Copy)`, settings: { ...src.settings, status: "draft" as const, slug: `${src.settings.slug}-copy` } };
  return createFromClone(copy);
}
async function createFromClone(input: Partial<LeadForm>): Promise<LeadForm> {
  const now = new Date().toISOString();
  const form = { ...(input as LeadForm), id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), createdAt: now, updatedAt: now };
  const all = readLS<LeadForm[]>(LS_FORMS, []);
  all.unshift(form);
  writeLS(LS_FORMS, all);
  return form;
}