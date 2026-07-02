import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Download, Save as SaveIcon, Trash2, Upload, RotateCcw } from "lucide-react";
import {
  type AdvancedDesign, type LeadForm, type Align, type TextTransform, type FontStyle,
  FORM_FONT_FAMILIES,
} from "../api/forms";
import {
  listDesignTemplates, saveDesignTemplate, deleteDesignTemplate, type DesignTemplate,
} from "../api/form-design";

type Section = keyof AdvancedDesign;

function num(v: string) { return v === "" ? undefined : Number(v); }

export function FormDesignPanel({ form, onChange }: { form: LeadForm; onChange: (patch: Partial<LeadForm>) => void }) {
  const adv: AdvancedDesign = form.design.advanced ?? {};
  const [templates, setTemplates] = useState<DesignTemplate[]>(() => listDesignTemplates());
  const [tplName, setTplName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const patchAdv = (next: AdvancedDesign) => onChange({ design: { ...form.design, advanced: next } });
  const setSection = <K extends Section>(key: K, value: AdvancedDesign[K]) =>
    patchAdv({ ...adv, [key]: value });
  const resetSection = (key: Section) => {
    const copy = { ...adv };
    delete copy[key];
    patchAdv(copy);
  };
  const resetAll = () => patchAdv({});
  const resetTypography = () => patchAdv({ ...adv, fontFamily: undefined, title: undefined, description: undefined, question: undefined, option: undefined });
  const resetColors = () => patchAdv({ ...adv, colors: undefined });
  const resetLayout = () => patchAdv({ ...adv, container: undefined, spacing: undefined, input: undefined, button: undefined, progress: undefined });

  const doSaveTemplate = () => {
    if (!tplName.trim()) return toast.error("Give the template a name.");
    const t = saveDesignTemplate(tplName.trim(), adv);
    setTemplates([t, ...templates]);
    setTplName("");
    toast.success("Design template saved.");
  };
  const doLoadTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    patchAdv(t.design);
    toast.success(`Loaded "${t.name}".`);
  };
  const doDeleteTemplate = (id: string) => {
    deleteDesignTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };
  const doDuplicate = () => {
    const t = saveDesignTemplate(`${form.name} — Copy`, adv);
    setTemplates([t, ...templates]);
    toast.success("Design duplicated.");
  };
  const doExport = () => {
    const blob = new Blob([JSON.stringify(adv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${form.name || "form"}-design.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const doImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AdvancedDesign;
      patchAdv(parsed);
      toast.success("Design imported.");
    } catch {
      toast.error("Invalid design file.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex flex-wrap gap-2 items-center rounded-md border border-border p-3 bg-secondary/40">
        <div className="text-xs uppercase text-muted-foreground mr-2">Reset</div>
        <Button size="sm" variant="outline" onClick={resetTypography}><RotateCcw className="h-3 w-3 mr-1" />Typography</Button>
        <Button size="sm" variant="outline" onClick={resetColors}><RotateCcw className="h-3 w-3 mr-1" />Colors</Button>
        <Button size="sm" variant="outline" onClick={resetLayout}><RotateCcw className="h-3 w-3 mr-1" />Layout</Button>
        <Button size="sm" variant="destructive" onClick={resetAll}><RotateCcw className="h-3 w-3 mr-1" />Everything</Button>
        <div className="ml-auto flex gap-2 items-center flex-wrap">
          <Button size="sm" variant="outline" onClick={doDuplicate}>Duplicate Design</Button>
          <Button size="sm" variant="outline" onClick={doExport}><Download className="h-3 w-3 mr-1" />Export</Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-3 w-3 mr-1" />Import</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["header", "typography"]}>
        {/* GLOBAL TYPOGRAPHY */}
        <SectionItem value="typography" title="Global Typography">
          <Row>
            <FontField label="Font Family" value={adv.fontFamily} onChange={(v) => patchAdv({ ...adv, fontFamily: v })} />
          </Row>
        </SectionItem>

        {/* HEADER */}
        <SectionItem value="header" title="Form Header" onReset={() => resetSection("header")}>
          <Row>
            <SwitchField label="Show Form Header" checked={adv.header?.show !== false} onCheckedChange={(v) => setSection("header", { ...adv.header, show: v })} />
            <SwitchField label="Progress Bar" checked={adv.header?.showProgress !== false} onCheckedChange={(v) => setSection("header", { ...adv.header, showProgress: v })} />
            <SwitchField label="Step Counter" checked={adv.header?.showStepCounter !== false} onCheckedChange={(v) => setSection("header", { ...adv.header, showStepCounter: v })} />
          </Row>
          <Row>
            <TextField wide label="Form Title" value={adv.header?.title ?? ""} onChange={(v) => setSection("header", { ...adv.header, title: v })} />
          </Row>
          <Row>
            <TextAreaField label="Form Description" value={adv.header?.description ?? ""} onChange={(v) => setSection("header", { ...adv.header, description: v })} />
          </Row>
        </SectionItem>

        {/* TITLE */}
        <SectionItem value="title" title="Title Settings" onReset={() => resetSection("title")}>
          <TypographyRows value={adv.title ?? {}} onChange={(v) => setSection("title", v)} />
          <Row>
            <AlignField value={adv.title?.align} onChange={(v) => setSection("title", { ...adv.title, align: v })} allowJustify />
            <NumField label="Max Width (px)" value={adv.title?.maxWidth} onChange={(v) => setSection("title", { ...adv.title, maxWidth: v })} />
          </Row>
          <Row>
            <NumField label="Margin Top (px)" value={adv.title?.marginTop} onChange={(v) => setSection("title", { ...adv.title, marginTop: v })} />
            <NumField label="Margin Bottom (px)" value={adv.title?.marginBottom} onChange={(v) => setSection("title", { ...adv.title, marginBottom: v })} />
          </Row>
        </SectionItem>

        {/* DESCRIPTION */}
        <SectionItem value="description" title="Description Settings" onReset={() => resetSection("description")}>
          <TypographyRows value={adv.description ?? {}} onChange={(v) => setSection("description", v)} />
          <Row>
            <AlignField value={adv.description?.align} onChange={(v) => setSection("description", { ...adv.description, align: v })} allowJustify />
            <NumField label="Max Width (px)" value={adv.description?.maxWidth} onChange={(v) => setSection("description", { ...adv.description, maxWidth: v })} />
            <NumField label="Margin Bottom (px)" value={adv.description?.marginBottom} onChange={(v) => setSection("description", { ...adv.description, marginBottom: v })} />
          </Row>
        </SectionItem>

        {/* QUESTION */}
        <SectionItem value="question" title="Question / Label Settings" onReset={() => resetSection("question")}>
          <TypographyRows value={adv.question ?? {}} onChange={(v) => setSection("question", v)} />
          <Row>
            <AlignField value={adv.question?.align} onChange={(v) => setSection("question", { ...adv.question, align: v })} />
            <NumField label="Margin Top (px)" value={adv.question?.marginTop} onChange={(v) => setSection("question", { ...adv.question, marginTop: v })} />
            <NumField label="Margin Bottom (px)" value={adv.question?.marginBottom} onChange={(v) => setSection("question", { ...adv.question, marginBottom: v })} />
          </Row>
          <Row>
            <ColorField label="Required * Color" value={adv.question?.requiredColor} onChange={(v) => setSection("question", { ...adv.question, requiredColor: v })} />
            <NumField label="Required * Size (px)" value={adv.question?.requiredSize} onChange={(v) => setSection("question", { ...adv.question, requiredSize: v })} />
          </Row>
        </SectionItem>

        {/* OPTION */}
        <SectionItem value="option" title="Option Settings" onReset={() => resetSection("option")}>
          <TypographyRows value={adv.option ?? {}} onChange={(v) => setSection("option", v)} />
          <Row>
            <AlignField value={adv.option?.align} onChange={(v) => setSection("option", { ...adv.option, align: v })} />
            <NumField label="Vertical Gap (px)" value={adv.option?.verticalGap} onChange={(v) => setSection("option", { ...adv.option, verticalGap: v })} />
            <NumField label="Horizontal Gap (px)" value={adv.option?.horizontalGap} onChange={(v) => setSection("option", { ...adv.option, horizontalGap: v })} />
          </Row>
          <Row>
            <NumField label="Radio Gap (px)" value={adv.option?.radioGap} onChange={(v) => setSection("option", { ...adv.option, radioGap: v })} />
            <NumField label="Checkbox Gap (px)" value={adv.option?.checkboxGap} onChange={(v) => setSection("option", { ...adv.option, checkboxGap: v })} />
            <NumField label="Label Gap (px)" value={adv.option?.labelGap} onChange={(v) => setSection("option", { ...adv.option, labelGap: v })} />
          </Row>
        </SectionItem>

        {/* INPUT */}
        <SectionItem value="input" title="Input Settings" onReset={() => resetSection("input")}>
          <Row>
            <TextField label="Width (CSS)" value={adv.input?.width ?? ""} onChange={(v) => setSection("input", { ...adv.input, width: v || undefined })} placeholder="100%" />
            <NumField label="Height (px)" value={adv.input?.height} onChange={(v) => setSection("input", { ...adv.input, height: v })} />
            <NumField label="Border Radius (px)" value={adv.input?.borderRadius} onChange={(v) => setSection("input", { ...adv.input, borderRadius: v })} />
          </Row>
          <Row>
            <NumField label="Border Width (px)" value={adv.input?.borderWidth} onChange={(v) => setSection("input", { ...adv.input, borderWidth: v })} />
            <ColorField label="Border Color" value={adv.input?.borderColor} onChange={(v) => setSection("input", { ...adv.input, borderColor: v })} />
            <ColorField label="Background" value={adv.input?.background} onChange={(v) => setSection("input", { ...adv.input, background: v })} />
          </Row>
          <Row>
            <ColorField label="Text Color" value={adv.input?.color} onChange={(v) => setSection("input", { ...adv.input, color: v })} />
            <ColorField label="Placeholder Color" value={adv.input?.placeholderColor} onChange={(v) => setSection("input", { ...adv.input, placeholderColor: v })} />
            <ColorField label="Focus Color" value={adv.input?.focusColor} onChange={(v) => setSection("input", { ...adv.input, focusColor: v })} />
          </Row>
          <Row>
            <NumField label="Padding X (px)" value={adv.input?.paddingX} onChange={(v) => setSection("input", { ...adv.input, paddingX: v })} />
            <NumField label="Padding Y (px)" value={adv.input?.paddingY} onChange={(v) => setSection("input", { ...adv.input, paddingY: v })} />
          </Row>
        </SectionItem>

        {/* BUTTON */}
        <SectionItem value="button" title="Button Settings" onReset={() => resetSection("button")}>
          <Row>
            <TextField wide label="Button Text" value={adv.button?.text ?? ""} onChange={(v) => setSection("button", { ...adv.button, text: v })} placeholder="Submit" />
          </Row>
          <Row>
            <AlignField value={adv.button?.align} onChange={(v) => setSection("button", { ...adv.button, align: v as "left" | "center" | "right" })} />
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Select value={adv.button?.width ?? "auto"} onValueChange={(v) => setSection("button", { ...adv.button, width: v as "auto" | "full" | "custom" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="custom">Custom %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {adv.button?.width === "custom" && (
              <NumField label="Width %" value={adv.button?.widthPct} onChange={(v) => setSection("button", { ...adv.button, widthPct: v })} />
            )}
          </Row>
          <Row>
            <NumField label="Height (px)" value={adv.button?.height} onChange={(v) => setSection("button", { ...adv.button, height: v })} />
            <NumField label="Border Radius (px)" value={adv.button?.borderRadius} onChange={(v) => setSection("button", { ...adv.button, borderRadius: v })} />
          </Row>
          <Row>
            <FontField label="Font Family" value={adv.button?.fontFamily} onChange={(v) => setSection("button", { ...adv.button, fontFamily: v })} />
            <NumField label="Font Size (px)" value={adv.button?.fontSize} onChange={(v) => setSection("button", { ...adv.button, fontSize: v })} />
            <NumField label="Font Weight" value={adv.button?.fontWeight} onChange={(v) => setSection("button", { ...adv.button, fontWeight: v })} />
          </Row>
          <Row>
            <ColorField label="Text Color" value={adv.button?.color} onChange={(v) => setSection("button", { ...adv.button, color: v })} />
            <ColorField label="Background" value={adv.button?.background} onChange={(v) => setSection("button", { ...adv.button, background: v })} />
            <ColorField label="Hover Background" value={adv.button?.hoverBackground} onChange={(v) => setSection("button", { ...adv.button, hoverBackground: v })} />
          </Row>
          <Row>
            <ColorField label="Border Color" value={adv.button?.borderColor} onChange={(v) => setSection("button", { ...adv.button, borderColor: v })} />
            <TextField label="Shadow (CSS)" value={adv.button?.shadow ?? ""} onChange={(v) => setSection("button", { ...adv.button, shadow: v || undefined })} placeholder="0 4px 12px rgba(0,0,0,.2)" />
          </Row>
        </SectionItem>

        {/* CONTAINER */}
        <SectionItem value="container" title="Form Container" onReset={() => resetSection("container")}>
          <Row>
            <NumField label="Max Width (px)" value={adv.container?.maxWidth} onChange={(v) => setSection("container", { ...adv.container, maxWidth: v })} />
            <TextField label="Container Width (CSS)" value={adv.container?.width ?? ""} onChange={(v) => setSection("container", { ...adv.container, width: v || undefined })} placeholder="100%" />
          </Row>
          <Row>
            <NumField label="Padding X (px)" value={adv.container?.paddingX} onChange={(v) => setSection("container", { ...adv.container, paddingX: v })} />
            <NumField label="Padding Y (px)" value={adv.container?.paddingY} onChange={(v) => setSection("container", { ...adv.container, paddingY: v })} />
            <NumField label="Margin Y (px)" value={adv.container?.marginY} onChange={(v) => setSection("container", { ...adv.container, marginY: v })} />
          </Row>
          <Row>
            <ColorField label="Background" value={adv.container?.background} onChange={(v) => setSection("container", { ...adv.container, background: v })} />
            <ColorField label="Border Color" value={adv.container?.borderColor} onChange={(v) => setSection("container", { ...adv.container, borderColor: v })} />
            <NumField label="Border Width (px)" value={adv.container?.borderWidth} onChange={(v) => setSection("container", { ...adv.container, borderWidth: v })} />
          </Row>
          <Row>
            <NumField label="Border Radius (px)" value={adv.container?.borderRadius} onChange={(v) => setSection("container", { ...adv.container, borderRadius: v })} />
            <TextField label="Shadow (CSS)" value={adv.container?.shadow ?? ""} onChange={(v) => setSection("container", { ...adv.container, shadow: v || undefined })} placeholder="0 20px 40px -20px rgba(0,0,0,.35)" />
          </Row>
        </SectionItem>

        {/* SPACING */}
        <SectionItem value="spacing" title="Form Spacing" onReset={() => resetSection("spacing")}>
          <Row>
            <NumField label="Question Gap" value={adv.spacing?.questionGap} onChange={(v) => setSection("spacing", { ...adv.spacing, questionGap: v })} />
            <NumField label="Option Gap" value={adv.spacing?.optionGap} onChange={(v) => setSection("spacing", { ...adv.spacing, optionGap: v })} />
            <NumField label="Field Gap" value={adv.spacing?.fieldGap} onChange={(v) => setSection("spacing", { ...adv.spacing, fieldGap: v })} />
          </Row>
          <Row>
            <NumField label="Section Gap" value={adv.spacing?.sectionGap} onChange={(v) => setSection("spacing", { ...adv.spacing, sectionGap: v })} />
            <NumField label="Button Gap" value={adv.spacing?.buttonGap} onChange={(v) => setSection("spacing", { ...adv.spacing, buttonGap: v })} />
            <NumField label="Header Gap" value={adv.spacing?.headerGap} onChange={(v) => setSection("spacing", { ...adv.spacing, headerGap: v })} />
          </Row>
        </SectionItem>

        {/* COLORS */}
        <SectionItem value="colors" title="Form Colors" onReset={() => resetSection("colors")}>
          <Row>
            <ColorField label="Primary" value={adv.colors?.primary} onChange={(v) => setSection("colors", { ...adv.colors, primary: v })} />
            <ColorField label="Secondary" value={adv.colors?.secondary} onChange={(v) => setSection("colors", { ...adv.colors, secondary: v })} />
            <ColorField label="Accent" value={adv.colors?.accent} onChange={(v) => setSection("colors", { ...adv.colors, accent: v })} />
          </Row>
          <Row>
            <ColorField label="Required *" value={adv.colors?.requiredStar} onChange={(v) => setSection("colors", { ...adv.colors, requiredStar: v })} />
            <ColorField label="Border" value={adv.colors?.border} onChange={(v) => setSection("colors", { ...adv.colors, border: v })} />
            <ColorField label="Background" value={adv.colors?.background} onChange={(v) => setSection("colors", { ...adv.colors, background: v })} />
            <ColorField label="Hover" value={adv.colors?.hover} onChange={(v) => setSection("colors", { ...adv.colors, hover: v })} />
          </Row>
        </SectionItem>

        {/* PROGRESS */}
        <SectionItem value="progress" title="Progress Bar" onReset={() => resetSection("progress")}>
          <Row>
            <SwitchField label="Show Progress" checked={adv.progress?.show !== false} onCheckedChange={(v) => setSection("progress", { ...adv.progress, show: v })} />
            <SwitchField label="Show Percentage" checked={!!adv.progress?.showPercent} onCheckedChange={(v) => setSection("progress", { ...adv.progress, showPercent: v })} />
          </Row>
          <Row>
            <NumField label="Height (px)" value={adv.progress?.height} onChange={(v) => setSection("progress", { ...adv.progress, height: v })} />
            <NumField label="Border Radius (px)" value={adv.progress?.borderRadius} onChange={(v) => setSection("progress", { ...adv.progress, borderRadius: v })} />
          </Row>
          <Row>
            <ColorField label="Active Color" value={adv.progress?.activeColor} onChange={(v) => setSection("progress", { ...adv.progress, activeColor: v })} />
            <ColorField label="Inactive Color" value={adv.progress?.inactiveColor} onChange={(v) => setSection("progress", { ...adv.progress, inactiveColor: v })} />
          </Row>
        </SectionItem>

        {/* TEMPLATES */}
        <SectionItem value="templates" title="Save as Template">
          <Row>
            <TextField wide label="Template Name" value={tplName} onChange={setTplName} placeholder="e.g. Gold Landing" />
            <Button size="sm" onClick={doSaveTemplate}><SaveIcon className="h-3 w-3 mr-1" />Save Template</Button>
          </Row>
          {templates.length === 0 ? (
            <p className="text-xs text-muted-foreground">No saved templates yet.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => doLoadTemplate(t.id)}>Load</Button>
                  <Button size="icon" variant="ghost" onClick={() => doDeleteTemplate(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </SectionItem>
      </Accordion>
    </div>
  );
}

// --- Small primitive controls -------------------------------------------------
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">{children}</div>;
}
function SectionItem({ value, title, children, onReset }: { value: string; title: string; children: React.ReactNode; onReset?: () => void }) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-sm font-medium">
        <span className="flex-1 text-left">{title}</span>
        {onReset && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="text-[10px] uppercase text-muted-foreground hover:text-foreground mr-3"
          >Reset</button>
        )}
      </AccordionTrigger>
      <AccordionContent className="space-y-3 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}
function TextField({ label, value, onChange, placeholder, wide }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return (
    <div className={`space-y-1 ${wide ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1 md:col-span-3">
      <Label className="text-xs">{label}</Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value ?? ""} onChange={(e) => onChange(num(e.target.value))} />
    </div>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input type="color" value={value ?? "#000000"} onChange={(e) => onChange(e.target.value)} className="w-14 p-1 h-9" />
        <Input value={value ?? ""} placeholder="#000000" onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
function SwitchField({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-input p-2">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
function AlignField({ value, onChange, allowJustify }: { value: Align | undefined; onChange: (v: Align) => void; allowJustify?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Alignment</Label>
      <Select value={value ?? "left"} onValueChange={(v) => onChange(v as Align)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
          {allowJustify && <SelectItem value="justify">Justify</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
function FontField({ label, value, onChange }: { label: string; value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value ?? "__inherit"} onValueChange={(v) => onChange(v === "__inherit" ? undefined : v)}>
        <SelectTrigger><SelectValue placeholder="Inherit" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__inherit">Inherit</SelectItem>
          {FORM_FONT_FAMILIES.map((f) => <SelectItem key={f.label} value={f.value}>{f.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function TypographyRows({ value, onChange }: {
  value: {
    fontFamily?: string; fontSize?: number; fontWeight?: number; fontStyle?: FontStyle;
    textTransform?: TextTransform; letterSpacing?: number; lineHeight?: number; color?: string;
  };
  onChange: (v: typeof value) => void;
}) {
  return (
    <>
      <Row>
        <FontField label="Font Family" value={value.fontFamily} onChange={(v) => onChange({ ...value, fontFamily: v })} />
        <NumField label="Font Size (px)" value={value.fontSize} onChange={(v) => onChange({ ...value, fontSize: v })} />
        <NumField label="Font Weight" value={value.fontWeight} onChange={(v) => onChange({ ...value, fontWeight: v })} />
      </Row>
      <Row>
        <div className="space-y-1">
          <Label className="text-xs">Font Style</Label>
          <Select value={value.fontStyle ?? "normal"} onValueChange={(v) => onChange({ ...value, fontStyle: v as FontStyle })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Text Transform</Label>
          <Select value={value.textTransform ?? "none"} onValueChange={(v) => onChange({ ...value, textTransform: v as TextTransform })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="lowercase">lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ColorField label="Text Color" value={value.color} onChange={(v) => onChange({ ...value, color: v })} />
      </Row>
      <Row>
        <NumField label="Letter Spacing (px)" value={value.letterSpacing} onChange={(v) => onChange({ ...value, letterSpacing: v })} />
        <NumField label="Line Height" value={value.lineHeight} onChange={(v) => onChange({ ...value, lineHeight: v })} />
      </Row>
    </>
  );
}