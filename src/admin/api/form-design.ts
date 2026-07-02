import type { AdvancedDesign, LeadForm } from "./forms";

const TEMPLATES_LS = "sel_form_design_templates_v1";

export interface DesignTemplate {
  id: string;
  name: string;
  design: AdvancedDesign;
  createdAt: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listDesignTemplates(): DesignTemplate[] {
  return readLS<DesignTemplate[]>(TEMPLATES_LS, []);
}

export function saveDesignTemplate(name: string, design: AdvancedDesign): DesignTemplate {
  const tpl: DesignTemplate = { id: uid(), name, design, createdAt: new Date().toISOString() };
  const all = listDesignTemplates();
  all.unshift(tpl);
  writeLS(TEMPLATES_LS, all);
  return tpl;
}

export function deleteDesignTemplate(id: string) {
  writeLS(TEMPLATES_LS, listDesignTemplates().filter((t) => t.id !== id));
}

// ---------------------------------------------------------------------------
// CSS generator — produces a scoped stylesheet that applies AdvancedDesign
// tokens to the given form. The renderer wraps the form in
// `<div data-form-id="...">` and injects the returned CSS via a <style> tag.
// ---------------------------------------------------------------------------

const px = (v: number | undefined) => (typeof v === "number" ? `${v}px` : undefined);

function textBlock(sel: string, t: {
  fontFamily?: string; fontSize?: number; fontWeight?: number; fontStyle?: string;
  textTransform?: string; letterSpacing?: number; lineHeight?: number; color?: string;
  align?: string; marginTop?: number; marginBottom?: number; maxWidth?: number;
} | undefined): string {
  if (!t) return "";
  const lines: string[] = [];
  if (t.fontFamily) lines.push(`font-family:${t.fontFamily};`);
  if (t.fontSize) lines.push(`font-size:${t.fontSize}px;`);
  if (t.fontWeight) lines.push(`font-weight:${t.fontWeight};`);
  if (t.fontStyle) lines.push(`font-style:${t.fontStyle};`);
  if (t.textTransform) lines.push(`text-transform:${t.textTransform};`);
  if (typeof t.letterSpacing === "number") lines.push(`letter-spacing:${t.letterSpacing}px;`);
  if (typeof t.lineHeight === "number") lines.push(`line-height:${t.lineHeight};`);
  if (t.color) lines.push(`color:${t.color};`);
  if (t.align) lines.push(`text-align:${t.align};`);
  if (typeof t.marginTop === "number") lines.push(`margin-top:${t.marginTop}px;`);
  if (typeof t.marginBottom === "number") lines.push(`margin-bottom:${t.marginBottom}px;`);
  if (typeof t.maxWidth === "number") lines.push(`max-width:${t.maxWidth}px;`);
  return lines.length ? `${sel}{${lines.join("")}}` : "";
}

export function buildFormCss(form: LeadForm): string {
  const adv = form.design.advanced ?? {};
  const scope = `[data-form-id="${form.id}"]`;
  const out: string[] = [];

  // Root font / colors
  const rootLines: string[] = [];
  if (adv.fontFamily) rootLines.push(`font-family:${adv.fontFamily};`);
  if (adv.colors?.primary) rootLines.push(`--f-primary:${adv.colors.primary};`);
  if (adv.colors?.secondary) rootLines.push(`--f-secondary:${adv.colors.secondary};`);
  if (adv.colors?.accent) rootLines.push(`--f-accent:${adv.colors.accent};`);
  if (adv.colors?.border) rootLines.push(`--f-border:${adv.colors.border};`);
  if (adv.colors?.background) rootLines.push(`background:${adv.colors.background};`);
  if (rootLines.length) out.push(`${scope}{${rootLines.join("")}}`);

  // Container
  const c = adv.container;
  if (c) {
    const l: string[] = [];
    if (c.maxWidth) l.push(`max-width:${c.maxWidth}px;`);
    if (c.width) l.push(`width:${c.width};`);
    if (typeof c.paddingX === "number" || typeof c.paddingY === "number") {
      const py = px(c.paddingY) ?? "24px";
      const px_ = px(c.paddingX) ?? "24px";
      l.push(`padding:${py} ${px_};`);
    }
    if (typeof c.marginY === "number") l.push(`margin-top:${c.marginY}px;margin-bottom:${c.marginY}px;`);
    if (c.background) l.push(`background:${c.background};`);
    if (c.borderColor || typeof c.borderWidth === "number") {
      l.push(`border:${c.borderWidth ?? 1}px solid ${c.borderColor ?? "var(--f-border,rgba(0,0,0,.1))"};`);
    }
    if (typeof c.borderRadius === "number") l.push(`border-radius:${c.borderRadius}px;`);
    if (c.shadow) l.push(`box-shadow:${c.shadow};`);
    if (l.length) out.push(`${scope} .form-container{${l.join("")}}`);
  }

  // Spacing
  const sp = adv.spacing;
  if (sp) {
    if (typeof sp.fieldGap === "number") out.push(`${scope} .form-fields{gap:${sp.fieldGap}px;}`);
    if (typeof sp.headerGap === "number") out.push(`${scope} .form-header{margin-bottom:${sp.headerGap}px;}`);
    if (typeof sp.buttonGap === "number") out.push(`${scope} .form-actions{margin-top:${sp.buttonGap}px;}`);
    if (typeof sp.sectionGap === "number") out.push(`${scope} hr{margin-top:${sp.sectionGap}px;margin-bottom:${sp.sectionGap}px;}`);
    if (typeof sp.optionGap === "number") out.push(`${scope} .form-option{margin-bottom:${sp.optionGap}px;}`);
    if (typeof sp.questionGap === "number") out.push(`${scope} .form-field{margin-bottom:${sp.questionGap}px;}`);
  }

  // Title & Description
  out.push(textBlock(`${scope} .form-title`, adv.title));
  out.push(textBlock(`${scope} .form-description`, adv.description));

  // Question (labels)
  if (adv.question) {
    out.push(textBlock(`${scope} .form-question, ${scope} label.form-question`, adv.question));
    if (adv.question.requiredColor || adv.question.requiredSize) {
      const l: string[] = [];
      if (adv.question.requiredColor) l.push(`color:${adv.question.requiredColor};`);
      if (adv.question.requiredSize) l.push(`font-size:${adv.question.requiredSize}px;`);
      out.push(`${scope} .form-required{${l.join("")}}`);
    }
  }

  // Option
  if (adv.option) {
    out.push(textBlock(`${scope} .form-option, ${scope} .form-option label, ${scope} .form-option span`, adv.option));
    const l: string[] = [];
    if (typeof adv.option.labelGap === "number") l.push(`gap:${adv.option.labelGap}px;`);
    if (typeof adv.option.verticalGap === "number") l.push(`margin-bottom:${adv.option.verticalGap}px;`);
    if (l.length) out.push(`${scope} .form-option{${l.join("")}}`);
    if (typeof adv.option.horizontalGap === "number") {
      out.push(`${scope} .form-options-grid{gap:${adv.option.horizontalGap}px;}`);
    }
  }

  // Input
  const i = adv.input;
  if (i) {
    const l: string[] = [];
    if (i.width) l.push(`width:${i.width};`);
    if (i.height) l.push(`height:${i.height}px;`);
    if (typeof i.borderRadius === "number") l.push(`border-radius:${i.borderRadius}px;`);
    if (i.borderColor || typeof i.borderWidth === "number") {
      l.push(`border:${i.borderWidth ?? 1}px solid ${i.borderColor ?? "var(--f-border,rgba(0,0,0,.15))"};`);
    }
    if (i.background) l.push(`background:${i.background};`);
    if (i.color) l.push(`color:${i.color};`);
    if (typeof i.paddingX === "number" || typeof i.paddingY === "number") {
      l.push(`padding:${i.paddingY ?? 8}px ${i.paddingX ?? 12}px;`);
    }
    if (l.length) {
      out.push(`${scope} input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), ${scope} textarea, ${scope} [role="combobox"]{${l.join("")}}`);
    }
    if (i.placeholderColor) {
      out.push(`${scope} input::placeholder, ${scope} textarea::placeholder{color:${i.placeholderColor};opacity:1;}`);
    }
    if (i.focusColor) {
      out.push(`${scope} input:focus, ${scope} textarea:focus, ${scope} [role="combobox"]:focus{border-color:${i.focusColor};box-shadow:0 0 0 2px ${i.focusColor}33;outline:none;}`);
    }
  }

  // Button
  const b = adv.button;
  if (b) {
    const l: string[] = [];
    if (b.height) l.push(`height:${b.height}px;`);
    if (typeof b.borderRadius === "number") l.push(`border-radius:${b.borderRadius}px;`);
    if (b.fontFamily) l.push(`font-family:${b.fontFamily};`);
    if (b.fontSize) l.push(`font-size:${b.fontSize}px;`);
    if (b.fontWeight) l.push(`font-weight:${b.fontWeight};`);
    if (b.color) l.push(`color:${b.color};`);
    if (b.background) l.push(`background:${b.background};`);
    if (b.borderColor) l.push(`border:1px solid ${b.borderColor};`);
    if (b.shadow) l.push(`box-shadow:${b.shadow};`);
    if (b.width === "full") l.push(`width:100%;`);
    else if (b.width === "custom" && b.widthPct) l.push(`width:${b.widthPct}%;`);
    if (l.length) out.push(`${scope} .form-submit{${l.join("")}}`);
    if (b.hoverBackground) out.push(`${scope} .form-submit:hover{background:${b.hoverBackground};}`);
    if (b.align) {
      const j = b.align === "left" ? "flex-start" : b.align === "right" ? "flex-end" : "center";
      out.push(`${scope} .form-actions{justify-content:${j};}`);
    }
  }

  // Progress
  const pr = adv.progress;
  if (pr) {
    const l: string[] = [];
    if (pr.height) l.push(`height:${pr.height}px;`);
    if (typeof pr.borderRadius === "number") l.push(`border-radius:${pr.borderRadius}px;`);
    if (pr.inactiveColor) l.push(`background:${pr.inactiveColor};`);
    if (l.length) out.push(`${scope} .form-progress > [role="progressbar"]{${l.join("")}}`);
    if (pr.activeColor) out.push(`${scope} .form-progress > [role="progressbar"] > *{background:${pr.activeColor};}`);
  }

  return out.filter(Boolean).join("\n");
}