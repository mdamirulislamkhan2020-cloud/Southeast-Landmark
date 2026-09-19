import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Search, Trash2, Copy, Pencil, FolderPlus, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, listMedia, renameMedia, uploadMedia } from "../api/settings-client";
import type { MediaFile } from "../api/settings";

function formatSize(n: number) { if (n < 1024) return `${n} B`; if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`; return `${(n / 1024 / 1024).toFixed(2)} MB`; }

export function MediaPage() {
  const qc = useQueryClient();
  const { data: files = [] } = useQuery({ queryKey: ["media"], queryFn: listMedia });
  const [folder, setFolder] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const folders = useMemo(() => {
    const set = new Set<string>(["root", ...customFolders, ...files.map((f) => f.folder)]);
    return Array.from(set);
  }, [files, customFolders]);

  const filtered = useMemo(() => files.filter((f) => {
    if (folder !== "all" && f.folder !== folder) return false;
    if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [files, folder, q]);

  const up = useMutation({
    mutationFn: async (list: FileList) => { for (const f of Array.from(list)) await uploadMedia(f, folder === "all" ? "root" : folder); },
    onSuccess: () => { toast.success("Uploaded"); qc.invalidateQueries({ queryKey: ["media"] }); },
    onError: () => toast.error("Upload failed"),
  });
  const del = useMutation({ mutationFn: (id: string) => deleteMedia(id), onSuccess: () => { toast.success("Deleted"); setSelected(null); qc.invalidateQueries({ queryKey: ["media"] }); } });
  const rn = useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => renameMedia(id, name), onSuccess: () => { toast.success("Renamed"); qc.invalidateQueries({ queryKey: ["media"] }); } });

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.files.length) up.mutate(e.dataTransfer.files); };
  const addFolder = () => { const n = prompt("New folder name"); if (n) setCustomFolders((v) => [...v, n]); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-semibold">Media Library</h1><p className="text-sm text-muted-foreground">Manage images, PDFs, SVG and icons.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addFolder}><FolderPlus className="h-4 w-4 mr-2" />New Folder</Button>
          <input ref={inputRef} type="file" multiple hidden accept="image/*,application/pdf,image/svg+xml" onChange={(e) => e.target.files && up.mutate(e.target.files)} />
          <Button onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Upload</Button>
        </div>
      </div>

      <Card><CardContent className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            {folders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent></Card>

      <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="rounded-lg border-2 border-dashed border-border p-4 min-h-[300px]">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-sm text-muted-foreground gap-2">
            <Upload className="h-8 w-8" />
            <div>Drag & drop files here, or use the Upload button</div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((f) => (
            <button key={f.id} onClick={() => setSelected(f)} className="group rounded-md border border-border bg-card overflow-hidden text-left hover:border-primary transition">
              <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                {typeof f.mime === "string" && f.mime.startsWith("image/") ? (
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-2">
                <div className="text-xs font-medium truncate">{f.name}</div>
                <div className="text-[10px] text-muted-foreground">{formatSize(f.size)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-secondary p-2 flex items-center justify-center min-h-[200px]">
                {typeof selected.mime === "string" && selected.mime.startsWith("image/") ? (
                  <img src={selected.url} alt={selected.name} className="max-h-[360px] object-contain" />
                ) : (
                  <FileText className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {selected.mime}</div>
                <div><span className="text-muted-foreground">Size:</span> {formatSize(selected.size)}</div>
                <div><span className="text-muted-foreground">Folder:</span> {selected.folder}</div>
                <div><span className="text-muted-foreground">Uploaded:</span> {new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(selected.url); toast.success("URL copied"); }}><Copy className="h-4 w-4 mr-2" />Copy URL</Button>
                <Button variant="outline" size="sm" onClick={() => { const n = prompt("Rename to", selected.name); if (n) rn.mutate({ id: selected.id, name: n }); }}><Pencil className="h-4 w-4 mr-2" />Rename</Button>
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this file?")) del.mutate(selected.id); }}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}