import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { fbqTrackWithId, newEventId, setFbqAdvancedMatching, splitName } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

type Q = { id: keyof FormValues; label: string; options: string[] };

const QUESTIONS: Q[] = [
  { id: "q1", label: "আপনি কি আর্থিকভাবে নিরাপদ ভবিষ্যৎ গড়ে তুলতে চান?", options: ["হ্যাঁ", "না"] },
  { id: "q2", label: "আপনি কি আপনার সন্তানের আর্থিক নিরাপত্তা চান?", options: ["হ্যাঁ", "না"] },
  { id: "q3", label: "আপনি কি ঢাকার মিরপুর বেড়িবাঁধ সংলগ্ন সাভারে জমি কিনতে আগ্রহী?", options: ["হ্যাঁ", "না"] },
  { id: "q4", label: "আপনি কি সাভার এলাকায় কোনো রিয়েল এস্টেট প্রকল্প সম্পর্কে জানেন অথবা পরিদর্শন করেছেন?", options: ["হ্যাঁ, বেশ কিছু জানি ও ভিজিট করেছি", "কিছু জানি, তবে এখনো ভিজিট করিনি", "না, কিছুই জানি না"] },
  { id: "q5", label: "একা জমি কেনার সামর্থ্য না থাকলেও আপনি কি শেয়ারে জমি কিনতে চান?", options: ["হ্যাঁ", "না"] },
  { id: "q6", label: "আপনার জমি ক্রয়ের জন্য বাজেট কত?", options: ["২০–৩০ লাখ টাকা", "৩০–৫০ লাখ টাকা", "৫০ লাখ–১ কোটি টাকা"] },
  { id: "q7", label: "আপনি কত দিনের মধ্যে জমি কেনার পরিকল্পনা করছেন?", options: ["এখনই", "আগামী ১ মাসের মধ্যে", "আগামী ৩ মাসের মধ্যে", "আগামী ৬ মাসের মধ্যে", "শুধু তথ্য জানতে চাই"] },
  { id: "q8", label: "জমিকে সম্পদ হিসেবে বিবেচনা করার মূল উদ্দেশ্য কী?", options: ["স্বল্প সময়ে দ্রুত রিটার্ন পেতে চাই", "ভবিষ্যৎ আর্থিক নিরাপত্তা", "বাড়ি করার জন্য", "পুনঃবিক্রয় করে আয়"] },
  { id: "q9", label: "মূলত জমি কেনার পিছনে আপনার সবচেয়ে বড় প্রতিবন্ধকতা কী?", options: ["অতিরঞ্জিত ভবিষ্যৎ দেখায়", "কাগজপত্র নির্ভেজাল নয়", "দাম বাজেটের বাইরে"] },
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
  q9: z.string({ required_error: SELECT_MSG }).min(1, SELECT_MSG),
});

type FormValues = z.infer<typeof schema>;

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
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

export default function SoutheastCityPage() {
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);
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
      if (error) console.error("[southeast-city] email invoke error:", error.message);
    } catch (err) {
      console.error("[southeast-city] email send failed:", err);
    }

    if (!conversionFiredRef.current) {
      conversionFiredRef.current = true;
      const { firstName, lastName } = splitName(data.name);
      setFbqAdvancedMatching({ phone: data.phone, firstName, lastName, country: "bd" });

      const page_location = typeof window !== "undefined" ? window.location.href : "";
      const page_path = typeof window !== "undefined" ? window.location.pathname : "";

      fbqTrackWithId("Lead", newEventId("Lead"), {
        content_name: "Southeast City Registration",
        content_category: "Landing",
        source: "Website",
        page_location,
        page_path,
      });
      fbqTrackWithId("CompleteRegistration", newEventId("CompleteRegistration"), {
        registration_type: "Southeast City",
        source: "Website",
      });
      fbqTrackWithId("SubmitApplication", newEventId("SubmitApplication"), {
        content_name: "Southeast City Registration",
        source: "Website",
      });

      gtmPush("form_submit", { form_name: "southeast_city_registration", source: "Website" });
      gtmPush("southeast_city_registration_success", {
        registration_type: "Southeast City",
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
    "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9",
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
        <title>আপনি কি সেই ব্যক্তি? — সাউথইস্ট সিটি</title>
        <meta name="description" content="সাউথইস্ট সিটি — দূরদর্শী সম্পদ নির্মাতাদের জন্য দীর্ঘমেয়াদি স্থায়িত্ব, মূল্যবৃদ্ধির সম্ভাবনা এবং ভবিষ্যৎ প্রজন্মের সম্পদের একটি শক্ত ভিত্তি।" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta property="og:title" content="আপনি কি সেই ব্যক্তি? — সাউথইস্ট সিটি" />
        <meta property="og:description" content="সাউথইস্ট সিটি — পরিকল্পিত ইকোসিস্টেম, দীর্ঘমেয়াদি সম্পদ বৃদ্ধির সম্ভাবনা।" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="/southeast-city" />
      </Helmet>

      {/* Hero */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" /> সাউথইস্ট সিটি
          </span>
          <h1 className="mt-4 text-center text-[26px] font-bold leading-[1.3] text-foreground sm:text-[30px] md:text-[34px] md:leading-[1.25]">
            আপনি কি সেই ব্যক্তি?
          </h1>
          <ol className="mx-auto mt-6 max-w-2xl space-y-3 text-left text-[15px] leading-[1.85] text-foreground/90 sm:text-[16px]">
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold text-primary">১)</span>
              <span>যিনি শুধু জমি নয়, গড়তে চান সম্পদের ভিত্তি।</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold text-primary">২)</span>
              <span>যাঁর প্রতিটি সিদ্ধান্ত ভবিষ্যৎ প্রজন্মকে করবে আরও সুরক্ষিত।</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold text-primary">৩)</span>
              <span>যিনি সাময়িক লাভ নয়, দীর্ঘমেয়াদি সম্পদ বৃদ্ধিতে বিশ্বাসী।</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold text-primary">৪)</span>
              <span>যিনি শুধু একটি প্লট নয়, চান একটি পরিকল্পিত ইকোসিস্টেম।</span>
            </li>
          </ol>
          <div className="mt-7 rounded-2xl border border-primary/20 bg-card/70 p-6 text-left sm:p-8">
            <p className="text-[20px] font-bold leading-[1.5] text-primary sm:text-[22px]">সাউথইস্ট সিটি আপনার জন্যই।</p>
            <p className="mt-3 text-justify text-[14px] leading-[1.75] text-foreground/85 sm:text-[15px]">
              আপনাদের মতন দূরদর্শী সম্পদ নির্মাতাদের জন্য আমাদের প্রকল্প দিবে দীর্ঘমেয়াদি স্থায়িত্ব, মূল্যবৃদ্ধির সম্ভাবনা এবং ভবিষ্যৎ প্রজন্মের সম্পদের একটি শক্ত ভিত্তি।
            </p>
          </div>
        </div>
      </header>

      {/* Form / Success */}
      <section className="mx-auto max-w-3xl px-5 py-9 sm:py-12">
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
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-foreground/85">
              ফর্মটি পূরণ করার জন্য আপনাকে ধন্যবাদ।
            </p>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন, ইনশাআল্লাহ।
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
          >
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন</h2>

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
              {isSubmitting ? "সাবমিট হচ্ছে…" : "ফর্মটি জমা দিন"}
            </button>
          </form>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Southeast Landmark Ltd
      </footer>
    </main>
  );
}

export { SoutheastCityPage };