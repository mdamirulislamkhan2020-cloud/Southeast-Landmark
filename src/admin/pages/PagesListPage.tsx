import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPages, deletePage, duplicatePage } from "../api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Copy, Trash2, Pencil, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

export function PagesListPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["pages"], queryFn: listPages });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["pages"] });

  const del = useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => { invalidate(); toast.success("Page deleted"); },
  });
  const dup = useMutation({
    mutationFn: (id: string) => duplicatePage(id),
    onSuccess: () => { invalidate(); toast.success("Page duplicated"); },
  });

  const filtered = data.filter((p) =>
    q ? (p.title + p.slug).toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Pages</h1>
          <p className="text-sm text-muted-foreground">Create, edit, duplicate, schedule and publish website pages.</p>
        </div>
        <Button asChild>
          <Link to="/admin/pages/new"><Plus className="mr-1 h-4 w-4" /> New Page</Link>
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-secondary/40">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (<tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>)}
                {!isLoading && filtered.length === 0 && (<tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No pages found.</td></tr>)}
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.slug}</td>
                    <td className="px-4 py-3">
                      <span className={
                        p.status === "published" ? "text-xs rounded-full px-2 py-0.5 bg-primary/15 text-primary" :
                        p.status === "scheduled" ? "text-xs rounded-full px-2 py-0.5 bg-accent/20 text-accent-foreground" :
                        "text-xs rounded-full px-2 py-0.5 bg-secondary text-muted-foreground"
                      }>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost"><a href={p.slug} target="_blank" rel="noreferrer" title="Preview"><ExternalLink className="h-4 w-4" /></a></Button>
                        <Button asChild size="sm" variant="ghost"><Link to={`/admin/pages/${p.id}`} title="Edit"><Pencil className="h-4 w-4" /></Link></Button>
                        <Button size="sm" variant="ghost" title="Duplicate" onClick={() => dup.mutate(p.id)}><Copy className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" title="Delete" onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}