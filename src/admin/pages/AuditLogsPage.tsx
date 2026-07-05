import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Search } from "lucide-react";
import { listActivity, type ActivityEntry } from "@/admin/api/activity-log-client";

const PAGE_SIZE = 25;

function toCsv(rows: ActivityEntry[]): string {
  const header = ["When", "User", "Action", "Entity", "Entity ID", "Message"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    new Date(r.createdAt).toISOString(),
    r.actorEmail ?? "",
    r.action,
    r.entity ?? "",
    r.entityId ?? "",
    r.message,
  ].map((v) => escape(String(v))).join(","));
  return [header.join(","), ...lines].join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ActivityTable({ rows }: { rows: ActivityEntry[] }) {
  const [q, setQ] = useState("");
  const [action, setAction] = useState<string>("all");
  const [page, setPage] = useState(1);

  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);
  const filtered = useMemo(() => rows.filter((r) => {
    if (action !== "all" && r.action !== action) return false;
    if (q) {
      const t = q.toLowerCase();
      if (!(r.message.toLowerCase().includes(t) || (r.actorEmail ?? "").toLowerCase().includes(t) || (r.entity ?? "").toLowerCase().includes(t))) return false;
    }
    return true;
  }), [rows, q, action]);

  useEffect(() => { setPage(1); }, [q, action]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search message, email, entity…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => download(`audit-log-${new Date().toISOString().slice(0,10)}.csv`, toCsv(filtered))}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{r.actorEmail ?? <span className="text-muted-foreground">system</span>}</TableCell>
                <TableCell><Badge variant="secondary">{r.action}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.entity ?? "—"}</TableCell>
                <TableCell className="text-sm">{r.message}</TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No entries.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{filtered.length} entries</span>
        <div className="inline-flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="px-3 py-1.5 text-xs text-muted-foreground">Page {page} / {pageCount}</span>
          <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

export function AuditLogsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["audit-log-all"],
    queryFn: () => listActivity({ limit: 1000 }),
  });

  const loginRows = useMemo(() => data.filter((r) => r.action === "user.login" || r.action === "user.logout"), [data]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit & Login History</h1>
        <p className="text-sm text-muted-foreground">Track every admin action and sign-in event across the system.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : <ActivityTable rows={data} />}
        </TabsContent>
        <TabsContent value="logins" className="pt-4">
          {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : <ActivityTable rows={loginRows} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}