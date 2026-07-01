import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTestimonial, deleteTestimonial, listTestimonials, reorderTestimonials, updateTestimonial } from "../api/content-client";
import type { Testimonial } from "../api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Search, Star } from "lucide-react";
import { toast } from "sonner";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange?.(n)} disabled={!onChange} className="disabled:cursor-default">
          <Star className={`h-4 w-4 ${n <= value ? "text-primary fill-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function TestimonialEditor({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (v: boolean) => void; initial: Partial<Testimonial> | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Testimonial>>({ name: "", position: "", company: "", image: null, rating: 5, review: "", active: true });
  useEffect(() => { if (open) setForm(initial ?? { name: "", position: "", company: "", image: null, rating: 5, review: "", active: true }); }, [open, initial]);

  const set = <K extends keyof Testimonial>(k: K, v: Testimonial[K]) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (file: File | null) => {
    if (!file) return;
    set("image", await fileToDataUrl(file));
  };

  const save = async () => {
    if (!form.name) return toast.error("Name is required");
    if (!form.review) return toast.error("Review is required");
    if (initial?.id) { await updateTestimonial(initial.id, form); toast.success("Testimonial updated"); }
    else { await createTestimonial(form); toast.success("Testimonial added"); }
    qc.invalidateQueries({ queryKey: ["testimonials"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial?.id ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Position</Label><Input value={form.position ?? ""} onChange={(e) => set("position", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Company</Label><Input value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="flex items-center gap-3">
              {form.image ? <img src={form.image} alt="" className="h-14 w-14 rounded-full object-cover" /> : <div className="h-14 w-14 rounded-full bg-secondary" />}
              <div className="flex-1 space-y-2">
                <Input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0] ?? null)} />
                <Input value={form.image ?? ""} onChange={(e) => set("image", e.target.value || null)} placeholder="or paste image URL" />
              </div>
            </div>
          </div>
          <div className="space-y-2"><Label>Rating</Label><Stars value={form.rating ?? 5} onChange={(n) => set("rating", n)} /></div>
          <div className="space-y-2"><Label>Review</Label><Textarea rows={4} value={form.review ?? ""} onChange={(e) => set("review", e.target.value)} /></div>
          <div className="flex items-center gap-2"><Switch checked={form.active ?? true} onCheckedChange={(v) => set("active", v)} /><span className="text-sm text-muted-foreground">Active</span></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TestimonialsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");
  const query = useMemo(() => ({ search, active }), [search, active]);

  const { data: items = [], isLoading } = useQuery({ queryKey: ["testimonials", query], queryFn: () => listTestimonials(query) });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Testimonial deleted"); },
  });

  const toggleActive = async (t: Testimonial) => {
    await updateTestimonial(t.id, { active: !t.active });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = items.map((t) => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await reorderTestimonials(ids);
    qc.invalidateQueries({ queryKey: ["testimonials"] });
    setDragId(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Manage client reviews shown on the public site.</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Add Testimonial</Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, company, review..." className="pl-9" />
        </div>
        <Select value={active} onValueChange={(v) => setActive(v as typeof active)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading testimonials...</CardContent></Card>}
      {!isLoading && items.length === 0 && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No testimonials yet.</CardContent></Card>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <Card
            key={t.id}
            draggable
            onDragStart={() => setDragId(t.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(t.id)}
            className={dragId === t.id ? "opacity-50" : ""}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                {t.image ? <img src={t.image} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-secondary" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{[t.position, t.company].filter(Boolean).join(" · ")}</div>
                  <div className="mt-1"><Stars value={t.rating} /></div>
                </div>
                <button className="cursor-grab text-muted-foreground" title="Drag to reorder"><GripVertical className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4">{t.review}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={t.active} onCheckedChange={() => toggleActive(t)} />
                  {t.active ? "Active" : "Hidden"}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete testimonial from ${t.name}?`)) del.mutate(t.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TestimonialEditor open={editorOpen} onOpenChange={setEditorOpen} initial={editing} />
    </div>
  );
}