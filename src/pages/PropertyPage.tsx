import { PageHero } from "@/components/site/PageHero";
import { MapPin, LandPlot, Layers, Ruler, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";
import { blockData, CmsAssignedLeadForm, cmsList, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { usePublishedProperties } from "@/components/site/useCmsData";
import { formatBdtShort } from "@/lib/format";

const fallbackImages = [p1, p2, p3];

const amenities = [
  "Wide Roads",
  "Boundary Wall",
  "Utility Connections",
  "Drainage System",
  "Security",
  "Mosque & Community Space",
  "Playground / Park",
];

export function PropertyPage() {
  const blocks = useCmsPageBlocks("/property");
  const heroBlock = blockData(blocks, "property.hero");
  const gridBlock = blockData(blocks, "property.grid");
  const editableAmenities = cmsList<string>(gridBlock, "amenities", amenities);
  const { items, loading } = usePublishedProperties(48);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const locations = useMemo(() => Array.from(new Set(items.map((p) => p.location.area).filter(Boolean))), [items]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (locationFilter && p.location.area !== locationFilter) return false;
      if (statusFilter && p.listingStatus !== statusFilter) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.location.area.toLowerCase().includes(q) || p.location.city.toLowerCase().includes(q);
    });
  }, [items, search, locationFilter, statusFilter]);

  return (
    <div>
      <PageHero title={cmsString(heroBlock, "title", "Projects")} crumb={cmsString(heroBlock, "crumb", "Projects")} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-primary">{cmsString(gridBlock, "searchTitle", "Find Your Plot")}</h3>
            <div className="mt-4 space-y-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search project or location" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Select Location</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Project Status</option>
                <option value="available">Available</option>
                <option value="upcoming">Upcoming</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-primary">{cmsString(gridBlock, "facilitiesTitle", "Project Facilities")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {editableAmenities.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-[oklch(0.78_0.14_85)]" /> {a}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div>
          {loading ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">Loading projects…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">
              {items.length === 0 ? "No projects have been published yet." : "No projects match your filters."}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((p, i) => {
                const img = p.featuredImage || fallbackImages[i % fallbackImages.length];
                const loc = [p.location.area, p.location.city].filter(Boolean).join(", ");
                const price = formatBdtShort(p.pricing.price, p.pricing.currency);
                return (
                  <article key={p.id} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50">
                    <Link to={`/property/${p.slug}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={img} alt={p.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        {price && <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{price}</div>}
                        <div className="absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-primary capitalize">{p.listingStatus}</div>
                      </div>
                    </Link>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold"><Link to={`/property/${p.slug}`}>{p.title}</Link></h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {loc || "—"}</p>
                      <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><LandPlot className="h-4 w-4 text-primary" /> {p.details.areaSqft || 0} sqft</span>
                        <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> {p.category}</span>
                        <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> {p.type}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <Link to={`/property/${p.slug}`} className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground transition hover:brightness-110">View Project</Link>
                        <Link to="/contact" className="flex-1 rounded-full border border-primary/40 px-4 py-2 text-center text-xs font-semibold text-primary transition hover:bg-primary/5">Request Details</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <CmsAssignedLeadForm path="/property" />
    </div>
  );
}
