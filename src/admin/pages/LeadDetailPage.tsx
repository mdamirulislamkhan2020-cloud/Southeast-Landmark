import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Phone, MessageCircle, Mail, Copy, Trash2, CheckCircle2, Circle, XCircle, Paperclip, StickyNote, ListChecks, Activity, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  addAttachment, addCommunication, addNote, addTask, assignLead, deleteAttachment, deleteNote, deleteTask,
  getCrmLead, listAssignees, setScore, updateLeadStatus, updateNote, updateTaskStatus,
} from "../api/crm-client";
import { LEAD_STATUSES, type LeadStatus } from "../api/crm";

export function LeadDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: lead, isLoading } = useQuery({ queryKey: ["crm-lead", id], queryFn: () => getCrmLead(id) });
  const { data: assignees = [] } = useQuery({ queryKey: ["crm-assignees"], queryFn: listAssignees });

  const [note, setNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [comChannel, setComChannel] = useState<"call" | "whatsapp" | "email" | "sms" | "meeting">("call");
  const [comSummary, setComSummary] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["crm-lead", id] });

  const statusMut = useMutation({ mutationFn: (s: LeadStatus) => updateLeadStatus(id, s), onSuccess: () => { toast.success("Status updated"); invalidate(); qc.invalidateQueries({ queryKey: ["crm-leads"] }); } });
  const assignMut = useMutation({ mutationFn: (uid: string | null) => assignLead(id, uid), onSuccess: () => { toast.success("Assignment updated"); invalidate(); qc.invalidateQueries({ queryKey: ["crm-leads"] }); } });
  const scoreMut = useMutation({ mutationFn: (n: number) => setScore(id, n), onSuccess: invalidate });
  const noteAdd = useMutation({ mutationFn: () => addNote(id, note), onSuccess: () => { setNote(""); toast.success("Note added"); invalidate(); } });
  const noteEdit = useMutation({ mutationFn: (nid: string) => updateNote(id, nid, editingNoteText), onSuccess: () => { setEditingNote(null); toast.success("Note updated"); invalidate(); } });
  const noteDel = useMutation({ mutationFn: (nid: string) => deleteNote(id, nid), onSuccess: () => { toast.success("Note deleted"); invalidate(); } });
  const taskAdd = useMutation({
    mutationFn: () => addTask(id, { title: taskTitle, description: taskDesc, dueAt: taskDue || null }),
    onSuccess: () => { setTaskTitle(""); setTaskDue(""); setTaskDesc(""); toast.success("Task added"); invalidate(); },
  });
  const taskUpd = useMutation({ mutationFn: ({ tid, s }: { tid: string; s: "pending" | "complete" | "cancelled" }) => updateTaskStatus(id, tid, s), onSuccess: invalidate });
  const taskDel = useMutation({ mutationFn: (tid: string) => deleteTask(id, tid), onSuccess: invalidate });
  const comAdd = useMutation({ mutationFn: () => addCommunication(id, comChannel, comSummary), onSuccess: () => { setComSummary(""); toast.success("Logged"); invalidate(); } });
  const attAdd = useMutation({ mutationFn: (f: File) => addAttachment(id, f.name, undefined, f.size), onSuccess: () => { toast.success("Attachment added"); invalidate(); } });
  const attDel = useMutation({ mutationFn: (aid: string) => deleteAttachment(id, aid), onSuccess: invalidate });

  const statusHistory = useMemo(() => lead?.timeline.filter((t) => t.kind === "status_change") ?? [], [lead]);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!lead) return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Lead not found.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/admin/leads">Back to leads</Link></Button>
    </div>
  );

  const s = LEAD_STATUSES.find((x) => x.value === lead.status);
  const assigneeObj = assignees.find((a) => a.id === lead.assignedTo);

  function copy(v: string) { navigator.clipboard.writeText(v); toast.success("Copied"); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/leads")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{lead.name}</h1>
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${s?.tone ?? ""}`}>{s?.label}</span>
              <Badge variant="outline" className="font-mono text-xs">{lead.code}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Captured {new Date(lead.createdAt).toLocaleString()} · Source: {lead.source}</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {lead.phone && <Button asChild size="sm" variant="outline"><a href={`tel:${lead.phone}`}><Phone className="h-4 w-4 mr-1" /> Call</a></Button>}
          {lead.phone && <Button asChild size="sm" variant="outline"><a href={`https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</a></Button>}
          {lead.email && <Button asChild size="sm" variant="outline"><a href={`mailto:${lead.email}`}><Mail className="h-4 w-4 mr-1" /> Email</a></Button>}
          {lead.phone && <Button size="sm" variant="ghost" onClick={() => copy(lead.phone)}><Copy className="h-4 w-4 mr-1" /> Copy phone</Button>}
          {lead.email && <Button size="sm" variant="ghost" onClick={() => copy(lead.email)}><Copy className="h-4 w-4 mr-1" /> Copy email</Button>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: main tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview"><User className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
              <TabsTrigger value="answers">Form Answers</TabsTrigger>
              <TabsTrigger value="notes"><StickyNote className="h-4 w-4 mr-1" /> Notes</TabsTrigger>
              <TabsTrigger value="tasks"><ListChecks className="h-4 w-4 mr-1" /> Tasks</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1" /> Attachments</TabsTrigger>
              <TabsTrigger value="timeline"><Activity className="h-4 w-4 mr-1" /> Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card><CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
                <Field label="Name" value={lead.name} />
                <Field label="Email" value={lead.email || "—"} />
                <Field label="Phone" value={lead.phone || "—"} />
                <Field label="Source" value={lead.source} />
                <Field label="Form" value={lead.formName ?? "—"} />
                <Field label="Lead Page" value={lead.leadPageSlug ?? "—"} />
                <Field label="Campaign" value={lead.analytics.campaign ?? lead.analytics.utmCampaign ?? "—"} />
                <Field label="UTM Source" value={lead.analytics.utmSource ?? "—"} />
                <Field label="UTM Medium" value={lead.analytics.utmMedium ?? "—"} />
                <Field label="UTM Content" value={lead.analytics.utmContent ?? "—"} />
                <Field label="UTM Term" value={lead.analytics.utmTerm ?? "—"} />
                <Field label="GCLID" value={lead.analytics.gclid ?? "—"} />
                <Field label="FBCLID" value={lead.analytics.fbclid ?? "—"} />
                <Field label="Landing URL" value={lead.analytics.landingUrl ?? "—"} />
                <Field label="Referrer" value={lead.analytics.referrer ?? "—"} />
                <Field label="Device" value={lead.analytics.device ?? "—"} />
                <Field label="Browser" value={lead.analytics.browser ?? "—"} />
                <Field label="Operating System" value={lead.analytics.os ?? "—"} />
                <Field label="IP Address" value={lead.analytics.ip ?? "—"} />
                <Field label="Submitted" value={new Date(lead.createdAt).toLocaleString()} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="answers">
              <Card><CardContent className="p-6">
                {Object.keys(lead.answers).length === 0 && <div className="text-sm text-muted-foreground">No form answers captured.</div>}
                <dl className="divide-y divide-border">
                  {Object.entries(lead.answers).map(([k, v]) => (
                    <div key={k} className="py-2 grid grid-cols-3 gap-3 text-sm">
                      <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                      <dd className="col-span-2 break-words">{Array.isArray(v) ? v.join(", ") : String(v ?? "—")}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card><CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Textarea placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button size="sm" disabled={!note.trim()} onClick={() => noteAdd.mutate()}>Add note</Button>
                </div>
                <div className="space-y-3">
                  {lead.notes.length === 0 && <div className="text-sm text-muted-foreground">No notes yet.</div>}
                  {lead.notes.map((n) => (
                    <div key={n.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{n.author} · {new Date(n.at).toLocaleString()}</span>
                        <div className="flex gap-1">
                          {editingNote === n.id ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => noteEdit.mutate(n.id)}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingNote(n.id); setEditingNoteText(n.text); }}>Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => noteDel.mutate(n.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                      {editingNote === n.id ? (
                        <Textarea className="mt-2" value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} />
                      ) : (
                        <div className="mt-2 text-sm whitespace-pre-wrap">{n.text}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card><CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                  <Input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                  <Textarea placeholder="Description (optional)" className="sm:col-span-2" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
                  <Button size="sm" disabled={!taskTitle.trim()} onClick={() => taskAdd.mutate()}>Add task</Button>
                </div>
                <div className="space-y-2">
                  {lead.tasks.length === 0 && <div className="text-sm text-muted-foreground">No tasks yet.</div>}
                  {lead.tasks.map((t) => (
                    <div key={t.id} className="rounded-md border border-border p-3 flex items-start gap-3">
                      <button onClick={() => taskUpd.mutate({ tid: t.id, s: t.status === "complete" ? "pending" : "complete" })}>
                        {t.status === "complete" ? <CheckCircle2 className="h-5 w-5 text-primary" /> : t.status === "cancelled" ? <XCircle className="h-5 w-5 text-muted-foreground" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${t.status === "complete" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                        {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                        <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                          {t.dueAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(t.dueAt).toLocaleString()}</span>}
                          <span>Status: {t.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => taskUpd.mutate({ tid: t.id, s: "cancelled" })}>Cancel</Button>
                        <Button size="sm" variant="ghost" onClick={() => taskDel.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="communications">
              <Card><CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-4 gap-2">
                  <Select value={comChannel} onValueChange={(v) => setComChannel(v as typeof comChannel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="sm:col-span-2" placeholder="Summary of interaction" value={comSummary} onChange={(e) => setComSummary(e.target.value)} />
                  <Button size="sm" disabled={!comSummary.trim()} onClick={() => comAdd.mutate()}>Log</Button>
                </div>
                <div className="space-y-2">
                  {lead.communications.length === 0 && <div className="text-sm text-muted-foreground">No communications logged.</div>}
                  {lead.communications.map((c) => (
                    <div key={c.id} className="rounded-md border border-border p-3">
                      <div className="text-xs text-muted-foreground">{c.channel.toUpperCase()} · {new Date(c.at).toLocaleString()} · {c.by ?? "Admin"}</div>
                      <div className="text-sm mt-1">{c.summary}</div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="attachments">
              <Card><CardContent className="p-6 space-y-4">
                <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) attAdd.mutate(f); e.currentTarget.value = ""; }} />
                <div className="space-y-2">
                  {lead.attachments.length === 0 && <div className="text-sm text-muted-foreground">No attachments.</div>}
                  {lead.attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                      <div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-muted-foreground" /><span>{a.name}</span>{a.size && <span className="text-xs text-muted-foreground">({Math.round(a.size / 1024)} KB)</span>}</div>
                      <Button size="sm" variant="ghost" onClick={() => attDel.mutate(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card><CardContent className="p-6">
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  {lead.timeline.map((ev) => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="text-xs text-muted-foreground">{new Date(ev.at).toLocaleString()} · {ev.kind.replace(/_/g, " ")}</div>
                      <div className="text-sm">{ev.text}</div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <div className="text-sm font-semibold">Status</div>
            <Select value={lead.status} onValueChange={(v) => statusMut.mutate(v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEAD_STATUSES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
            </Select>

            <div className="text-sm font-semibold pt-2">Assignment</div>
            <Select value={lead.assignedTo ?? "none"} onValueChange={(v) => assignMut.mutate(v === "none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Assign to…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {assignees.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} · {a.role}</SelectItem>)}
              </SelectContent>
            </Select>
            {assigneeObj && <div className="text-xs text-muted-foreground">{assigneeObj.email}</div>}
          </CardContent></Card>

          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Lead Score</div>
              <Badge variant={lead.score >= 70 ? "default" : lead.score >= 40 ? "secondary" : "outline"}>{lead.score}/100</Badge>
            </div>
            <Progress value={lead.score} />
            <div className="flex items-center gap-2">
              <Label className="text-xs">Manual</Label>
              <Input type="number" min={0} max={100} defaultValue={lead.score} onBlur={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n) && n !== lead.score) scoreMut.mutate(n); }} />
            </div>
            <p className="text-xs text-muted-foreground">Auto-scored from budget, timeline, filled fields and source.</p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-sm font-semibold mb-2">Status History</div>
            {statusHistory.length === 0 && <div className="text-xs text-muted-foreground">No status changes yet.</div>}
            <ul className="space-y-2 text-xs">
              {statusHistory.map((h) => (
                <li key={h.id} className="text-muted-foreground"><span className="text-foreground">{h.text}</span><br />{new Date(h.at).toLocaleString()}</li>
              ))}
            </ul>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 break-words">{value}</div>
    </div>
  );
}