import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Zap, Activity, Search, Trash2, RotateCcw, Send,
  ScrollText, Radio, Save, Plug, AlertCircle,
} from "lucide-react";
import { INTEGRATION_DEFINITIONS, TRACKING_EVENTS } from "../api/integrations";
import type { IntegrationConfig, IntegrationDefinition, IntegrationKey, IntegrationLog, DataLayerEntry } from "../api/integrations";
import {
  listIntegrations, saveIntegration, testIntegration, deleteIntegration,
  resetAllIntegrations, sendTestEmail, sendTestWebhook,
  listLogs, clearLogs, listDataLayer, clearDataLayer, trackEvent,
} from "../api/integrations-client";

const CATEGORY_ORDER: IntegrationDefinition["category"][] = ["analytics", "ads", "search", "email", "messaging", "maps", "security", "marketing", "webhook"];
const CATEGORY_LABEL: Record<IntegrationDefinition["category"], string> = {
  analytics: "Analytics", ads: "Advertising", search: "Search Consoles",
  email: "Email", messaging: "Messaging", maps: "Maps", security: "Security & Anti-spam",
  marketing: "Marketing", webhook: "Webhooks",
};

function StatusBadge({ cfg }: { cfg: IntegrationConfig }) {
  if (!cfg.enabled) return <Badge variant="outline" className="text-[10px]">Disabled</Badge>;
  if (cfg.lastTestOk === true) return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Connected</Badge>;
  if (cfg.lastTestOk === false) return <Badge variant="destructive" className="text-[10px]"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
  return <Badge variant="secondary" className="text-[10px]"><Activity className="h-3 w-3 mr-1" />Ready</Badge>;
}

function FieldRow({ f, value, onChange }: { f: IntegrationDefinition["fields"][number]; value: string; onChange: (v: string) => void }) {
  const kind = f.kind ?? (f.secret ? "password" : "text");
  return (
    <div>
      <Label className="text-xs">{f.label}{f.secret && <span className="ml-1 text-muted-foreground">(secret)</span>}</Label>
      {kind === "textarea" ? (
        <Textarea value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : kind === "select" ? (
        <Select value={value || (f.defaultValue ?? "")} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={f.placeholder ?? "Select..."} /></SelectTrigger>
          <SelectContent>{f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      ) : kind === "switch" ? (
        <div className="flex items-center gap-2 h-9">
          <Switch checked={value === "true"} onCheckedChange={(v) => onChange(v ? "true" : "false")} />
          <span className="text-xs text-muted-foreground">{value === "true" ? "Enabled" : "Disabled"}</span>
        </div>
      ) : (
        <Input type={kind === "password" ? "password" : kind === "number" ? "number" : "text"} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {f.helper && <p className="mt-1 text-[11px] text-muted-foreground">{f.helper}</p>}
    </div>
  );
}

function IntegrationPanel({ def, cfg, logs, onChange }: { def: IntegrationDefinition; cfg: IntegrationConfig; logs: IntegrationLog[]; onChange: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(cfg.values ?? {});
  const [enabled, setEnabled] = useState<boolean>(cfg.enabled);
  const [busy, setBusy] = useState<string | null>(null);
  const [testEmailTo, setTestEmailTo] = useState("");

  useEffect(() => { setValues(cfg.values ?? {}); setEnabled(cfg.enabled); }, [cfg]);

  const setV = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setBusy("save");
    try { await saveIntegration(def.key, { enabled, values }); toast.success(`${def.name} saved`); onChange(); }
    finally { setBusy(null); }
  };
  const test = async () => {
    setBusy("test");
    try {
      await saveIntegration(def.key, { enabled, values });
      const r = await testIntegration(def.key);
      if (r.ok) toast.success(r.message); else toast.error(r.message);
      onChange();
    } finally { setBusy(null); }
  };
  const del = async () => {
    if (!confirm(`Reset ${def.name} configuration?`)) return;
    setBusy("del");
    try { await deleteIntegration(def.key); toast.success(`${def.name} reset`); onChange(); }
    finally { setBusy(null); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              {def.name}
              {def.status === "placeholder" && <Badge variant="outline" className="text-[10px]">Placeholder</Badge>}
              <StatusBadge cfg={{ ...cfg, enabled, values }} />
            </CardTitle>
            {def.description && <p className="mt-1 text-xs text-muted-foreground">{def.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {def.fields.map((f) => (
            <FieldRow key={f.id} f={f} value={values[f.id] ?? ""} onChange={(v) => setV(f.id, v)} />
          ))}
        </div>

        {def.supportedEvents && def.supportedEvents.length > 0 && (
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supported Events</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {def.supportedEvents.map((e) => <Badge key={e} variant="secondary" className="text-[10px] font-mono">{e}</Badge>)}
            </div>
          </div>
        )}

        {def.key === "smtp" && (
          <div className="rounded-md border border-dashed border-border p-3 space-y-2">
            <Label className="text-xs">Send a test email</Label>
            <div className="flex gap-2">
              <Input placeholder="recipient@example.com" value={testEmailTo} onChange={(e) => setTestEmailTo(e.target.value)} />
              <Button size="sm" variant="outline" disabled={busy === "email"} onClick={async () => {
                setBusy("email");
                try {
                  const r = await sendTestEmail(testEmailTo);
                  if (r.ok) toast.success(r.message); else toast.error(r.message);
                  onChange();
                } finally { setBusy(null); }
              }}><Send className="h-4 w-4 mr-1" />Send</Button>
            </div>
          </div>
        )}

        {def.key === "webhook" && (
          <Button variant="outline" size="sm" disabled={busy === "hook"} onClick={async () => {
            setBusy("hook");
            try {
              const r = await sendTestWebhook();
              if (r.ok) toast.success(r.message); else toast.error(r.message);
              onChange();
            } finally { setBusy(null); }
          }}><Send className="h-4 w-4 mr-1" />Fire Test Payload</Button>
        )}

        {def.key === "google_maps" && values.apiKey && values.defaultLat && values.defaultLng && (
          <div className="rounded-md border border-border overflow-hidden">
            <iframe title="map-preview" className="w-full h-56" loading="lazy"
              src={`https://www.google.com/maps?q=${values.defaultLat},${values.defaultLng}&z=${values.zoom || 12}&output=embed`} />
          </div>
        )}

        <Separator />

        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div><span className="text-muted-foreground">Last sync:</span> {cfg.lastSyncAt ? new Date(cfg.lastSyncAt).toLocaleString() : "—"}</div>
          <div><span className="text-muted-foreground">Last test:</span> {cfg.lastTestedAt ? new Date(cfg.lastTestedAt).toLocaleString() : "—"}</div>
          <div className="truncate"><span className="text-muted-foreground">Last error:</span> {cfg.lastError ?? "—"}</div>
        </div>

        {logs.length > 0 && (
          <div className="rounded-md border border-border">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-xs font-medium flex items-center gap-1"><ScrollText className="h-3 w-3" /> Recent activity</span>
              <Button size="sm" variant="ghost" onClick={() => { clearLogs(def.key); onChange(); }}><Trash2 className="h-3 w-3" /></Button>
            </div>
            <div className="max-h-40 overflow-auto text-xs">
              {logs.slice(0, 10).map((l) => (
                <div key={l.id} className="flex items-start gap-2 px-3 py-1.5 border-b border-border/60 last:border-0">
                  <span className={`mt-0.5 h-2 w-2 rounded-full ${l.level === "success" ? "bg-emerald-500" : l.level === "error" ? "bg-red-500" : l.level === "warn" ? "bg-amber-500" : "bg-slate-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate"><span className="font-mono text-[10px] text-muted-foreground">{l.action}</span> {l.message}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(l.at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={del} disabled={busy === "del"}><Trash2 className="h-4 w-4 mr-1" />Reset</Button>
          <Button variant="outline" size="sm" disabled={busy === "test"} onClick={test}><Zap className="h-4 w-4 mr-1" />Test Connection</Button>
          <Button size="sm" disabled={busy === "save"} onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DataLayerTab() {
  const [entries, setEntries] = useState<DataLayerEntry[]>(() => listDataLayer());
  const refresh = () => setEntries(listDataLayer());
  useEffect(() => { const id = setInterval(refresh, 1500); return () => clearInterval(id); }, []);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Radio className="h-4 w-4" /> Data Layer & Events Log</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { trackEvent("page_view", { path: window.location.pathname, source: "admin_test" }); refresh(); }}>Push Test Event</Button>
            <Button size="sm" variant="ghost" onClick={() => { clearDataLayer(); refresh(); }}><Trash2 className="h-4 w-4 mr-1" />Clear</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events dispatched yet. Interact with the public site or click "Push Test Event".</p>
        ) : (
          <div className="rounded-md border border-border max-h-[480px] overflow-auto">
            {entries.map((e) => (
              <div key={e.id} className="px-3 py-2 border-b border-border/60 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{e.event}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(e.at).toLocaleTimeString()}</span>
                </div>
                {Object.keys(e.params).length > 0 && (
                  <pre className="mt-1 text-[11px] bg-muted/40 rounded p-2 overflow-x-auto">{JSON.stringify(e.params, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<IntegrationLog[]>(() => listLogs());
  const refresh = () => setLogs(listLogs());
  useEffect(() => { const id = setInterval(refresh, 1500); return () => clearInterval(id); }, []);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" /> Global Logs</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => { clearLogs(); refresh(); }}><Trash2 className="h-4 w-4 mr-1" />Clear</Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="rounded-md border border-border max-h-[480px] overflow-auto text-xs">
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 px-3 py-2 border-b border-border/60 last:border-0">
                <span className={`mt-1 h-2 w-2 rounded-full ${l.level === "success" ? "bg-emerald-500" : l.level === "error" ? "bg-red-500" : l.level === "warn" ? "bg-amber-500" : "bg-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{l.key}</Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">{l.action}</span>
                  </div>
                  <div className="mt-0.5">{l.message}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(l.at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegrationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["integrations"], queryFn: listIntegrations });
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<IntegrationKey | null>(null);
  const [logsTick, setLogsTick] = useState(0);

  const grouped = useMemo(() => {
    const map = new Map<IntegrationDefinition["category"], IntegrationDefinition[]>();
    INTEGRATION_DEFINITIONS
      .filter((d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.key.includes(query.toLowerCase()))
      .forEach((d) => { const arr = map.get(d.category) ?? []; arr.push(d); map.set(d.category, arr); });
    return map;
  }, [query]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["integrations"] }); setLogsTick((t) => t + 1); };
  const selectedDef = selectedKey ? INTEGRATION_DEFINITIONS.find((d) => d.key === selectedKey) ?? null : null;
  const selectedCfg = selectedKey && data ? data[selectedKey] : null;
  // logsTick is intentional — bumps after mutations so we re-read localStorage-backed logs.
  const selectedLogs = useMemo(
    () => (selectedKey ? listLogs(selectedKey) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedKey, logsTick],
  );

  const enabledCount = data ? Object.values(data).filter((c) => c.enabled).length : 0;
  const connectedCount = data ? Object.values(data).filter((c) => c.lastTestOk === true).length : 0;
  const errorCount = data ? Object.values(data).filter((c) => c.lastTestOk === false).length : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2"><Plug className="h-6 w-6" /> Integrations Center</h1>
          <p className="text-sm text-muted-foreground">Connect analytics, ads, messaging, email and webhooks. All values are editable — nothing is hardcoded.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {connectedCount} connected</Badge>
          <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> {enabledCount} enabled</Badge>
          <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3 text-red-500" /> {errorCount} error</Badge>
          <Button size="sm" variant="outline" onClick={async () => {
            if (!confirm("Reset ALL integrations and clear logs?")) return;
            await resetAllIntegrations(); toast.success("Integrations reset"); refresh();
          }}><RotateCcw className="h-4 w-4 mr-1" />Reset All</Button>
        </div>
      </header>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="events">Tracking Events</TabsTrigger>
          <TabsTrigger value="datalayer">Data Layer</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
            <aside className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search integrations…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="space-y-4">
                {CATEGORY_ORDER.map((cat) => {
                  const defs = grouped.get(cat) ?? [];
                  if (!defs.length) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5 px-2">{CATEGORY_LABEL[cat]}</h3>
                      <div className="flex flex-col gap-0.5">
                        {defs.map((d) => {
                          const cfg = data?.[d.key];
                          const active = selectedKey === d.key;
                          return (
                            <button key={d.key} onClick={() => setSelectedKey(d.key)}
                              className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between gap-2 transition-colors ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}>
                              <span className="truncate">{d.name}</span>
                              {cfg?.enabled ? (
                                cfg.lastTestOk === false
                                  ? <span className="h-2 w-2 rounded-full bg-red-500" />
                                  : <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              ) : <span className="h-2 w-2 rounded-full bg-slate-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <div>
              {selectedDef && selectedCfg ? (
                <IntegrationPanel def={selectedDef} cfg={selectedCfg} logs={selectedLogs} onChange={refresh} />
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-sm text-muted-foreground">
                    <Plug className="h-8 w-8 mx-auto mb-3 opacity-60" />
                    Select an integration on the left to configure it.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader><CardTitle className="text-base">Tracked Events</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Fired automatically on the public site and dispatched to any enabled analytics or webhook integration.</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TRACKING_EVENTS.map((e) => (
                  <div key={e.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{e.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">{e.key}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Auto</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datalayer"><DataLayerTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}