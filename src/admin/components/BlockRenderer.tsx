import { useEffect, useState } from "react";
import type { PageBlock } from "../api/lead-pages";
import { getForm } from "../api/forms-client";
import type { LeadForm } from "../api/forms";
import { FormRenderer } from "./FormRenderer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`w-full py-12 md:py-16 ${className}`}>{children}</section>;
}
function Container({ children, width }: { children: React.ReactNode; width: number }) {
  return <div className="mx-auto px-4" style={{ maxWidth: width }}>{children}</div>;
}

function LeadFormBlock({ formId, title }: { formId: string | null; title?: string }) {
  const [form, setForm] = useState<LeadForm | null>(null);
  useEffect(() => {
    if (formId) getForm(formId).then(setForm);
    else setForm(null);
  }, [formId]);

  if (!formId) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No form assigned — select one in the page editor.
      </div>
    );
  }
  if (!form) return <div className="text-sm text-muted-foreground text-center py-4">Loading form…</div>;
  return (
    <div id="form" className="max-w-xl mx-auto">
      {title && <h3 className="text-2xl font-semibold mb-4 text-center">{title}</h3>}
      <FormRenderer form={form} />
    </div>
  );
}

function LivePropertyGrid({ ctaHref, ctaLabel, eyebrow, title }: { ctaHref: string; ctaLabel: string; eyebrow: string; title: string }) {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setProperties(data);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {eyebrow && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mt-1">
            {title || "Featured Projects"}
          </h2>
        </div>
        {ctaLabel && (
          <a href={ctaHref || "/property"}>
            <Button variant="outline">{ctaLabel}</Button>
          </a>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length > 0 ? (
          properties.map((p) => (
            <Card key={p.id} className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="h-48 bg-muted relative overflow-hidden">
                <img
                  src={p.featured_image || p.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=70"}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded capitalize">
                  {p.status || "Ongoing"}
                </span>
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                {p.location && <p className="text-xs text-muted-foreground">{p.location}</p>}
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="pt-2">
                  <a href={`/property/${p.slug || p.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      View Project Details
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="overflow-hidden group hover:shadow-lg transition-all">
            <div className="h-48 bg-muted relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=70"
                alt="Savar Bonogram Township"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded">
                Ongoing Project
              </span>
            </div>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-bold text-lg text-foreground">Savar Bonogram Planned Township</h3>
              <p className="text-xs text-muted-foreground">Bonogram, Savar, Dhaka (Beside Mirpur National Zoo)</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Prime residential plots with wide roads, utility reservations, mutation-ready paperwork and installment facility.
              </p>
              <div className="pt-2">
                <a href="/property">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Project Details
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function LiveBlogGrid({ ctaHref, ctaLabel, eyebrow, title, subtitle }: { ctaHref: string; ctaLabel: string; eyebrow: string; title: string; subtitle: string }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setPosts(data);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {eyebrow && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mt-1">
            {title || "Latest News & Updates"}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {ctaLabel && (
          <a href={ctaHref || "/blog"}>
            <Button variant="outline">{ctaLabel}</Button>
          </a>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-2">
                {post.category && <span className="text-xs text-primary font-semibold">{post.category}</span>}
                <h3 className="font-bold text-base text-foreground">{post.title}</h3>
                {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                <a href={`/blog/${post.slug || post.id}`} className="text-xs text-primary font-semibold inline-block pt-1 hover:underline">
                  Read article →
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs text-primary font-semibold">Township Development</span>
              <h3 className="font-bold text-base text-foreground">
                Why Savar & Bonogram Are Dhaka's Fastest Emerging Residential Hubs
              </h3>
              <p className="text-xs text-muted-foreground">
                Explore strategic geographic advantages, upcoming highway connections, and long-term land valuation growth.
              </p>
              <a href="/blog" className="text-xs text-primary font-semibold inline-block pt-1 hover:underline">
                Read article →
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export function BlockRenderer({
  block,
  containerWidth,
  pageFormId,
}: {
  block: PageBlock;
  containerWidth: number;
  pageFormId: string | null;
}) {
  const d = block.data as Record<string, unknown>;
  const str = (k: string, dflt = "") => (typeof d[k] === "string" ? (d[k] as string) : dflt);
  const num = (k: string, dflt = 0) => (typeof d[k] === "number" ? (d[k] as number) : dflt);
  const arr = <T,>(k: string): T[] => (Array.isArray(d[k]) ? (d[k] as T[]) : []);

  switch (block.type) {
    case "hero": {
      const stats = arr<{ k: string; v: string }>("stats");
      return (
        <Section className="bg-secondary/30 border-b border-border/50">
          <Container width={containerWidth}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {str("eyebrow") && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {str("eyebrow")}
                  </span>
                )}
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-foreground">
                  {str("title", "")}
                </h1>
                {str("subtitle") && (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {str("subtitle")}
                  </p>
                )}
                {str("ctaLabel") && (
                  <div className="pt-2">
                    <a href={str("ctaHref", "#")}>
                      <Button size="lg">{str("ctaLabel")}</Button>
                    </a>
                  </div>
                )}
                {stats.length > 0 && (
                  <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/40">
                    {stats.map((st, i) => (
                      <div key={i}>
                        <div className="font-bold text-primary text-base md:text-lg">{st.k}</div>
                        <div className="text-xs text-muted-foreground">{st.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {str("image") ? (
                <img
                  src={str("image")}
                  alt={str("title")}
                  className="rounded-xl object-cover w-full h-72 md:h-96 shadow-md border border-border/50"
                />
              ) : null}
            </div>
          </Container>
        </Section>
      );
    }

    case "text": {
      const services = arr<string>("services");
      const hasCustomFields = str("title") || str("body") || str("body1") || str("body2") || str("eyebrow");
      return (
        <Section>
          <Container width={containerWidth}>
            {hasCustomFields ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                {str("eyebrow") && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {str("eyebrow")}
                  </span>
                )}
                {str("title") && (
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-display">
                    {str("title")}
                  </h2>
                )}
                {str("subtitle") && (
                  <p className="text-lg text-muted-foreground font-medium">{str("subtitle")}</p>
                )}
                {str("body") && (
                  <p className="text-muted-foreground leading-relaxed">{str("body")}</p>
                )}
                {str("body1") && (
                  <p className="text-muted-foreground leading-relaxed">{str("body1")}</p>
                )}
                {str("body2") && (
                  <p className="text-muted-foreground leading-relaxed">{str("body2")}</p>
                )}
                {services.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-semibold text-sm text-foreground mb-3">Our Core Services:</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {services.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {str("ctaLabel") && (
                  <div className="pt-2">
                    <a href={str("ctaHref", "#")}>
                      <Button variant="outline">{str("ctaLabel")}</Button>
                    </a>
                  </div>
                )}
              </div>
            ) : null}
            {str("html") ? (
              <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: str("html") }} />
            ) : null}
          </Container>
        </Section>
      );
    }

    case "image": {
      const src = str("src") || str("image") || str("imageUrl") || str("url") || "";
      return (
        <Section>
          <Container width={containerWidth}>
            {src ? (
              <figure>
                <img src={src} alt={str("alt")} className="rounded-lg w-full max-h-[500px] object-cover" />
                {str("caption") && (
                  <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                    {str("caption")}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border/80 p-8 text-center text-muted-foreground bg-secondary/10">
                <p className="text-sm font-medium">No image selected</p>
                <p className="text-xs mt-1">Select an image from the sidebar or media library</p>
              </div>
            )}
          </Container>
        </Section>
      );
    }

    case "gallery": {
      const images = arr<string>("images");
      return (
        <Section>
          <Container width={containerWidth}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-md w-full h-48 object-cover" />
              ))}
            </div>
          </Container>
        </Section>
      );
    }

    case "video":
      return (
        <Section>
          <Container width={containerWidth}>
            {str("url") ? (
              <div className="aspect-video">
                <iframe src={str("url")} className="w-full h-full rounded-lg" allowFullScreen />
              </div>
            ) : null}
          </Container>
        </Section>
      );

    case "features": {
      const items = arr<{ title: string; text?: string; body?: string }>("items");
      return (
        <Section>
          <Container width={containerWidth}>
            {(str("eyebrow") || str("title") || str("subtitle")) && (
              <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                {str("eyebrow") && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {str("eyebrow")}
                  </span>
                )}
                {str("title") && (
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                    {str("title")}
                  </h2>
                )}
                {str("subtitle") && (
                  <p className="text-sm md:text-base text-muted-foreground">{str("subtitle")}</p>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((it, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-2">
                    <h3 className="font-semibold text-base text-foreground">{it.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{it.body ?? it.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      );
    }

    case "counter": {
      const items = arr<{ value: string | number; label: string }>("items");
      return (
        <Section className="bg-primary/5 border-y border-primary/10">
          <Container width={containerWidth}>
            {(str("title") || str("subtitle")) && (
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
                {str("title") && (
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                    {str("title")}
                  </h2>
                )}
                {str("subtitle") && (
                  <p className="text-sm text-muted-foreground">{str("subtitle")}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {items.map((it, i) => {
                const valStr = typeof it.value === "number" ? it.value.toLocaleString() : String(it.value ?? "");
                return (
                  <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/40">
                    <div className="text-2xl md:text-4xl font-bold text-primary font-display">{valStr}</div>
                    <div className="mt-1 text-xs md:text-sm text-muted-foreground font-medium">{it.label}</div>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );
    }

    case "faq": {
      const items = arr<{ q: string; a: string }>("items");
      return (
        <Section>
          <Container width={containerWidth}>
            {(str("eyebrow") || str("title") || str("subtitle")) && (
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                {str("eyebrow") && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {str("eyebrow")}
                  </span>
                )}
                {str("title") && (
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                    {str("title")}
                  </h2>
                )}
                {str("subtitle") && (
                  <p className="text-sm text-muted-foreground">{str("subtitle")}</p>
                )}
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {items.map((it, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-foreground">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </Section>
      );
    }

    case "testimonials": {
      const items = arr<{ name?: string; role?: string; body?: string; text?: string }>("items");
      return (
        <Section className="bg-secondary/20">
          <Container width={containerWidth}>
            {(str("eyebrow") || str("title") || str("subtitle")) && (
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                {str("eyebrow") && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {str("eyebrow")}
                  </span>
                )}
                {str("title") && (
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                    {str("title")}
                  </h2>
                )}
                {str("subtitle") && (
                  <p className="text-sm text-muted-foreground">{str("subtitle")}</p>
                )}
              </div>
            )}
            {items.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((it, i) => (
                  <Card key={i} className="border-border/60">
                    <CardContent className="p-6 space-y-3">
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{it.body ?? it.text}"
                      </p>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{it.name}</div>
                        {it.role && <div className="text-xs text-primary">{it.role}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                Testimonials loaded from content manager.
              </div>
            )}
          </Container>
        </Section>
      );
    }

    case "cta":
      return (
        <Section className="bg-primary text-primary-foreground">
          <Container width={containerWidth}>
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold font-display">{str("title")}</h2>
              <p className="text-primary-foreground/85 text-sm md:text-base">{str("subtitle")}</p>
              {str("ctaLabel") && (
                <div className="pt-2">
                  <a href={str("ctaHref", "#")}>
                    <Button variant="secondary" size="lg">
                      {str("ctaLabel")}
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </Container>
        </Section>
      );

    case "map":
      return (
        <Section>
          <Container width={containerWidth}>
            {str("embed") ? (
              <div className="rounded-lg overflow-hidden border border-border" dangerouslySetInnerHTML={{ __html: str("embed") }} />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Google Maps preview container</div>
            )}
          </Container>
        </Section>
      );

    case "property_grid":
      return (
        <Section>
          <Container width={containerWidth}>
            <LivePropertyGrid
              ctaHref={str("ctaHref", "/property")}
              ctaLabel={str("ctaLabel")}
              eyebrow={str("eyebrow")}
              title={str("title", "Featured Projects")}
            />
          </Container>
        </Section>
      );

    case "blog_grid":
      return (
        <Section>
          <Container width={containerWidth}>
            <LiveBlogGrid
              ctaHref={str("ctaHref", "/blog")}
              ctaLabel={str("ctaLabel")}
              eyebrow={str("eyebrow")}
              title={str("title", "Latest News & Updates")}
              subtitle={str("subtitle")}
            />
          </Container>
        </Section>
      );

    case "contact":
      return (
        <Section>
          <Container width={containerWidth}>
            <div className="grid md:grid-cols-3 gap-6">
              {str("phone") && (
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">Phone</div>
                      <div className="text-sm text-muted-foreground mt-1">{str("phone")}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {str("email") && (
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground mt-1">{str("email")}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {str("address") && (
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">Corporate Office</div>
                      <div className="text-sm text-muted-foreground mt-1">{str("address")}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Container>
        </Section>
      );

    case "lead_form":
      return (
        <Section>
          <Container width={containerWidth}>
            <LeadFormBlock formId={(d.formId as string | null) ?? pageFormId} title={str("title")} />
          </Container>
        </Section>
      );

    case "html":
      return (
        <Section>
          <Container width={containerWidth}>
            <div dangerouslySetInnerHTML={{ __html: str("html", "") }} />
          </Container>
        </Section>
      );

    case "spacing":
      return <div style={{ height: num("height", 48) }} />;

    case "divider":
      return (
        <Container width={containerWidth}>
          <hr className="my-6 border-border" />
        </Container>
      );

    default:
      return null;
  }
}
