import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProperties, deleteProperty, listCategories } from "../api/properties-client";
import type { Property } from "../api/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ExternalLink, Search, Star } from "lucide-react";
import { toast } from "sonner";

const PER_PAGE = 8;

const listingBadge: Record<string, string> = {
  available: "bg-primary/15 text-primary",
  sold: "bg-destructive/15 text-destructive",
  reserved: "bg-accent/25 text-accent-foreground",
  upcoming: "bg-secondary text-muted-foreground",
};

const formatBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n);

export function PropertiesListPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({ search, status: status as never, type, category, page, perPage: PER_PAGE }),
    [search, status, type, category, page],
  );

  const { data, isLoading } = useQuery({ queryKey: ["properties", query], queryFn: () => listProperties(query) });
  const { data: categories = [] } = useQuery({ queryKey: ["property-categories"], queryFn: listCategories });

  const del = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted");
    },
  });

  const items: Property[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Properties</h1>
          <p className="text-sm text-muted-foreground">Manage listings, gallery, pricing, and investment details.</p>
        </div>
        <Button asChild>
          <Link to="/admin/properties/new"><Plus className="mr-1 h-4 w-4" /> Add Property</Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, address, area..." className="pl-9" />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="duplex">Duplex</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {["all", "draft", "published"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-3 py-1.5 border ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s === "all" ? "All" : s === "draft" ? "Drafts" : "Published"}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-secondary/40">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading properties...</td></tr>}
                {!isLoading && items.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No properties match your filters.</td></tr>}
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 overflow-hidden rounded-md bg-secondary">
                          {p.featuredImage && <img src={p.featuredImage} alt="" className="h-full w-full object-cover" loading="lazy" />}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            {p.title}
                            {p.featured && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{p.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.location.area}, {p.location.city}</td>
                    <td className="px-4 py-3">{formatBDT(p.pricing.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${listingBadge[p.listingStatus] ?? "bg-secondary"}`}>{p.listingStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.status === "published" ? "text-xs rounded-full px-2 py-0.5 bg-primary/15 text-primary" : "text-xs rounded-full px-2 py-0.5 bg-secondary text-muted-foreground"}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost"><a href={`/property?id=${p.id}`} target="_blank" rel="noreferrer" title="Preview"><ExternalLink className="h-4 w-4" /></a></Button>
                        <Button asChild size="sm" variant="ghost"><Link to={`/admin/properties/${p.id}`} title="Edit"><Pencil className="h-4 w-4" /></Link></Button>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <div className="text-muted-foreground">Page {page} of {totalPages} · {total} properties</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}