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

function formatBody(payload: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push("New Free Seminar Registration");
  lines.push("=".repeat(40));
  lines.push("");
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || String(value).trim() === "") continue;
    const val = Array.isArray(value) ? value.join(", ") : String(value);
    lines.push(`${key}: ${val}`);
  }
  lines.push("");
  lines.push(`Submitted at: ${new Date().toISOString()}`);
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

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
      content: formatBody(payload),
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