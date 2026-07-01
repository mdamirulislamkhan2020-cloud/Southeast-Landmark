import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Copy, Trash2, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { createLeadPage, deleteLeadPage, duplicateLeadPage, listLeadPages } from "../api/lead-pages-client";

export function LeadPagesListPage() {
  const qc = useQueryClient();
  const { data: pages = [] } = useQuery({ queryKey: ["lead-pages"], queryFn: listLeadPages });
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "draft" | "published" | "scheduled" | "archived">("all");

  const filtered = useMemo(() => pages.filter((p) => {
    if (tab !== "all" && p.status !== tab) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.slug.includes(q.toLowerCase())) return false;
    return true;
  }), [pages, q, tab]);

  const create = useMutation({ mutationFn: () => createLeadPage("New Lead Page"), onSuccess: (p) => { toast.success("Lead page created"); qc.invalidateQueries({ queryKey: ["lead-pages"] }); window.location.assign(`/admin/lead-pages/${p.id}`); } });
  const dup = useMutation({ mutationFn: (id: string) => duplicateLeadPage(id), onSuccess: () => { toast.success("Duplicated"); qc.invalidateQueries({ queryKey: ["lead-pages"] }); } });
  const del = useMutation({ mutationFn: (id: string) => deleteLeadPage(id), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["lead-pages"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-semibold">Lead Pages</h1><p className="text-sm text-muted-foreground">Dynamic landing pages published at /lead/&lt;slug&gt;.</p></div>
        <Button onClick={() => create.mutate()}><Plus className="h-4 w-4 mr-2" />New Lead Page</Button>
      </div>

      <Card><CardContent className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or slug…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Category</TableHead>
            <TableHead>Blocks</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">/lead/{p.slug}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.blocks.length}</TableCell>
                <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button asChild size="sm" variant="ghost"><a href={`/lead/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                    <Button asChild size="sm" variant="ghost"><Link to={`/admin/lead-pages/${p.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => dup.mutate(p.id)}><Copy className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this page?")) del.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">No lead pages yet — click New Lead Page.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}