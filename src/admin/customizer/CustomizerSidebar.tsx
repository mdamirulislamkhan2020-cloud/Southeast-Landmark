import React, { useState } from "react";
import {
  Sliders,
  Layout,
  Image as ImageIcon,
  Menu as MenuIcon,
  MousePointerClick,
  Smartphone,
  PanelBottom,
  Palette,
  Type,
  Globe,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CustomizerSection, CustomizerState } from "./types";
import type { FooterColumn, MenuItem } from "../api/navigation";
import { MediaPickerDialog } from "../visual-builder/MediaPickerDialog";

interface CustomizerSidebarProps {
  state: CustomizerState;
  activeSection: CustomizerSection;
  onSectionChange: (section: CustomizerSection) => void;
  onUpdateHeader: (patch: Partial<CustomizerState["header"]>) => void;
  onUpdateFooter: (patch: Partial<CustomizerState["footer"]>) => void;
  onUpdateMobile: (patch: Partial<CustomizerState["mobile"]>) => void;
  onUpdateTheme: (patch: Partial<CustomizerState["theme"]>) => void;
  onUpdateGlobal: (patch: Partial<CustomizerState["global"]>) => void;
  onUpdateMenus: (menus: CustomizerState["menus"]) => void;
}

const SECTIONS: Array<{ id: CustomizerSection; label: string; icon: typeof Layout }> = [
  { id: "header", label: "Header & Layout", icon: Layout },
  { id: "logo", label: "Logo & Brand", icon: ImageIcon },
  { id: "cta", label: "CTA Button", icon: MousePointerClick },
  { id: "menus", label: "Navigation Menus", icon: MenuIcon },
  { id: "mobile", label: "Mobile Menu", icon: Smartphone },
  { id: "footer", label: "Footer & Columns", icon: PanelBottom },
  { id: "colors", label: "Colors & Tokens", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "site", label: "Site & SEO", icon: Globe },
];

export function CustomizerSidebar({
  state,
  activeSection,
  onSectionChange,
  onUpdateHeader,
  onUpdateFooter,
  onUpdateMobile,
  onUpdateTheme,
  onUpdateGlobal,
  onUpdateMenus,
}: CustomizerSidebarProps) {
  const [mediaPickerField, setMediaPickerField] = useState<string | null>(null);
  const [activeMenuSlug, setActiveMenuSlug] = useState<string>("header");
  const [newMenuItemLabel, setNewMenuItemLabel] = useState("");
  const [newMenuItemUrl, setNewMenuItemUrl] = useState("");

  const handleMediaSelect = (url: string) => {
    if (mediaPickerField === "header.logo") {
      onUpdateHeader({ logo: url });
    } else if (mediaPickerField === "header.mobileLogo") {
      onUpdateHeader({ mobileLogo: url });
    } else if (mediaPickerField === "footer.logo") {
      onUpdateFooter({ logo: url });
    } else if (mediaPickerField === "theme.favicon") {
      onUpdateTheme({ favicon: url });
    } else if (mediaPickerField === "global.ogImage") {
      onUpdateGlobal({ og: { ...state.global.og, image: url } });
    }
    setMediaPickerField(null);
  };

  // Helper for menu item manipulation
  const currentMenu = state.menus.find((m) => m.slug === activeMenuSlug) || state.menus[0];

  const handleAddMenuItem = () => {
    if (!newMenuItemLabel.trim() || !newMenuItemUrl.trim() || !currentMenu) return;
    const newItem: MenuItem = {
      id: "item-" + Math.random().toString(36).slice(2, 8),
      parentId: null,
      label: newMenuItemLabel.trim(),
      url: newMenuItemUrl.trim(),
      linkType: "internal",
      newTab: false,
      visibility: "everyone",
      enabled: true,
      sortOrder: currentMenu.items.length,
    };
    const updated = state.menus.map((m) =>
      m.id === currentMenu.id ? { ...m, items: [...m.items, newItem] } : m
    );
    onUpdateMenus(updated);
    setNewMenuItemLabel("");
    setNewMenuItemUrl("");
  };

  const handleMoveMenuItem = (index: number, direction: "up" | "down") => {
    if (!currentMenu) return;
    const items = [...currentMenu.items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    const reordered = items.map((it, i) => ({ ...it, sortOrder: i }));
    const updated = state.menus.map((m) =>
      m.id === currentMenu.id ? { ...m, items: reordered } : m
    );
    onUpdateMenus(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (!currentMenu) return;
    const updated = state.menus.map((m) =>
      m.id === currentMenu.id
        ? { ...m, items: m.items.filter((it) => it.id !== id) }
        : m
    );
    onUpdateMenus(updated);
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Category Nav Tabs */}
      <div className="grid grid-cols-3 gap-1 border-b border-border p-2 text-xs">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSectionChange(sec.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-md p-2 text-[11px] font-medium transition",
              activeSection === sec.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <sec.icon className="h-4 w-4" />
            <span className="truncate">{sec.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ================= HEADER SECTION ================= */}
        {activeSection === "header" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Header & Top Bar</h3>
              <p className="text-xs text-muted-foreground">Customize navigation chrome layout, positioning & background.</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hdr-vis">Header Visible</Label>
              <Switch
                id="hdr-vis"
                checked={state.header.visible}
                onCheckedChange={(v) => onUpdateHeader({ visible: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hdr-sticky">Sticky Header (Sticks on scroll)</Label>
              <Switch
                id="hdr-sticky"
                checked={state.header.sticky !== false}
                onCheckedChange={(v) => onUpdateHeader({ sticky: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hdr-trans">Transparent Header</Label>
              <Switch
                id="hdr-trans"
                checked={!!state.header.transparent}
                onCheckedChange={(v) => onUpdateHeader({ transparent: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hdr-blur">Backdrop Blur</Label>
              <Switch
                id="hdr-blur"
                checked={state.header.backdropBlur !== false}
                onCheckedChange={(v) => onUpdateHeader({ backdropBlur: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.header.backgroundColor?.startsWith("#") ? state.header.backgroundColor : "#0B0B0D"}
                  onChange={(e) => onUpdateHeader({ backgroundColor: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
                />
                <Input
                  value={state.header.backgroundColor || ""}
                  onChange={(e) => onUpdateHeader({ backgroundColor: e.target.value })}
                  placeholder="oklch(0.14 0.005 60) or #0B0B0D"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Desktop Header Height</Label>
                <span className="text-muted-foreground">{state.header.height || 80}px</span>
              </div>
              <Slider
                value={[state.header.height || 80]}
                min={56}
                max={120}
                step={2}
                onValueChange={([val]) => onUpdateHeader({ height: val })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Container Max Width</Label>
                <span className="text-muted-foreground">{state.header.maxWidth || 1280}px</span>
              </div>
              <Slider
                value={[state.header.maxWidth || 1280]}
                min={960}
                max={1600}
                step={20}
                onValueChange={([val]) => onUpdateHeader({ maxWidth: val })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Horizontal Padding</Label>
                <span className="text-muted-foreground">{state.header.paddingX || 24}px</span>
              </div>
              <Slider
                value={[state.header.paddingX || 24]}
                min={12}
                max={64}
                step={4}
                onValueChange={([val]) => onUpdateHeader({ paddingX: val })}
              />
            </div>

            <div className="space-y-2">
              <Label>Menu Alignment</Label>
              <Select
                value={state.header.alignment || "space-between"}
                onValueChange={(val: any) => onUpdateHeader({ alignment: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="space-between">Space Between (Logo Left, Menu Center/Right)</SelectItem>
                  <SelectItem value="center">Centered Menu</SelectItem>
                  <SelectItem value="left">Left Aligned (Adjacent to Logo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hdr-border">Border Bottom</Label>
              <Switch
                id="hdr-border"
                checked={state.header.borderBottom !== false}
                onCheckedChange={(v) => onUpdateHeader({ borderBottom: v })}
              />
            </div>

            {/* Top Bar Settings */}
            <div className="pt-4 border-t border-border space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Top Bar Announcement</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="hdr-topbar">Enable Top Bar</Label>
                <Switch
                  id="hdr-topbar"
                  checked={!!state.header.showTopBar}
                  onCheckedChange={(v) => onUpdateHeader({ showTopBar: v })}
                />
              </div>

              {state.header.showTopBar && (
                <>
                  <div className="space-y-2">
                    <Label>Top Bar Text</Label>
                    <Input
                      value={state.header.topBarText || ""}
                      onChange={(e) => onUpdateHeader({ topBarText: e.target.value })}
                      placeholder="Special Announcement or Offer..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Top Bar Background</Label>
                    <Input
                      value={state.header.topBarBg || ""}
                      onChange={(e) => onUpdateHeader({ topBarBg: e.target.value })}
                      placeholder="oklch(0.20 0.01 70)"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= LOGO & BRANDING ================= */}
        {activeSection === "logo" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Logo & Identity</h3>
              <p className="text-xs text-muted-foreground">Upload and configure header and mobile logos.</p>
            </div>

            <div className="space-y-3">
              <Label>Main Desktop Logo</Label>
              {state.header.logo && (
                <div className="relative w-full h-20 rounded-lg border border-border bg-black/40 flex items-center justify-center p-2 overflow-hidden">
                  <img src={state.header.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setMediaPickerField("header.logo")}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Choose / Upload Logo
                </Button>
                {state.header.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => onUpdateHeader({ logo: null })}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Logo Height</Label>
                <span className="text-muted-foreground">{state.header.logoHeight || 36}px</span>
              </div>
              <Slider
                value={[state.header.logoHeight || 36]}
                min={24}
                max={72}
                step={2}
                onValueChange={([val]) => onUpdateHeader({ logoHeight: val })}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo Object Fit</Label>
              <Select
                value={state.header.logoFit || "contain"}
                onValueChange={(val: any) => onUpdateHeader({ logoFit: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain (Keep Proportions)</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo Click URL</Label>
              <Input
                value={state.header.logoLink || "/"}
                onChange={(e) => onUpdateHeader({ logoLink: e.target.value })}
                placeholder="/"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="logo-txt-vis">Show Brand Text Beside Logo</Label>
              <Switch
                id="logo-txt-vis"
                checked={state.header.siteTitleVisible !== false}
                onCheckedChange={(v) => onUpdateHeader({ siteTitleVisible: v })}
              />
            </div>

            {state.header.siteTitleVisible !== false && (
              <div className="space-y-2">
                <Label>Brand Display Text</Label>
                <Input
                  value={state.header.siteTitleText ?? "Southeast Landmark"}
                  onChange={(e) => onUpdateHeader({ siteTitleText: e.target.value })}
                  placeholder="Southeast Landmark"
                />
              </div>
            )}
          </div>
        )}

        {/* ================= CTA / LOGIN BUTTON ================= */}
        {activeSection === "cta" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Header Action / CTA Button</h3>
              <p className="text-xs text-muted-foreground">Configure the action button on the top right of the header.</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cta-enable">Enable CTA Button</Label>
              <Switch
                id="cta-enable"
                checked={state.header.ctaEnabled !== false}
                onCheckedChange={(v) => onUpdateHeader({ ctaEnabled: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={state.header.ctaText ?? "Login"}
                onChange={(e) => onUpdateHeader({ ctaText: e.target.value })}
                placeholder="Login / Book Visit"
              />
            </div>

            <div className="space-y-2">
              <Label>Button Destination URL</Label>
              <Input
                value={state.header.ctaLink ?? "#login"}
                onChange={(e) => onUpdateHeader({ ctaLink: e.target.value })}
                placeholder="#login or /contact"
              />
            </div>

            <div className="space-y-2">
              <Label>Button Icon</Label>
              <Select
                value={state.header.ctaIcon || "User"}
                onValueChange={(val) => onUpdateHeader({ ctaIcon: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User / Profile</SelectItem>
                  <SelectItem value="LogIn">Log In</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Mail">Mail</SelectItem>
                  <SelectItem value="ArrowRight">Arrow Right</SelectItem>
                  <SelectItem value="Sparkles">Sparkles</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Button Background Color</Label>
              <Input
                value={state.header.ctaBgColor || ""}
                onChange={(e) => onUpdateHeader({ ctaBgColor: e.target.value })}
                placeholder="hsl(var(--primary)) or #D4AF37"
              />
            </div>

            <div className="space-y-2">
              <Label>Button Text Color</Label>
              <Input
                value={state.header.ctaTextColor || ""}
                onChange={(e) => onUpdateHeader({ ctaTextColor: e.target.value })}
                placeholder="hsl(var(--primary-foreground)) or #0B0B0D"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Border Radius</Label>
                <span className="text-muted-foreground">{state.header.ctaRadius ?? 9999}px</span>
              </div>
              <Slider
                value={[state.header.ctaRadius ?? 9999]}
                min={0}
                max={9999}
                step={2}
                onValueChange={([val]) => onUpdateHeader({ ctaRadius: val })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Padding X (px)</Label>
                <Input
                  type="number"
                  value={state.header.ctaPaddingX ?? 20}
                  onChange={(e) => onUpdateHeader({ ctaPaddingX: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Padding Y (px)</Label>
                <Input
                  type="number"
                  value={state.header.ctaPaddingY ?? 10}
                  onChange={(e) => onUpdateHeader({ ctaPaddingY: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= NAVIGATION MENUS ================= */}
        {activeSection === "menus" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Navigation Menus</h3>
              <p className="text-xs text-muted-foreground">Manage and reorder header and footer links.</p>
            </div>

            <div className="space-y-2">
              <Label>Active Menu to Edit</Label>
              <Select
                value={activeMenuSlug}
                onValueChange={(val) => setActiveMenuSlug(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.menus.map((m) => (
                    <SelectItem key={m.id} value={m.slug}>
                      {m.name} ({m.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Items List */}
            <div className="space-y-2">
              <Label>Menu Items ({currentMenu?.items.length || 0})</Label>
              <div className="space-y-2">
                {currentMenu?.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-2.5 text-xs"
                  >
                    <div>
                      <div className="font-medium text-foreground">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground">{item.url}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => handleMoveMenuItem(idx, "up")}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === currentMenu.items.length - 1}
                        onClick={() => handleMoveMenuItem(idx, "down")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Item */}
            <div className="rounded-lg border border-dashed border-border p-3 space-y-3 bg-secondary/10">
              <h4 className="text-xs font-semibold text-foreground">Add Menu Link</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Link Label (e.g. Services)"
                  value={newMenuItemLabel}
                  onChange={(e) => setNewMenuItemLabel(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="URL / Path (e.g. /services or #)"
                  value={newMenuItemUrl}
                  onChange={(e) => setNewMenuItemUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full text-xs"
                onClick={handleAddMenuItem}
                disabled={!newMenuItemLabel.trim() || !newMenuItemUrl.trim()}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add to Menu
              </Button>
            </div>
          </div>
        )}

        {/* ================= MOBILE MENU ================= */}
        {activeSection === "mobile" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Mobile Menu Drawer</h3>
              <p className="text-xs text-muted-foreground">Settings for smartphones and small tablets.</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mob-en">Mobile Menu Enabled</Label>
              <Switch
                id="mob-en"
                checked={state.mobile.enabled !== false}
                onCheckedChange={(v) => onUpdateMobile({ enabled: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mob-cta">Show CTA in Drawer</Label>
              <Switch
                id="mob-cta"
                checked={state.mobile.showCta !== false}
                onCheckedChange={(v) => onUpdateMobile({ showCta: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Drawer Background</Label>
              <Input
                value={state.mobile.menuBackground || ""}
                onChange={(e) => onUpdateMobile({ menuBackground: e.target.value })}
                placeholder="hsl(var(--background)) or #0B0B0D"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Item Spacing</Label>
                <span className="text-muted-foreground">{state.mobile.itemSpacing ?? 8}px</span>
              </div>
              <Slider
                value={[state.mobile.itemSpacing ?? 8]}
                min={4}
                max={24}
                step={2}
                onValueChange={([val]) => onUpdateMobile({ itemSpacing: val })}
              />
            </div>
          </div>
        )}

        {/* ================= FOOTER & COLUMNS ================= */}
        {activeSection === "footer" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Footer & Columns</h3>
              <p className="text-xs text-muted-foreground">Configure website footer columns, contact details & copyright.</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ftr-vis">Footer Visible</Label>
              <Switch
                id="ftr-vis"
                checked={state.footer.visible !== false}
                onCheckedChange={(v) => onUpdateFooter({ visible: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Footer Logo</Label>
              {state.footer.logo && (
                <div className="relative w-full h-16 rounded-lg border border-border bg-black/40 flex items-center justify-center p-2 mb-2">
                  <img src={state.footer.logo} alt="Footer logo" className="max-h-full object-contain" />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setMediaPickerField("footer.logo")}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Choose Footer Logo
                </Button>
                {state.footer.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive"
                    onClick={() => onUpdateFooter({ logo: null })}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Footer Description / About Us</Label>
              <Textarea
                rows={3}
                value={state.footer.description || ""}
                onChange={(e) => onUpdateFooter({ description: e.target.value })}
                placeholder="Brief description about the company..."
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input
                value={state.footer.backgroundColor || ""}
                onChange={(e) => onUpdateFooter({ backgroundColor: e.target.value })}
                placeholder="oklch(0.18 0.008 70)"
              />
            </div>

            <div className="space-y-2">
              <Label>Heading / Accent Color</Label>
              <Input
                value={state.footer.accentColor || ""}
                onChange={(e) => onUpdateFooter({ accentColor: e.target.value })}
                placeholder="oklch(0.78 0.14 85)"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Vertical Padding</Label>
                <span className="text-muted-foreground">{state.footer.paddingY ?? 64}px</span>
              </div>
              <Slider
                value={[state.footer.paddingY ?? 64]}
                min={32}
                max={120}
                step={4}
                onValueChange={([val]) => onUpdateFooter({ paddingY: val })}
              />
            </div>

            {/* Contact Details */}
            <div className="pt-4 border-t border-border space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Contact & Address</h4>
              <div className="space-y-2">
                <Label>Office Address</Label>
                <Input
                  value={state.footer.address || ""}
                  onChange={(e) => onUpdateFooter({ address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={state.footer.phone || ""}
                  onChange={(e) => onUpdateFooter({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={state.footer.email || ""}
                  onChange={(e) => onUpdateFooter({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Office Hours</Label>
                <Input
                  value={state.footer.businessHours || ""}
                  onChange={(e) => onUpdateFooter({ businessHours: e.target.value })}
                />
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ftr-news">Show Newsletter</Label>
                <Switch
                  id="ftr-news"
                  checked={state.footer.showNewsletter !== false}
                  onCheckedChange={(v) => onUpdateFooter({ showNewsletter: v })}
                />
              </div>
              {state.footer.showNewsletter !== false && (
                <>
                  <div className="space-y-2">
                    <Label>Newsletter Heading</Label>
                    <Input
                      value={state.footer.newsletterTitle || "Newsletter"}
                      onChange={(e) => onUpdateFooter({ newsletterTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Newsletter Subtitle</Label>
                    <Input
                      value={state.footer.newsletterSubtitle || ""}
                      onChange={(e) => onUpdateFooter({ newsletterSubtitle: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Copyright & Tagline */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="space-y-2">
                <Label>Copyright Notice</Label>
                <Input
                  value={state.footer.copyright || ""}
                  onChange={(e) => onUpdateFooter({ copyright: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bottom Tagline</Label>
                <Input
                  value={state.footer.bottomTagline || ""}
                  onChange={(e) => onUpdateFooter({ bottomTagline: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= GLOBAL COLORS & TOKENS ================= */}
        {activeSection === "colors" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Global Colors & Design Tokens</h3>
              <p className="text-xs text-muted-foreground">Adjust brand colors and base styling variables across the site.</p>
            </div>

            <div className="space-y-2">
              <Label>Primary Brand Color (Gold)</Label>
              <Input
                value={state.theme.primaryColor}
                onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                placeholder="oklch(0.78 0.14 85) or #D4AF37"
              />
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <Input
                value={state.theme.accentColor}
                onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                placeholder="oklch(0.86 0.12 88) or #EBD07A"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Canvas Color</Label>
              <Input
                value={state.theme.backgroundColor || ""}
                onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                placeholder="oklch(0.14 0.005 60) or #0B0B0D"
              />
            </div>

            <div className="space-y-2">
              <Label>Card / Surface Color</Label>
              <Input
                value={state.theme.surfaceColor || ""}
                onChange={(e) => onUpdateTheme({ surfaceColor: e.target.value })}
                placeholder="oklch(0.18 0.008 70) or #141418"
              />
            </div>

            <div className="space-y-2">
              <Label>Foreground Text Color</Label>
              <Input
                value={state.theme.textColor || ""}
                onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
                placeholder="oklch(0.96 0.02 90)"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Corner Radius (Tokens)</Label>
                <span className="text-muted-foreground">{state.theme.radius ?? 10}px</span>
              </div>
              <Slider
                value={[state.theme.radius ?? 10]}
                min={0}
                max={24}
                step={2}
                onValueChange={([val]) => onUpdateTheme({ radius: val })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label>Site Max Width</Label>
                <span className="text-muted-foreground">{state.theme.containerWidth || 1280}px</span>
              </div>
              <Slider
                value={[state.theme.containerWidth || 1280]}
                min={1080}
                max={1600}
                step={20}
                onValueChange={([val]) => onUpdateTheme({ containerWidth: val })}
              />
            </div>
          </div>
        )}

        {/* ================= TYPOGRAPHY ================= */}
        {activeSection === "typography" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Site Typography</h3>
              <p className="text-xs text-muted-foreground">Select heading and body font pairings.</p>
            </div>

            <div className="space-y-2">
              <Label>Heading Display Font</Label>
              <Select
                value={state.theme.fontHeading || "Playfair Display"}
                onValueChange={(val) => onUpdateTheme({ fontHeading: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playfair Display">Playfair Display (Serif Elegance)</SelectItem>
                  <SelectItem value="Cinzel">Cinzel (Luxury Classical)</SelectItem>
                  <SelectItem value="Cormorant Garamond">Cormorant Garamond (Editorial Serif)</SelectItem>
                  <SelectItem value="Merriweather">Merriweather (Classic Serif)</SelectItem>
                  <SelectItem value="Lora">Lora (Contemporary Serif)</SelectItem>
                  <SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</SelectItem>
                  <SelectItem value="Outfit">Outfit (Clean Display)</SelectItem>
                  <SelectItem value="Inter">Inter (Neutral Sans)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Copy Font</Label>
              <Select
                value={state.theme.fontBody || "Inter"}
                onValueChange={(val) => onUpdateTheme({ fontBody: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Hind Siliguri">Hind Siliguri (Bengali + English)</SelectItem>
                  <SelectItem value="Noto Sans Bengali">Noto Sans Bengali</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Heading 1 Size</Label>
              <Input
                value={state.theme.h1Size || "3.5rem"}
                onChange={(e) => onUpdateTheme({ h1Size: e.target.value })}
                placeholder="3.5rem or 48px"
              />
            </div>

            <div className="space-y-2">
              <Label>Body Text Line Height</Label>
              <Input
                value={state.theme.lineHeightBody || "1.6"}
                onChange={(e) => onUpdateTheme({ lineHeightBody: e.target.value })}
                placeholder="1.6"
              />
            </div>
          </div>
        )}

        {/* ================= SITE & SEO ================= */}
        {activeSection === "site" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Site & Global Info</h3>
              <p className="text-xs text-muted-foreground">General business metadata and search engine defaults.</p>
            </div>

            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={state.global.companyName || ""}
                onChange={(e) => onUpdateGlobal({ companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Meta Title</Label>
              <Input
                value={state.global.seo?.title || ""}
                onChange={(e) =>
                  onUpdateGlobal({ seo: { ...state.global.seo, title: e.target.value } })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Default Meta Description</Label>
              <Textarea
                rows={3}
                value={state.global.seo?.description || ""}
                onChange={(e) =>
                  onUpdateGlobal({ seo: { ...state.global.seo, description: e.target.value } })
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setMediaPickerField("theme.favicon")}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Select Favicon
                </Button>
                {state.theme.favicon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive"
                    onClick={() => onUpdateTheme({ favicon: null })}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={!!mediaPickerField}
        onOpenChange={(open) => !open && setMediaPickerField(null)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
