export type IntegrationKey =
  | "gtm" | "ga4" | "google_ads" | "facebook_pixel" | "meta_capi"
  | "search_console" | "bing_webmaster" | "smtp" | "whatsapp"
  | "google_maps" | "recaptcha_v3" | "cloudflare_turnstile"
  | "mailchimp" | "webhook";

export interface IntegrationDefinition {
  key: IntegrationKey;
  name: string;
  category: "analytics" | "ads" | "search" | "email" | "messaging" | "maps" | "security" | "marketing" | "webhook";
  fields: { id: string; label: string; placeholder?: string; secret?: boolean; helper?: string }[];
  helpUrl?: string;
  status?: "stable" | "placeholder";
}

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  { key: "gtm", name: "Google Tag Manager", category: "analytics", fields: [{ id: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" }] },
  { key: "ga4", name: "Google Analytics 4", category: "analytics", fields: [{ id: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" }] },
  { key: "google_ads", name: "Google Ads", category: "ads", fields: [{ id: "conversionId", label: "Conversion ID", placeholder: "AW-XXXXXXXXX" }, { id: "conversionLabel", label: "Conversion Label" }] },
  { key: "facebook_pixel", name: "Facebook Pixel", category: "ads", fields: [{ id: "pixelId", label: "Pixel ID", placeholder: "0000000000000000" }] },
  { key: "meta_capi", name: "Meta Conversions API", category: "ads", status: "placeholder", fields: [{ id: "accessToken", label: "Access Token", secret: true }, { id: "datasetId", label: "Dataset ID" }] },
  { key: "search_console", name: "Google Search Console", category: "search", fields: [{ id: "verificationCode", label: "Verification Meta Content", helper: "The value inside the google-site-verification meta tag." }] },
  { key: "bing_webmaster", name: "Bing Webmaster Tools", category: "search", fields: [{ id: "verificationCode", label: "Verification Meta Content" }] },
  { key: "smtp", name: "SMTP Email", category: "email", fields: [
    { id: "host", label: "Host", placeholder: "smtp.mailgun.org" },
    { id: "port", label: "Port", placeholder: "587" },
    { id: "username", label: "Username" },
    { id: "password", label: "Password", secret: true },
    { id: "fromEmail", label: "From Email" },
    { id: "fromName", label: "From Name" },
  ] },
  { key: "whatsapp", name: "WhatsApp Business", category: "messaging", fields: [
    { id: "phoneNumberId", label: "Phone Number ID" },
    { id: "accessToken", label: "Access Token", secret: true },
    { id: "defaultTemplate", label: "Default Template Name" },
  ] },
  { key: "google_maps", name: "Google Maps API", category: "maps", fields: [{ id: "apiKey", label: "API Key", secret: true }] },
  { key: "recaptcha_v3", name: "Google reCAPTCHA v3", category: "security", fields: [{ id: "siteKey", label: "Site Key" }, { id: "secretKey", label: "Secret Key", secret: true }] },
  { key: "cloudflare_turnstile", name: "Cloudflare Turnstile", category: "security", status: "placeholder", fields: [{ id: "siteKey", label: "Site Key" }, { id: "secretKey", label: "Secret Key", secret: true }] },
  { key: "mailchimp", name: "Mailchimp", category: "marketing", status: "placeholder", fields: [{ id: "apiKey", label: "API Key", secret: true }, { id: "audienceId", label: "Audience ID" }] },
  { key: "webhook", name: "Webhook URL", category: "webhook", fields: [{ id: "url", label: "Webhook URL", placeholder: "https://example.com/webhook" }, { id: "secret", label: "Signing Secret", secret: true }] },
];

export interface IntegrationConfig {
  key: IntegrationKey;
  enabled: boolean;
  values: Record<string, string>;
  lastTestedAt?: string | null;
  lastTestOk?: boolean | null;
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