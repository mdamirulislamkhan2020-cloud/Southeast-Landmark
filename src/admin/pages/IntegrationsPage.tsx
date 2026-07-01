import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Zap, Activity } from "lucide-react";
import { INTEGRATION_DEFINITIONS, TRACKING_EVENTS } from "../api/integrations";
import type { IntegrationConfig, IntegrationDefinition, IntegrationKey } from "../api/integrations";
import { listIntegrations, saveIntegration, testIntegration } from "../api/integrations-client";

const CATEGORY_ORDER: IntegrationDefinition["category"][] = ["analytics", "ads", "search", "email", "messaging", "maps", "security", "marketing", "webhook"];
const CATEGORY_LABEL: Record<IntegrationDefinition["category"], string> = {
  analytics: "Analytics", ads: "Advertising", search: "Search Consoles",
  email: "Email", messaging: "Messaging", maps: "Maps", security: "Security & Anti-spam",
  marketing: "Marketing", webhook: "Webhooks",
};

function IntegrationCard({ def, cfg, onChange }: { def: IntegrationDefinition; cfg: IntegrationConfig; onChange: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(cfg.values ?? {});
  const [enabled, setEnabled] = useState<boolean>(cfg.enabled);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);

  const save = async () => {
    setBusy("save");
    try { await saveIntegration(def.key, { enabled, values }); toast.success(`${def.name} saved`); onChange(); }
    finally { setBusy(null); }
  };
  const test = async () => {
    setBusy("test");
    try { await saveIntegration(def.key, { enabled, values }); const r = await testIntegration(def.key); r.ok ? toast.success(r.message) : toast.error(r.message); onChange(); }
    finally { setBusy(null); }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {def.name}
              {def.status === "placeholder" && <Badge variant="outline" className="text-[10px]">Placeholder</Badge>}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {cfg.lastTestOk === true && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Connected</span>}
              {cfg.lastTestOk === false && <span className="inline-flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" /> Not connected</span>}
              {cfg.lastTestOk == null && <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Never tested</span>}
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {def.fields.map((f) => (
          <div key={f.id}>
            <Label className="text-xs">{f.label}{f.secret && <span className="ml-1 text-muted-foreground">(secret)</span>}</Label>
            <Input type={f.secret ? "password" : "text"} placeholder={f.placeholder} value={values[f.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} />
            {f.helper && <p className="mt-1 text-[11px] text-muted-foreground">{f.helper}</p>}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" disabled={busy === "test"} onClick={test}><Zap className="h-4 w-4 mr-1" />Test</Button>
          <Button size="sm" disabled={busy === "save"} onClick={save}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["integrations"], queryFn: listIntegrations });

  const grouped = useMemo(() => {
    const map = new Map<IntegrationDefinition["category"], IntegrationDefinition[]>();
    INTEGRATION_DEFINITIONS.forEach((d) => { const arr = map.get(d.category) ?? []; arr.push(d); map.set(d.category, arr); });
    return map;
  }, []);

  const refresh = () => qc.invalidateQueries({ queryKey: ["integrations"] });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Integrations</h1>
        <p className="text-sm text-muted-foreground">Central hub for analytics, ads, messaging and connectivity. All keys and toggles come from settings — nothing is hardcoded.</p>
      </header>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="events">Tracking Events</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {CATEGORY_ORDER.map((cat) => {
            const defs = grouped.get(cat) ?? [];
            if (!defs.length) return null;
            return (
              <section key={cat} className="space-y-3">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">{CATEGORY_LABEL[cat]}</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {defs.map((d) => {
                    const cfg = data?.[d.key as IntegrationKey] ?? { key: d.key, enabled: false, values: {}, lastTestedAt: null, lastTestOk: null };
                    return <IntegrationCard key={d.key} def={d} cfg={cfg} onChange={refresh} />;
                  })}
                </div>
              </section>
            );
          })}
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
      </Tabs>
    </div>
  );
}