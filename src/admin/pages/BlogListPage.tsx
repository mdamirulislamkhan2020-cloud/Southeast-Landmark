import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBlogPosts,
  deleteBlogPost,
  duplicateBlogPost,
  listBlogCategories,
  listBlogTags,
} from "../api/content-client";
import type { BlogPost } from "../api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Copy, Search, Clock } from "lucide-react";
import { toast } from "sonner";

const PER_PAGE = 8;

const statusBadge: Record<string, string> = {
  published: "bg-primary/15 text-primary",
  draft: "bg-secondary text-muted-foreground",
  scheduled: "bg-accent/25 text-accent-foreground",
};

export function BlogListPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({ search, status: status as never, category, tag, page, perPage: PER_PAGE }),
    [search, status, category, tag, page],
  );

  const { data, isLoading } = useQuery({ queryKey: ["blog", query], queryFn: () => listBlogPosts(query) });
  const { data: categories = [] } = useQuery({ queryKey: ["blog-categories"], queryFn: listBlogCategories });
  const { data: tags = [] } = useQuery({ queryKey: ["blog-tags"], queryFn: listBlogTags });

  const del = useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog"] }); toast.success("Post deleted"); },
  });
  const dup = useMutation({
    mutationFn: (id: string) => duplicateBlogPost(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog"] }); toast.success("Post duplicated"); },
  });

  const items: BlogPost[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Blog</h1>
          <p className="text-sm text-muted-foreground">Publish articles, manage categories, tags, and SEO.</p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new"><Plus className="mr-1 h-4 w-4" /> Add Blog Post</Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, author, tag..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tag} onValueChange={(v) => { setTag(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {["all", "draft", "published", "scheduled"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-3 py-1.5 border capitalize ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-secondary/40">
                <tr>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Categories</th>
                  <th className="px-4 py-3">Read</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading posts...</td></tr>}
                {!isLoading && items.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No posts match your filters.</td></tr>}
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 overflow-hidden rounded-md bg-secondary">
                          {p.featuredImage && <img src={p.featuredImage} alt="" className="h-full w-full object-cover" loading="lazy" />}
                        </div>
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[280px]">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.author}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.categories.slice(0, 2).map((c) => <span key={c} className="text-[10px] rounded-full bg-secondary px-2 py-0.5">{c}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.readingTime}m</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${statusBadge[p.status] ?? "bg-secondary"}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" title="Duplicate" onClick={() => dup.mutate(p.id)}><Copy className="h-4 w-4" /></Button>
                        <Button asChild size="sm" variant="ghost"><Link to={`/admin/blog/${p.id}`} title="Edit"><Pencil className="h-4 w-4" /></Link></Button>
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
              <div className="text-muted-foreground">Page {page} of {totalPages} · {total} posts</div>
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