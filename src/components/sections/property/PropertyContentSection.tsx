import { useState } from "react";
import { Search, MapPin, LandPlot, Layers, CheckCircle2, ShieldCheck } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";
import { PlotBookingModal } from "@/components/site/PlotBookingModal";

interface PropertyContentSectionProps {
  data?: Record<string, any> | null;
  isEditable?: boolean;
  onUpdateField?: (field: string, value: any) => void;
}

export const defaultPropertyItems = [
  { img: p1, title: "Landmark City — Phase 1", location: "Purbachal, Dhaka", price: "৳ 18 Lac/katha", katha: 3, blocks: "A–D", status: "Ongoing" },
  { img: p2, title: "Riverside Township", location: "Keraniganj, Dhaka", price: "৳ 24 Lac/katha", katha: 5, blocks: "A–F", status: "Upcoming" },
  { img: p3, title: "Skyline Green Enclave", location: "Savar, Dhaka", price: "৳ 12 Lac/katha", katha: 3, blocks: "A–C", status: "Completed" },
  { img: p1, title: "Adabor Garden Plots", location: "Adabor, Dhaka", price: "৳ 22 Lac/katha", katha: 3, blocks: "A–B", status: "Ongoing" },
  { img: p2, title: "Ring Road Signature Township", location: "Mohammadpur, Dhaka", price: "৳ 28 Lac/katha", katha: 5, blocks: "A–E", status: "Upcoming" },
  { img: p3, title: "Uttara Sky Enclave", location: "Uttara, Dhaka", price: "৳ 30 Lac/katha", katha: 3, blocks: "A–C", status: "Completed" },
];

export const defaultPropertyAmenities = [
  "Wide Roads (30–60 ft)",
  "Boundary Wall & Security Gate",
  "Electricity & Utility Connections",
  "Central Drainage System",
  "24/7 Security & CCTV",
  "Mosque & Community Space",
  "Playground / Green Park",
];

export function PropertyContentSection({ data, isEditable, onUpdateField }: PropertyContentSectionProps) {
  const d = data || {};
  const searchTitle = d.searchTitle ?? "Find Your Plot";
  const facilitiesTitle = d.facilitiesTitle ?? "Project Facilities";
  const rawAmenities = Array.isArray(d.amenities) && d.amenities.length > 0 ? d.amenities : defaultPropertyAmenities;

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProjectForBooking, setSelectedProjectForBooking] = useState<string | undefined>();

  const filteredItems = defaultPropertyItems.filter((p) => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && !p.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (locationFilter !== "all" && !p.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && p.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleOpenBooking = (projectName?: string) => {
    if (isEditable) return; // don't open interactive modals in editor canvas if editing
    setSelectedProjectForBooking(projectName);
    setBookingModalOpen(true);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
      {/* Search & Filters */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("searchTitle", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition"
            >
              {searchTitle}
            </span>
          ) : (
            searchTitle
          )}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by project name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            aria-label="Filter projects by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Locations</option>
            <option value="purbachal">Purbachal</option>
            <option value="keraniganj">Keraniganj</option>
            <option value="savar">Savar</option>
            <option value="adabor">Adabor</option>
            <option value="mohammadpur">Mohammadpur</option>
            <option value="uttara">Uttara</option>
          </select>
          <select
            aria-label="Filter projects by development status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid of plots */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((p, i) => (
          <article
            key={i}
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={800}
                height={600}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                {p.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{p.location}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs">
                <span className="inline-flex items-center gap-1">
                  <LandPlot className="h-3.5 w-3.5 text-primary" /> {p.katha} Katha
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Block {p.blocks}
                </span>
                <span className="font-display font-semibold text-primary">{p.price}</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenBooking(p.title)}
                className="mt-5 w-full rounded-full bg-primary/10 py-2.5 text-center text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                Inquire & Book Plot
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Amenities highlight */}
      <div className="mt-16 rounded-3xl border border-primary/20 bg-primary/5 p-8 lg:p-12">
        <h3 className="font-display text-2xl font-semibold">
          {isEditable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateField?.("facilitiesTitle", e.currentTarget.textContent || "")}
              className="outline-none hover:bg-primary/10 px-1 rounded transition"
            >
              {facilitiesTitle}
            </span>
          ) : (
            facilitiesTitle
          )}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Every project is master-planned to provide complete civic infrastructure before handover.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rawAmenities.map((a: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...rawAmenities];
                    updated[i] = e.currentTarget.textContent || "";
                    onUpdateField?.("amenities", updated);
                  }}
                  className="outline-none hover:bg-primary/10 px-1 rounded transition"
                >
                  {a}
                </span>
              ) : (
                <span>{a}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <PlotBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedProjectName={selectedProjectForBooking}
      />
    </section>
  );
}
