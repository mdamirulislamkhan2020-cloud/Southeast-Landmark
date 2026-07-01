import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileText, Printer, Filter as FilterIcon, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteLead, downloadFile, leadsToCsv, listAssignees, listCrmLeads } from "../api/crm-client";
import { LEAD_STATUSES, type LeadStatus } from "../api/crm";
import { listForms } from "../api/forms-client";
import { listLeadPages } from "../api/lead-pages-client";

const PAGE_SIZE = 10;

export function LeadsCRMPage() {
  const qc = useQueryClient();
  const { data: leads = [] } = useQuery({ queryKey: ["crm-leads"], queryFn: listCrmLeads });
  const { data: assignees = [] } = useQuery({ queryKey: ["crm-assignees"], queryFn: listAssignees });
  const { data: forms = [] } = useQuery({ queryKey: ["forms"], queryFn: listForms });
  const { data: leadPages = [] } = useQuery({ queryKey: ["lead-pages"], queryFn: listLeadPages });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");
  const [formId, setFormId] = useState<string>("all");
  const [leadPageId, setLeadPageId] = useState<string>("all");
  const [utmSource, setUtmSource] = useState<string>("all");
  const [campaign, setCampaign] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);

  const utmSources = useMemo(() => Array.from(new Set(leads.map((l) => l.analytics.utmSource).filter(Boolean))) as string[], [leads]);
  const campaigns = useMemo(() => Array.from(new Set(leads.map((l) => l.analytics.campaign || l.analytics.utmCampaign).filter(Boolean))) as string[], [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (assignee !== "all" && l.assignedTo !== (assignee === "none" ? null : assignee)) return false;
      if (formId !== "all" && l.formId !== (formId === "none" ? null : formId)) return false;
      if (leadPageId !== "all" && l.leadPageId !== (leadPageId === "none" ? null : leadPageId)) return false;
      if (utmSource !== "all" && (l.analytics.utmSource ?? "") !== utmSource) return false;
      if (campaign !== "all" && ((l.analytics.campaign ?? l.analytics.utmCampaign ?? "")) !== campaign) return false;
      if (dateFrom && new Date(l.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(l.createdAt) > new Date(dateTo + "T23:59:59")) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = [l.name, l.email, l.phone, l.code, l.source, l.formName, l.leadPageSlug, JSON.stringify(l.answers)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [leads, status, assignee, formId, leadPageId, utmSource, campaign, dateFrom, dateTo, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const del = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => { toast.success("Lead deleted"); qc.invalidateQueries({ queryKey: ["crm-leads"] }); },
  });

  function assigneeName(id: string | null) { return assignees.find((a) => a.id === id)?.name ?? "—"; }

  function exportCsv() {
    downloadFile(`leads-${new Date().toISOString().slice(0, 10)}.csv`, leadsToCsv(filtered), "text/csv;charset=utf-8");
  }
  function exportExcel() {
    // CSV opens natively in Excel; suffix as .xls for compatibility
    downloadFile(`leads-${new Date().toISOString().slice(0, 10)}.xls`, leadsToCsv(filtered), "application/vnd.ms-excel");
  }
  function exportPdf() {
    const rows = filtered.map((l) => `<tr><td>${l.code}</td><td>${l.name}</td><td>${l.email}</td><td>${l.phone}</td><td>${l.status}</td><td>${l.score}</td><td>${l.source}</td><td>${new Date(l.createdAt).toLocaleDateString()}</td></tr>`).join("");
    const html = `<html><head><title>Leads Export</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Leads Export — ${new Date().toLocaleString()}</h2><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Score</th><th>Source</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lead CRM</h1>
          <p className="text-sm text-muted-foreground">Every submission from Lead Forms & Lead Pages appears here automatically.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportExcel}><FileText className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPdf}><Printer className="h-4 w-4 mr-1" /> PDF / Print</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><FilterIcon className="h-4 w-4" /> Filters</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative col-span-full lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Global search: name, email, phone, code, campaign, answer…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v as LeadStatus | "all"); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={assignee} onValueChange={(v) => { setAssignee(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                {assignees.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={formId} onValueChange={(v) => { setFormId(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Form" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All forms</SelectItem>
                <SelectItem value="none">No form</SelectItem>
                {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={leadPageId} onValueChange={(v) => { setLeadPageId(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Lead Page" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lead pages</SelectItem>
                <SelectItem value="none">No lead page</SelectItem>
                {leadPages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={utmSource} onValueChange={(v) => { setUtmSource(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="UTM Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All UTM sources</SelectItem>
                {utmSources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={campaign} onValueChange={(v) => { setCampaign(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                {campaigns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Showing {current.length} of {filtered.length} leads (total {leads.length}).</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Lead Page</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>UTM Source</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length === 0 && (
                <TableRow><TableCell colSpan={14} className="text-center text-muted-foreground py-10">No leads match your filters.</TableCell></TableRow>
              )}
              {current.map((l) => {
                const s = LEAD_STATUSES.find((x) => x.value === l.status);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.code}</TableCell>
                    <TableCell className="font-medium"><Link to={`/admin/leads/${l.id}`} className="hover:underline">{l.name}</Link></TableCell>
                    <TableCell className="text-muted-foreground">{l.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.formName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.leadPageSlug ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.analytics.campaign ?? l.analytics.utmCampaign ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.analytics.utmSource ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{l.analytics.device ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{assigneeName(l.assignedTo)}</TableCell>
                    <TableCell><span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${s?.tone ?? ""}`}>{s?.label ?? l.status}</span></TableCell>
                    <TableCell><Badge variant={l.score >= 70 ? "default" : l.score >= 40 ? "secondary" : "outline"}>{l.score}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon"><Link to={`/admin/leads/${l.id}`}><ExternalLink className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this lead?")) del.mutate(l.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}