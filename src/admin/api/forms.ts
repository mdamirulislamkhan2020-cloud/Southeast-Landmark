export type FieldType =
  | "text" | "email" | "phone" | "number" | "textarea"
  | "dropdown" | "multiselect" | "radio" | "checkbox" | "toggle"
  | "date" | "time" | "rating" | "slider"
  | "file" | "image" | "signature" | "hidden"
  | "heading" | "paragraph" | "divider";

export type FormStatus = "draft" | "published";
export type LogicOperator = "equals" | "not_equals" | "contains" | "gt" | "lt";
export type LogicJoin = "AND" | "OR";

export interface LogicRule { fieldId: string; operator: LogicOperator; value: string }
export interface LogicGroup { action: "show" | "hide"; join: LogicJoin; rules: LogicRule[] }

export interface FieldOption { label: string; value: string }

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: string;
  options?: FieldOption[];
  validation?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    errorMessage?: string;
  };
  width?: "full" | "half" | "third";
  cssClass?: string;
  step?: number; // which step index the field belongs to
  hidden?: boolean;
  collapsed?: boolean; // editor UI only
  logic?: LogicGroup | null;
}

export interface FormStep { id: string; title: string; description?: string }

export interface FormDesign {
  background: string;
  containerWidth: number;
  inputStyle: "outline" | "filled" | "underline";
  labelPosition: "top" | "left" | "floating";
  buttonStyle: "rounded" | "square" | "pill";
  radius: number;
  spacing: number;
  successMessage: string;
  errorMessage: string;
  /** Optional advanced design tokens (added by the Enterprise Form Designer). */
  advanced?: AdvancedDesign;
}

// ---------------------------------------------------------------------------
// Advanced Design tokens — every property is optional. When absent, the
// renderer falls back to the existing defaults so legacy forms keep working.
// ---------------------------------------------------------------------------

export type Align = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
export type FontStyle = "normal" | "italic";

export interface TypographyToken {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: FontStyle;
  textTransform?: TextTransform;
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
}

export interface HeaderConfig {
  show?: boolean;
  title?: string;
  description?: string;
  showProgress?: boolean;
  showStepCounter?: boolean;
}

export interface TitleBlock extends TypographyToken {
  align?: Align;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
}

export interface DescriptionBlock extends TypographyToken {
  align?: Align;
  maxWidth?: number;
  marginBottom?: number;
}

export interface QuestionBlock extends TypographyToken {
  align?: Align;
  marginTop?: number;
  marginBottom?: number;
  requiredColor?: string;
  requiredSize?: number;
}

export interface OptionBlock extends TypographyToken {
  align?: Align;
  verticalGap?: number;
  horizontalGap?: number;
  radioGap?: number;
  checkboxGap?: number;
  labelGap?: number;
}

export interface InputBlock {
  width?: string;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  background?: string;
  color?: string;
  placeholderColor?: string;
  focusColor?: string;
  paddingX?: number;
  paddingY?: number;
}

export interface ButtonBlock {
  text?: string;
  align?: "left" | "center" | "right";
  width?: "auto" | "full" | "custom";
  widthPct?: number;
  height?: number;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  background?: string;
  hoverBackground?: string;
  borderColor?: string;
  shadow?: string;
}

export interface ContainerBlock {
  maxWidth?: number;
  width?: string;
  paddingX?: number;
  paddingY?: number;
  marginY?: number;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: string;
}

export interface SpacingBlock {
  questionGap?: number;
  optionGap?: number;
  fieldGap?: number;
  sectionGap?: number;
  buttonGap?: number;
  headerGap?: number;
}

export interface ColorsBlock {
  primary?: string;
  secondary?: string;
  accent?: string;
  requiredStar?: string;
  border?: string;
  background?: string;
  hover?: string;
}

export interface ProgressBlock {
  show?: boolean;
  height?: number;
  borderRadius?: number;
  activeColor?: string;
  inactiveColor?: string;
  showPercent?: boolean;
}

export interface AdvancedDesign {
  fontFamily?: string;
  header?: HeaderConfig;
  title?: TitleBlock;
  description?: DescriptionBlock;
  question?: QuestionBlock;
  option?: OptionBlock;
  input?: InputBlock;
  button?: ButtonBlock;
  container?: ContainerBlock;
  spacing?: SpacingBlock;
  colors?: ColorsBlock;
  progress?: ProgressBlock;
}

export const FORM_FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Hind Siliguri", value: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" },
  { label: "Noto Sans Bengali", value: "'Noto Sans Bengali', 'Hind Siliguri', system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "Poppins", value: "'Poppins', system-ui, sans-serif" },
  { label: "Roboto", value: "'Roboto', system-ui, sans-serif" },
  { label: "Montserrat", value: "'Montserrat', system-ui, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', system-ui, sans-serif" },
];

export interface FormSettings {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  thankYou: string;
  redirectUrl: string;
  whatsappRedirect: string;
  notifyEmail: string;
  autoReplyEmail: string;
  status: FormStatus;
}

export interface LeadForm {
  id: string;
  name: string;
  multiStep: boolean;
  showProgress: boolean;
  steps: FormStep[];
  fields: FormField[];
  design: FormDesign;
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text", email: "Email", phone: "Phone", number: "Number", textarea: "Textarea",
  dropdown: "Dropdown", multiselect: "Multi Select", radio: "Radio", checkbox: "Checkbox", toggle: "Toggle",
  date: "Date", time: "Time", rating: "Rating", slider: "Budget Slider",
  file: "File Upload", image: "Image Upload", signature: "Signature", hidden: "Hidden",
  heading: "Heading", paragraph: "Paragraph", divider: "Divider",
};

export const FIELD_TYPE_GROUPS: { label: string; types: FieldType[] }[] = [
  { label: "Basic", types: ["text", "email", "phone", "number", "textarea"] },
  { label: "Choice", types: ["dropdown", "multiselect", "radio", "checkbox", "toggle"] },
  { label: "Advanced", types: ["date", "time", "rating", "slider", "file", "image", "signature", "hidden"] },
  { label: "Layout", types: ["heading", "paragraph", "divider"] },
];