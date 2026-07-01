import { useMemo, useState } from "react";
import type { FormField, LeadForm, LogicGroup } from "../api/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { submitLead } from "../api/crm-client";
import type { CrmAnalytics } from "../api/crm";

type Values = Record<string, string | string[] | boolean | number>;

function evalLogic(logic: LogicGroup | null | undefined, values: Values, fieldsById: Map<string, FormField>): boolean {
  if (!logic || !logic.rules.length) return true;
  const results = logic.rules.map((r) => {
    const f = fieldsById.get(r.fieldId);
    if (!f) return false;
    const v = values[f.name];
    const cmp = String(v ?? "");
    switch (r.operator) {
      case "equals": return cmp === r.value;
      case "not_equals": return cmp !== r.value;
      case "contains": return cmp.includes(r.value);
      case "gt": return Number(v) > Number(r.value);
      case "lt": return Number(v) < Number(r.value);
    }
  });
  const passed = logic.join === "AND" ? results.every(Boolean) : results.some(Boolean);
  return logic.action === "show" ? passed : !passed;
}

function widthClass(w?: FormField["width"]) {
  if (w === "half") return "md:col-span-6";
  if (w === "third") return "md:col-span-4";
  return "md:col-span-12";
}

export function FormRenderer({ form }: { form: LeadForm }) {
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    form.fields.forEach((f) => { if (f.defaultValue !== undefined) v[f.name] = f.defaultValue; });
    return v;
  });
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const fieldsById = useMemo(() => new Map(form.fields.map((f) => [f.id, f])), [form.fields]);
  const steps = form.multiStep ? form.steps : form.steps.slice(0, 1);
  const stepFields = form.fields.filter((f) => (form.multiStep ? (f.step ?? 0) === step : true)).filter((f) => !f.hidden);

  const set = (name: string, v: Values[string]) => setValues((prev) => ({ ...prev, [name]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.multiStep && step < steps.length - 1) { setStep(step + 1); return; }
    setSubmitted(true);
    try {
      const answers: Record<string, unknown> = {};
      form.fields.forEach((f) => {
        if (["heading", "paragraph", "divider"].includes(f.type)) return;
        answers[f.name || f.id] = values[f.name];
      });
      let analytics: CrmAnalytics = {};
      let leadPageSlug: string | null = null;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const p = url.searchParams;
        analytics = {
          utmSource: p.get("utm_source") ?? undefined,
          utmMedium: p.get("utm_medium") ?? undefined,
          utmCampaign: p.get("utm_campaign") ?? undefined,
          utmContent: p.get("utm_content") ?? undefined,
          utmTerm: p.get("utm_term") ?? undefined,
          gclid: p.get("gclid") ?? undefined,
          fbclid: p.get("fbclid") ?? undefined,
          landingUrl: window.location.href,
          referrer: document.referrer || undefined,
          device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          campaign: p.get("utm_campaign") ?? undefined,
        };
        const m = url.pathname.match(/^\/lead\/([^/]+)/);
        if (m) {
          leadPageSlug = m[1];
          try {
            const cached = sessionStorage.getItem(`lead:${leadPageSlug}:analytics`);
            if (cached) {
              const parsed = JSON.parse(cached) as Record<string, string | undefined>;
              analytics = {
                ...analytics,
                utmSource: analytics.utmSource ?? parsed.utm_source,
                utmMedium: analytics.utmMedium ?? parsed.utm_medium,
                utmCampaign: analytics.utmCampaign ?? parsed.utm_campaign,
                utmContent: analytics.utmContent ?? parsed.utm_content,
                utmTerm: analytics.utmTerm ?? parsed.utm_term,
                gclid: analytics.gclid ?? parsed.gclid,
                fbclid: analytics.fbclid ?? parsed.fbclid,
                landingUrl: analytics.landingUrl ?? parsed.landing_url,
                referrer: analytics.referrer ?? parsed.referrer,
              };
            }
          } catch { /* ignore */ }
        }
      }
      void submitLead({
        formId: form.id,
        formName: form.name,
        answers,
        leadPageSlug,
        analytics,
        source: leadPageSlug ? `Lead Page: ${leadPageSlug}` : `Form: ${form.name}`,
      });
    } catch { /* non-blocking */ }
  };

  const btnRadius = form.design.buttonStyle === "pill" ? "rounded-full" : form.design.buttonStyle === "square" ? "rounded-none" : "rounded-md";

  if (submitted) {
    return (
      <div className="mx-auto text-center py-10" style={{ maxWidth: form.design.containerWidth }}>
        <div className="text-2xl font-semibold mb-2">{form.settings.thankYou || form.design.successMessage}</div>
        <div className="text-sm text-muted-foreground">Thank you for reaching out.</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto p-6 rounded-lg border border-border" style={{ maxWidth: form.design.containerWidth, background: form.design.background, borderRadius: form.design.radius }}>
      {form.multiStep && form.showProgress && steps.length > 1 && (
        <div className="mb-6">
          <Progress value={((step + 1) / steps.length) * 100} />
          <div className="mt-2 text-xs text-muted-foreground">Step {step + 1} of {steps.length}</div>
          {steps[step]?.title && <div className="mt-3 text-lg font-semibold">{steps[step].title}</div>}
          {steps[step]?.description && <div className="text-sm text-muted-foreground">{steps[step].description}</div>}
        </div>
      )}
      <div className="grid grid-cols-12" style={{ gap: form.design.spacing }}>
        {stepFields.map((f) => {
          const visible = evalLogic(f.logic, values, fieldsById);
          if (!visible) return null;
          const val = values[f.name];
          const common = (
            <>
              {f.label && f.type !== "heading" && f.type !== "paragraph" && f.type !== "divider" && (
                <Label className="mb-1 inline-block">{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
              )}
            </>
          );
          let control: React.ReactNode = null;
          switch (f.type) {
            case "text": case "email": case "phone":
              control = <Input type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"} placeholder={f.placeholder} required={f.required} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />; break;
            case "number":
              control = <Input type="number" placeholder={f.placeholder} required={f.required} min={f.validation?.min} max={f.validation?.max} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />; break;
            case "textarea":
              control = <Textarea rows={4} placeholder={f.placeholder} required={f.required} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />; break;
            case "dropdown":
              control = (
                <Select value={String(val ?? "")} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger><SelectValue placeholder={f.placeholder ?? "Select…"} /></SelectTrigger>
                  <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>); break;
            case "multiselect":
              control = (
                <div className="grid grid-cols-2 gap-2">
                  {(f.options ?? []).map((o) => {
                    const arr = Array.isArray(val) ? (val as string[]) : [];
                    const checked = arr.includes(o.value);
                    return (
                      <label key={o.value} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={checked} onCheckedChange={(c) => set(f.name, c ? [...arr, o.value] : arr.filter((x) => x !== o.value))} /> {o.label}
                      </label>
                    );
                  })}
                </div>); break;
            case "radio":
              control = (
                <RadioGroup value={String(val ?? "")} onValueChange={(v) => set(f.name, v)}>
                  {(f.options ?? []).map((o) => (<div key={o.value} className="flex items-center gap-2"><RadioGroupItem value={o.value} id={`${f.id}-${o.value}`} /><Label htmlFor={`${f.id}-${o.value}`}>{o.label}</Label></div>))}
                </RadioGroup>); break;
            case "checkbox":
              control = (<div className="flex items-center gap-2"><Checkbox checked={!!val} onCheckedChange={(c) => set(f.name, !!c)} /><span className="text-sm">{f.placeholder ?? "Check this"}</span></div>); break;
            case "toggle":
              control = (<Switch checked={!!val} onCheckedChange={(c) => set(f.name, c)} />); break;
            case "date":
              control = <Input type="date" required={f.required} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />; break;
            case "time":
              control = <Input type="time" required={f.required} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />; break;
            case "rating": {
              const cur = Number(val ?? 0);
              const max = f.validation?.max ?? 5;
              control = (<div className="flex gap-1">{Array.from({ length: max }).map((_, i) => (
                <button type="button" key={i} onClick={() => set(f.name, i + 1)}><Star className={`h-6 w-6 ${i < cur ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>
              ))}</div>); break;
            }
            case "slider": {
              const min = f.validation?.min ?? 0; const max = f.validation?.max ?? 100;
              const cur = Number(val ?? min);
              control = (<div><Slider min={min} max={max} step={Math.max(1, Math.round((max - min) / 100))} value={[cur]} onValueChange={(v) => set(f.name, v[0])} /><div className="mt-2 text-xs text-muted-foreground">Value: {cur.toLocaleString()}</div></div>); break;
            }
            case "file":
              control = <Input type="file" onChange={(e) => set(f.name, e.target.files?.[0]?.name ?? "")} />; break;
            case "image":
              control = <Input type="file" accept="image/*" onChange={(e) => set(f.name, e.target.files?.[0]?.name ?? "")} />; break;
            case "signature":
              control = <div className="rounded-md border border-dashed border-input h-24 flex items-center justify-center text-xs text-muted-foreground">Signature pad</div>; break;
            case "hidden":
              return <input key={f.id} type="hidden" name={f.name} value={f.defaultValue ?? ""} />;
            case "heading":
              return <div key={f.id} className={`col-span-12 ${widthClass(f.width)} ${f.cssClass ?? ""}`}><h3 className="text-xl font-semibold">{f.label}</h3></div>;
            case "paragraph":
              return <div key={f.id} className={`col-span-12 ${widthClass(f.width)} ${f.cssClass ?? ""}`}><p className="text-sm text-muted-foreground">{f.label}</p></div>;
            case "divider":
              return <div key={f.id} className="col-span-12"><hr className="border-border" /></div>;
          }
          return (
            <div key={f.id} className={`col-span-12 ${widthClass(f.width)} ${f.cssClass ?? ""}`}>
              {common}
              {control}
              {f.helpText && <p className="mt-1 text-xs text-muted-foreground">{f.helpText}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-between">
        {form.multiStep && step > 0 ? <Button type="button" variant="outline" className={btnRadius} onClick={() => setStep(step - 1)}>Previous</Button> : <span />}
        <Button type="submit" className={btnRadius}>{form.multiStep && step < steps.length - 1 ? "Next" : "Submit"}</Button>
      </div>
    </form>
  );
}