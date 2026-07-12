import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { fbqTrackCustomWithId, fbqTrackWithId, newEventId, setFbqAdvancedMatching, splitName } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

const WHATSAPP_URL = "https://chat.whatsapp.com/J0clS5gbuapCiSnOogGk9Y?mode=gi_t";

type Q = { id: keyof FormValues; label: string; options: string[] };

const QUESTIONS: Q[] = [
  { id: "q1", label: "আপনি কি আর্থিকভাবে নিরাপদ ভবিষ্যৎ গড়ে তুলতে চান?", options: ["হ্যাঁ", "না"] },
  { id: "q2", label: "আপনি কি আপনার সন্তানের আর্থিক নিরাপত্তা চান?", options: ["হ্যাঁ", "না"] },
  { id: "q3", label: "আপনি কি ঢাকাতে জমি কিনতে আগ্রহী?", options: ["হ্যাঁ", "না"] },
  { id: "q4", label: "একা জমি কেনার সামর্থ্য না থাকলে আপনি কি শেয়ারে জমি কিনতে চান?", options: ["হ্যাঁ", "না"] },
  { id: "q5", label: "আপনার বিনিয়োগের বাজেট কত?", options: ["৫–১০ লাখ টাকা", "১০–২০ লাখ টাকা", "২০–৫০ লাখ টাকা", "৫০ লাখ–১ কোটি টাকা"] },
  { id: "q6", label: "আপনি কত দিনের মধ্যে জমি কেনার পরিকল্পনা করছেন?", options: ["আগামী ১ মাসের মধ্যে", "আগামী ৩ মাসের মধ্যে", "আগামী ৬ মাসের মধ্যে", "শুধু তথ্য জানতে চাই"] },
  { id: "q7", label: "এই সেমিনারে অংশ নেওয়ার প্রধান কারণ কী?", options: ["নিরাপদে জমি কেনার নিয়ম জানতে চাই", "বিনিয়োগের জন্য ভালো লোকেশন সম্পর্কে জানতে চাই", "ভবিষ্যতের জন্য জমি কিনতে চাই", "শুধু শেখার জন্য অংশ নিতে চাই"] },
  { id: "q8", label: "অনলাইন সেমিনারে অংশ নিতে হলে অবশ্যই আমাদের WhatsApp গ্রুপে যোগ দিতে হবে। সেমিনারের লিংক শুধুমাত্র গ্রুপেই শেয়ার করা হবে। আপনি কি WhatsApp গ্রুপে যোগ করতে ইচ্ছুক?", options: ["হ্যাঁ, WhatsApp গ্রুপে Join করতে চাই", "না, চাই না"] },
];

const REQUIRED_MSG = "এই তথ্যটি আবশ্যক।";
const SELECT_MSG = "অনুগ্রহ করে একটি অপশন নির্বাচন করুন।";
const BD_PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

const schema = z.object({
  name: z.string().trim().min(1, REQUIRED_MSG).max(100),
  phone: z
    .string()
    .trim()
    .min(1, REQUIRED_MSG)
    .refine((v) => BD_PHONE_RE.test(v.replace(/[\s-]/g, "")), {
      message: "সঠিক বাংলাদেশি ফোন নম্বর লিখুন (যেমন 01XXXXXXXXX)।",
    }),
  jobTitle: z.string().trim().min(1, REQUIRED_MSG).max(100),
  companyName: z.string().trim().min(1, REQUIRED_MSG).max(150),
  q1: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q2: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q3: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q4: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q5: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q6: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q7: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
  q8: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
});

type FormValues = z.infer<typeof schema>;

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.67a11.83 11.83 0 0 0 5.64 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.45ZM12.05 21.5h-.01a9.65 9.65 0 0 1-4.92-1.35l-.35-.21-3.8.99 1.01-3.7-.23-.38a9.66 9.66 0 1 1 8.3 4.65Zm5.55-7.24c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.35.23-.65.08a8.14 8.14 0 0 1-2.4-1.48 8.98 8.98 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.04-1.44.25-.7.25-1.3.18-1.43-.07-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

function RadioGroup({ name, options, value, onChange, error }: { name: string; options: string[]; value?: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div role="radiogroup" aria-invalid={!!error} className="mt-4 space-y-3">
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-[17px] leading-relaxed transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <input type="radio" name={name} value={opt} checked={checked} onChange={() => onChange(opt)} className="peer sr-only" />
            <span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-primary" : "border-muted-foreground/40"}`}>
              <span className={`h-2.5 w-2.5 rounded-full bg-primary transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
            </span>
            <span className="flex-1 text-foreground">{opt}</span>
          </label>
        );
      })}
      {error && <p className="pt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function SeminarPage() {
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);
  // Guarantees Meta conversion events cannot fire twice for the same user
  // action even if the submit handler is re-entered somehow (React
  // StrictMode, double-click, dev HMR). Page refresh naturally resets this
  // because it lives in component state — the user then re-submits fresh.
  const conversionFiredRef = useRef(false);
  const { register, handleSubmit, setValue, watch, setFocus, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onSubmit" });
  const values = watch();

  const onSubmit = async (data: FormValues) => {
    const payload = {
      full_name: data.name,
      phone_number: data.phone,
      job_title: data.jobTitle,
      company_name: data.companyName,
      answers: QUESTIONS.map((q) => ({ question: q.label, answer: data[q.id] as string })),
      submitted_at: new Date().toISOString(),
    };
    try {
      const { error } = await supabase.functions.invoke("send-seminar-registration", { body: payload });
      if (error) console.error("[seminar] email invoke error:", error.message);
    } catch (err) {
      // Never block the user's successful registration on an email failure.
      console.error("[seminar] email send failed:", err);
    }
    // Meta Pixel: fire only after a successful (validated) submission,
    // and only once per component lifetime.
    if (!conversionFiredRef.current) {
      conversionFiredRef.current = true;
      const { firstName, lastName } = splitName(data.name);
      setFbqAdvancedMatching({ phone: data.phone, firstName, lastName, country: "bd" });

      const page_location = typeof window !== "undefined" ? window.location.href : "";
      const page_path = typeof window !== "undefined" ? window.location.pathname : "";

      const leadId = newEventId("Lead");
      const completeRegId = newEventId("CompleteRegistration");
      const submitAppId = newEventId("SubmitApplication");

      fbqTrackWithId("Lead", leadId, {
        content_name: "Free Seminar Registration",
        content_category: "Seminar",
        source: "Website",
        page_location,
        page_path,
      });
      fbqTrackWithId("CompleteRegistration", completeRegId, {
        registration_type: "Free Seminar",
        source: "Website",
      });
      fbqTrackWithId("SubmitApplication", submitAppId, {
        content_name: "Free Seminar Registration",
        source: "Website",
      });
      // Exposed for future CAPI implementation to reuse for deduplication.
      console.debug("[fbq] event ids", { leadId, completeRegId, submitAppId });

      // GTM dataLayer — fire once per successful submission.
      gtmPush("form_submit", { form_name: "seminar_registration", source: "Website" });
      gtmPush("seminar_registration_success", {
        registration_type: "Free Seminar",
        source: "Website",
      });
    }
    setSubmitted(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const FIELD_ORDER: (keyof FormValues)[] = [
    "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8",
    "name", "phone", "jobTitle", "companyName",
  ];

  const onInvalid = () => {
    const first = FIELD_ORDER.find((k) => errors[k]) ?? (Object.keys(errors)[0] as keyof FormValues | undefined);
    if (!first) return;
    const el = document.getElementById(first) || document.querySelector(`[data-field="${first}"]`);
    if (el && "scrollIntoView" in el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    try { setFocus(first); } catch { /* ignore */ }
  };

  const Req = () => <span aria-hidden="true" className="ml-1 text-destructive">*</span>;
  const inputBase =
    "mt-2 w-full rounded-xl border bg-background px-4 py-3 text-[16px] text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20";
  const inputCls = (invalid?: boolean) =>
    `${inputBase} ${invalid ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`;

  return (
    <main lang="bn" className="min-h-screen bg-background font-[Hind_Siliguri,'Noto_Sans_Bengali',system-ui,sans-serif] antialiased">
      <Helmet>
        <html lang="bn" />
        <title>ফ্রি অনলাইন সেমিনার রেজিস্ট্রেশন — Southeast Landmark</title>
        <meta name="description" content="নিরাপদ জমি বিনিয়োগ ও ভবিষ্যৎ সম্পদ পরিকল্পনার ফ্রি অনলাইন সেমিনারে অংশ নিতে এখনই রেজিস্ট্রেশন করুন।" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta property="og:title" content="ফ্রি অনলাইন সেমিনার রেজিস্ট্রেশন" />
        <meta property="og:description" content="নিরাপদ জমি বিনিয়োগ বিষয়ক ফ্রি অনলাইন সেমিনার। এখনই রেজিস্ট্রেশন করুন।" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="/seminar" />
      </Helmet>

      {/* Hero */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-3xl px-5 pt-10 pb-7 text-center sm:pt-14 sm:pb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" /> ফ্রি অনলাইন সেমিনার
          </span>
          <h1 className="mt-4 text-[24px] font-bold leading-[1.25] text-foreground sm:text-[30px] md:text-[34px] md:leading-[1.2]">
            আপনার ভবিষ্যৎ আরও নিরাপদ করতে নিচের ফর্মটি পূরণ করুন
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.55] text-muted-foreground sm:text-base">
            আপনি কি নিজের বার্ধক্য এবং সন্তানের আর্থিক ভবিষ্যৎ আরও নিরাপদ করতে চান?
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-[1.55] text-foreground/80 sm:text-base">
            আপনার উত্তর যদি <strong className="text-primary">"হ্যাঁ"</strong> হয়, তাহলে এই সুযোগ হাতছাড়া করবেন না।
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-5 pt-5 sm:pt-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-[17px] leading-[1.9] text-foreground/90 sm:p-8">
          <p>আমাদের ফ্রি অনলাইন সেমিনারে অংশ নিয়ে জানুন নিরাপদ ও পরিকল্পিতভাবে জমিকে আদর্শ সম্পদে রূপান্তরের গুরুত্বপূর্ণ কৌশল এবং অভিজ্ঞ পরামর্শকের দিকনির্দেশনা।</p>
          <p className="mt-4">এর মাধ্যমে আপনি আপনার সম্পদকে আরও নিরাপদ করতে পারবেন।</p>
          <p className="mt-4">এখনই WhatsApp গ্রুপে যোগ দিয়ে আপনার রেজিস্ট্রেশন সম্পন্ন করুন এবং আপনার আসন নিশ্চিত করুন।</p>
        </div>
      </section>

      {/* Form / Success */}
      <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        {submitted ? (
          <div
            ref={successRef}
            role="status"
            aria-live="polite"
            className="animate-fade-in rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-sm sm:p-12"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckIcon />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">ধন্যবাদ!</h2>
            <p className="mt-4 text-lg text-foreground/85">আপনার রেজিস্ট্রেশন সফল হয়েছে।</p>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              ফ্রি সেমিনারের আপডেট পেতে এবং সেমিনারের তারিখ, সময় ও ক্লাসে যোগ দেওয়ার লিংক পেতে অবশ্যই আমাদের WhatsApp গ্রুপে Join করুন।
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fbqTrackCustomWithId("WhatsAppGroupJoin", newEventId("WhatsAppGroupJoin"), {
                  destination: "WhatsApp Group",
                  source: "Seminar Success Screen",
                });
                gtmPush("whatsapp_group_join", {
                  destination: "WhatsApp Group",
                  source: "Seminar Success Screen",
                });
              }}
              className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-8 py-4 text-[17px] font-semibold text-white shadow-sm transition-transform hover:brightness-110 active:scale-[0.99]"
            >
              <WhatsAppIcon className="h-6 w-6" />
              WhatsApp Group এ Join করুন
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
          >
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">রেজিস্ট্রেশন ফর্ম</h2>
            <p className="mt-2 text-base text-muted-foreground">সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন।</p>

            <ol className="mt-8 space-y-10">
              {QUESTIONS.map((q, i) => (
                <li key={q.id} data-field={q.id}>
                  <p className="text-[19px] font-semibold leading-[1.6] text-foreground">
                    <span className="mr-2 text-primary">{i + 1}.</span>{q.label}<Req />
                  </p>
                  <RadioGroup
                    name={q.id}
                    options={q.options}
                    value={values[q.id] as string | undefined}
                    onChange={(v) => setValue(q.id, v, { shouldValidate: true })}
                    error={errors[q.id]?.message as string | undefined}
                  />
                </li>
              ))}
            </ol>

            <fieldset className="mt-12">
              <legend className="text-[19px] font-bold text-foreground">ব্যক্তিগত তথ্য</legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-[15px] font-semibold text-foreground">
                    Full Name<Req />
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                    className={inputCls(!!errors.name)}
                  />
                  {errors.name && <p className="pt-1.5 text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-[15px] font-semibold text-foreground">
                    Phone Number<Req />
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                    className={inputCls(!!errors.phone)}
                  />
                  {errors.phone && <p className="pt-1.5 text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div>
                  <label htmlFor="jobTitle" className="block text-[15px] font-semibold text-foreground">
                    Job Title<Req />
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    autoComplete="organization-title"
                    placeholder="Enter your job title"
                    aria-invalid={!!errors.jobTitle}
                    {...register("jobTitle")}
                    className={inputCls(!!errors.jobTitle)}
                  />
                  {errors.jobTitle && <p className="pt-1.5 text-sm text-destructive">{errors.jobTitle.message}</p>}
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-[15px] font-semibold text-foreground">
                    Company Name<Req />
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    autoComplete="organization"
                    placeholder="Enter your company name"
                    aria-invalid={!!errors.companyName}
                    {...register("companyName")}
                    className={inputCls(!!errors.companyName)}
                  />
                  {errors.companyName && <p className="pt-1.5 text-sm text-destructive">{errors.companyName.message}</p>}
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-[17px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {isSubmitting ? "সাবমিট হচ্ছে…" : "রেজিস্ট্রেশন সম্পন্ন করুন"}
            </button>
          </form>
        )}
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {["ফ্রি অনলাইন সেমিনার", "অভিজ্ঞ পরামর্শক", "নিরাপদ বিনিয়োগ বিষয়ক দিকনির্দেশনা", "সম্পূর্ণ ফ্রি রেজিস্ট্রেশন"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-[16px] text-foreground">
              <CheckIcon />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Southeast Landmark Ltd
      </footer>
    </main>
  );
}

export { SeminarPage };