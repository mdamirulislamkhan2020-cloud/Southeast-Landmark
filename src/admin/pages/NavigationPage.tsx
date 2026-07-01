import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus, Trash2, Copy, GripVertical, ChevronRight, ChevronDown,
  Eye, EyeOff, ExternalLink, Menu as MenuIcon, Save, Settings2,
  Layout, Smartphone, PanelTop, LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  listMenus, createMenu, updateMenu, deleteMenu, duplicateMenu, newMenuItem,
  getHeaderSettings, saveHeaderSettings,
  getFooterSettings, saveFooterSettings,
  getMobileMenuSettings, saveMobileMenuSettings,
  buildTree,
} from "../api/navigation-client";
import type {
  Menu, MenuItem, MenuLocation, MenuVisibility, HeaderSettings,
  FooterSettings, MobileMenuSettings,
} from "../api/navigation";
import { LOCATION_LABELS, VISIBILITY_LABELS } from "../api/navigation";
import { listPages } from "../api/client";
import type { CmsPage } from "../api/types";
import { toErrorMessage } from "@/lib/error-handler";

// -------------------------------------------------------------------

function MenuItemRow({
  item, depth, pages, onChange, onDelete, onDuplicate, onDragStart, onDragOver, onDrop, dragOverId,
}: {
  item: MenuItem;
  depth: number;
  pages: CmsPage[];
  onChange: (patch: Partial<MenuItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDrop: (id: string, mode: "before" | "after" | "child") => void;
  dragOverId: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(item.id); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(item.id, e); }}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation();
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const x = e.clientX - rect.left;
        const mode = x > rect.width * 0.6 ? "child" : y > rect.height / 2 ? "after" : "before";
        onDrop(item.id, mode);
      }}
      className={`rounded-md border ${dragOverId === item.id ? "border-primary" : "border-border"} bg-card`}
      style={{ marginLeft: depth * 20 }}
    >
      <div className="flex items-center gap-2 p-2">
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
        <button className="text-muted-foreground" onClick={() => setOpen((v) => !v)} aria-label="toggle">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{item.label || "Untitled"}</span>
            {!item.enabled && <Badge variant="outline" className="text-[10px]">Disabled</Badge>}
            <Badge variant="secondary" className="text-[10px] font-normal">{item.linkType}</Badge>
          </div>
          <div className="truncate text-xs text-muted-foreground">{item.url || "—"}</div>
        </div>
        <Switch checked={item.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
        <Button size="icon" variant="ghost" onClick={onDuplicate} title="Duplicate"><Copy className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={onDelete} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      {open && (
        <div className="grid gap-3 border-t border-border p-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Link Type</Label>
            <Select value={item.linkType} onValueChange={(v: MenuItem["linkType"]) => onChange({ linkType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Page</SelectItem>
                <SelectItem value="external">External Link</SelectItem>
                <SelectItem value="anchor">Anchor / URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {item.linkType === "internal" ? (
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">Page</Label>
              <Select
                value={item.pageId ?? item.url}
                onValueChange={(v) => {
                  const p = pages.find((pg) => pg.id === v);
                  onChange(p ? { pageId: p.id, url: p.slug } : { pageId: null, url: v });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                <SelectContent>
                  {pages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} — {p.slug}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">URL</Label>
              <Input value={item.url} onChange={(e) => onChange({ url: e.target.value, pageId: null })} placeholder={item.linkType === "external" ? "https://example.com" : "/path or #anchor"} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Icon (lucide name)</Label>
            <Input value={item.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value || null })} placeholder="e.g. Home" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Visibility</Label>
            <Select value={item.visibility} onValueChange={(v: MenuVisibility) => onChange({ visibility: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(VISIBILITY_LABELS) as MenuVisibility[]).map((k) => (
                  <SelectItem key={k} value={k}>{VISIBILITY_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CSS class</Label>
            <Input value={item.cssClass ?? ""} onChange={(e) => onChange({ cssClass: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={item.newTab} onCheckedChange={(v) => onChange({ newTab: v })} />
              <Label className="text-xs">Open in new tab</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderTree(
  items: MenuItem[],
  pages: CmsPage[],
  updateItem: (id: string, patch: Partial<MenuItem>) => void,
  deleteItem: (id: string) => void,
  duplicateItem: (id: string) => void,
  onDragStart: (id: string) => void,
  onDragOver: (id: string, e: React.DragEvent) => void,
  onDrop: (id: string, mode: "before" | "after" | "child") => void,
  dragOverId: string | null,
) {
  const tree = buildTree(items);
  const walk = (nodes: ReturnType<typeof buildTree>): ReactElement[] =>
    nodes.flatMap((n) => [
      <MenuItemRow
        key={n.id}
        item={n}
        depth={n.depth}
        pages={pages}
        onChange={(patch) => updateItem(n.id, patch)}
        onDelete={() => deleteItem(n.id)}
        onDuplicate={() => duplicateItem(n.id)}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        dragOverId={dragOverId}
      />,
      ...walk(n.children),
    ]);
  return <div className="space-y-2">{walk(tree)}</div>;
}

// -------------------------------------------------------------------

function LivePreview({ items, title }: { items: MenuItem[]; title: string }) {
  const tree = buildTree(items.filter((i) => i.enabled));
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title} — Live Preview</CardTitle></CardHeader>
      <CardContent>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-border bg-background p-4">
          {tree.length === 0 && <span className="text-xs text-muted-foreground">No enabled items</span>}
          {tree.map((n) => (
            <div key={n.id} className="group relative">
              <span className="text-sm font-medium text-foreground/80 hover:text-primary">{n.label}</span>
              {n.children.length > 0 && (
                <div className="mt-2 min-w-40 rounded-md border border-border bg-card p-2 shadow-sm">
                  {n.children.map((c) => (
                    <div key={c.id} className="px-2 py-1 text-xs text-muted-foreground hover:text-primary">
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------------

function MenuEditor({ menu, pages }: { menu: Menu; pages: CmsPage[] }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Menu>(menu);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setDraft(menu); setDirty(false); }, [menu]);

  const updateDraft = (patch: Partial<Menu>) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); };

  const addItem = () => {
    const item = newMenuItem({ label: "New Item", url: "/", sortOrder: draft.items.length });
    updateDraft({ items: [...draft.items, item] });
  };

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    updateDraft({ items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  };

  const deleteItem = (id: string) => {
    // orphan children go to root
    updateDraft({
      items: draft.items
        .filter((it) => it.id !== id)
        .map((it) => (it.parentId === id ? { ...it, parentId: null } : it)),
    });
  };

  const duplicateItem = (id: string) => {
    const src = draft.items.find((it) => it.id === id);
    if (!src) return;
    const clone = newMenuItem({ ...src, sortOrder: draft.items.length });
    updateDraft({ items: [...draft.items, clone] });
  };

  const onDrop = (targetId: string, mode: "before" | "after" | "child") => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const items = [...draft.items];
    const src = items.find((i) => i.id === dragId);
    const tgt = items.find((i) => i.id === targetId);
    if (!src || !tgt) return;

    // prevent dropping onto own descendant
    const isDescendant = (parentId: string | null): boolean => {
      if (!parentId) return false;
      if (parentId === dragId) return true;
      const p = items.find((i) => i.id === parentId);
      return p ? isDescendant(p.parentId) : false;
    };
    if (isDescendant(tgt.id)) { setDragId(null); setDragOverId(null); return; }

    if (mode === "child") {
      src.parentId = tgt.id;
      src.sortOrder = Math.max(0, ...items.filter((i) => i.parentId === tgt.id).map((i) => i.sortOrder)) + 1;
    } else {
      src.parentId = tgt.parentId;
      const siblings = items.filter((i) => i.parentId === tgt.parentId && i.id !== src.id).sort((a, b) => a.sortOrder - b.sortOrder);
      const tgtIdx = siblings.findIndex((i) => i.id === tgt.id);
      const insertAt = mode === "before" ? tgtIdx : tgtIdx + 1;
      siblings.splice(insertAt, 0, src);
      siblings.forEach((s, i) => { s.sortOrder = i; });
    }
    updateDraft({ items: [...items] });
    setDragId(null); setDragOverId(null);
  };

  const onSave = async () => {
    try {
      await updateMenu(draft.id, draft);
      qc.invalidateQueries({ queryKey: ["admin-menus"] });
      setDirty(false);
      toast.success("Menu saved");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Menu Name</Label>
                <Input value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug</Label>
                <Input value={draft.slug} onChange={(e) => updateDraft({ slug: e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase() })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <Select value={draft.location} onValueChange={(v: MenuLocation) => updateDraft({ location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LOCATION_LABELS) as MenuLocation[]).map((k) => (
                      <SelectItem key={k} value={k}>{LOCATION_LABELS[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={draft.enabled} onCheckedChange={(v) => updateDraft({ enabled: v })} />
                <Label className="text-xs">{draft.enabled ? "Enabled" : "Disabled"}</Label>
              </div>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4" />Add item</Button>
                <Button size="sm" onClick={onSave} disabled={!dirty}><Save className="mr-1 h-4 w-4" />Save {dirty && "•"}</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {draft.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No menu items. Click <b>Add item</b> to get started.
            </div>
          ) : (
            renderTree(
              draft.items, pages, updateItem, deleteItem, duplicateItem,
              setDragId,
              (id) => setDragOverId(id),
              onDrop,
              dragOverId,
            )
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Drag rows to reorder. Drop on the right side of a row to nest it as a child.
          </p>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <LivePreview items={draft.items} title={draft.name} />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Available CMS pages</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {pages.length === 0 && <div className="text-xs text-muted-foreground">No pages yet.</div>}
            {pages.map((p) => (
              <button
                key={p.id}
                className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-secondary"
                onClick={() => updateDraft({ items: [...draft.items, newMenuItem({ label: p.title, url: p.slug, pageId: p.id, sortOrder: draft.items.length })] })}
              >
                <span className="truncate">{p.title}</span>
                <span className="text-xs text-muted-foreground">{p.slug}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------

function HeaderSettingsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["header-settings"], queryFn: getHeaderSettings });
  const [form, setForm] = useState<HeaderSettings | null>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);
  if (!form) return null;
  const update = (patch: Partial<HeaderSettings>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const save = async () => {
    try {
      await saveHeaderSettings(form);
      qc.invalidateQueries({ queryKey: ["header-settings"] });
      toast.success("Header settings saved");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Header Settings</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2"><Switch checked={form.visible} onCheckedChange={(v) => update({ visible: v })} /><Label>Show Header</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.sticky} onCheckedChange={(v) => update({ sticky: v })} /><Label>Sticky</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.transparent} onCheckedChange={(v) => update({ transparent: v })} /><Label>Transparent</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.showTopBar} onCheckedChange={(v) => update({ showTopBar: v })} /><Label>Show Top Bar</Label></div>
        <div className="space-y-1"><Label>Background</Label><Input value={form.backgroundColor} onChange={(e) => update({ backgroundColor: e.target.value })} /></div>
        <div className="space-y-1"><Label>Height (px)</Label><Input type="number" value={form.height} onChange={(e) => update({ height: Number(e.target.value) })} /></div>
        <div className="space-y-1"><Label>Logo URL</Label><Input value={form.logo ?? ""} onChange={(e) => update({ logo: e.target.value || null })} /></div>
        <div className="space-y-1"><Label>Mobile Logo URL</Label><Input value={form.mobileLogo ?? ""} onChange={(e) => update({ mobileLogo: e.target.value || null })} /></div>
        <div className="space-y-1"><Label>Header menu slug</Label><Input value={form.headerMenuSlug} onChange={(e) => update({ headerMenuSlug: e.target.value })} /></div>
        <div className="space-y-1"><Label>Top bar menu slug</Label><Input value={form.topBarMenuSlug} onChange={(e) => update({ topBarMenuSlug: e.target.value })} /></div>
        <div className="space-y-1"><Label>Top bar text</Label><Input value={form.topBarText} onChange={(e) => update({ topBarText: e.target.value })} /></div>
        <Separator className="md:col-span-2" />
        <div className="flex items-center gap-2"><Switch checked={form.ctaEnabled} onCheckedChange={(v) => update({ ctaEnabled: v })} /><Label>Enable CTA button</Label></div>
        <div />
        <div className="space-y-1"><Label>CTA text</Label><Input value={form.ctaText} onChange={(e) => update({ ctaText: e.target.value })} /></div>
        <div className="space-y-1"><Label>CTA link</Label><Input value={form.ctaLink} onChange={(e) => update({ ctaLink: e.target.value })} /></div>
        <div className="md:col-span-2"><Button onClick={save}><Save className="mr-1 h-4 w-4" />Save header</Button></div>
      </CardContent>
    </Card>
  );
}

function FooterSettingsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["footer-settings"], queryFn: getFooterSettings });
  const [form, setForm] = useState<FooterSettings | null>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);
  if (!form) return null;
  const update = (patch: Partial<FooterSettings>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const save = async () => {
    try {
      await saveFooterSettings(form);
      qc.invalidateQueries({ queryKey: ["footer-settings"] });
      toast.success("Footer settings saved");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Footer Settings</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2"><Switch checked={form.visible} onCheckedChange={(v) => update({ visible: v })} /><Label>Show Footer</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.showSocials} onCheckedChange={(v) => update({ showSocials: v })} /><Label>Show socials</Label></div>
        <div className="space-y-1"><Label>Columns</Label><Input type="number" min={1} max={6} value={form.columns} onChange={(e) => update({ columns: Number(e.target.value) })} /></div>
        <div className="space-y-1"><Label>Background</Label><Input value={form.backgroundColor} onChange={(e) => update({ backgroundColor: e.target.value })} /></div>
        <div className="space-y-1"><Label>Footer menu slug</Label><Input value={form.footerMenuSlug} onChange={(e) => update({ footerMenuSlug: e.target.value })} /></div>
        <div className="space-y-1 md:col-span-2"><Label>Copyright text</Label><Textarea rows={2} value={form.copyright} onChange={(e) => update({ copyright: e.target.value })} /></div>
        <div className="md:col-span-2"><Button onClick={save}><Save className="mr-1 h-4 w-4" />Save footer</Button></div>
      </CardContent>
    </Card>
  );
}

function MobileSettingsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["mobile-menu-settings"], queryFn: getMobileMenuSettings });
  const [form, setForm] = useState<MobileMenuSettings | null>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);
  if (!form) return null;
  const update = (patch: Partial<MobileMenuSettings>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const save = async () => {
    try {
      await saveMobileMenuSettings(form);
      qc.invalidateQueries({ queryKey: ["mobile-menu-settings"] });
      toast.success("Mobile menu saved");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Mobile Menu</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2"><Switch checked={form.enabled} onCheckedChange={(v) => update({ enabled: v })} /><Label>Enable mobile menu</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.hamburger} onCheckedChange={(v) => update({ hamburger: v })} /><Label>Hamburger toggle</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.showCta} onCheckedChange={(v) => update({ showCta: v })} /><Label>Show CTA on mobile</Label></div>
        <div className="space-y-1"><Label>Mobile menu slug</Label><Input value={form.mobileMenuSlug} onChange={(e) => update({ mobileMenuSlug: e.target.value })} /></div>
        <div className="md:col-span-2"><Button onClick={save}><Save className="mr-1 h-4 w-4" />Save mobile</Button></div>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------------

export function NavigationPage() {
  const qc = useQueryClient();
  const { data: menus = [] } = useQuery({ queryKey: ["admin-menus"], queryFn: listMenus });
  const { data: pages = [] } = useQuery({ queryKey: ["admin-pages"], queryFn: listPages });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newForm, setNewForm] = useState<{ name: string; slug: string; location: MenuLocation }>({ name: "", slug: "", location: "custom" });

  useEffect(() => {
    if (!selectedId && menus.length > 0) setSelectedId(menus[0].id);
  }, [menus, selectedId]);

  const selected = useMemo(() => menus.find((m) => m.id === selectedId) ?? null, [menus, selectedId]);

  const doCreate = async () => {
    if (!newForm.name) return toast.error("Name is required");
    try {
      const m = await createMenu(newForm);
      qc.invalidateQueries({ queryKey: ["admin-menus"] });
      setSelectedId(m.id);
      setCreateOpen(false);
      setNewForm({ name: "", slug: "", location: "custom" });
      toast.success("Menu created");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };

  const doDelete = async (id: string) => {
    if (!confirm("Delete this menu?")) return;
    try {
      await deleteMenu(id);
      qc.invalidateQueries({ queryKey: ["admin-menus"] });
      if (selectedId === id) setSelectedId(null);
      toast.success("Menu deleted");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };

  const doDuplicate = async (id: string) => {
    try {
      const m = await duplicateMenu(id);
      qc.invalidateQueries({ queryKey: ["admin-menus"] });
      setSelectedId(m.id);
      toast.success("Menu duplicated");
    } catch (err) { toast.error(toErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Navigation Manager</h1>
          <p className="text-sm text-muted-foreground">Build unlimited menus, header, footer and mobile navigation.</p>
        </div>
      </div>

      <Tabs defaultValue="menus">
        <TabsList>
          <TabsTrigger value="menus"><MenuIcon className="mr-1 h-4 w-4" />Menus</TabsTrigger>
          <TabsTrigger value="header"><PanelTop className="mr-1 h-4 w-4" />Header</TabsTrigger>
          <TabsTrigger value="footer"><Layout className="mr-1 h-4 w-4" />Footer</TabsTrigger>
          <TabsTrigger value="mobile"><Smartphone className="mr-1 h-4 w-4" />Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="menus" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm">Menus</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" />New</Button>
              </CardHeader>
              <CardContent className="space-y-1">
                {menus.length === 0 && <div className="text-xs text-muted-foreground">No menus yet.</div>}
                {menus.map((m) => (
                  <div key={m.id} className={`group flex items-center gap-1 rounded-md border ${selectedId === m.id ? "border-primary bg-secondary" : "border-transparent"} px-2 py-1.5`}>
                    <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedId(m.id)}>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{m.name}</span>
                        {!m.enabled && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{LOCATION_LABELS[m.location]} · {m.slug} · {m.items.length} items</div>
                    </button>
                    <Button size="icon" variant="ghost" onClick={() => doDuplicate(m.id)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => doDelete(m.id)} title="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div>
              {selected ? (
                <MenuEditor menu={selected} pages={pages} />
              ) : (
                <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Select a menu on the left to edit.</CardContent></Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="header" className="mt-4"><HeaderSettingsPanel /></TabsContent>
        <TabsContent value="footer" className="mt-4"><FooterSettingsPanel /></TabsContent>
        <TabsContent value="mobile" className="mt-4"><MobileSettingsPanel /></TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create new menu</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Slug</Label><Input value={newForm.slug} onChange={(e) => setNewForm((f) => ({ ...f, slug: e.target.value }))} placeholder="my-menu" /></div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={newForm.location} onValueChange={(v: MenuLocation) => setNewForm((f) => ({ ...f, location: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(LOCATION_LABELS) as MenuLocation[]).map((k) => (
                    <SelectItem key={k} value={k}>{LOCATION_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={doCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}