/**
 * Unified email entry-point for the entire app.
 *
 * Every module that can send email (contact form, lead forms, site-visit,
 * project inquiries, callback requests, brochure downloads, newsletter
 * subscriptions, password reset, welcome emails, admin notifications, lead
 * assignment notifications, …) MUST use this service. It funnels every send
 * through the admin SMTP configuration so those settings are the single source
 * of truth. Nothing else touches SMTP directly.
 *
 * Every helper returns the same `ApiResult` shape from the SMTP client so
 * callers get consistent success/error/simulated handling.
 */
import { sendEmail as smtpSend } from "@/admin/api/smtp-client";
import type { SendEmailInput } from "@/admin/api/smtp";
import { site } from "@/config/site";

export type EmailSource =
  | "contact_form"
  | "lead_form"
  | "site_visit_request"
  | "project_inquiry"
  | "callback_request"
  | "brochure_request"
  | "newsletter_subscription"
  | "inquiry_form"
  | "password_reset"
  | "welcome_email"
  | "admin_notification"
  | "lead_assignment";

export interface AppEmailInput extends Omit<SendEmailInput, "source"> {
  source: EmailSource;
}

export async function sendAppEmail(input: AppEmailInput) {
  return smtpSend(input);
}

// ---------- convenience helpers (typed wrappers, one line at call site) ----------

/** Format a key/value bag as a readable plain-text body. */
export function formatAnswers(answers: Record<string, unknown>): string {
  return Object.entries(answers)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join("\n");
}

/** Notify the admin inbox (defaults to site.email). */
export function notifyAdmin(params: {
  subject: string;
  text: string;
  source?: EmailSource;
  to?: string;
  replyTo?: string;
  meta?: SendEmailInput["meta"];
}) {
  return sendAppEmail({
    to: params.to ?? site.email,
    subject: params.subject,
    text: params.text,
    replyTo: params.replyTo,
    source: params.source ?? "admin_notification",
    meta: params.meta,
  });
}

export function sendWelcomeEmail(to: string, name: string, tempPassword?: string) {
  const lines = [
    `Hi ${name || "there"},`,
    "",
    `Your ${site.name} account has been created.`,
    tempPassword ? `Temporary password: ${tempPassword} (please change it after signing in).` : "",
    "",
    "— The team",
  ].filter(Boolean);
  return sendAppEmail({
    to,
    subject: `Welcome to ${site.name}`,
    text: lines.join("\n"),
    source: "welcome_email",
  });
}

export function sendPasswordResetEmail(to: string, resetToken: string) {
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password?token=${encodeURIComponent(resetToken)}`;
  return sendAppEmail({
    to,
    subject: `Reset your ${site.name} password`,
    text: `We received a request to reset your password.\n\nOpen this link to set a new one:\n${link}\n\nIf you didn't request this you can ignore this email.`,
    source: "password_reset",
    meta: { link },
  });
}

export function sendLeadAssignmentEmail(params: {
  assigneeEmail: string;
  assigneeName: string;
  leadName: string;
  leadId: string;
}) {
  return sendAppEmail({
    to: params.assigneeEmail,
    subject: `New lead assigned: ${params.leadName}`,
    text: `Hi ${params.assigneeName},\n\nA new lead has been assigned to you: ${params.leadName}\n\nOpen: ${typeof window !== "undefined" ? window.location.origin : ""}/admin/leads/${params.leadId}\n`,
    source: "lead_assignment",
    meta: { leadId: params.leadId },
  });
}

export function subscribeToNewsletter(email: string) {
  return sendAppEmail({
    to: site.email,
    subject: `Newsletter subscription — ${email}`,
    text: `New newsletter subscriber: ${email}\nAt: ${new Date().toISOString()}`,
    replyTo: email,
    source: "newsletter_subscription",
    meta: { subscriber: email },
  });
}
