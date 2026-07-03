import type { PageStatus } from "../api/types";
import { CheckCircle2, FileEdit, Clock, Archive } from "lucide-react";

const CONFIG: Record<PageStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  draft:     { label: "Draft",     className: "bg-muted text-muted-foreground border border-border",                  Icon: FileEdit },
  published: { label: "Published", className: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",     Icon: CheckCircle2 },
  scheduled: { label: "Scheduled", className: "bg-amber-500/15 text-amber-500 border border-amber-500/30",           Icon: Clock },
  archived:  { label: "Archived",  className: "bg-rose-500/10 text-rose-500 border border-rose-500/30",              Icon: Archive },
};

export function PageStatusBadge({ status, className = "" }: { status: PageStatus; className?: string }) {
  const cfg = CONFIG[status] ?? CONFIG.draft;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.className} ${className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}