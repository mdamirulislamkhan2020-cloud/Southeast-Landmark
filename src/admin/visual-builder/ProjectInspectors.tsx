import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  MapPin,
  Building,
  CheckSquare,
  Sparkles,
  Phone,
  HelpCircle,
  Layers,
  X,
} from "lucide-react";

interface ProjectInspectorProps {
  blockKey: string;
  blockData: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
  openMediaFor: (target: string) => void;
}

export function ProjectInspectors({
  blockKey,
  blockData,
  updateData,
  openMediaFor,
}: ProjectInspectorProps) {
  switch (blockKey) {
    case "project.hero":
      return (
        <ProjectHeroInspector
          data={blockData}
          updateData={updateData}
          openMediaFor={openMediaFor}
        />
      );
    case "project.location":
      return <ProjectLocationInspector data={blockData} updateData={updateData} />;
    case "project.masterplan":
      return (
        <ProjectMasterPlanInspector
          data={blockData}
          updateData={updateData}
          openMediaFor={openMediaFor}
        />
      );
    case "project.blocks":
      return <ProjectBlocksInspector data={blockData} updateData={updateData} />;
    case "project.roads":
      return <ProjectRoadsInspector data={blockData} updateData={updateData} />;
    case "project.amenities":
      return <ProjectAmenitiesInspector data={blockData} updateData={updateData} />;
    case "project.plots":
      return <ProjectPlotsInspector data={blockData} updateData={updateData} />;
    case "project.sitevisit":
      return <ProjectSiteVisitInspector data={blockData} updateData={updateData} />;
    case "project.faq":
      return <ProjectFaqInspector data={blockData} updateData={updateData} />;
    default:
      return null;
  }
}

// 1. HERO INSPECTOR
function ProjectHeroInspector({
  data,
  updateData,
  openMediaFor,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
  openMediaFor: (target: string) => void;
}) {
  const defaultStats = [
    { label: "Total Area", value: "100+ Acres", desc: "Master-Planned Township" },
    { label: "Road Network", value: "60ft & 40ft", desc: "Boulevard & Internal Avenues" },
    { label: "Elevation", value: "Flood-Free", desc: "Naturally Elevated Red Soil" },
    { label: "Transit Gateway", value: "Shah Ali Bridge", desc: "Direct Mirpur & Uttara Link" },
  ];

  const stats = Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : defaultStats;

  const updateStatItem = (idx: number, patch: Record<string, string>) => {
    const next = stats.map((s: any, i: number) => (i === idx ? { ...s, ...patch } : s));
    updateData({ stats: next });
  };

  const addStatItem = () => {
    updateData({ stats: [...stats, { label: "New Stat", value: "100%", desc: "Highlight" }] });
  };

  const removeStatItem = (idx: number) => {
    updateData({ stats: stats.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow Tag</Label>
        <Input
          value={data.eyebrow ?? data.crumb ?? "SOUTHEAST CITY"}
          onChange={(e) => updateData({ eyebrow: e.target.value, crumb: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Main Title</Label>
        <Input
          value={data.title ?? "Southeast City Master Layout"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "A safe, modern, and nature-surrounded township in Bonogram, Savar—adjacent to the Mirpur Embankment and Shah Ali Bridge."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Hero Aerial Image</Label>
        <div className="flex gap-2">
          <Input
            value={data.image || ""}
            onChange={(e) => updateData({ image: e.target.value })}
            placeholder="Default hero asset..."
            className="h-8 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => openMediaFor("image")}
            title="Choose from media library"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-3">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          CTA Buttons
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Primary Button</Label>
            <Input
              value={data.ctaLabel ?? "Explore Master Plan"}
              onChange={(e) => updateData({ ctaLabel: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Target Anchor / Link</Label>
            <Input
              value={data.ctaHref ?? "#master-plan"}
              onChange={(e) => updateData({ ctaHref: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Secondary Button</Label>
            <Input
              value={data.secondaryCtaLabel ?? "Book a Site Visit"}
              onChange={(e) => updateData({ secondaryCtaLabel: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Target Anchor / Link</Label>
            <Input
              value={data.secondaryCtaHref ?? "#site-visit"}
              onChange={(e) => updateData({ secondaryCtaHref: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Tertiary Link</Label>
            <Input
              value={data.tertiaryCtaLabel ?? "View Plot Options →"}
              onChange={(e) => updateData({ tertiaryCtaLabel: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Target Anchor / Link</Label>
            <Input
              value={data.tertiaryCtaHref ?? "#plot-options"}
              onChange={(e) => updateData({ tertiaryCtaHref: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Hero Highlight Metrics ({stats.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addStatItem}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Stat
          </Button>
        </div>

        <div className="space-y-2">
          {stats.map((st: any, i: number) => (
            <div key={i} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary">Metric {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStatItem(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  value={st.label || st.k || ""}
                  onChange={(e) => updateStatItem(i, { label: e.target.value })}
                  placeholder="Label (e.g. Total Area)"
                  className="h-7 text-[11px]"
                />
                <Input
                  value={st.value || st.v || ""}
                  onChange={(e) => updateStatItem(i, { value: e.target.value })}
                  placeholder="Value (e.g. 100+ Acres)"
                  className="h-7 text-[11px] font-bold"
                />
              </div>
              <Input
                value={st.desc || ""}
                onChange={(e) => updateStatItem(i, { desc: e.target.value })}
                placeholder="Description / subtitle..."
                className="h-7 text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. LOCATION & MAP INSPECTOR
function ProjectLocationInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultCards = [
    {
      num: "01",
      title: "Bridge & River Connectivity",
      text: "Direct access to Mirpur and Uttara via the approved Shah Ali Bridge and Birulia Bridge, with the Turag River flowing alongside.",
      tag: "Shah Ali Bridge · Turag River Corridor",
    },
    {
      num: "02",
      title: "Major Highways",
      text: "Located adjacent to the 170-ft Asian Highway Road and Dhaka-Aricha Highway.",
      tag: "170-ft Asian Highway · Dhaka-Aricha Link",
    },
    {
      num: "03",
      title: "Metro & Urban Hubs",
      text: "Close to Uttara Metro Rail, Mirpur 12 (DOHS), Pallabi, Mirpur 1, and the National Zoo.",
      tag: "Uttara Metro · Mirpur 12 DOHS · Mirpur 1",
    },
    {
      num: "04",
      title: "Education & Recreation",
      text: "Near Daffodil, BRAC, City, Eastern, and Jahangirnagar Universities, with access to Nandan Park, Golap Gram, and Tamanna Park.",
      tag: "Top Universities & Nature Theme Parks",
    },
  ];

  const cards =
    Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : Array.isArray(data.cards) && data.cards.length > 0
      ? data.cards
      : defaultCards;

  const updateCard = (idx: number, patch: Record<string, string>) => {
    const next = cards.map((c: any, i: number) => (i === idx ? { ...c, ...patch } : c));
    updateData({ items: next, cards: next });
  };

  const addCard = () => {
    const nextNum = String(cards.length + 1).padStart(2, "0");
    const next = [
      ...cards,
      {
        num: nextNum,
        title: "New Location Advantage",
        text: "Strategic connectivity highlight description.",
        tag: "Highway / Transit Link",
      },
    ];
    updateData({ items: next, cards: next });
  };

  const removeCard = (idx: number) => {
    const next = cards.filter((_: any, i: number) => i !== idx);
    updateData({ items: next, cards: next });
  };

  const moveCard = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    updateData({ items: next, cards: next });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "LOCATION"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Strategic Location & Accessibility"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Situated at Bonogram, Savar—directly beside the Mirpur Embankment and Shah Ali Bridge—Southeast City balances instant arterial connectivity into the Dhaka metropolis with the tranquility of nature."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Map Configuration
        </h4>
        <div className="space-y-1">
          <Label className="text-[11px]">Map Embed URL (iframe embed)</Label>
          <Input
            value={
              data.mapEmbedUrl ??
              data.embed ??
              "https://maps.google.com/maps?q=Bonogram,+Savar,+Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
            }
            onChange={(e) => updateData({ mapEmbedUrl: e.target.value, embed: e.target.value })}
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Button Label</Label>
            <Input
              value={data.mapButtonLabel ?? "View Full Map"}
              onChange={(e) => updateData({ mapButtonLabel: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">External Map Link</Label>
            <Input
              value={data.mapLink ?? "https://maps.google.com/?q=Bonogram,+Savar,+Dhaka"}
              onChange={(e) => updateData({ mapLink: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Location Highlight Cards ({cards.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addCard}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Card
          </Button>
        </div>

        <div className="space-y-3">
          {cards.map((c: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-primary">Card #{c.num || i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === 0}
                    onClick={() => moveCard(i, "up")}
                    className="h-5 w-5 p-0"
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === cards.length - 1}
                    onClick={() => moveCard(i, "down")}
                    className="h-5 w-5 p-0"
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCard(i)}
                    className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                    title="Delete card"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <Input
                  value={c.num || ""}
                  onChange={(e) => updateCard(i, { num: e.target.value })}
                  placeholder="01"
                  className="h-7 text-[11px] col-span-1 font-mono"
                />
                <Input
                  value={c.title || ""}
                  onChange={(e) => updateCard(i, { title: e.target.value })}
                  placeholder="Card Title"
                  className="h-7 text-[11px] col-span-3 font-semibold"
                />
              </div>

              <Textarea
                rows={2}
                value={c.text || c.body || c.desc || ""}
                onChange={(e) => updateCard(i, { text: e.target.value })}
                placeholder="Connectivity details..."
                className="text-xs"
              />

              <Input
                value={c.tag || c.badge || ""}
                onChange={(e) => updateCard(i, { tag: e.target.value })}
                placeholder="Highlight Tag (e.g. Shah Ali Bridge Corridor)"
                className="h-7 text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. MASTER PLAN INSPECTOR
function ProjectMasterPlanInspector({
  data,
  updateData,
  openMediaFor,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
  openMediaFor: (target: string) => void;
}) {
  const defaultMetrics = [
    { label: "Township Footprint", value: "100+ Acres", hint: "Continuous master development" },
    { label: "Road Infrastructure", value: "28% Area", hint: "60ft, 40ft & 30ft paved roads" },
    { label: "Green & Waterbodies", value: "32% Area", hint: "Parks, lake & promenade" },
    {
      label: "Planned Plots",
      value: "3, 5, 10 Katha",
      hint: "Mutation-ready residential & commercial",
    },
  ];

  const metrics =
    Array.isArray(data.metrics) && data.metrics.length > 0
      ? data.metrics
      : Array.isArray(data.stats) && data.stats.length > 0
      ? data.stats
      : defaultMetrics;

  const updateMetric = (idx: number, patch: Record<string, string>) => {
    const next = metrics.map((m: any, i: number) => (i === idx ? { ...m, ...patch } : m));
    updateData({ metrics: next, stats: next });
  };

  const addMetric = () => {
    updateData({
      metrics: [...metrics, { label: "New Metric", value: "50%", hint: "Description" }],
    });
  };

  const removeMetric = (idx: number) => {
    updateData({ metrics: metrics.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "MASTER PLAN"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Township Master Layout & Key Metrics"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Engineered with human-centric zoning, expansive green buffers, and a hierarchical road network to deliver an idyllic residential ecosystem for generations to come."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="space-y-1 pt-2 border-t border-border/60">
        <Label className="text-xs">Custom Master Plan Layout Image</Label>
        <div className="flex gap-2">
          <Input
            value={data.masterPlanImage || ""}
            onChange={(e) => updateData({ masterPlanImage: e.target.value })}
            placeholder="Official blueprint image URL..."
            className="h-8 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => openMediaFor("masterPlanImage")}
            title="Pick official layout plan"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          {data.masterPlanImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => updateData({ masterPlanImage: "" })}
              title="Clear (uses vector blueprint)"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Leave blank to render the interactive architectural vector layout schematic.
        </p>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Layout Metrics ({metrics.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addMetric}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Metric
          </Button>
        </div>

        <div className="space-y-2">
          {metrics.map((m: any, i: number) => (
            <div key={i} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary">Metric {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMetric(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  value={m.label || m.k || ""}
                  onChange={(e) => updateMetric(i, { label: e.target.value })}
                  placeholder="Label (e.g. Total Area)"
                  className="h-7 text-[11px]"
                />
                <Input
                  value={m.value || m.v || ""}
                  onChange={(e) => updateMetric(i, { value: e.target.value })}
                  placeholder="Value (e.g. 100+ Acres)"
                  className="h-7 text-[11px] font-bold"
                />
              </div>
              <Input
                value={m.hint || m.desc || ""}
                onChange={(e) => updateMetric(i, { hint: e.target.value })}
                placeholder="Hint / description..."
                className="h-7 text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. BLOCKS / SECTORS INSPECTOR
function ProjectBlocksInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultBlocks = [
    {
      code: "BLOCK A",
      name: "Executive Boulevard & Commercial Frontage",
      highlight: "Frontline 60-ft Road Access",
      description:
        "Positioned right at the grand township entrance along the 60-ft boulevard. Features prime residential plots and dedicated commercial strips suitable for brand outlets, offices, and clinics.",
    },
    {
      code: "BLOCK B",
      name: "Lakeside & Central Parkside Enclave",
      highlight: "Waterfront Serenity & Parks",
      description:
        "Surrounded by the natural lake promenade and a 5-acre central green park. Quiet residential cul-de-sacs designed specifically for families desiring fresh air and waterfront lifestyle.",
    },
    {
      code: "BLOCK C",
      name: "Civic Community & Educational Hub",
      highlight: "Mosque & School Walkability",
      description:
        "The social heart of Southeast City. Perfectly situated within comfortable walking distance of the Grand Central Mosque, English-medium school, and neighborhood healthcare center.",
    },
    {
      code: "BLOCK D",
      name: "Nature Meadow & Extended Township",
      highlight: "Low-Density Green Living",
      description:
        "Spacious residential sector bordered by open green landscape and future expansion reserves. Unmatched quietness, expansive plot layouts, and highly flexible payment structures.",
    },
  ];

  const blocks =
    Array.isArray(data.blocks) && data.blocks.length > 0
      ? data.blocks
      : Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : defaultBlocks;

  const updateBlock = (idx: number, patch: Record<string, string>) => {
    const next = blocks.map((b: any, i: number) => (i === idx ? { ...b, ...patch } : b));
    updateData({ blocks: next, items: next });
  };

  const addBlock = () => {
    const nextLetter = String.fromCharCode(65 + blocks.length);
    const next = [
      ...blocks,
      {
        code: `BLOCK ${nextLetter}`,
        name: `Sector ${nextLetter} Enclave`,
        highlight: "Planned Residential Sector",
        description: "Master-planned residential plots with internal roads and parks.",
      },
    ];
    updateData({ blocks: next, items: next });
  };

  const removeBlock = (idx: number) => {
    const next = blocks.filter((_: any, i: number) => i !== idx);
    updateData({ blocks: next, items: next });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "ZONING & SECTORS"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Block-Wise Planning Architecture"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Every block is master-planned with distinct architectural zoning, dedicated road reservations, and easy access to neighborhood social infrastructure."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Sectors & Blocks ({blocks.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addBlock}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Sector
          </Button>
        </div>

        <div className="space-y-3">
          {blocks.map((b: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-primary">{b.code}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Input
                  value={b.code || ""}
                  onChange={(e) => updateBlock(i, { code: e.target.value })}
                  placeholder="BLOCK A"
                  className="h-7 text-[11px] col-span-1 font-mono font-bold"
                />
                <Input
                  value={b.highlight || ""}
                  onChange={(e) => updateBlock(i, { highlight: e.target.value })}
                  placeholder="Highlight tag..."
                  className="h-7 text-[11px] col-span-2 text-primary"
                />
              </div>

              <Input
                value={b.name || ""}
                onChange={(e) => updateBlock(i, { name: e.target.value })}
                placeholder="Sector Name / Character"
                className="h-7 text-[11px] font-semibold"
              />

              <Textarea
                rows={2}
                value={b.description || ""}
                onChange={(e) => updateBlock(i, { description: e.target.value })}
                placeholder="Sector zoning and infrastructure description..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Card CTA Button
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Button Label</Label>
            <Input
              value={data.ctaLabel !== undefined ? data.ctaLabel : "Inquire"}
              onChange={(e) => updateData({ ctaLabel: e.target.value })}
              placeholder="Clear to hide button"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Target Link</Label>
            <Input
              value={data.ctaHref ?? "#site-visit"}
              onChange={(e) => updateData({ ctaHref: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Clear the button label to completely remove the button.
        </p>
      </div>
    </div>
  );
}

// 5. ROADS & INFRASTRUCTURE INSPECTOR
function ProjectRoadsInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultRoadTiers = [
    {
      width: "60 FT",
      tier: "Grand Entrance Boulevard",
      role: "Central Town Arterial",
      description:
        "Dual-carriageway main avenue welcoming residents into Southeast City. Features a landscaped central median, solar-powered LED street lights, wide pedestrian walkways, and tree-lined verges.",
    },
    {
      width: "40 FT",
      tier: "Secondary Connecting Avenues",
      role: "Inter-Sector Thoroughfare",
      description:
        "Spacious arterial roadways connecting Blocks A, B, C, and D smoothly. Designed to handle two-way vehicular traffic, service vehicles, and emergency access without roadside congestion.",
    },
    {
      width: "30 FT",
      tier: "Inner Residential Access Loops",
      role: "Neighborhood Living Streets",
      description:
        "Tranquil, pedestrian-first residential streets servicing individual plots. Built with durable high-grade brick paving or asphalt macadam, speed-calmed for children's safety.",
    },
  ];

  const roadTiers =
    Array.isArray(data.roadTiers) && data.roadTiers.length > 0
      ? data.roadTiers
      : Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : defaultRoadTiers;

  const updateTier = (idx: number, patch: Record<string, string>) => {
    const next = roadTiers.map((r: any, i: number) => (i === idx ? { ...r, ...patch } : r));
    updateData({ roadTiers: next, items: next });
  };

  const addTier = () => {
    updateData({
      roadTiers: [
        ...roadTiers,
        {
          width: "25 FT",
          tier: "Connecting Lane",
          role: "Inner Lane Access",
          description: "Paved quiet street servicing inner plots.",
        },
      ],
    });
  };

  const removeTier = (idx: number) => {
    updateData({ roadTiers: roadTiers.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "INFRASTRUCTURE"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Engineered Road Network & Modern Utilities"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Civil-engineered with comprehensive sub-surface drainage, underground utility ducts, and generous street widths to prevent future road cuts and traffic bottlenecks."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Road Network Tiers ({roadTiers.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addTier}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Tier
          </Button>
        </div>

        <div className="space-y-3">
          {roadTiers.map((r: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-primary">{r.width} Tier</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTier(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Input
                  value={r.width || ""}
                  onChange={(e) => updateTier(i, { width: e.target.value })}
                  placeholder="60 FT"
                  className="h-7 text-[11px] col-span-1 font-mono font-bold"
                />
                <Input
                  value={r.tier || ""}
                  onChange={(e) => updateTier(i, { tier: e.target.value })}
                  placeholder="Grand Boulevard"
                  className="h-7 text-[11px] col-span-2 font-semibold"
                />
              </div>

              <Input
                value={r.role || ""}
                onChange={(e) => updateTier(i, { role: e.target.value })}
                placeholder="Role (e.g. Central Town Arterial)"
                className="h-7 text-[11px]"
              />

              <Textarea
                rows={2}
                value={r.description || ""}
                onChange={(e) => updateTier(i, { description: e.target.value })}
                placeholder="Width and utility features..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. AMENITIES INSPECTOR
function ProjectAmenitiesInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultAmenities = [
    {
      title: "Grand Central Mosque & Cultural Center",
      category: "Spiritual Community",
      desc: "Centrally located multi-tier architectural mosque with dedicated ablution facilities, prayer halls for both men and women, and an Islamic learning library.",
    },
    {
      title: "Natural Lake & Waterfront Promenade",
      category: "Recreation & Wellness",
      desc: "Expansive natural water reservoir with lighted lakeside walking paths, wooden resting gazebos, and landscaped botanical gardens for morning exercise.",
    },
    {
      title: "Planned Comprehensive School Campus",
      category: "Education",
      desc: "Reserved 3-acre institutional zoning for an international standard English and National curriculum school, so children study safely within walking distance.",
    },
    {
      title: "Healthcare & Wellness Clinic",
      category: "Healthcare",
      desc: "Dedicated medical center with 24/7 first-aid trauma response, on-site pharmacy, diagnostic sample collection, and doctor consultation chambers.",
    },
    {
      title: "Commercial & Daily Bazaar Arcade",
      category: "Convenience Retail",
      desc: "Convenient grocery supermarkets, daily organic vegetable stalls, bakeries, laundry services, and banking ATMs located along the 60ft Boulevard.",
    },
    {
      title: "Community Club & Event Hall",
      category: "Social Living",
      desc: "Spacious multipurpose community pavilion for family celebrations, residents’ welfare meetings, youth indoor table tennis, and social gatherings.",
    },
  ];

  const amenities =
    Array.isArray(data.amenities) && data.amenities.length > 0
      ? data.amenities
      : Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : defaultAmenities;

  const updateAmenity = (idx: number, patch: Record<string, string>) => {
    const next = amenities.map((a: any, i: number) => (i === idx ? { ...a, ...patch } : a));
    updateData({ amenities: next, items: next });
  };

  const addAmenity = () => {
    updateData({
      amenities: [
        ...amenities,
        {
          title: "New Community Amenity",
          category: "Recreation",
          desc: "Description of modern community facility.",
        },
      ],
    });
  };

  const removeAmenity = (idx: number) => {
    updateData({ amenities: amenities.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "AMENITIES & LIFESTYLE"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Designed for a Complete Township Lifestyle"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "From daily spiritual peace to children’s schooling and lakeside wellness, Southeast City provides every neighborhood comfort inside a secure gated boundary."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Amenities & Facilities ({amenities.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAmenity}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Amenity
          </Button>
        </div>

        <div className="space-y-3">
          {amenities.map((a: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Amenity {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAmenity(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Input
                  value={a.title || ""}
                  onChange={(e) => updateAmenity(i, { title: e.target.value })}
                  placeholder="Amenity Name"
                  className="h-7 text-[11px] col-span-2 font-semibold"
                />
                <Input
                  value={a.category || ""}
                  onChange={(e) => updateAmenity(i, { category: e.target.value })}
                  placeholder="Category"
                  className="h-7 text-[11px] col-span-1"
                />
              </div>

              <Textarea
                rows={2}
                value={a.desc || ""}
                onChange={(e) => updateAmenity(i, { desc: e.target.value })}
                placeholder="Description of facility..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. PLOTS & CALCULATOR INSPECTOR
function ProjectPlotsInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultPlotTypes = [
    {
      katha: 3,
      name: "3 Katha Residential Plot",
      dim: "approx. 2,160 sq. ft.",
      bestFor: "Nuclear Families & Duplex Homes",
      price: "From ৳ 14 Lac / Katha",
      badge: "Most Popular",
    },
    {
      katha: 5,
      name: "5 Katha Premium Plot",
      dim: "approx. 3,600 sq. ft.",
      bestFor: "Multi-Family Homes & Garden Villas",
      price: "From ৳ 15 Lac / Katha",
      badge: "High Growth",
    },
    {
      katha: 10,
      name: "10 Katha Executive Estate",
      dim: "approx. 7,200 sq. ft.",
      bestFor: "Exclusive Estate & Institutional",
      price: "Custom Executive Pricing",
      badge: "Signature Living",
    },
    {
      katha: 0,
      name: "Commercial Boulevard Plots",
      dim: "Custom 5 to 20 Katha",
      bestFor: "Retail, Banking, Clinics & Mixed-Use",
      price: "Strategic Commercial Valuation",
      badge: "High Yield",
    },
  ];

  const plotTypes =
    Array.isArray(data.plotTypes) && data.plotTypes.length > 0
      ? data.plotTypes
      : Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : defaultPlotTypes;

  const updatePlot = (idx: number, patch: Record<string, any>) => {
    const next = plotTypes.map((p: any, i: number) => (i === idx ? { ...p, ...patch } : p));
    updateData({ plotTypes: next, items: next });
  };

  const addPlot = () => {
    updateData({
      plotTypes: [
        ...plotTypes,
        {
          katha: 4,
          name: "4 Katha Custom Plot",
          dim: "approx. 2,880 sq. ft.",
          bestFor: "Family Homes",
          price: "Inquire For Price",
          badge: "New Release",
        },
      ],
    });
  };

  const removePlot = (idx: number) => {
    updateData({ plotTypes: plotTypes.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "PLOT INVENTORY & INVESTMENT"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Plot Sizes & Flexible Ownership Plans"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Choose from standard 3 Katha, 5 Katha, 10 Katha, and Commercial plots with transparent pricing, instant booking discounts, and flexible 36-to-60 month interest-free installment schedules."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="space-y-1 pt-2 border-t border-border/60">
        <Label className="text-xs">Base Calculator Price per Katha (Lac BDT)</Label>
        <Input
          type="number"
          value={data.pricePerKathaLac ?? 14}
          onChange={(e) => updateData({ pricePerKathaLac: parseFloat(e.target.value) || 14 })}
          className="h-8 text-xs font-mono font-bold"
        />
        <p className="text-[10px] text-muted-foreground">
          Powers the interactive installment estimator calculator widget.
        </p>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Plot Size Packages ({plotTypes.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addPlot}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {plotTypes.map((p: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-primary">
                  {p.katha > 0 ? `${p.katha} Katha` : "Commercial"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlot(i)}
                  className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <Input
                  value={p.name || ""}
                  onChange={(e) => updatePlot(i, { name: e.target.value })}
                  placeholder="Plot Name"
                  className="h-7 text-[11px] col-span-2 font-semibold"
                />
                <Input
                  value={p.badge || ""}
                  onChange={(e) => updatePlot(i, { badge: e.target.value })}
                  placeholder="Badge (Popular)"
                  className="h-7 text-[11px] col-span-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  value={p.dim || ""}
                  onChange={(e) => updatePlot(i, { dim: e.target.value })}
                  placeholder="Dimensions (2,160 sq ft)"
                  className="h-7 text-[11px]"
                />
                <Input
                  value={p.price || ""}
                  onChange={(e) => updatePlot(i, { price: e.target.value })}
                  placeholder="Price hint..."
                  className="h-7 text-[11px] font-medium"
                />
              </div>

              <Input
                value={p.bestFor || ""}
                onChange={(e) => updatePlot(i, { bestFor: e.target.value })}
                placeholder="Best for duplex, villa, commercial..."
                className="h-7 text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Card CTA Button
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Button Label</Label>
            <Input
              value={data.ctaLabel !== undefined ? data.ctaLabel : "Book Plot Inquiry"}
              onChange={(e) => updateData({ ctaLabel: e.target.value })}
              placeholder="Clear to hide button"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Target Link</Label>
            <Input
              value={data.ctaHref ?? "#site-visit"}
              onChange={(e) => updateData({ ctaHref: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Clear the button label to completely remove the button.
        </p>
      </div>
    </div>
  );
}

// 8. SITE VISIT & FORM INSPECTOR
function ProjectSiteVisitInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "EXPERIENCE THE TOWNSHIP"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Book a Guided Site Visit to Southeast City"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Experience the natural red-soil elevation, wide boulevard alignment, and calm riverside surroundings firsthand. We provide complimentary air-conditioned round-trip transport from our Dhaka hubs."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-3">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Booking Form Settings
        </h4>
        <div className="space-y-1">
          <Label className="text-[11px]">Form Title</Label>
          <Input
            value={data.formTitle ?? "Schedule Your Tour"}
            onChange={(e) => updateData({ formTitle: e.target.value })}
            className="h-8 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Form Subtitle</Label>
          <Input
            value={
              data.formSubtitle ??
              "Fill out this quick form and our hospitality desk will reserve your transport seat."
            }
            onChange={(e) => updateData({ formSubtitle: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Submit Button Label</Label>
          <Input
            value={data.submitButtonLabel ?? data.buttonLabel ?? "Confirm Guided Site Visit"}
            onChange={(e) =>
              updateData({ submitButtonLabel: e.target.value, buttonLabel: e.target.value })
            }
            className="h-8 text-xs font-semibold"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 space-y-3">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Direct Hotline & Office
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Phone Hotline</Label>
            <Input
              value={data.phone ?? "01591-134357"}
              onChange={(e) => updateData({ phone: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">WhatsApp Number</Label>
            <Input
              value={data.whatsapp ?? "8801591134357"}
              onChange={(e) => updateData({ whatsapp: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Corporate Office Address</Label>
          <Textarea
            rows={2}
            value={
              data.address ??
              "Corporate Office: 19/2-C, 4th floor, Ring Road, Adabor, Mohammadpur, Dhaka – 1207"
            }
            onChange={(e) => updateData({ address: e.target.value })}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// 9. PROJECT FAQS INSPECTOR
function ProjectFaqInspector({
  data,
  updateData,
}: {
  data: Record<string, any>;
  updateData: (patch: Record<string, unknown>) => void;
}) {
  const defaultFaqs = [
    {
      q: "Where is Southeast City located, and what is the transit time from Dhaka?",
      a: "Southeast City is situated in Bonogram, Savar—directly beside the Mirpur Embankment and Shah Ali Bridge, close to the Mirpur National Zoo. Travel time is only 10 to 15 minutes from Mirpur 1 / Gabtoli and 20 to 25 minutes from Uttara via the embankment expressway.",
    },
    {
      q: "Is Southeast City naturally elevated and flood-free?",
      a: "Yes. Unlike low-lying riverbed projects that require artificial sand filling, Southeast City is situated on natural red-soil high ground well above the 100-year highest flood watermark. This guarantees solid building foundations and zero waterlogging.",
    },
    {
      q: "What is the legal status and documentation of the land?",
      a: "Southeast Landmark Ltd. maintains complete transparency. All land is legally vetted, with 100% genuine CS, SA, RS, and BS record clearance. Plots are mutation-ready with clear title deeds, and our legal team supports every client through registration and possession.",
    },
    {
      q: "What plot sizes and installment options are available?",
      a: "We offer 3 Katha, 5 Katha, 10 Katha residential plots, as well as prime commercial plots along the 60ft Boulevard. Payment options range from upfront full-payment with instant discounts to flexible 36-to-60 month interest-free monthly installments.",
    },
    {
      q: "What infrastructure and utilities will be provided before handover?",
      a: "The master plan includes 60ft, 40ft, and 30ft paved roads, underground drainage with concrete box culverts, subsurface channels for power and water, solar streetlights, 24/7 security with perimeter boundary walls, central mosque, and lake promenade.",
    },
    {
      q: "How can I visit the project site in person?",
      a: "We provide complimentary round-trip air-conditioned transport every Saturday through Thursday from our corporate office in Mohammadpur (Ring Road), Mirpur 1, or Gabtoli. You can submit the booking form above or call our hotline at 01591-134357.",
    },
  ];

  const faqs = Array.isArray(data.items) && data.items.length > 0 ? data.items : defaultFaqs;

  const updateFaq = (idx: number, patch: Record<string, string>) => {
    const next = faqs.map((f: any, i: number) => (i === idx ? { ...f, ...patch } : f));
    updateData({ items: next });
  };

  const addFaq = () => {
    updateData({
      items: [
        ...faqs,
        {
          q: "New Frequently Asked Question?",
          a: "Clear and transparent answer explaining terms, titles, or process.",
        },
      ],
    });
  };

  const removeFaq = (idx: number) => {
    updateData({ items: faqs.filter((_: any, i: number) => i !== idx) });
  };

  const moveFaq = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    updateData({ items: next });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Eyebrow</Label>
        <Input
          value={data.eyebrow ?? "FREQUENTLY ASKED QUESTIONS"}
          onChange={(e) => updateData({ eyebrow: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input
          value={data.title ?? "Essential Answers for Plot Buyers"}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Subtitle</Label>
        <Textarea
          rows={3}
          value={
            data.subtitle ??
            "Everything you need to know about Southeast City's land titles, connectivity, infrastructure, and booking procedures."
          }
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="text-xs"
        />
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            Questions & Answers ({faqs.length})
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addFaq}
            className="h-6 text-[10px] text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Question
          </Button>
        </div>

        <div className="space-y-3">
          {faqs.map((f: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary">Q{i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === 0}
                    onClick={() => moveFaq(i, "up")}
                    className="h-5 w-5 p-0"
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === faqs.length - 1}
                    onClick={() => moveFaq(i, "down")}
                    className="h-5 w-5 p-0"
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaq(i)}
                    className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                    title="Delete question"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Input
                value={f.q || ""}
                onChange={(e) => updateFaq(i, { q: e.target.value })}
                placeholder="Question text..."
                className="h-8 text-[11px] font-semibold"
              />

              <Textarea
                rows={3}
                value={f.a || ""}
                onChange={(e) => updateFaq(i, { a: e.target.value })}
                placeholder="Detailed answer..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
