import React, { useState } from "react";
import {
  Compass,
  MapPin,
  ExternalLink,
  Navigation,
  ShieldCheck,
  Clock,
  Layers,
  Car,
} from "lucide-react";

interface ProjectLocationSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectLocationSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectLocationSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "LOCATION";
  const title = d.title ?? "Strategic Location & Accessibility";
  const subtitle =
    d.subtitle ??
    "Situated at Bonogram, Savar—directly beside the Mirpur Embankment and Shah Ali Bridge—Southeast City balances instant arterial connectivity into the Dhaka metropolis with the tranquility of nature.";
  const mapEmbedUrl =
    d.mapEmbedUrl ||
    d.embed ||
    "https://maps.google.com/maps?q=Bonogram,+Savar,+Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed";
  const mapLink = d.mapLink || "https://maps.google.com/?q=Bonogram,+Savar,+Dhaka";
  const mapButtonLabel = d.mapButtonLabel || "View Full Map";

  const defaultCards = [
    {
      num: "01",
      title: "Bridge & River Connectivity",
      text: "Direct access to Mirpur and Uttara via the approved Shah Ali Bridge and Birulia Bridge, with the Turag River flowing alongside.",
      tag: "Shah Ali Bridge · Turag River Corridor",
    },
    {
      num: "02",
      title: "Major Highways",
      text: "Located adjacent to the 170-ft Asian Highway Road and Dhaka-Aricha Highway.",
      tag: "170-ft Asian Highway · Dhaka-Aricha Link",
    },
    {
      num: "03",
      title: "Metro & Urban Hubs",
      text: "Close to Uttara Metro Rail, Mirpur 12 (DOHS), Pallabi, Mirpur 1, and the National Zoo.",
      tag: "Uttara Metro · Mirpur 12 DOHS · Mirpur 1",
    },
    {
      num: "04",
      title: "Education & Recreation",
      text: "Near Daffodil, BRAC, City, Eastern, and Jahangirnagar Universities, with access to Nandan Park, Golap Gram, and Tamanna Park.",
      tag: "Top Universities & Nature Theme Parks",
    },
  ];

  const cards =
    Array.isArray(d.items) && d.items.length > 0
      ? d.items
      : Array.isArray(d.cards) && d.cards.length > 0
      ? d.cards
      : defaultCards;

  const [activeTransitTab, setActiveTransitTab] = useState<
    "mirpur" | "uttara" | "gabtoli" | "savar"
  >("mirpur");

  const transitTimes = {
    mirpur: {
      route: "Via Shah Ali Bridge & Mirpur Embankment Bypass",
      time: "10–15 Minutes",
      distance: "6.5 km",
      landmarks: "Mirpur 1, Sony Square, Botanical Garden & National Zoo",
    },
    uttara: {
      route: "Via Ashulia Embankment & Western Bypass",
      time: "20–25 Minutes",
      distance: "14 km",
      landmarks: "Uttara Sector 10/18, Metro Rail Depot & Diabari",
    },
    gabtoli: {
      route: "Via Mazar Road & Ring Road Embankment",
      time: "12–18 Minutes",
      distance: "8 km",
      landmarks: "Gabtoli Bus Terminal, Technical More & Shyamoli",
    },
    savar: {
      route: "Via Dhaka-Aricha National Highway",
      time: "15 Minutes",
      distance: "9 km",
      landmarks: "Savar Cantonment, Jahangirnagar University & City Center",
    },
  };

  return (
    <section id="location" className="w-full py-16 sm:py-24 bg-card/40 border-b border-border/60">
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

        {/* Main Grid: Left Map / Right Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Interactive Visual Location Map */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-border/70 bg-card shadow-sm group">
              <iframe
                title="Southeast City Location Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                className="w-full h-full border-0 filter contrast-[1.02]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Pin badge overlay */}
              <div className="absolute top-4 left-4 rounded-xl bg-background/90 px-3.5 py-2 backdrop-blur-md border border-border/80 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-semibold text-foreground">Southeast City</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Bonogram, Savar (Beside Mirpur Zoo)
                </p>
              </div>

              {/* Open in Google Maps affordance */}
              <a
                href="https://maps.google.com/?q=Bonogram,+Savar,+Dhaka"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl bg-background/90 px-3.5 py-2 text-xs font-semibold text-foreground backdrop-blur-md border border-border/80 shadow-md hover:bg-background transition-colors"
              >
                <span>View Full Map</span>
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
              </a>
            </div>

            {/* Commute Quick Navigator */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estimated Transit Corridors
                </span>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" /> Rapid City Access
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(["mirpur", "uttara", "gabtoli", "savar"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTransitTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                      activeTransitTab === tab
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    To {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="pt-2 border-t border-border/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-foreground">
                  <span className="font-semibold">{transitTimes[activeTransitTab].route}</span>
                  <span className="text-primary font-bold tabular-nums">
                    {transitTimes[activeTransitTab].time}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Key Hubs: {transitTimes[activeTransitTab].landmarks}</span>
                  <span className="tabular-nums font-mono">
                    {transitTimes[activeTransitTab].distance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location Highlights */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card: any, idx: number) => {
              const num = card.num || String(idx + 1).padStart(2, "0");
              const cardTitle = card.title || "";
              const cardText = card.text || card.body || card.desc || "";
              const cardTag = card.tag || card.badge || "";
              const Icons = [Navigation, Compass, ShieldCheck, MapPin];
              const IconComp = Icons[idx % Icons.length];

              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-semibold text-primary">{num}</span>
                      <IconComp className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{cardTitle}</h3>
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                      {cardText}
                    </p>
                  </div>
                  {cardTag && (
                    <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-primary font-medium">
                      {cardTag}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
