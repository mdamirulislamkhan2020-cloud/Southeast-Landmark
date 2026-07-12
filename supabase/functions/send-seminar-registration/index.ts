// Sends a plain-text notification email when a seminar registration is submitted.
// Server-side only. Uses the client's own cPanel SMTP via denomailer.
// All configuration is read from Edge Function secrets — no hardcoded credentials.

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SEP = "=".repeat(52);

type SeminarPayload = {
  full_name?: string;
  phone_number?: string;
  job_title?: string;
  company_name?: string;
  answers?: Array<{ question: string; answer: string }>;
  submitted_at?: string;
};

function v(x: unknown): string {
  const s = x === undefined || x === null ? "" : String(x).trim();
  return s.length ? s : "-";
}

function formatBody(payload: SeminarPayload, ipAddress: string): string {
  const L: string[] = [];
  L.push(SEP);
  L.push("NEW FREE SEMINAR REGISTRATION");
  L.push(SEP);
  L.push("");
  L.push("PERSONAL INFORMATION");
  L.push("");
  L.push("Full Name:");
  L.push(v(payload.full_name));
  L.push("");
  L.push("Phone Number:");
  L.push(v(payload.phone_number));
  L.push("");
  L.push("Job Title:");
  L.push(v(payload.job_title));
  L.push("");
  L.push("Company Name:");
  L.push(v(payload.company_name));
  L.push("");
  L.push(SEP);
  L.push("QUESTIONNAIRE");
  L.push(SEP);
  L.push("");
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  answers.forEach((a, i) => {
    L.push(`${i + 1}. ${v(a?.question)}`);
    L.push("Answer:");
    L.push(v(a?.answer));
    L.push("");
  });
  L.push(SEP);
  L.push("SYSTEM INFORMATION");
  L.push(SEP);
  L.push("");
  L.push("Submitted At:");
  L.push(v(payload.submitted_at) === "-" ? new Date().toISOString() : v(payload.submitted_at));
  L.push("");
  L.push("IP Address:");
  L.push(v(ipAddress));
  L.push("");
  L.push(SEP);
  L.push("");
  L.push("This email was generated automatically from the Southeast Landmark Free Seminar Registration System.");
  return L.join("\r\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let payload: SeminarPayload = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  const host = Deno.env.get("SMTP_HOST");
  const portStr = Deno.env.get("SMTP_PORT") ?? "465";
  const secure = (Deno.env.get("SMTP_SECURE") ?? "ssl").toLowerCase();
  const username = Deno.env.get("SMTP_USERNAME");
  const password = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") ?? username ?? "";
  const fromName = Deno.env.get("SMTP_FROM_NAME") ?? "";
  const replyTo = Deno.env.get("SMTP_REPLY_TO") ?? "";
  const recipientsRaw = Deno.env.get("SEMINAR_RECIPIENTS") ?? "";
  const subject = Deno.env.get("SEMINAR_EMAIL_SUBJECT") ?? "New Free Seminar Registration";

  const recipients = recipientsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (!host || !username || !password || !fromEmail || recipients.length === 0) {
    console.error("[send-seminar-registration] missing SMTP config", {
      hasHost: !!host, hasUser: !!username, hasPass: !!password,
      hasFrom: !!fromEmail, recipientCount: recipients.length,
    });
    return json({ ok: false, error: "smtp_not_configured" }, 500);
  }

  const port = Number.parseInt(portStr, 10);
  const useTls = secure === "ssl" || port === 465;

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls: useTls,
      auth: { username, password },
    },
  });

  try {
    await client.send({
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: recipients,
      replyTo: replyTo || undefined,
      subject,
      content: formatBody(payload, ipAddress),
    });
    console.log(`[send-seminar-registration] sent to ${recipients.length} recipient(s)`);
    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-seminar-registration] send failed:", message);
    // Never fail the user's registration because of email problems.
    return json({ ok: false, error: "send_failed", detail: message }, 200);
  } finally {
    try { await client.close(); } catch { /* ignore */ }
  }
});