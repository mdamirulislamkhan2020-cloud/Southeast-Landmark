import { z } from "zod";

export type SmtpEncryption = "none" | "ssl" | "tls" | "starttls";

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  /** Never returned by GET /config — write-only. Empty string means "unchanged". */
  password: string;
  encryption: SmtpEncryption;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  replyToName: string;
  /** True when a password is stored server-side (returned by GET even though the value isn't). */
  hasPassword?: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export const EMPTY_SMTP: SmtpConfig = {
  host: "",
  port: 587,
  username: "",
  password: "",
  encryption: "tls",
  fromEmail: "",
  fromName: "",
  replyToEmail: "",
  replyToName: "",
  hasPassword: false,
  updatedAt: null,
  updatedBy: null,
};

/** Create-path schema — password is required. */
export const smtpConfigSchema = z.object({
  host: z
    .string()
    .trim()
    .min(1, "SMTP host is required")
    .max(253, "Host is too long")
    .regex(
      /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(?:\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/,
      "Enter a valid hostname (e.g. smtp.example.com)",
    ),
  port: z
    .number({ invalid_type_error: "Port must be a number" })
    .int("Port must be an integer")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535"),
  username: z.string().trim().min(1, "Username is required").max(255),
  password: z.string().min(1, "Password is required").max(1024),
  encryption: z.enum(["none", "ssl", "tls", "starttls"]),
  fromEmail: z.string().trim().email("Enter a valid sender email").max(255),
  fromName: z.string().trim().min(1, "Sender name is required").max(120),
  replyToEmail: z.string().trim().email("Enter a valid reply-to email").max(255),
  replyToName: z.string().trim().min(1, "Reply-to name is required").max(120),
});

/** Edit-path schema — password may be blank when a password already exists server-side. */
export function editSmtpSchema(hasStoredPassword: boolean) {
  return smtpConfigSchema.extend({
    password: hasStoredPassword
      ? z.string().max(1024)
      : z.string().min(1, "Password is required").max(1024),
  });
}

export const testEmailSchema = z.object({
  to: z.string().trim().email("Enter a valid recipient email").max(255),
});

/** Public-safe view of the config (no password). */
export function redact(cfg: SmtpConfig): Omit<SmtpConfig, "password"> & { hasPassword: boolean } {
  const { password, ...rest } = cfg;
  return { ...rest, hasPassword: Boolean(password) || Boolean(cfg.hasPassword) };
}

export type SmtpLogAction = "save" | "update" | "delete" | "test_email" | "send";
export interface SmtpLog {
  id: string;
  at: string;
  user: string | null;
  action: SmtpLogAction;
  success: boolean;
  message: string;
  error?: string | null;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface TestEmailResult {
  ok: boolean;
  message: string;
  simulated: boolean;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  meta?: Record<string, string | number | boolean | null>;
  /** Source module id (contact_form, lead_form, etc.) — used for logging & idempotency. */
  source: string;
}
