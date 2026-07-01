import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DEFAULT_THEME, getTheme, updateTheme } from "../api/settings-client";
import type { ThemeSettings } from "../api/settings";

function hexToHsl(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "0 0% 0%";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
function hslToHex(hsl: string): string {
  const [hStr, sStr, lStr] = hsl.split(" ");
  const h = parseFloat(hStr) / 360; const s = parseFloat(sStr) / 100; const l = parseFloat(lStr) / 100;
  const hue2rgb = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3); }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function fileToDataUrl(f: File) { return new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); }); }

export function ThemePage() {
  const [t, setT] = useState<ThemeSettings>(DEFAULT_THEME);
  useEffect(() => { getTheme().then(setT); }, []);
  const update = (patch: Partial<ThemeSettings>) => setT((s) => ({ ...s, ...patch }));
  const save = async () => { await updateTheme(t); toast.success("Theme saved — public site updated"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Theme Settings</h1><p className="text-sm text-muted-foreground">Changes apply live to the public website.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setT(DEFAULT_THEME)}>Reset</Button><Button onClick={save}>Save Theme</Button></div>
      </div>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="pt-4">
          <Card><CardHeader><CardTitle className="text-base">Logo & Favicon</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Logo</Label>
                {t.logo && <img src={t.logo} alt="logo" className="h-14 mt-2 mb-2 bg-secondary rounded p-1" />}
                <Input type="file" accept="image/*,image/svg+xml" onChange={async (e) => { const f = e.target.files?.[0]; if (f) update({ logo: await fileToDataUrl(f) }); }} />
              </div>
              <div>
                <Label>Favicon</Label>
                {t.favicon && <img src={t.favicon} alt="favicon" className="h-8 mt-2 mb-2 bg-secondary rounded p-1" />}
                <Input type="file" accept="image/x-icon,image/png,image/svg+xml" onChange={async (e) => { const f = e.target.files?.[0]; if (f) update({ favicon: await fileToDataUrl(f) }); }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {(["primaryColor", "secondaryColor", "accentColor"] as const).map((k) => (
              <div key={k} className="space-y-2">
                <Label className="capitalize">{k.replace("Color", " Color")}</Label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-10 w-14 rounded border border-input bg-transparent" value={hslToHex(t[k])} onChange={(e) => update({ [k]: hexToHsl(e.target.value) } as Partial<ThemeSettings>)} />
                  <Input value={t[k]} onChange={(e) => update({ [k]: e.target.value } as Partial<ThemeSettings>)} />
                </div>
                <p className="text-xs text-muted-foreground">HSL format (H S% L%)</p>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="typography" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2"><Label>Heading Font</Label><Input value={t.fontHeading} onChange={(e) => update({ fontHeading: e.target.value })} /></div>
            <div className="space-y-2"><Label>Body Font</Label><Input value={t.fontBody} onChange={(e) => update({ fontBody: e.target.value })} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="layout" className="pt-4">
          <Card><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2"><Label>Button Style</Label>
              <Select value={t.buttonStyle} onValueChange={(v) => update({ buttonStyle: v as ThemeSettings["buttonStyle"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="rounded">Rounded</SelectItem><SelectItem value="square">Square</SelectItem><SelectItem value="pill">Pill</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Border Radius: {t.radius}px</Label><Slider min={0} max={24} step={1} value={[t.radius]} onValueChange={(v) => update({ radius: v[0] })} /></div>
            <div className="space-y-2"><Label>Shadow</Label>
              <Select value={t.shadow} onValueChange={(v) => update({ shadow: v as ThemeSettings["shadow"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="sm">Small</SelectItem><SelectItem value="md">Medium</SelectItem><SelectItem value="lg">Large</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Container Width: {t.containerWidth}px</Label><Slider min={960} max={1600} step={20} value={[t.containerWidth]} onValueChange={(v) => update({ containerWidth: v[0] })} /></div>
            <div className="space-y-2"><Label>Header Style</Label>
              <Select value={t.headerStyle} onValueChange={(v) => update({ headerStyle: v as ThemeSettings["headerStyle"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="minimal">Minimal</SelectItem><SelectItem value="centered">Centered</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Footer Style</Label>
              <Select value={t.footerStyle} onValueChange={(v) => update({ footerStyle: v as ThemeSettings["footerStyle"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="compact">Compact</SelectItem><SelectItem value="expanded">Expanded</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-input px-3 py-2 md:col-span-2">
              <div><Label>Animations</Label><p className="text-xs text-muted-foreground">Enable page & element transitions.</p></div>
              <Switch checked={t.animations} onCheckedChange={(v) => update({ animations: v })} />
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}