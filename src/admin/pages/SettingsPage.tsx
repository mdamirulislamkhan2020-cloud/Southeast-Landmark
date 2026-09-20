import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DEFAULT_GLOBAL, getGlobalSettings, updateGlobalSettings } from "../api/settings-client";
import type { GlobalSettings } from "../api/settings";

export function SettingsPage() {
  const [s, setS] = useState<GlobalSettings>(DEFAULT_GLOBAL);
  useEffect(() => { getGlobalSettings().then(setS); }, []);
  const set = <K extends keyof GlobalSettings>(k: K, v: GlobalSettings[K]) => setS((prev) => ({ ...prev, [k]: v }));
  const save = async () => {
    try {
      await updateGlobalSettings(s);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Global Settings</h1><p className="text-sm text-muted-foreground">Company details used across the website.</p></div>
        <Button onClick={save}>Save Settings</Button>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="social">Socials</TabsTrigger>
          <TabsTrigger value="seo">SEO / OG</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="space-y-2 md:col-span-2"><Label>Company Name</Label><Input value={s.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea rows={2} value={s.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={s.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={s.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="space-y-2"><Label>Office Hours</Label><Input value={s.officeHours} onChange={(e) => set("officeHours", e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Copyright</Label><Input value={s.copyright} onChange={(e) => set("copyright", e.target.value)} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="social" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {(["facebook", "instagram", "linkedin", "youtube", "twitter"] as const).map((k) => (
              <div key={k} className="space-y-2"><Label className="capitalize">{k}</Label>
                <Input placeholder={`https://${k}.com/…`} value={s.socials[k]} onChange={(e) => set("socials", { ...s.socials, [k]: e.target.value })} /></div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">Default SEO</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="space-y-2"><Label>Title</Label><Input value={s.seo.title} onChange={(e) => set("seo", { ...s.seo, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={s.seo.description} onChange={(e) => set("seo", { ...s.seo, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Keywords</Label><Input value={s.seo.keywords} onChange={(e) => set("seo", { ...s.seo, keywords: e.target.value })} /></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Default Open Graph</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="space-y-2"><Label>OG Title</Label><Input value={s.og.title} onChange={(e) => set("og", { ...s.og, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>OG Description</Label><Textarea rows={3} value={s.og.description} onChange={(e) => set("og", { ...s.og, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>OG Image URL</Label><Input value={s.og.image} onChange={(e) => set("og", { ...s.og, image: e.target.value })} /></div>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="pt-4">
          <Card><CardContent className="p-6 space-y-3">
            <div className="space-y-2"><Label>Google Maps Embed HTML / URL</Label>
              <Textarea rows={4} value={s.mapsEmbed} onChange={(e) => set("mapsEmbed", e.target.value)} placeholder='<iframe src="https://www.google.com/maps/embed?..." />' />
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}