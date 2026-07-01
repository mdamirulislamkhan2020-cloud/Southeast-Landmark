/**
 * Unified email entry-point for the entire app.
 *
 * Every module that can send email (contact form, lead forms, site-visit
 * requests, password reset, welcome, admin notifications, …) MUST use this
 * service. It funnels every send through the admin SMTP configuration so the
 * settings truly are the single source of truth.
 */
import { sendEmail as smtpSend } from "@/admin/api/smtp-client";
import type { SendEmailInput } from "@/admin/api/smtp";

export type EmailSource =
  | "contact_form"
  | "lead_form"
  | "site_visit_request"
  | "inquiry_form"
  | "password_reset"
  | "welcome_email"
  | "admin_notification";

export interface AppEmailInput extends Omit<SendEmailInput, "source"> {
  source: EmailSource;
}

export async function sendAppEmail(input: AppEmailInput) {
  return smtpSend(input);
}
