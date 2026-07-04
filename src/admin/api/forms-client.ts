import type { FieldType, FormField, LeadForm } from "./forms";
import { supabase } from "@/integrations/supabase/client";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

type FormRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  multi_step: boolean;
  show_progress: boolean;
  steps: unknown;
  fields: unknown;
  design: unknown;
  settings: unknown;
  created_at: string;
  updated_at: string;
};

function rowToForm(row: FormRow): LeadForm {
  const settings = (row.settings ?? {}) as Partial<LeadForm["settings"]>;
  return {
    id: row.id,
    name: row.name,
    multiStep: row.multi_step,
    showProgress: row.show_progress,
    steps: (row.steps ?? []) as LeadForm["steps"],
    fields: (row.fields ?? []) as LeadForm["fields"],
    design: (row.design ?? {}) as LeadForm["design"],
    settings: {
      seoTitle: "",
      seoDescription: "",
      thankYou: "",
      redirectUrl: "",
      whatsappRedirect: "",
      notifyEmail: "",
      autoReplyEmail: "",
      ...settings,
      slug: settings.slug ?? row.slug,
      status: (settings.status ?? row.status ?? "draft") as LeadForm["settings"]["status"],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formToRow(form: Partial<LeadForm>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (form.name !== undefined) row.name = form.name;
  if (form.multiStep !== undefined) row.multi_step = form.multiStep;
  if (form.showProgress !== undefined) row.show_progress = form.showProgress;
  if (form.steps !== undefined) row.steps = form.steps;
  if (form.fields !== undefined) row.fields = form.fields;
  if (form.design !== undefined) row.design = form.design;
  if (form.settings !== undefined) {
    row.settings = form.settings;
    if (form.settings.slug) row.slug = form.settings.slug;
    if (form.settings.status) row.status = form.settings.status;
  }
  return row;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const clean = (base || "form").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "form";
  let candidate = clean;
  for (let i = 2; i < 100; i++) {
    const q = supabase.from("forms").select("id").eq("slug", candidate).limit(1);
    const { data } = await q;
    const hit = (data ?? []).find((r) => r.id !== excludeId);
    if (!hit) return candidate;
    candidate = `${clean}-${i}`;
  }
  return `${clean}-${Date.now()}`;
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

async function seedIfEmpty(): Promise<void> {
  const { count, error } = await supabase.from("forms").select("id", { count: "exact", head: true });
  if (error || (count ?? 0) > 0) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await supabase.from("forms").insert({
    name: contact.name,
    slug: contact.settings.slug,
    status: contact.settings.status,
    multi_step: contact.multiStep,
    show_progress: contact.showProgress,
    steps: contact.steps,
    fields: contact.fields,
    design: contact.design,
    settings: contact.settings,
  });
}

export async function listForms(): Promise<LeadForm[]> {
  await seedIfEmpty();
  const { data, error } = await supabase.from("forms").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as FormRow[]).map(rowToForm);
}

export async function getForm(id: string): Promise<LeadForm | null> {
  const { data, error } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToForm(data as FormRow) : null;
}

export async function getFormBySlug(slug: string): Promise<LeadForm | null> {
  const { data, error } = await supabase.from("forms").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToForm(data as FormRow) : null;
}

export async function createForm(name = "Untitled Form"): Promise<LeadForm> {
  const stepId = uid();
  const slug = await uniqueSlug(name);
  const settings: LeadForm["settings"] = {
    slug, seoTitle: name, seoDescription: "", thankYou: "Thanks!", redirectUrl: "",
    whatsappRedirect: "", notifyEmail: "", autoReplyEmail: "", status: "draft",
  };
  const design: LeadForm["design"] = {
    background: "#ffffff", containerWidth: 640, inputStyle: "outline", labelPosition: "top",
    buttonStyle: "rounded", radius: 8, spacing: 16, successMessage: "Thanks!", errorMessage: "Something went wrong.",
  };
  const { data, error } = await supabase.from("forms").insert({
    name, slug, status: "draft", multi_step: false, show_progress: true,
    steps: [{ id: stepId, title: "Step 1", description: "" }],
    fields: [], design, settings,
  }).select("*").single();
  if (error) throw error;
  return rowToForm(data as FormRow);
}

export async function updateForm(id: string, patch: Partial<LeadForm>): Promise<LeadForm> {
  const row = formToRow(patch);
  if (row.slug) row.slug = await uniqueSlug(String(row.slug), id);
  const { data, error } = await supabase.from("forms").update(row).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToForm(data as FormRow);
}

export async function deleteForm(id: string): Promise<void> {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateForm(id: string): Promise<LeadForm> {
  const src = await getForm(id);
  if (!src) throw new Error("Form not found");
  const slug = await uniqueSlug(`${src.settings.slug}-copy`);
  const settings = { ...src.settings, slug, status: "draft" as const };
  const { data, error } = await supabase.from("forms").insert({
    name: `${src.name} (Copy)`,
    slug,
    status: "draft",
    multi_step: src.multiStep,
    show_progress: src.showProgress,
    steps: src.steps,
    fields: src.fields,
    design: src.design,
    settings,
  }).select("*").single();
  if (error) throw error;
  return rowToForm(data as FormRow);
}