import { PageHero } from "@/components/site/PageHero";
import { useEffect, useRef } from "react";
import { MapPin, LandPlot, Layers, Ruler, Search } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";
import { blockData, CmsAssignedLeadForm, cmsList, cmsString, useCmsPageBlocks } from "@/components/site/useCmsPageBlocks";
import { fbqTrack } from "@/lib/fbq";

const items = [
  { img: p1, title: "Landmark City — Phase 1", location: "Purbachal, Dhaka", price: "৳ 18 Lac/katha", katha: 3, blocks: "A–D", status: "Ongoing" },
  { img: p2, title: "Riverside Township", location: "Keraniganj, Dhaka", price: "৳ 24 Lac/katha", katha: 5, blocks: "A–F", status: "Upcoming" },
  { img: p3, title: "Skyline Green Enclave", location: "Savar, Dhaka", price: "৳ 12 Lac/katha", katha: 3, blocks: "A–C", status: "Completed" },
  { img: p1, title: "Adabor Garden Plots", location: "Adabor, Dhaka", price: "৳ 22 Lac/katha", katha: 3, blocks: "A–B", status: "Ongoing" },
  { img: p2, title: "Ring Road Signature Township", location: "Mohammadpur, Dhaka", price: "৳ 28 Lac/katha", katha: 5, blocks: "A–E", status: "Upcoming" },
  { img: p3, title: "Uttara Sky Enclave", location: "Uttara, Dhaka", price: "৳ 30 Lac/katha", katha: 3, blocks: "A–C", status: "Completed" },
];

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

  // Guard against React StrictMode double-invoke of effects in dev.
  const viewContentFiredRef = useRef(false);
  useEffect(() => {
    if (viewContentFiredRef.current) return;
    viewContentFiredRef.current = true;
    fbqTrack("ViewContent", {
      content_type: "product_group",
      content_category: "Projects",
      page_title: typeof document !== "undefined" ? document.title : "",
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
  }, []);

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
                <input type="text" placeholder="Search project or location" className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>Select Location</option>
                <option>Purbachal</option><option>Keraniganj</option><option>Savar</option><option>Uttara</option><option>Mohammadpur</option>
              </select>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>Project Status</option>
                <option>Ongoing</option>
                <option>Upcoming</option>
                <option>Completed</option>
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
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((p, i) => (
            <article key={i} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:border-primary/50">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{p.price}</div>
                <div className="absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-primary">{p.status}</div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {p.location}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><LandPlot className="h-4 w-4 text-primary" /> {p.katha} katha</span>
                  <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> Blocks {p.blocks}</span>
                  <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> Planned</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button className="flex-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110">Book Site Visit</button>
                  <button className="flex-1 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5">Request Project Details</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CmsAssignedLeadForm path="/property" />
    </div>
  );
}
