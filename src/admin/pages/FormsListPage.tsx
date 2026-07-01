import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Copy, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { createForm, deleteForm, duplicateForm, listForms } from "../api/forms-client";

export function FormsListPage() {
  const qc = useQueryClient();
  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "draft" | "published">("all");

  const filtered = useMemo(() => forms.filter((f) => {
    if (tab !== "all" && f.settings.status !== tab) return false;
    if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [forms, q, tab]);

  const create = useMutation({ mutationFn: () => createForm("New Form"), onSuccess: (f) => { toast.success("Form created"); qc.invalidateQueries({ queryKey: ["forms"] }); window.location.assign(`/admin/forms/${f.id}`); } });
  const dup = useMutation({ mutationFn: (id: string) => duplicateForm(id), onSuccess: () => { toast.success("Duplicated"); qc.invalidateQueries({ queryKey: ["forms"] }); } });
  const del = useMutation({ mutationFn: (id: string) => deleteForm(id), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["forms"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-semibold">Lead Forms</h1><p className="text-sm text-muted-foreground">Dynamic drag-and-drop form builder.</p></div>
        <Button onClick={() => create.mutate()}><Plus className="h-4 w-4 mr-2" />New Form</Button>
      </div>

      <Card><CardContent className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search forms…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="draft">Draft</TabsTrigger><TabsTrigger value="published">Published</TabsTrigger></TabsList>
        </Tabs>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Fields</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">/{f.settings.slug}</TableCell>
                <TableCell>{f.fields.length}</TableCell>
                <TableCell><Badge variant={f.settings.status === "published" ? "default" : "secondary"}>{f.settings.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(f.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button asChild size="sm" variant="ghost"><Link to={`/admin/forms/${f.id}?tab=preview`}><Eye className="h-4 w-4" /></Link></Button>
                    <Button asChild size="sm" variant="ghost"><Link to={`/admin/forms/${f.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => dup.mutate(f.id)}><Copy className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this form?")) del.mutate(f.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No forms yet — click New Form to start.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}