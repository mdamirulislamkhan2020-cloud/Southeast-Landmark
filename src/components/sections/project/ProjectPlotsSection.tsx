import React, { useState } from "react";
import {
  LandPlot,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ProjectPlotsSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectPlotsSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectPlotsSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "PLOT INVENTORY & INVESTMENT";
  const title = d.title ?? "Plot Sizes & Flexible Ownership Plans";
  const subtitle =
    d.subtitle ??
    "Choose from standard 3 Katha, 5 Katha, 10 Katha, and Commercial plots with transparent pricing, instant booking discounts, and flexible 36-to-60 month interest-free installment schedules.";
  const plotCtaLabel = d.ctaLabel !== undefined ? d.ctaLabel : "Book Plot Inquiry";
  const plotCtaHref = d.ctaHref ?? "#site-visit";
  const showPlotCta =
    d.showCta !== false && (d.ctaLabel === undefined || Boolean(d.ctaLabel && String(d.ctaLabel).trim().length > 0));

  // Calculator State
  const [calcPlotSize, setCalcPlotSize] = useState<3 | 5 | 10>(3);
  const [calcDownPaymentPct, setCalcDownPaymentPct] = useState<20 | 30 | 50>(30);
  const [calcMonths, setCalcMonths] = useState<36 | 48 | 60>(48);

  // Indicative base price per katha for estimation (e.g. 14 Lac per katha)
  const pricePerKathaLac = Number(d.pricePerKathaLac) || 14;
  const totalCostLac = calcPlotSize * pricePerKathaLac;
  const downPaymentLac = (totalCostLac * calcDownPaymentPct) / 100;
  const remainingAmountLac = totalCostLac - downPaymentLac;
  const monthlyInstallmentTk = Math.round((remainingAmountLac * 100000) / calcMonths / 100) * 100;

  const defaultPlotTypes = [
    {
      katha: 3,
      name: "3 Katha Residential Plot",
      dim: "approx. 2,160 sq. ft.",
      bestFor: "Nuclear Families & Duplex Homes",
      features: [
        "Optimal for 3–4 bedroom modern duplex",
        "Generous 30ft road frontage",
        "Low entry ticket & high capital liquidity",
        "Blocks B, C & D availability",
      ],
      price: "From ৳ 14 Lac / Katha",
      badge: "Most Popular",
      badgeColor: "bg-primary/10 text-primary border-primary/30",
    },
    {
      katha: 5,
      name: "5 Katha Premium Plot",
      dim: "approx. 3,600 sq. ft.",
      bestFor: "Multi-Family Homes & Garden Villas",
      features: [
        "Spacious footprint for building G+6 or villa",
        "Generous 30ft or 40ft road frontage",
        "Dedicated lawn & parking space",
        "Available in Blocks A, B & C",
      ],
      price: "From ৳ 15 Lac / Katha",
      badge: "High Growth",
      badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    },
    {
      katha: 10,
      name: "10 Katha Executive Estate",
      dim: "approx. 7,200 sq. ft.",
      bestFor: "Exclusive Estate & Institutional",
      features: [
        "Magnificent front boulevard or corner locations",
        "Unrestricted architectural design freedom",
        "Dual-road corner orientation available",
        "Block A & B Waterfront Strip",
      ],
      price: "Custom Executive Pricing",
      badge: "Signature Living",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    },
    {
      katha: 0,
      name: "Commercial Boulevard Plots",
      dim: "Custom 5 to 20 Katha",
      bestFor: "Retail, Banking, Clinics & Mixed-Use",
      features: [
        "High-visibility frontage on 60ft Grand Boulevard",
        "Direct township entrance exposure",
        "Dedicated commercial utility lines",
        "High commercial rental yields",
      ],
      price: "Strategic Commercial Valuation",
      badge: "High Yield",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    },
  ];

  const plotTypes =
    Array.isArray(d.plotTypes) && d.plotTypes.length > 0
      ? d.plotTypes
      : Array.isArray(d.items) && d.items.length > 0
      ? d.items
      : defaultPlotTypes;

  return (
    <section id="plot-options" className="w-full py-16 sm:py-24 bg-background">
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

        {/* 4 Plot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plotTypes.map((plot, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${plot.badgeColor}`}
                  >
                    {plot.badge}
                  </span>
                  <LandPlot className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <h3 className="font-display text-xl font-bold text-foreground">{plot.name}</h3>
                <span className="text-xs text-muted-foreground block mt-1">
                  {plot.dim} · {plot.bestFor}
                </span>

                <div className="mt-5 pt-4 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground block">
                    Estimated Starting Rate
                  </span>
                  <p className="font-display text-lg font-bold text-primary mt-0.5">{plot.price}</p>
                </div>

                <div className="mt-5 space-y-2">
                  {plot.features.map((feat: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/85">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {showPlotCta && (
                <div className="mt-6 pt-4 border-t border-border/60">
                  <a
                    href={plot.ctaHref || plotCtaHref}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {plot.ctaLabel || plotCtaLabel}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Installment Calculator */}
        <div className="mt-14 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                <span>Estimate Your Ownership Plan</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Flexible Monthly Installment Estimator
              </h3>
            </div>
            <span className="text-xs text-muted-foreground max-w-sm">
              Tailored payment structures available with upfront one-time payment discounts and
              mutation assistance.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Plot Size Selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  1. Select Plot Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([3, 5, 10] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCalcPlotSize(size)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        calcPlotSize === size
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="text-lg font-display block">{size} Katha</span>
                      <span className="text-[11px] text-muted-foreground">Residential</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Payment % Selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  2. Select Down Payment Share
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([20, 30, 50] as const).map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCalcDownPaymentPct(pct)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        calcDownPaymentPct === pct
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {pct}% Down Payment
                    </button>
                  ))}
                </div>
              </div>

              {/* Installment Term (Months) */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  3. Installment Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([36, 48, 60] as const).map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setCalcMonths(months)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        calcMonths === months
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {months} Months ({months / 12} Years)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="lg:col-span-5 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 space-y-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Estimated Breakdown ({calcPlotSize} Katha Plot)
              </span>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Approximate Total Value:</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ৳ {totalCostLac} Lac
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Down Payment ({calcDownPaymentPct}%):</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ৳ {downPaymentLac} Lac
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Remaining Financed Amount:</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ৳ {remainingAmountLac} Lac
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Repayment Tenure:</span>
                  <span className="text-foreground font-semibold">
                    {calcMonths} Equal Installments
                  </span>
                </div>
              </div>

              <div className="border-t border-primary/20 pt-4">
                <span className="text-[11px] text-muted-foreground block">
                  Estimated Monthly Installment
                </span>
                <p className="font-display text-3xl font-bold text-primary tabular-nums mt-1">
                  ৳ {monthlyInstallmentTk.toLocaleString("en-BD")}
                  <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="#site-visit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Confirm Plot & Schedule Visit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
