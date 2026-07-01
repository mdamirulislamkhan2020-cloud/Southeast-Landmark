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
}

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