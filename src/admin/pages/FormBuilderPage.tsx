import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronRight, Plus, Save, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { getForm, newField, updateForm } from "../api/forms-client";
import { FIELD_TYPE_GROUPS, FIELD_TYPE_LABELS, type FieldType, type FormField, type LeadForm, type LogicGroup, type LogicOperator } from "../api/forms";
import { FormRenderer } from "../components/FormRenderer";
import { FormDesignPanel } from "../components/FormDesignPanel";

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

export function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const [form, setForm] = useState<LeadForm | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const tab = sp.get("tab") ?? "builder";

  useEffect(() => { if (id) getForm(id).then((f) => setForm(f)); }, [id]);

  const selected = useMemo(() => form?.fields.find((f) => f.id === selectedId) ?? null, [form, selectedId]);

  if (!form) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  const update = (patch: Partial<LeadForm>) => setForm({ ...form, ...patch });
  const updateFields = (fields: FormField[]) => update({ fields });
  const updateField = (fid: string, patch: Partial<FormField>) => updateFields(form.fields.map((f) => (f.id === fid ? { ...f, ...patch } : f)));

  const addField = (type: FieldType) => {
    const f = { ...newField(type), step: form.multiStep ? activeStep : 0 };
    updateFields([...form.fields, f]);
    setSelectedId(f.id);
  };
  const removeField = (fid: string) => { updateFields(form.fields.filter((f) => f.id !== fid)); if (selectedId === fid) setSelectedId(null); };
  const duplicateField = (fid: string) => {
    const src = form.fields.find((f) => f.id === fid); if (!src) return;
    const copy: FormField = { ...src, id: uid(), name: `${src.name}_copy` };
    const i = form.fields.findIndex((f) => f.id === fid);
    const next = [...form.fields]; next.splice(i + 1, 0, copy);
    updateFields(next);
  };

  const onDragStart = (fid: string) => setDragId(fid);
  const onDragOver = (e: React.DragEvent, fid: string) => { e.preventDefault(); setDragOverId(fid); };
  const onDrop = (fid: string) => {
    if (!dragId || dragId === fid) { setDragId(null); setDragOverId(null); return; }
    const list = [...form.fields];
    const from = list.findIndex((f) => f.id === dragId);
    const to = list.findIndex((f) => f.id === fid);
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    updateFields(list); setDragId(null); setDragOverId(null);
  };

  const save = async () => { await updateForm(form.id, form); toast.success("Form saved"); };

  const stepFields = form.fields.filter((f) => (form.multiStep ? (f.step ?? 0) === activeStep : true));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav("/admin/forms")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Input value={form.name} onChange={(e) => update({ name: e.target.value })} className="w-64 font-medium" />
          <Badge variant={form.settings.status === "published" ? "default" : "secondary"}>{form.settings.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => update({ settings: { ...form.settings, status: form.settings.status === "published" ? "draft" : "published" } })}>
            {form.settings.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={save}><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setSp({ tab: v })}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="logic">Conditional Logic</TabsTrigger>
          <TabsTrigger value="steps">Multi-Step</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="pt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Field palette */}
            <Card className="col-span-12 lg:col-span-3"><CardHeader><CardTitle className="text-sm">Add Fields</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {FIELD_TYPE_GROUPS.map((g) => (
                  <div key={g.label}>
                    <div className="text-[10px] uppercase text-muted-foreground mb-2">{g.label}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {g.types.map((t) => (
                        <Button key={t} size="sm" variant="outline" className="justify-start text-xs h-8" onClick={() => addField(t)}>
                          <Plus className="h-3 w-3 mr-1" />{FIELD_TYPE_LABELS[t]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Canvas */}
            <Card className="col-span-12 lg:col-span-6"><CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Form Canvas</CardTitle>
              {form.multiStep && (
                <Select value={String(activeStep)} onValueChange={(v) => setActiveStep(Number(v))}>
                  <SelectTrigger className="w-48 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{form.steps.map((s, i) => <SelectItem key={s.id} value={String(i)}>Step {i + 1}: {s.title}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </CardHeader>
              <CardContent className="space-y-2 min-h-[400px]">
                {stepFields.length === 0 && <div className="text-sm text-muted-foreground border-2 border-dashed border-border rounded-md p-8 text-center">Add fields from the left panel to start building.</div>}
                {stepFields.map((f) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={() => onDragStart(f.id)}
                    onDragOver={(e) => onDragOver(e, f.id)}
                    onDrop={() => onDrop(f.id)}
                    onClick={() => setSelectedId(f.id)}
                    className={`group rounded-md border ${selectedId === f.id ? "border-primary" : "border-border"} ${dragOverId === f.id ? "bg-secondary" : "bg-card"} p-3 cursor-pointer`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <button onClick={(e) => { e.stopPropagation(); updateField(f.id, { collapsed: !f.collapsed }); }} className="text-muted-foreground">
                        {f.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <span className="text-xs uppercase text-muted-foreground">{FIELD_TYPE_LABELS[f.type]}</span>
                      <span className="font-medium text-sm truncate">{f.label || "(untitled)"}</span>
                      {f.required && <Badge variant="outline" className="text-[10px]">required</Badge>}
                      {f.hidden && <Badge variant="outline" className="text-[10px]">hidden</Badge>}
                      <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateField(f.id, { hidden: !f.hidden }); }}>
                          {f.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); duplicateField(f.id); }}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeField(f.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {!f.collapsed && (
                      <div className="mt-2 pl-6 text-xs text-muted-foreground">
                        <span className="font-mono">name={f.name}</span>{f.placeholder ? ` · placeholder=${f.placeholder}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Settings panel */}
            <Card className="col-span-12 lg:col-span-3"><CardHeader><CardTitle className="text-sm">Field Settings</CardTitle></CardHeader>
              <CardContent>
                {!selected ? <div className="text-xs text-muted-foreground">Select a field to edit its properties.</div> :
                  <FieldSettings field={selected} steps={form.steps.length} multiStep={form.multiStep} onChange={(patch) => updateField(selected.id, patch)} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logic" className="pt-4">
          <LogicTab form={form} onChange={updateFields} />
        </TabsContent>

        <TabsContent value="steps" className="pt-4">
          <Card><CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between rounded-md border border-input p-3">
              <div><Label>Enable Multi-Step</Label><p className="text-xs text-muted-foreground">Split fields across multiple pages.</p></div>
              <Switch checked={form.multiStep} onCheckedChange={(v) => update({ multiStep: v })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-input p-3">
              <div><Label>Show Progress Bar</Label></div>
              <Switch checked={form.showProgress} onCheckedChange={(v) => update({ showProgress: v })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Steps</Label>
                <Button size="sm" variant="outline" onClick={() => update({ steps: [...form.steps, { id: uid(), title: `Step ${form.steps.length + 1}`, description: "" }] })}><Plus className="h-3 w-3 mr-1" />Add Step</Button>
              </div>
              {form.steps.map((s, i) => (
                <div key={s.id} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-14">Step {i + 1}</span>
                    <Input value={s.title} onChange={(e) => update({ steps: form.steps.map((x) => x.id === s.id ? { ...x, title: e.target.value } : x) })} />
                    <Button size="icon" variant="ghost" onClick={() => update({ steps: form.steps.filter((x) => x.id !== s.id) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <Textarea rows={2} placeholder="Step description" value={s.description ?? ""} onChange={(e) => update({ steps: form.steps.map((x) => x.id === s.id ? { ...x, description: e.target.value } : x) })} />
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="design" className="pt-4">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <Card className="xl:col-span-3">
              <CardHeader><CardTitle className="text-sm">Design Controls</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Legacy Background</Label><Input type="color" value={form.design.background} onChange={(e) => update({ design: { ...form.design, background: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>Legacy Container Width: {form.design.containerWidth}px</Label><Slider min={360} max={1200} step={20} value={[form.design.containerWidth]} onValueChange={(v) => update({ design: { ...form.design, containerWidth: v[0] } })} /></div>
                  <div className="space-y-2"><Label>Input Style</Label>
                    <Select value={form.design.inputStyle} onValueChange={(v) => update({ design: { ...form.design, inputStyle: v as LeadForm["design"]["inputStyle"] } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="outline">Outline</SelectItem><SelectItem value="filled">Filled</SelectItem><SelectItem value="underline">Underline</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Label Position</Label>
                    <Select value={form.design.labelPosition} onValueChange={(v) => update({ design: { ...form.design, labelPosition: v as LeadForm["design"]["labelPosition"] } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="top">Top</SelectItem><SelectItem value="left">Left</SelectItem><SelectItem value="floating">Floating</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Button Style</Label>
                    <Select value={form.design.buttonStyle} onValueChange={(v) => update({ design: { ...form.design, buttonStyle: v as LeadForm["design"]["buttonStyle"] } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="rounded">Rounded</SelectItem><SelectItem value="square">Square</SelectItem><SelectItem value="pill">Pill</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Border Radius: {form.design.radius}px</Label><Slider min={0} max={24} step={1} value={[form.design.radius]} onValueChange={(v) => update({ design: { ...form.design, radius: v[0] } })} /></div>
                  <div className="space-y-2"><Label>Spacing: {form.design.spacing}px</Label><Slider min={4} max={40} step={2} value={[form.design.spacing]} onValueChange={(v) => update({ design: { ...form.design, spacing: v[0] } })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Success Screen Message</Label><Textarea rows={2} value={form.design.successMessage} onChange={(e) => update({ design: { ...form.design, successMessage: e.target.value } })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Error Screen Message</Label><Textarea rows={2} value={form.design.errorMessage} onChange={(e) => update({ design: { ...form.design, errorMessage: e.target.value } })} /></div>
                </div>
                <FormDesignPanel form={form} onChange={update} />
              </CardContent>
            </Card>
            <Card className="xl:col-span-2 xl:sticky xl:top-4 h-fit">
              <CardHeader><CardTitle className="text-sm">Live Preview</CardTitle></CardHeader>
              <CardContent className="p-4 bg-secondary/40">
                <FormRenderer form={form} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="space-y-2"><Label>Slug</Label><Input value={form.settings.slug} onChange={(e) => update({ settings: { ...form.settings, slug: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={form.settings.status} onValueChange={(v) => update({ settings: { ...form.settings, status: v as LeadForm["settings"]["status"] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>SEO Title</Label><Input value={form.settings.seoTitle} onChange={(e) => update({ settings: { ...form.settings, seoTitle: e.target.value } })} /></div>
            <div className="space-y-2"><Label>SEO Description</Label><Input value={form.settings.seoDescription} onChange={(e) => update({ settings: { ...form.settings, seoDescription: e.target.value } })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Thank You Message</Label><Textarea rows={2} value={form.settings.thankYou} onChange={(e) => update({ settings: { ...form.settings, thankYou: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Redirect URL</Label><Input placeholder="https://…" value={form.settings.redirectUrl} onChange={(e) => update({ settings: { ...form.settings, redirectUrl: e.target.value } })} /></div>
            <div className="space-y-2"><Label>WhatsApp Redirect</Label><Input placeholder="https://wa.me/…" value={form.settings.whatsappRedirect} onChange={(e) => update({ settings: { ...form.settings, whatsappRedirect: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Notification Email</Label><Input type="email" placeholder="leads@example.com" value={form.settings.notifyEmail} onChange={(e) => update({ settings: { ...form.settings, notifyEmail: e.target.value } })} /></div>
            <div className="space-y-2"><Label>Auto-Reply From</Label><Input type="email" placeholder="no-reply@example.com" value={form.settings.autoReplyEmail} onChange={(e) => update({ settings: { ...form.settings, autoReplyEmail: e.target.value } })} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          <div className="rounded-md bg-secondary/50 p-6">
            <FormRenderer form={form} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FieldSettings({ field, steps, multiStep, onChange }: { field: FormField; steps: number; multiStep: boolean; onChange: (p: Partial<FormField>) => void }) {
  const hasOptions = ["dropdown", "multiselect", "radio", "checkbox"].includes(field.type);
  const isText = ["text", "email", "phone", "textarea"].includes(field.type);
  const isNumeric = ["number", "rating", "slider"].includes(field.type);
  return (
    <div className="space-y-3">
      <div className="space-y-1"><Label className="text-xs">Label</Label><Input value={field.label} onChange={(e) => onChange({ label: e.target.value })} /></div>
      <div className="space-y-1"><Label className="text-xs">Field Name</Label><Input value={field.name} onChange={(e) => onChange({ name: e.target.value.replace(/\s+/g, "_") })} /></div>
      {isText || field.type === "number" ? (<div className="space-y-1"><Label className="text-xs">Placeholder</Label><Input value={field.placeholder ?? ""} onChange={(e) => onChange({ placeholder: e.target.value })} /></div>) : null}
      <div className="space-y-1"><Label className="text-xs">Help Text</Label><Input value={field.helpText ?? ""} onChange={(e) => onChange({ helpText: e.target.value })} /></div>
      <div className="space-y-1"><Label className="text-xs">Default Value</Label><Input value={field.defaultValue ?? ""} onChange={(e) => onChange({ defaultValue: e.target.value })} /></div>
      <div className="flex items-center justify-between rounded-md border border-input p-2">
        <Label className="text-xs">Required</Label>
        <Switch checked={!!field.required} onCheckedChange={(v) => onChange({ required: v })} />
      </div>
      <div className="space-y-1"><Label className="text-xs">Width</Label>
        <Select value={field.width ?? "full"} onValueChange={(v) => onChange({ width: v as FormField["width"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="full">Full</SelectItem><SelectItem value="half">Half</SelectItem><SelectItem value="third">Third</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">CSS Class</Label><Input value={field.cssClass ?? ""} onChange={(e) => onChange({ cssClass: e.target.value })} /></div>
      {multiStep && (
        <div className="space-y-1"><Label className="text-xs">Step</Label>
          <Select value={String(field.step ?? 0)} onValueChange={(v) => onChange({ step: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({ length: steps }).map((_, i) => <SelectItem key={i} value={String(i)}>Step {i + 1}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {isText && (
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Min Length</Label><Input type="number" value={field.validation?.minLength ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, minLength: e.target.value ? Number(e.target.value) : undefined } })} /></div>
          <div><Label className="text-xs">Max Length</Label><Input type="number" value={field.validation?.maxLength ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, maxLength: e.target.value ? Number(e.target.value) : undefined } })} /></div>
        </div>
      )}
      {isNumeric && (
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Min</Label><Input type="number" value={field.validation?.min ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined } })} /></div>
          <div><Label className="text-xs">Max</Label><Input type="number" value={field.validation?.max ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })} /></div>
        </div>
      )}
      {isText && (
        <div className="space-y-1"><Label className="text-xs">Regex</Label><Input placeholder="^[A-Za-z]+$" value={field.validation?.regex ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, regex: e.target.value } })} /></div>
      )}
      <div className="space-y-1"><Label className="text-xs">Custom Error Message</Label><Input value={field.validation?.errorMessage ?? ""} onChange={(e) => onChange({ validation: { ...field.validation, errorMessage: e.target.value } })} /></div>

      {hasOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label className="text-xs">Options</Label>
            <Button size="sm" variant="outline" className="h-7" onClick={() => onChange({ options: [...(field.options ?? []), { label: `Option ${(field.options?.length ?? 0) + 1}`, value: `opt${(field.options?.length ?? 0) + 1}` }] })}><Plus className="h-3 w-3" /></Button>
          </div>
          {(field.options ?? []).map((o, i) => (
            <div key={i} className="flex gap-1">
              <Input placeholder="Label" value={o.label} onChange={(e) => { const opts = [...(field.options ?? [])]; opts[i] = { ...opts[i], label: e.target.value }; onChange({ options: opts }); }} />
              <Input placeholder="Value" value={o.value} onChange={(e) => { const opts = [...(field.options ?? [])]; opts[i] = { ...opts[i], value: e.target.value }; onChange({ options: opts }); }} />
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => onChange({ options: (field.options ?? []).filter((_, j) => j !== i) })}><X className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogicTab({ form, onChange }: { form: LeadForm; onChange: (fields: FormField[]) => void }) {
  const [pick, setPick] = useState<string>(form.fields[0]?.id ?? "");
  const target = form.fields.find((f) => f.id === pick);
  const updateTarget = (patch: Partial<FormField>) => onChange(form.fields.map((f) => (f.id === pick ? { ...f, ...patch } : f)));
  const logic: LogicGroup = target?.logic ?? { action: "show", join: "AND", rules: [] };
  return (
    <Card><CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1"><Label className="text-xs">Configure logic for</Label>
          <Select value={pick} onValueChange={setPick}>
            <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
            <SelectContent>{form.fields.map((f) => <SelectItem key={f.id} value={f.id}>{f.label || f.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {target && <>
          <div className="space-y-1"><Label className="text-xs">Action</Label>
            <Select value={logic.action} onValueChange={(v) => updateTarget({ logic: { ...logic, action: v as LogicGroup["action"] } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="show">Show this field</SelectItem><SelectItem value="hide">Hide this field</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Match</Label>
            <Select value={logic.join} onValueChange={(v) => updateTarget({ logic: { ...logic, join: v as LogicGroup["join"] } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="AND">All (AND)</SelectItem><SelectItem value="OR">Any (OR)</SelectItem></SelectContent>
            </Select>
          </div>
        </>}
      </div>
      {target && (
        <div className="space-y-2">
          {logic.rules.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4"><Select value={r.fieldId} onValueChange={(v) => { const rules = [...logic.rules]; rules[i] = { ...r, fieldId: v }; updateTarget({ logic: { ...logic, rules } }); }}>
                <SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger>
                <SelectContent>{form.fields.filter((f) => f.id !== target.id).map((f) => <SelectItem key={f.id} value={f.id}>{f.label || f.name}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="col-span-3"><Select value={r.operator} onValueChange={(v) => { const rules = [...logic.rules]; rules[i] = { ...r, operator: v as LogicOperator }; updateTarget({ logic: { ...logic, rules } }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem><SelectItem value="not_equals">Not equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem><SelectItem value="gt">Greater than</SelectItem><SelectItem value="lt">Less than</SelectItem>
                </SelectContent>
              </Select></div>
              <div className="col-span-4"><Input placeholder="Value" value={r.value} onChange={(e) => { const rules = [...logic.rules]; rules[i] = { ...r, value: e.target.value }; updateTarget({ logic: { ...logic, rules } }); }} /></div>
              <div className="col-span-1"><Button size="icon" variant="ghost" onClick={() => updateTarget({ logic: { ...logic, rules: logic.rules.filter((_, j) => j !== i) } })}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => updateTarget({ logic: { ...logic, rules: [...logic.rules, { fieldId: form.fields.find((f) => f.id !== target.id)?.id ?? "", operator: "equals", value: "" }] } })}><Plus className="h-3 w-3 mr-1" />Add Rule</Button>
          {target.logic && <div className="pt-2"><Button size="sm" variant="ghost" onClick={() => updateTarget({ logic: null })}>Clear all rules</Button></div>}
        </div>
      )}
    </CardContent></Card>
  );
}