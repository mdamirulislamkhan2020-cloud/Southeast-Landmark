export type IntegrationKey =
  | "gtm" | "ga4" | "google_ads" | "facebook_pixel" | "meta_capi"
  | "search_console" | "bing_webmaster" | "smtp" | "whatsapp"
  | "google_maps" | "recaptcha_v3" | "cloudflare_turnstile"
  | "mailchimp" | "webhook";

export type FieldKind = "text" | "password" | "number" | "textarea" | "select" | "switch";

export interface IntegrationField {
  id: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  helper?: string;
  kind?: FieldKind;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface IntegrationDefinition {
  key: IntegrationKey;
  name: string;
  category: "analytics" | "ads" | "search" | "email" | "messaging" | "maps" | "security" | "marketing" | "webhook";
  description?: string;
  fields: IntegrationField[];
  supportedEvents?: string[];
  helpUrl?: string;
  status?: "stable" | "placeholder";
}

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    key: "gtm", name: "Google Tag Manager", category: "analytics",
    description: "Server-side tag orchestration and dataLayer event routing.",
    fields: [{ id: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" }],
    supportedEvents: ["page_view","property_view","blog_view","lead_form_start","lead_form_submit","lead_page_view","cta_click","phone_click","whatsapp_click","email_click","newsletter_signup","login","register"],
  },
  {
    key: "ga4", name: "Google Analytics 4", category: "analytics",
    description: "Realtime and historical analytics with debug mode.",
    fields: [
      { id: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" },
      { id: "apiSecret", label: "API Secret (Measurement Protocol)", secret: true },
      { id: "debugMode", label: "Debug Mode", kind: "switch", defaultValue: "false" },
    ],
    supportedEvents: ["page_view","property_view","blog_view","lead_form_submit","lead_page_view","file_download"],
  },
  {
    key: "google_ads", name: "Google Ads", category: "ads",
    description: "Conversion tracking, enhanced conversions and remarketing.",
    fields: [
      { id: "accountId", label: "Account ID", placeholder: "123-456-7890" },
      { id: "conversionId", label: "Conversion ID", placeholder: "AW-XXXXXXXXX" },
      { id: "conversionLabel", label: "Conversion Label" },
      { id: "remarketingTag", label: "Remarketing Tag ID" },
      { id: "enhancedConversion", label: "Enhanced Conversions", kind: "switch", defaultValue: "false" },
      { id: "leadEvents", label: "Lead Conversion Events", placeholder: "lead_form_submit, lead_page_view" },
      { id: "propertyEvents", label: "Property Conversion Events", placeholder: "property_view, cta_click" },
    ],
  },
  {
    key: "facebook_pixel", name: "Facebook Pixel", category: "ads",
    description: "Client-side conversion pixel for Meta advertising.",
    fields: [{ id: "pixelId", label: "Pixel ID", placeholder: "0000000000000000" }],
    supportedEvents: ["PageView","ViewContent","Lead","Contact","CompleteRegistration"],
  },
  {
    key: "meta_capi", name: "Meta Conversions API", category: "ads", status: "placeholder",
    description: "Server-side event delivery with hashed PII.",
    fields: [
      { id: "accessToken", label: "Access Token", secret: true },
      { id: "datasetId", label: "Dataset / Pixel ID" },
      { id: "testEventCode", label: "Test Event Code" },
    ],
  },
  {
    key: "search_console", name: "Google Search Console", category: "search",
    fields: [{ id: "verificationCode", label: "Verification Meta Content", helper: "The value inside the google-site-verification meta tag." }],
  },
  {
    key: "bing_webmaster", name: "Bing Webmaster Tools", category: "search",
    fields: [{ id: "verificationCode", label: "Verification Meta Content" }],
  },
  {
    key: "smtp", name: "SMTP Email", category: "email",
    description: "Outbound transactional email transport.",
    fields: [
      { id: "host", label: "Host", placeholder: "smtp.mailgun.org" },
      { id: "port", label: "Port", placeholder: "587", kind: "number" },
      { id: "encryption", label: "Encryption", kind: "select", options: [
        { value: "none", label: "None" }, { value: "ssl", label: "SSL" }, { value: "tls", label: "TLS/STARTTLS" },
      ], defaultValue: "tls" },
      { id: "username", label: "Username" },
      { id: "password", label: "Password", secret: true },
      { id: "fromEmail", label: "Sender Email", placeholder: "no-reply@example.com" },
      { id: "fromName", label: "Sender Name" },
      { id: "replyTo", label: "Reply-To Address" },
    ],
  },
  {
    key: "whatsapp", name: "WhatsApp Business", category: "messaging",
    description: "Click-to-chat and WhatsApp Business API messaging.",
    fields: [
      { id: "businessNumber", label: "Business Number", placeholder: "5511999999999" },
      { id: "countryCode", label: "Country Code", placeholder: "+55" },
      { id: "defaultMessage", label: "Default Message", kind: "textarea", placeholder: "Hi! I'd like to know more about..." },
      { id: "clickToChat", label: "Enable Click-To-Chat Widget", kind: "switch", defaultValue: "true" },
      { id: "phoneNumberId", label: "Phone Number ID (Cloud API)" },
      { id: "accessToken", label: "Access Token", secret: true },
      { id: "defaultTemplate", label: "Default Template Name" },
    ],
  },
  {
    key: "google_maps", name: "Google Maps API", category: "maps",
    fields: [
      { id: "apiKey", label: "API Key", secret: true },
      { id: "mapStyle", label: "Map Style", kind: "select", options: [
        { value: "roadmap", label: "Roadmap" }, { value: "satellite", label: "Satellite" },
        { value: "hybrid", label: "Hybrid" }, { value: "terrain", label: "Terrain" },
      ], defaultValue: "roadmap" },
      { id: "defaultLat", label: "Default Latitude", placeholder: "-23.5505", kind: "number" },
      { id: "defaultLng", label: "Default Longitude", placeholder: "-46.6333", kind: "number" },
      { id: "zoom", label: "Zoom Level", placeholder: "12", kind: "number", defaultValue: "12" },
    ],
  },
  {
    key: "recaptcha_v3", name: "Google reCAPTCHA v3", category: "security",
    fields: [{ id: "siteKey", label: "Site Key" }, { id: "secretKey", label: "Secret Key", secret: true }],
  },
  {
    key: "cloudflare_turnstile", name: "Cloudflare Turnstile", category: "security", status: "placeholder",
    fields: [{ id: "siteKey", label: "Site Key" }, { id: "secretKey", label: "Secret Key", secret: true }],
  },
  {
    key: "mailchimp", name: "Mailchimp", category: "marketing", status: "placeholder",
    fields: [{ id: "apiKey", label: "API Key", secret: true }, { id: "audienceId", label: "Audience ID" }],
  },
  {
    key: "webhook", name: "Webhook", category: "webhook",
    description: "Forward events to any HTTPS endpoint with signing and retries.",
    fields: [
      { id: "url", label: "Webhook URL", placeholder: "https://example.com/webhook" },
      { id: "authHeader", label: "Authorization Header", placeholder: "Bearer xxx" },
      { id: "secret", label: "Signing Secret", secret: true },
      { id: "retryCount", label: "Retry Count", kind: "number", defaultValue: "3" },
    ],
  },
];

export interface IntegrationConfig {
  key: IntegrationKey;
  enabled: boolean;
  values: Record<string, string>;
  lastTestedAt?: string | null;
  lastTestOk?: boolean | null;
  lastSyncAt?: string | null;
  lastError?: string | null;
}

export interface IntegrationLog {
  id: string;
  key: IntegrationKey | "global";
  level: "info" | "success" | "warn" | "error";
  action: string;
  message: string;
  at: string;
}

export interface DataLayerEntry {
  id: string;
  event: string;
  params: Record<string, unknown>;
  at: string;
}

export type TrackingEvent =
  | "page_view" | "property_view" | "blog_view"
  | "lead_form_start" | "lead_form_submit"
  | "lead_page_view" | "cta_click"
  | "whatsapp_click" | "phone_click" | "email_click"
  | "newsletter_signup" | "login" | "register";

export const TRACKING_EVENTS: { key: TrackingEvent; label: string }[] = [
  { key: "page_view", label: "Page View" },
  { key: "property_view", label: "Property View" },
  { key: "blog_view", label: "Blog View" },
  { key: "lead_form_start", label: "Lead Form Start" },
  { key: "lead_form_submit", label: "Lead Form Submit" },
  { key: "lead_page_view", label: "Lead Page View" },
  { key: "cta_click", label: "CTA Click" },
  { key: "whatsapp_click", label: "WhatsApp Click" },
  { key: "phone_click", label: "Phone Click" },
  { key: "email_click", label: "Email Click" },
  { key: "newsletter_signup", label: "Newsletter Signup" },
  { key: "login", label: "Login" },
  { key: "register", label: "Register" },
];