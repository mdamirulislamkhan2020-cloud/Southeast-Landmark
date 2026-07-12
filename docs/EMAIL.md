# Email — Seminar Registration Notifications

This project sends a plain-text notification email every time the public seminar registration form at `/seminar` is submitted successfully. Sending is done **entirely server-side** through a Supabase Edge Function that talks to the client's own **cPanel SMTP** server. SMTP credentials never touch the browser.

## Architecture

```
Browser (SeminarPage)
   │  supabase.functions.invoke("send-seminar-registration", { body })
   ▼
Supabase Edge Function  ── denomailer ──▶  cPanel SMTP (mail.southeastlandmark.com:465 SSL)
                                                    │
                                                    ▼
                                     southeastlandmarkofficial@gmail.com
                                     admin@southeastlandmark.com
```

- Edge Function: `supabase/functions/send-seminar-registration/index.ts`
- Library: [`denomailer`](https://deno.land/x/denomailer) (small, well-maintained, standards-based SMTP client for Deno)
- All configuration is read at request time from **Edge Function Secrets** — no redeploy is needed to change any value.

## SMTP Settings In Use

| Setting | Value |
|---|---|
| Host | `mail.southeastlandmark.com` |
| Port | `465` |
| Encryption | SSL (implicit TLS) |
| Username | `info@southeastlandmark.com` |
| From email | `info@southeastlandmark.com` |
| From name | `Southeast Landmark` |
| Reply-To | `admin@southeastlandmark.com` |
| Subject | `New Free Seminar Registration` |

## Secrets

All of the following live in **Lovable Cloud → Project → Edge Functions → Secrets** (identical to Supabase Edge Function Secrets).

| Secret name | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port (usually `465`) |
| `SMTP_SECURE` | `ssl` for port 465, `starttls` for port 587 |
| `SMTP_USERNAME` | Full mailbox address used for auth |
| `SMTP_PASSWORD` | **Sensitive** — mailbox password |
| `SMTP_FROM_EMAIL` | Visible From address |
| `SMTP_FROM_NAME` | Visible From display name |
| `SMTP_REPLY_TO` | Address that receives replies |
| `SEMINAR_RECIPIENTS` | **Comma-separated** list of recipient inboxes |
| `SEMINAR_EMAIL_SUBJECT` | Subject line |

> The function fails safe: if any critical secret is missing, it logs the problem and returns without sending. The user's registration is never blocked by an email failure.

## Common Maintenance Tasks

All tasks below are done in the Lovable Cloud (Supabase) dashboard under **Edge Functions → Secrets**. **No code deploy is required for any of them** — secrets are read at request time.

### Rotate the SMTP password

1. Log in to cPanel → **Email Accounts** → find `info@southeastlandmark.com` → **Manage** → **New Password**. Save the new password somewhere safe (password manager).
2. Open Lovable Cloud → **Edge Function Secrets** → edit `SMTP_PASSWORD` → paste the new password → save.
3. Test by submitting the form at `/seminar`. Check both recipient inboxes.
4. If you don't receive email, open the Edge Function logs for `send-seminar-registration` — the exact SMTP error will be printed.

### Change recipient addresses

Edit the `SEMINAR_RECIPIENTS` secret. It's a **comma-separated** list, e.g.

```
southeastlandmarkofficial@gmail.com,admin@southeastlandmark.com,newperson@southeastlandmark.com
```

Whitespace around commas is tolerated. Save — takes effect on the next submission. **No developer or code change needed.**

### Change the sender / display name / reply-to

Edit the corresponding secret:

- `SMTP_FROM_EMAIL` — visible From address (must be a mailbox that exists in cPanel)
- `SMTP_FROM_NAME` — display name shown in Gmail/Outlook
- `SMTP_REPLY_TO` — where user replies go

### Change the subject line

Edit `SEMINAR_EMAIL_SUBJECT`.

### Move to a different SMTP host later

Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`. The code is provider-agnostic — any SMTP host works (Google Workspace, Zoho, Postmark SMTP, another cPanel account, etc.).

## Deliverability Checklist (do once, in cPanel)

In cPanel → **Email Deliverability** → click **Manage** on `southeastlandmark.com`. Ensure all three are green:

- **SPF** — authorizes the cPanel server to send mail for the domain
- **DKIM** — cryptographic signature added to every outgoing message
- **DMARC** — reporting policy; start with `v=DMARC1; p=none; rua=mailto:admin@southeastlandmark.com`

If any show a warning, cPanel prints the exact DNS record to add at the domain registrar. Missing DKIM/SPF is the #1 reason seminar emails land in spam.

## Testing

1. Open `/seminar` in the deployed site.
2. Fill in valid data and submit.
3. The success card appears immediately (email is fire-and-forget by design).
4. Both recipient inboxes should receive `New Free Seminar Registration` within seconds. Check spam if missing.
5. For deeper inspection: Lovable Cloud → Edge Functions → `send-seminar-registration` → Logs.

## Handover Checklist

On project handover, the client should verify:

- [ ] They own the Lovable Cloud project (transferred or invited as owner).
- [ ] They own `southeastlandmark.com` DNS.
- [ ] They own the `info@southeastlandmark.com` cPanel mailbox and know its password.
- [ ] They have this `docs/EMAIL.md` file in the repo.
- [ ] They can log in and see all 10 secrets under Edge Function Secrets.

That's the entire dependency surface — everything else is standard SMTP.

## Troubleshooting

**"smtp_not_configured" in logs** — one of the required secrets is missing. Compare the "Secrets" section above with what's set.

**"Authentication failed" or "535" in logs** — wrong `SMTP_USERNAME` or `SMTP_PASSWORD`. Reset password in cPanel and update `SMTP_PASSWORD`.

**"Connection refused" / "timeout"** — cPanel host is unreachable. Verify `SMTP_HOST` is correct; try switching to port 587 with `SMTP_SECURE=starttls`.

**Emails land in spam** — SPF or DKIM missing (see Deliverability Checklist above).

**Emails not arriving anywhere** — check cPanel mailbox `Sent` folder for the mailbox `info@southeastlandmark.com`. If the message is there, delivery is fine and the recipient side is filtering it. If not, check Edge Function logs.

## Migrating to a Different Provider Later

Because the implementation is standard SMTP + `denomailer`, moving to another provider is trivial:

- **Another SMTP host** (Google Workspace, Zoho, Postmark SMTP, etc.) — just change the SMTP secrets.
- **API-based provider** (Resend, SendGrid, Mailgun) — replace `send()` in `supabase/functions/send-seminar-registration/index.ts` with a `fetch()` call to their REST API. Contract on the frontend is unchanged.

No vendor lock-in.