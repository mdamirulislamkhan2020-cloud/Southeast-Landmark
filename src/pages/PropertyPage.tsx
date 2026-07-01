import { PageHero } from "@/components/site/PageHero";
import { MapPin, Bed, Bath, Ruler, Search } from "lucide-react";
import p1 from "@/assets/brand/property-1.jpg";
import p2 from "@/assets/brand/property-2.jpg";
import p3 from "@/assets/brand/property-3.jpg";

const items = [
  { img: p1, title: "The Landmark Residences", location: "Gulshan, Dhaka", price: "৳ 1.85 Cr", beds: 3, baths: 3, sqft: 2100 },
  { img: p2, title: "Riverside Villa Estate", location: "Bashundhara R/A, Dhaka", price: "৳ 3.20 Cr", beds: 4, baths: 4, sqft: 3400 },
  { img: p3, title: "Skyline Tower Condominium", location: "Dhanmondi, Dhaka", price: "৳ 92 Lac", beds: 2, baths: 2, sqft: 1450 },
  { img: p1, title: "Adabor Garden Homes", location: "Adabor, Dhaka", price: "৳ 78 Lac", beds: 2, baths: 2, sqft: 1250 },
  { img: p2, title: "Ring Road Signature", location: "Mohammadpur, Dhaka", price: "৳ 1.10 Cr", beds: 3, baths: 2, sqft: 1780 },
  { img: p3, title: "Uttara Sky Court", location: "Uttara, Dhaka", price: "৳ 1.45 Cr", beds: 3, baths: 3, sqft: 1950 },
];

const amenities = ["Wifi", "Bath", "Bed", "TV", "AC", "Swimming Pool", "Parking"];

export function PropertyPage() {
  return (
    <div>
      <PageHero title="Property" crumb="Property" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-primary">Search Property</h3>
            <div className="mt-4 space-y-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="What are you looking for?" className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>Select Location</option>
                <option>Gulshan</option><option>Dhanmondi</option><option>Uttara</option><option>Mohammadpur</option>
              </select>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-primary">Amenities</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {amenities.map((a) => (
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
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {p.location}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Bed className="h-4 w-4 text-primary" /> {p.beds}</span>
                  <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary" /> {p.baths}</span>
                  <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> {p.sqft} sqft</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}