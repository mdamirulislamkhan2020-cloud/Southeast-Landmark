import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { fbqTrackWithId, newEventId, setFbqAdvancedMatching, splitName } from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";

interface ProjectSiteVisitSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
  pageFormId?: string | null;
}

const BD_PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(11, "Please enter a valid phone number")
    .refine((v) => BD_PHONE_RE.test(v.replace(/[\s-]/g, "")), {
      message: "Please enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX)",
    }),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  preferredPlotSize: z.string().min(1, "Select preferred plot size"),
  preferredDate: z.string().min(1, "Please pick a preferred date"),
  pickupLocation: z.string().min(1, "Please select pickup preference"),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProjectSiteVisitSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectSiteVisitSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "EXPERIENCE THE TOWNSHIP";
  const title = d.title ?? "Book a Guided Site Visit to Southeast City";
  const subtitle =
    d.subtitle ??
    "Experience the natural red-soil elevation, wide boulevard alignment, and calm riverside surroundings firsthand. We provide complimentary air-conditioned round-trip transport from our Dhaka hubs.";

  const formTitle = d.formTitle || "Schedule Your Tour";
  const formSubtitle =
    d.formSubtitle ||
    "Fill out this quick form and our hospitality desk will reserve your transport seat.";
  const submitButtonLabel = d.submitButtonLabel || d.buttonLabel || "Confirm Guided Site Visit";
  const phone = d.phone || "01591-134357";
  const whatsapp = d.whatsapp || "8801591134357";
  const address =
    d.address ||
    "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207";

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      preferredPlotSize: "3 Katha",
      preferredDate: "",
      pickupLocation: "Mohammadpur Corporate Office",
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const code = "VISIT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("leads").insert({
        code,
        name: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        status: "new",
        score: 90,
        source: "Southeast City Site Visit",
        form_name: "Southeast City Master Layout Visit",
        lead_page_slug: "/projects",
        answers: {
          preferredPlotSize: values.preferredPlotSize,
          preferredDate: values.preferredDate,
          pickupLocation: values.pickupLocation,
          notes: values.notes || "",
        },
      });

      if (error) {
        console.warn("[SiteVisit] Supabase lead insertion note:", error.message);
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            const offline = JSON.parse(localStorage.getItem("cms_offline_leads") || "[]");
            offline.push({
              code,
              name: values.fullName,
              phone: values.phone,
              email: values.email || "",
              answers: {
                preferredPlotSize: values.preferredPlotSize,
                preferredDate: values.preferredDate,
                pickupLocation: values.pickupLocation,
                notes: values.notes || "",
              },
              submittedAt: new Date().toISOString(),
            });
            localStorage.setItem("cms_offline_leads", JSON.stringify(offline));
          }
        } catch {
          // ignore
        }
      }

      // Track conversion
      const { firstName, lastName } = splitName(values.fullName);
      setFbqAdvancedMatching({ phone: values.phone, firstName, lastName, country: "bd" });

      const eventId = newEventId("Lead");
      fbqTrackWithId("Lead", eventId, {
        content_name: "Southeast City Site Visit",
        content_category: "Projects",
        preferred_plot_size: values.preferredPlotSize,
        pickup_location: values.pickupLocation,
        source: "Website",
      });

      gtmPush("form_submit", {
        form_name: "southeast_city_site_visit",
        plot_size: values.preferredPlotSize,
        pickup: values.pickupLocation,
      });

      setSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("[SiteVisit] Failed submission:", err);
      setSubmitError(err?.message || "Failed to submit booking. Please call our hotline directly.");
    }
  };

  return (
    <section id="site-visit" className="w-full py-16 sm:py-24 bg-card/40 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("eyebrow", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition"
              >
                {eyebrow}
              </span>
            ) : (
              eyebrow
            )}
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("title", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
              >
                {title}
              </span>
            ) : (
              title
            )}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateField?.("subtitle", e.currentTarget.textContent || "")}
                className="outline-none hover:bg-primary/10 px-1 rounded transition inline-block"
              >
                {subtitle}
              </span>
            ) : (
              subtitle
            )}
          </p>
        </div>

        {/* 2-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Inquiries & Corporate Logistics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-foreground">
                Complimentary Guided Tour Facilities
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Dedicated AC Transport</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Complimentary round-trip vehicle provided from our Mohammadpur corporate
                      office, Mirpur 1, or Gabtoli.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">On-Site Physical Verification</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Inspect the high elevation, demarcated sector boundaries, road alignment, and
                      legal clearance records in person.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Convenient Schedule</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Site tours run every Saturday through Thursday from 10:00 AM to 5:00 PM.
                      Special weekend slots available upon advance request.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Hotline Box */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Direct Inquiries & WhatsApp
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}?text=Hello,%20I%20would%20like%20to%20schedule%20a%20site%20visit%20to%20Southeast%20City`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="py-10 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-foreground">
                    Site Visit Request Received
                  </h3>
                  <p className="max-w-md mx-auto text-sm text-muted-foreground leading-relaxed">
                    Thank you! Our senior project advisor will contact you within a few hours to
                    confirm the pickup timing and transport details for Southeast City.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition"
                    >
                      Book Another Site Visit
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="border-b border-border/60 pb-4">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {isEditable ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onUpdateField?.("formTitle", e.currentTarget.textContent || "")
                          }
                          className="outline-none hover:bg-primary/10 px-1 rounded transition"
                        >
                          {formTitle}
                        </span>
                      ) : (
                        formTitle
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isEditable ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onUpdateField?.("formSubtitle", e.currentTarget.textContent || "")
                          }
                          className="outline-none hover:bg-primary/10 px-1 rounded transition"
                        >
                          {formSubtitle}
                        </span>
                      ) : (
                        formSubtitle
                      )}
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                      {submitError}
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        {...register("fullName")}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-destructive mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        {...register("phone")}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        {...register("email")}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Preferred Visit Date <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="date"
                        {...register("preferredDate")}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {errors.preferredDate && (
                        <p className="text-[11px] text-destructive mt-1">
                          {errors.preferredDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plot Size & Pickup Hub */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Interested Plot Category <span className="text-destructive">*</span>
                      </label>
                      <select
                        {...register("preferredPlotSize")}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="3 Katha">3 Katha (Residential)</option>
                        <option value="5 Katha">5 Katha (Residential)</option>
                        <option value="10 Katha">10 Katha (Executive)</option>
                        <option value="Commercial Plot">Commercial Boulevard Plot</option>
                        <option value="Undecided / Exploring">Undecided / Exploring Options</option>
                      </select>
                      {errors.preferredPlotSize && (
                        <p className="text-[11px] text-destructive mt-1">
                          {errors.preferredPlotSize.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Preferred Pickup Hub <span className="text-destructive">*</span>
                      </label>
                      <select
                        {...register("pickupLocation")}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Mohammadpur Corporate Office">
                          Mohammadpur Corporate Office (Ring Road)
                        </option>
                        <option value="Mirpur 1 (Sony Cinema Hall)">
                          Mirpur 1 (Sony Cinema Hub)
                        </option>
                        <option value="Gabtoli Bus Terminal">Gabtoli Bus Terminal</option>
                        <option value="Self-Arranged Private Transport">
                          Self-Arranged (Direct to Project)
                        </option>
                      </select>
                      {errors.pickupLocation && (
                        <p className="text-[11px] text-destructive mt-1">
                          {errors.pickupLocation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Specific Questions or Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any specific questions about facing, block preference, or installment schedule..."
                      {...register("notes")}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Booking…</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{submitButtonLabel}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
