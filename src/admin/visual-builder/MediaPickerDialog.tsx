import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listMedia, uploadMedia } from "../api/settings-client";
import type { MediaFile } from "../api/settings";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export function MediaPickerDialog({ open, onOpenChange, onSelect, currentValue }: MediaPickerDialogProps) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string>(currentValue || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media"],
    queryFn: listMedia,
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileList: FileList) => {
      const file = fileList[0];
      if (!file) throw new Error("No file selected");
      const isImg =
        (file.type && file.type.startsWith("image/")) ||
        Boolean(file.name.match(/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i));
      if (!isImg) {
        throw new Error("Please select a valid image file (JPG, PNG, WebP, SVG, GIF)");
      }
      return await uploadMedia(file, "uploads");
    },
    onSuccess: (uploaded) => {
      if (!uploaded || !uploaded.url) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
      toast.success("Image uploaded successfully");
      qc.invalidateQueries({ queryKey: ["media"] });
      setSelectedUrl(uploaded.url);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Image upload failed. Please try again.");
    },
  });

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (!f) return false;
      const rawMime = typeof f.mime === "string" ? f.mime : typeof f.mimeType === "string" ? f.mimeType : "";
      const isImageMime = typeof rawMime === "string" && rawMime.toLowerCase().startsWith("image/");
      const isImageExt = typeof f.name === "string" && Boolean(f.name.match(/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i));
      if (!isImageMime && !isImageExt) return false;
      if (q && typeof f.name === "string" && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [files, q]);

  const handleConfirm = () => {
    if (selectedUrl && typeof selectedUrl === "string" && selectedUrl.trim()) {
      onSelect(selectedUrl.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Select from Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onClick={(e) => {
              (e.currentTarget as HTMLInputElement).value = "";
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                uploadMutation.mutate(e.target.files);
              }
            }}
          />
          <Button
            variant="outline"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Image
          </Button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto border border-border rounded-lg p-3 min-h-[300px] max-h-[420px] bg-secondary/10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading media assets...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
              <p className="font-medium text-sm">No image assets found</p>
              <p className="text-xs mt-1">Upload a photo to add it to your library</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((f) => {
                const isSelected = selectedUrl === f.url;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedUrl(f.url)}
                    className={`group relative aspect-square rounded-md overflow-hidden border transition-all text-left bg-background ${
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={f.url}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4">
                      <p className="text-[10px] text-white font-medium truncate">{f.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected image preview & manual input */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Image URL:</span>
            <Input
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs h-8"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUrl}>
            Insert Selected Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
