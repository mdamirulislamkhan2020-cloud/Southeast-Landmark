import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFaq, deleteFaq, listFaqCategories, listFaqs, reorderFaqs, updateFaq } from "../api/content-client";
import type { Faq } from "../api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";

function FaqEditor({ open, onOpenChange, initial, categories }: { open: boolean; onOpenChange: (v: boolean) => void; initial: Partial<Faq> | null; categories: string[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Faq>>({ question: "", answer: "", category: "General", active: true });
  useEffect(() => { if (open) setForm(initial ?? { question: "", answer: "", category: "General", active: true }); }, [open, initial]);

  const save = async () => {
    if (!form.question) return toast.error("Question is required");
    if (initial?.id) {
      await updateFaq(initial.id, form);
      toast.success("FAQ updated");
    } else {
      await createFaq(form);
      toast.success("FAQ added");
    }
    qc.invalidateQueries({ queryKey: ["faqs"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial?.id ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input value={form.question ?? ""} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea rows={5} value={form.answer ?? ""} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category ?? "General"} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Active</Label>
              <div className="flex items-center gap-2 h-9"><Switch checked={form.active ?? true} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} /><span className="text-sm text-muted-foreground">{form.active ? "Visible" : "Hidden"}</span></div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FaqsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");
  const query = useMemo(() => ({ search, category, active }), [search, category, active]);

  const { data: items = [], isLoading } = useQuery({ queryKey: ["faqs", query], queryFn: () => listFaqs(query) });
  const { data: categories = [] } = useQuery({ queryKey: ["faq-categories"], queryFn: listFaqCategories });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("FAQ deleted"); },
  });

  const toggleActive = async (f: Faq) => {
    await updateFaq(f.id, { active: !f.active });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  };

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = items.map((f) => f.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await reorderFaqs(ids);
    qc.invalidateQueries({ queryKey: ["faqs"] });
    setDragId(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">FAQs</h1>
          <p className="text-sm text-muted-foreground">Drag to reorder. Toggle to hide from the public site.</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Add FAQ</Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question, answer..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={active} onValueChange={(v) => setActive(v as typeof active)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-8 text-center text-muted-foreground text-sm">Loading FAQs...</div>}
          {!isLoading && items.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No FAQs match your filters.</div>}
          <ul className="divide-y divide-border">
            {items.map((f) => (
              <li
                key={f.id}
                draggable
                onDragStart={() => setDragId(f.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(f.id)}
                className={`flex items-start gap-3 p-4 ${dragId === f.id ? "opacity-50" : ""}`}
              >
                <button className="mt-1 cursor-grab text-muted-foreground" title="Drag to reorder"><GripVertical className="h-4 w-4" /></button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] rounded-full bg-secondary px-2 py-0.5">{f.category}</span>
                    {!f.active && <span className="text-[10px] rounded-full bg-muted text-muted-foreground px-2 py-0.5">Hidden</span>}
                  </div>
                  <div className="font-medium mt-1">{f.question}</div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={f.active} onCheckedChange={() => toggleActive(f)} />
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(f); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this FAQ?")) del.mutate(f.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <FaqEditor open={editorOpen} onOpenChange={setEditorOpen} initial={editing} categories={categories.length ? categories : ["General"]} />
    </div>
  );
}