import React from "react";
import {
  Sparkles,
  TreePine,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Users,
  Compass,
  Building,
  CheckCircle2,
} from "lucide-react";

interface ProjectAmenitiesSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export function ProjectAmenitiesSection({
  data,
  isEditable = false,
  onUpdateField,
}: ProjectAmenitiesSectionProps) {
  const d = data || {};
  const eyebrow = d.eyebrow ?? "AMENITIES & LIFESTYLE";
  const title = d.title ?? "Designed for a Complete Township Lifestyle";
  const subtitle =
    d.subtitle ??
    "From daily spiritual peace to children’s schooling and lakeside wellness, Southeast City provides every neighborhood comfort inside a secure gated boundary.";

  const defaultAmenities = [
    {
      icon: Building,
      title: "Grand Central Mosque & Cultural Center",
      category: "Spiritual Community",
      desc: "Centrally located multi-tier architectural mosque with dedicated ablution facilities, prayer halls for both men and women, and an Islamic learning library.",
    },
    {
      icon: TreePine,
      title: "Natural Lake & Waterfront Promenade",
      category: "Recreation & Wellness",
      desc: "Expansive natural water reservoir with lighted lakeside walking paths, wooden resting gazebos, and landscaped botanical gardens for morning exercise.",
    },
    {
      icon: GraduationCap,
      title: "Planned Comprehensive School Campus",
      category: "Education",
      desc: "Reserved 3-acre institutional zoning for an international standard English and National curriculum school, so children study safely within walking distance.",
    },
    {
      icon: HeartPulse,
      title: "Healthcare & Wellness Clinic",
      category: "Healthcare",
      desc: "Dedicated medical center with 24/7 first-aid trauma response, on-site pharmacy, diagnostic sample collection, and doctor consultation chambers.",
    },
    {
      icon: ShoppingBag,
      title: "Commercial & Daily Bazaar Arcade",
      category: "Convenience Retail",
      desc: "Convenient grocery supermarkets, daily organic vegetable stalls, bakeries, laundry services, and banking ATMs located along the 60ft Boulevard.",
    },
    {
      icon: Users,
      title: "Community Club & Event Hall",
      category: "Social Living",
      desc: "Spacious multipurpose community pavilion for family celebrations, residents’ welfare meetings, youth indoor table tennis, and social gatherings.",
    },
    {
      icon: Sparkles,
      title: "Children’s Play Park & Sports Arena",
      category: "Active Play",
      desc: "Safe rubber-matted play structures for toddlers, alongside a fenced multipurpose football and cricket turf for teenagers and friendly weekend leagues.",
    },
    {
      icon: Compass,
      title: "Green Environmental Preservation",
      category: "Ecology",
      desc: "Over 30% of total land dedicated to tree-lined avenues, native bird-friendly foliage, rain gardens, and modern zero-discharge solid waste management.",
    },
  ];

  const amenities =
    Array.isArray(d.amenities) && d.amenities.length > 0
      ? d.amenities
      : Array.isArray(d.items) && d.items.length > 0
      ? d.items
      : defaultAmenities;

  return (
    <section className="w-full py-16 sm:py-24 bg-card/30 border-y border-border/60">
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

        {/* Bento Grid of 8 Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>

                  <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>

                  <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Integrated in Master Plan</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
