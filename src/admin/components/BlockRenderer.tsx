import { useEffect, useState } from "react";
import type { PageBlock } from "../api/lead-pages";
import { getForm } from "../api/forms-client";
import type { LeadForm } from "../api/forms";
import { FormRenderer } from "./FormRenderer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`w-full py-12 md:py-16 ${className}`}>{children}</section>;
}
function Container({ children, width }: { children: React.ReactNode; width: number }) {
  return <div className="mx-auto px-4" style={{ maxWidth: width }}>{children}</div>;
}

function LeadFormBlock({ formId, title }: { formId: string | null; title?: string }) {
  const [form, setForm] = useState<LeadForm | null>(null);
  useEffect(() => { if (formId) getForm(formId).then(setForm); else setForm(null); }, [formId]);
  if (!formId) return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No form assigned — select one in the page editor.</div>;
  if (!form) return <div className="text-sm text-muted-foreground">Loading form…</div>;
  return (
    <div id="form">
      {title && <h3 className="text-2xl font-semibold mb-4 text-center">{title}</h3>}
      <FormRenderer form={form} />
    </div>
  );
}

export function BlockRenderer({ block, containerWidth, pageFormId }: { block: PageBlock; containerWidth: number; pageFormId: string | null }) {
  const d = block.data as Record<string, unknown>;
  const str = (k: string, dflt = "") => (typeof d[k] === "string" ? (d[k] as string) : dflt);
  const num = (k: string, dflt = 0) => (typeof d[k] === "number" ? (d[k] as number) : dflt);
  const arr = <T,>(k: string): T[] => (Array.isArray(d[k]) ? (d[k] as T[]) : []);

  switch (block.type) {
    case "hero":
      return (
        <Section className="bg-secondary/30">
          <Container width={containerWidth}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{str("title", "")}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{str("subtitle", "")}</p>
                {str("ctaLabel") && <a href={str("ctaHref", "#")}><Button className="mt-6">{str("ctaLabel")}</Button></a>}
              </div>
              {str("image") && <img src={str("image")} alt="" className="rounded-lg object-cover w-full h-72 md:h-96" />}
            </div>
          </Container>
        </Section>
      );
    case "text":
      return <Section><Container width={containerWidth}><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: str("html", "") }} /></Container></Section>;
    case "image":
      return <Section><Container width={containerWidth}>{str("src") && <figure><img src={str("src")} alt={str("alt")} className="rounded-lg w-full" />{str("caption") && <figcaption className="mt-2 text-sm text-muted-foreground text-center">{str("caption")}</figcaption>}</figure>}</Container></Section>;
    case "gallery": {
      const images = arr<string>("images");
      return <Section><Container width={containerWidth}><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{images.map((src, i) => <img key={i} src={src} alt="" className="rounded-md w-full h-48 object-cover" />)}</div></Container></Section>;
    }
    case "video":
      return <Section><Container width={containerWidth}>{str("url") ? (<div className="aspect-video"><iframe src={str("url")} className="w-full h-full rounded-lg" allowFullScreen /></div>) : null}</Container></Section>;
    case "features": {
      const items = arr<{ title: string; text: string }>("items");
      return <Section><Container width={containerWidth}><div className="grid md:grid-cols-3 gap-6">{items.map((it, i) => (
        <Card key={i}><CardContent className="p-6"><h3 className="font-semibold text-lg">{it.title}</h3><p className="mt-2 text-sm text-muted-foreground">{it.text}</p></CardContent></Card>
      ))}</div></Container></Section>;
    }
    case "counter": {
      const items = arr<{ value: number; label: string }>("items");
      return <Section className="bg-primary/5"><Container width={containerWidth}><div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">{items.map((it, i) => (
        <div key={i}><div className="text-4xl font-bold text-primary">{it.value.toLocaleString()}+</div><div className="mt-1 text-sm text-muted-foreground">{it.label}</div></div>
      ))}</div></Container></Section>;
    }
    case "faq": {
      const items = arr<{ q: string; a: string }>("items");
      return <Section><Container width={containerWidth}><Accordion type="single" collapsible>{items.map((it, i) => (
        <AccordionItem key={i} value={`i${i}`}><AccordionTrigger>{it.q}</AccordionTrigger><AccordionContent>{it.a}</AccordionContent></AccordionItem>
      ))}</Accordion></Container></Section>;
    }
    case "testimonials":
      return <Section><Container width={containerWidth}><div className="text-center text-sm text-muted-foreground">Testimonials pulled from the Testimonials module.</div></Container></Section>;
    case "cta":
      return (
        <Section className="bg-primary text-primary-foreground">
          <Container width={containerWidth}>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold">{str("title")}</h2>
              <p className="text-primary-foreground/80">{str("subtitle")}</p>
              {str("ctaLabel") && <a href={str("ctaHref", "#")}><Button variant="secondary">{str("ctaLabel")}</Button></a>}
            </div>
          </Container>
        </Section>
      );
    case "map":
      return <Section><Container width={containerWidth}>{str("embed") ? (<div className="rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: str("embed") }} />) : (<div className="text-sm text-muted-foreground">Paste a Google Maps embed URL/iframe.</div>)}</Container></Section>;
    case "property_grid":
      return <Section><Container width={containerWidth}><div className="text-sm text-muted-foreground">Property grid — showing up to {num("limit", 6)} properties from the Properties module.</div></Container></Section>;
    case "blog_grid":
      return <Section><Container width={containerWidth}><div className="text-sm text-muted-foreground">Blog grid — showing up to {num("limit", 3)} latest posts.</div></Container></Section>;
    case "contact":
      return <Section><Container width={containerWidth}><div className="grid md:grid-cols-3 gap-6 text-sm">
        {str("phone") && <div><div className="font-semibold">Phone</div>{str("phone")}</div>}
        {str("email") && <div><div className="font-semibold">Email</div>{str("email")}</div>}
        {str("address") && <div><div className="font-semibold">Address</div>{str("address")}</div>}
      </div></Container></Section>;
    case "lead_form":
      return <Section><Container width={containerWidth}><LeadFormBlock formId={(d.formId as string | null) ?? pageFormId} title={str("title")} /></Container></Section>;
    case "html":
      return <Section><Container width={containerWidth}><div dangerouslySetInnerHTML={{ __html: str("html", "") }} /></Container></Section>;
    case "spacing":
      return <div style={{ height: num("height", 48) }} />;
    case "divider":
      return <Container width={containerWidth}><hr className="my-6 border-border" /></Container>;
  }
}