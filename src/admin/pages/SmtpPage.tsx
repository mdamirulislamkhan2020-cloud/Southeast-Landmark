import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Mail, Save, Send, Loader2, ScrollText, Trash2, ShieldCheck, RotateCcw,
} from "lucide-react";
import {
  EMPTY_SMTP,
  editSmtpSchema,
  smtpConfigSchema,
  testEmailSchema,
  type SmtpConfig,
  type SmtpLog,
} from "../api/smtp";
import {
  clearSmtpLogs,
  createSmtpConfig,
  deleteSmtpConfig,
  getSmtpConfig,
  listSmtpLogs,
  sendTestEmail,
  updateSmtpConfig,
} from "../api/smtp-client";

type Errors = Partial<Record<keyof SmtpConfig | "testEmail", string>>;

export function SmtpPage() {
  const [values, setValues] = useState<SmtpConfig>({ ...EMPTY_SMTP });
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [meta, setMeta] = useState<{ updatedAt?: string | null; updatedBy?: string | null }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [logs, setLogs] = useState<SmtpLog[]>([]);
  const inFlightTest = useRef(false);

  const isConfigured = hasStoredPassword && Boolean(meta.updatedAt);

  async function refresh() {
    setLoading(true);
    try {
      const cfg = await getSmtpConfig();
      setValues({
        ...EMPTY_SMTP,
        ...cfg,
        password: "", // never populate the password field
      });
      setHasStoredPassword(Boolean(cfg.hasPassword));
      setMeta({ updatedAt: cfg.updatedAt, updatedBy: cfg.updatedBy });
      setLogs(await listSmtpLogs());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load SMTP configuration");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void refresh(); }, []);

  const set = <K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function validate(): { ok: true; parsed: SmtpConfig } | { ok: false } {
    const schema = isConfigured ? editSmtpSchema(hasStoredPassword) : smtpConfigSchema;
    const result = schema.safeParse(values);
    if (result.success) return { ok: true, parsed: result.data as SmtpConfig };
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0] as keyof SmtpConfig | undefined;
      if (path) next[path] = issue.message;
    }
    setErrors(next);
    toast.error("Fix the highlighted fields before saving");
    return { ok: false };
  }

  async function handleSave() {
    if (saving) return;
    const v = validate();
    if (!v.ok) return;
    setSaving(true);
    try {
      const res = isConfigured ? await updateSmtpConfig(v.parsed) : await createSmtpConfig(v.parsed);
      if (!res.ok) {
        toast.error(res.error ?? "Save failed");
        return;
      }
      toast.success(isConfigured ? "SMTP settings updated" : "SMTP settings saved");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (testing || inFlightTest.current) return;
    const parsed = testEmailSchema.safeParse({ to: testEmail });
    if (!parsed.success) {
      setErrors((prev) => ({ ...prev, testEmail: parsed.error.issues[0]?.message ?? "Invalid email" }));
      return;
    }
    setErrors((prev) => ({ ...prev, testEmail: undefined }));
    if (!isConfigured) {
      toast.error("Save the SMTP configuration before sending a test.");
      return;
    }
    inFlightTest.current = true;
    setTesting(true);
    try {
      const res = await sendTestEmail(parsed.data.to);
      if (res.simulated) {
        toast.warning(res.message, { duration: 6000 });
      } else if (res.ok) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      setLogs(await listSmtpLogs());
    } finally {
      inFlightTest.current = false;
      setTesting(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    if (!confirm("Reset the SMTP configuration? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await deleteSmtpConfig();
      if (!res.ok) {
        toast.error(res.error ?? "Reset failed");
        return;
      }
      toast.success("SMTP configuration reset");
      setValues({ ...EMPTY_SMTP });
      setHasStoredPassword(false);
      setMeta({});
      await refresh();
    } finally {
      setDeleting(false);
    }
  }

  const statusBadge = useMemo(() => {
    if (loading) return <Badge variant="secondary">Loading…</Badge>;
    if (isConfigured) return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">Configured</Badge>;
    return <Badge variant="outline">Not configured</Badge>;
  }, [loading, isConfigured]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2">
            <Mail className="h-6 w-6" /> SMTP Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Single source of truth for every email the site sends. All form submissions,
            password resets and admin notifications route through this configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {meta.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(meta.updatedAt).toLocaleString()}
              {meta.updatedBy ? ` by ${meta.updatedBy}` : ""}
            </span>
          )}
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Server settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="SMTP Host" error={errors.host}>
            <Input
              value={values.host}
              placeholder="smtp.example.com"
              autoComplete="off"
              onChange={(e) => set("host", e.target.value)}
            />
          </Field>
          <Field label="Port" error={errors.port}>
            <Input
              type="number"
              min={1}
              max={65535}
              value={values.port}
              onChange={(e) => set("port", Number(e.target.value))}
            />
          </Field>
          <Field label="Encryption" error={errors.encryption}>
            <Select value={values.encryption} onValueChange={(v) => set("encryption", v as SmtpConfig["encryption"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="starttls">STARTTLS</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Username" error={errors.username}>
            <Input
              value={values.username}
              autoComplete="off"
              onChange={(e) => set("username", e.target.value)}
            />
          </Field>
          <Field
            label={
              <span className="flex items-center gap-1.5">
                Password
                <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                {hasStoredPassword && (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    (stored — leave blank to keep)
                  </span>
                )}
              </span>
            }
            error={errors.password}
          >
            <Input
              type="password"
              value={values.password}
              placeholder={hasStoredPassword ? "••••••••••" : ""}
              autoComplete="new-password"
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>
          <div />
          <Field label="From Email" error={errors.fromEmail}>
            <Input type="email" value={values.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} />
          </Field>
          <Field label="From Name" error={errors.fromName}>
            <Input value={values.fromName} onChange={(e) => set("fromName", e.target.value)} />
          </Field>
          <Field label="Reply-To Email" error={errors.replyToEmail}>
            <Input type="email" value={values.replyToEmail} onChange={(e) => set("replyToEmail", e.target.value)} />
          </Field>
          <Field label="Reply-To Name" error={errors.replyToName}>
            <Input value={values.replyToName} onChange={(e) => set("replyToName", e.target.value)} />
          </Field>
        </CardContent>
        <Separator />
        <CardContent className="flex flex-wrap justify-end gap-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={deleting || !isConfigured}
            onClick={handleDelete}
          >
            {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reload
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {isConfigured ? "Update settings" : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Send a test email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Recipient" error={errors.testEmail}>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => {
                  setTestEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, testEmail: undefined }));
                }}
              />
              <Button
                onClick={handleTest}
                disabled={testing || !isConfigured}
                aria-busy={testing}
              >
                {testing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                {testing ? "Sending…" : "Send test email"}
              </Button>
            </div>
          </Field>
          {!isConfigured && (
            <p className="text-xs text-muted-foreground">
              Save the SMTP configuration before running a test.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Activity log
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { clearSmtpLogs(); setLogs([]); }}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No SMTP activity recorded yet.</p>
          ) : (
            <div className="rounded-md border border-border max-h-96 overflow-auto text-xs">
              {logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 px-3 py-2 border-b border-border/60 last:border-0">
                  <span
                    className={`mt-1 h-2 w-2 rounded-full ${l.success ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{l.action}</Badge>
                      <span className="text-muted-foreground">{new Date(l.at).toLocaleString()}</span>
                      {l.user && <span className="text-muted-foreground">· {l.user}</span>}
                    </div>
                    <div className="mt-0.5">{l.message}</div>
                    {l.error && <div className="text-red-500 mt-0.5">{l.error}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
