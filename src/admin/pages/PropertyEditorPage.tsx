import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createProperty, getProperty, updateProperty } from "../api/properties-client";
import type { Property } from "../api/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Plus, X, Upload, Star } from "lucide-react";
import { toast } from "sonner";

function uid() { return Math.random().toString(36).slice(2, 10); }
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

// Local upload — turns files into base64 URLs (mock; real API replaces with uploaded URL).
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const empty: Partial<Property> = {
  title: "", slug: "", status: "draft", listingStatus: "available", category: "Residential",
  type: "apartment",
  location: { address: "", city: "Dhaka", area: "", lat: null, lng: null },
  featuredImage: null, gallery: [], floorPlan: null, brochureUrl: null,
  amenities: [],
  pricing: { price: 0, currency: "BDT", pricePerSqft: null, negotiable: false },
  investment: { roi: 0, paybackYears: 0, downPayment: 0, installments: 0 },
  details: { bedrooms: 0, bathrooms: 0, areaSqft: 0, floors: 1, parking: 0, yearBuilt: null },
  description: "", seo: { title: "", description: "", keywords: "" },
  leadFormId: null, featured: false,
};

export function PropertyEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Property>>(empty);
  const [autoSlug, setAutoSlug] = useState(isNew);

  const { data: existing } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id!),
    enabled: !isNew,
  });

  useEffect(() => { if (existing) { setForm(existing); setAutoSlug(false); } }, [existing]);
  useEffect(() => { if (autoSlug && form.title) setForm((f) => ({ ...f, slug: slugify(form.title!) })); }, [form.title, autoSlug]);

  const set = <K extends keyof Property>(k: K, v: Property[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setNested = <K extends keyof Property>(k: K, patch: Partial<Property[K]>) =>
    setForm((f) => ({ ...f, [k]: { ...(f[k] as object), ...patch } as Property[K] }));

  const save = async (status?: Property["status"]) => {
    try {
      const payload = { ...form, ...(status ? { status } : {}) };
      if (!payload.title) return toast.error("Title is required");
      if (isNew) {
        const created = await createProperty(payload);
        toast.success("Property created");
        qc.invalidateQueries({ queryKey: ["properties"] });
        nav(`/admin/properties/${created.id}`, { replace: true });
      } else {
        await updateProperty(id!, payload);
        toast.success("Property saved");
        qc.invalidateQueries({ queryKey: ["properties"] });
        qc.invalidateQueries({ queryKey: ["property", id] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const onFeaturedUpload = async (file: File) => set("featuredImage", await readFileAsDataUrl(file));
  const onGalleryUpload = async (files: FileList) => {
    const uploaded = await Promise.all(Array.from(files).map(async (f) => ({ id: uid(), url: await readFileAsDataUrl(f), alt: f.name })));
    set("gallery", [...(form.gallery ?? []), ...uploaded]);
  };
  const onFloorPlanUpload = async (file: File) => set("floorPlan", await readFileAsDataUrl(file));
  const onBrochureUpload = async (file: File) => set("brochureUrl", await readFileAsDataUrl(file));

  const removeGalleryImg = (imgId: string) => set("gallery", (form.gallery ?? []).filter((g) => g.id !== imgId));
  const addAmenity = () => set("amenities", [...(form.amenities ?? []), { id: uid(), label: "" }]);
  const updateAmenity = (aid: string, label: string) => set("amenities", (form.amenities ?? []).map((a) => a.id === aid ? { ...a, label } : a));
  const removeAmenity = (aid: string) => set("amenities", (form.amenities ?? []).filter((a) => a.id !== aid));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost"><Link to="/admin/properties"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <h1 className="font-display text-2xl">{isNew ? "Add Property" : "Edit Property"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save("draft")}>Save Draft</Button>
          <Button onClick={() => save("published")}><Save className="h-4 w-4 mr-1" /> Publish</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="investment">Investment</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <Card><CardContent className="p-5 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <Input value={form.slug ?? ""} onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }} />
                    <Button type="button" variant="outline" onClick={() => { setAutoSlug(true); if (form.title) set("slug", slugify(form.title)); }}>Auto</Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Residential" />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={form.type ?? "apartment"} onValueChange={(v) => set("type", v as Property["type"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="duplex">Duplex</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="plot">Plot</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={6} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Address</Label><Input value={form.location?.address ?? ""} onChange={(e) => setNested("location", { address: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Area</Label><Input value={form.location?.area ?? ""} onChange={(e) => setNested("location", { area: e.target.value })} /></div>
                  <div className="space-y-2"><Label>City</Label><Input value={form.location?.city ?? ""} onChange={(e) => setNested("location", { city: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2"><Label>Latitude</Label><Input type="number" step="any" value={form.location?.lat ?? ""} onChange={(e) => setNested("location", { lat: e.target.value ? Number(e.target.value) : null })} /></div>
                    <div className="space-y-2"><Label>Longitude</Label><Input type="number" step="any" value={form.location?.lng ?? ""} onChange={(e) => setNested("location", { lng: e.target.value ? Number(e.target.value) : null })} /></div>
                  </div>
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-4">
              <Card><CardHeader><CardTitle className="text-base">Featured Image</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {form.featuredImage ? (
                    <div className="relative w-full max-w-md">
                      <img src={form.featuredImage} alt="" className="rounded-md border border-border" />
                      <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => set("featuredImage", null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary">
                      <Upload className="h-6 w-6" /><span className="text-sm">Click to upload featured image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFeaturedUpload(e.target.files[0])} />
                    </label>
                  )}
                </CardContent>
              </Card>

              <Card><CardHeader><CardTitle className="text-base">Gallery</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary">
                    <Upload className="h-5 w-5" /><span className="text-xs">Upload multiple images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && onGalleryUpload(e.target.files)} />
                  </label>
                  {(form.gallery ?? []).length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {form.gallery!.map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={img.url} alt={img.alt ?? ""} className="aspect-square w-full rounded-md object-cover border border-border" />
                          <button onClick={() => removeGalleryImg(img.id)} className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">Floor Plan</CardTitle></CardHeader>
                  <CardContent>
                    {form.floorPlan ? (
                      <div className="relative"><img src={form.floorPlan} alt="Floor plan" className="rounded-md border border-border" />
                        <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => set("floorPlan", null)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary">
                        <Upload className="h-5 w-5" /><span className="text-xs">Upload floor plan</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFloorPlanUpload(e.target.files[0])} />
                      </label>
                    )}
                  </CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="text-base">Brochure</CardTitle></CardHeader>
                  <CardContent>
                    {form.brochureUrl ? (
                      <div className="flex items-center justify-between rounded-md border border-border p-3">
                        <a href={form.brochureUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Preview brochure</a>
                        <Button size="sm" variant="destructive" onClick={() => set("brochureUrl", null)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary">
                        <Upload className="h-5 w-5" /><span className="text-xs">Upload PDF brochure</span>
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onBrochureUpload(e.target.files[0])} />
                      </label>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card><CardContent className="p-5 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Bedrooms</Label><Input type="number" value={form.details?.bedrooms ?? 0} onChange={(e) => setNested("details", { bedrooms: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Bathrooms</Label><Input type="number" value={form.details?.bathrooms ?? 0} onChange={(e) => setNested("details", { bathrooms: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Area (sqft)</Label><Input type="number" value={form.details?.areaSqft ?? 0} onChange={(e) => setNested("details", { areaSqft: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Floors</Label><Input type="number" value={form.details?.floors ?? 1} onChange={(e) => setNested("details", { floors: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Parking</Label><Input type="number" value={form.details?.parking ?? 0} onChange={(e) => setNested("details", { parking: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Year Built</Label><Input type="number" value={form.details?.yearBuilt ?? ""} onChange={(e) => setNested("details", { yearBuilt: e.target.value ? Number(e.target.value) : null })} /></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-4">
              <Card><CardContent className="p-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Price</Label><Input type="number" value={form.pricing?.price ?? 0} onChange={(e) => setNested("pricing", { price: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Currency</Label>
                  <Select value={form.pricing?.currency ?? "BDT"} onValueChange={(v) => setNested("pricing", { currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="BDT">BDT</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Price / sqft</Label><Input type="number" value={form.pricing?.pricePerSqft ?? ""} onChange={(e) => setNested("pricing", { pricePerSqft: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.pricing?.negotiable ?? false} onCheckedChange={(v) => setNested("pricing", { negotiable: v })} />
                  <Label>Negotiable</Label>
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="investment" className="mt-4">
              <Card><CardContent className="p-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Expected ROI (%)</Label><Input type="number" value={form.investment?.roi ?? 0} onChange={(e) => setNested("investment", { roi: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Payback (years)</Label><Input type="number" value={form.investment?.paybackYears ?? 0} onChange={(e) => setNested("investment", { paybackYears: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Down Payment (%)</Label><Input type="number" value={form.investment?.downPayment ?? 0} onChange={(e) => setNested("investment", { downPayment: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Installments (months)</Label><Input type="number" value={form.investment?.installments ?? 0} onChange={(e) => setNested("investment", { installments: Number(e.target.value) })} /></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="amenities" className="mt-4">
              <Card><CardContent className="p-5 space-y-3">
                {(form.amenities ?? []).length === 0 && <p className="text-sm text-muted-foreground">No amenities yet.</p>}
                {(form.amenities ?? []).map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <Input value={a.label} onChange={(e) => updateAmenity(a.id, e.target.value)} placeholder="e.g. Swimming Pool" />
                    <Button size="icon" variant="ghost" onClick={() => removeAmenity(a.id)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addAmenity}><Plus className="h-4 w-4 mr-1" /> Add amenity</Button>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <Card><CardContent className="p-5 space-y-4">
                <div className="space-y-2"><Label>Meta title</Label><Input value={form.seo?.title ?? ""} maxLength={60} onChange={(e) => setNested("seo", { title: e.target.value })} /><p className="text-xs text-muted-foreground">{(form.seo?.title ?? "").length}/60</p></div>
                <div className="space-y-2"><Label>Meta description</Label><Textarea rows={3} value={form.seo?.description ?? ""} maxLength={160} onChange={(e) => setNested("seo", { description: e.target.value })} /><p className="text-xs text-muted-foreground">{(form.seo?.description ?? "").length}/160</p></div>
                <div className="space-y-2"><Label>Keywords</Label><Input value={form.seo?.keywords ?? ""} onChange={(e) => setNested("seo", { keywords: e.target.value })} placeholder="apartment, dhaka, mohammadpur" /></div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-5">
          <Card><CardHeader><CardTitle className="text-base">Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status ?? "draft"} onValueChange={(v) => set("status", v as Property["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Listing Status</Label>
                <Select value={form.listingStatus ?? "available"} onValueChange={(v) => set("listingStatus", v as Property["listingStatus"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /><Label>Featured</Label></div>
                <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
              </div>
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-base">Assigned Lead Form</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>Lead form ID</Label>
              <Input value={form.leadFormId ?? ""} onChange={(e) => set("leadFormId", e.target.value || null)} placeholder="e.g. contact-main" />
              <p className="text-xs text-muted-foreground">Wire to a specific lead-capture form. Form builder ships later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}