import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, LandPlot, Layers, Ruler, ArrowLeft, Bed, Bath, Car, Building2, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Seo } from "@/components/site/Seo";
import { getPropertyBySlug } from "@/admin/api/properties-client";
import type { Property } from "@/admin/api/properties";
import { BlockRenderer } from "@/admin/components/BlockRenderer";
import { formatBdtShort } from "@/lib/format";

export function PropertyDetailPage() {
  const { slug = "" } = useParams();
  const [property, setProperty] = useState<Property | null | "notfound">(null);

  useEffect(() => {
    let alive = true;
    getPropertyBySlug(slug)
      .then((p) => { if (alive) setProperty(p ?? "notfound"); })
      .catch(() => { if (alive) setProperty("notfound"); });
    return () => { alive = false; };
  }, [slug]);

  if (property === null) {
    return <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">Loading project…</div>;
  }
  if (property === "notfound") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">This project isn't available or hasn't been published.</p>
        <Link to="/property" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    );
  }

  const price = formatBdtShort(property.pricing.price, property.pricing.currency);
  const loc = [property.location.area, property.location.city].filter(Boolean).join(", ");
  const gallery = [property.featuredImage, ...property.gallery.map((g) => g.url)].filter(Boolean) as string[];

  return (
    <>
      <Seo
        title={property.seo.title || `${property.title} — Southeast Landmark Ltd`}
        description={property.seo.description || property.description.slice(0, 160)}
        path={`/property/${property.slug}`}
      />
      <PageHero title={property.title} crumb="Project" />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            {gallery[0] && (
              <div className="overflow-hidden rounded-3xl border border-primary/20">
                <img src={gallery[0]} alt={property.title} className="h-full w-full object-cover" width={1600} height={900} />
              </div>
            )}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {gallery.slice(1, 9).map((src, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border/60">
                    <img src={src} alt="" loading="lazy" className="aspect-square h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">About this project</h2>
              <div className="prose prose-sm mt-4 max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: property.description || "" }} />
            </div>
            {property.amenities.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Amenities</h2>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-3">
                  {property.amenities.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border/60 bg-card px-3 py-2">{a.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-primary/25 bg-card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary capitalize">{property.listingStatus}</div>
              <h1 className="mt-2 font-display text-2xl font-semibold">{property.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {loc || property.location.address}</p>
              {price && <div className="mt-4 font-display text-3xl font-semibold text-gradient-gold">{price}</div>}
              <ul className="mt-6 space-y-3 text-sm text-foreground/85">
                <li className="flex items-center gap-2"><LandPlot className="h-4 w-4 text-primary" /> {property.details.areaSqft || 0} sqft</li>
                <li className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> {property.category} · {property.type}</li>
                {property.details.bedrooms > 0 && <li className="flex items-center gap-2"><Bed className="h-4 w-4 text-primary" /> {property.details.bedrooms} bedrooms</li>}
                {property.details.bathrooms > 0 && <li className="flex items-center gap-2"><Bath className="h-4 w-4 text-primary" /> {property.details.bathrooms} bathrooms</li>}
                {property.details.parking > 0 && <li className="flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> {property.details.parking} parking</li>}
                {property.details.floors > 0 && <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> {property.details.floors} floors</li>}
                {property.investment.roi > 0 && <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> {property.investment.roi}% projected ROI</li>}
                {property.details.yearBuilt && <li className="flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" /> Built {property.details.yearBuilt}</li>}
              </ul>
              <Link to="/contact" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                Request project details
              </Link>
              {property.brochureUrl && (
                <a href={property.brochureUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-primary/40 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5">
                  Download brochure
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>
      {property.leadFormId && (
        <BlockRenderer
          block={{ id: `${property.id}-form`, type: "lead_form", data: { formId: property.leadFormId } }}
          containerWidth={1200}
          pageFormId={property.leadFormId}
        />
      )}
    </>
  );
}