import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, KeyRound, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { createUser, deleteUser, listUsers, resetUserPassword, updateUser, permissionsFor } from "../api/settings-client";
import { PERMISSION_KEYS, PERMISSION_LABELS, ROLE_LABELS, type AdminUser, type PermissionKey, type UserRole } from "../api/settings";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/services/email-service";

const PAGE_SIZE = 8;

function fileToDataUrl(f: File) {
  return new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
}

function UserEditor({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (v: boolean) => void; initial: AdminUser | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<AdminUser>>({});
  useEffect(() => {
    if (!open) return;
    setForm(initial ?? { name: "", email: "", phone: "", role: "editor", active: true, avatar: null, permissions: permissionsFor("editor") });
  }, [open, initial]);

  const onRoleChange = (role: UserRole) => setForm((f) => ({ ...f, role, permissions: permissionsFor(role) }));
  const togglePerm = (k: PermissionKey) => setForm((f) => ({ ...f, permissions: { ...(f.permissions ?? {}), [k]: !f.permissions?.[k] } }));

  const onFile = async (f: File | null) => {
    if (!f) return;
    const dataUrl = await fileToDataUrl(f);
    setForm((s) => ({ ...s, avatar: dataUrl }));
  };

  const save = async () => {
    if (!form.name || !form.email) return toast.error("Name and email required");
    if (initial?.id) {
      await updateUser(initial.id, form);
      toast.success("User updated");
    } else {
      const created = await createUser(form);
      toast.success("User added");
      // Fire-and-forget welcome email through the centralised SMTP service.
      const r = await sendWelcomeEmail(created.email, created.name);
      if (r.ok && r.data?.simulated) toast.warning("Welcome email simulated (no backend).");
      else if (!r.ok) toast.error(`Welcome email failed: ${r.error ?? "unknown error"}`);
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="permissions">Permissions</TabsTrigger></TabsList>
          <TabsContent value="profile" className="space-y-4 pt-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarImage src={form.avatar ?? undefined} /><AvatarFallback>{form.name?.[0] ?? "?"}</AvatarFallback></Avatar>
              <label className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-secondary">
                <Upload className="h-4 w-4" /> Upload avatar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => onRoleChange(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (<SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2 md:col-span-2">
                <div><Label>Active</Label><p className="text-xs text-muted-foreground">Inactive users cannot sign in.</p></div>
                <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="permissions" className="pt-3">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader><TableRow><TableHead>Module</TableHead><TableHead className="w-24 text-right">Access</TableHead></TableRow></TableHeader>
                <TableBody>
                  {PERMISSION_KEYS.map((k) => (
                    <TableRow key={k}>
                      <TableCell>{PERMISSION_LABELS[k]}</TableCell>
                      <TableCell className="text-right"><Checkbox checked={!!form.permissions?.[k]} onCheckedChange={() => togglePerm(k)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersPage() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });
  const [q, setQ] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (status === "active" && !u.active) return false;
    if (status === "inactive" && u.active) return false;
    if (q && !(u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [users, q, role, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const del = useMutation({ mutationFn: (id: string) => deleteUser(id), onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); } });
  const toggle = useMutation({ mutationFn: (u: AdminUser) => updateUser(u.id, { active: !u.active }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
  const reset = useMutation({
    mutationFn: async (u: AdminUser) => {
      const r = await resetUserPassword(u.id);
      const mail = await sendPasswordResetEmail(u.email, r.tempPassword);
      return { ...r, mail, user: u };
    },
    onSuccess: ({ tempPassword, mail, user }) => {
      toast.success(`Temp password for ${user.email}: ${tempPassword}`);
      if (mail.ok && mail.data?.simulated) {
        toast.warning("Password reset email simulated (no backend).");
      } else if (!mail.ok) {
        toast.error(`Reset email failed: ${mail.error ?? "unknown error"}`);
      } else {
        toast.success("Password reset email sent");
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">Manage team access and per-module permissions.</p>
        </div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <Card><CardContent className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as UserRole | "all"); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (<SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v as "all" | "active" | "inactive"); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last Login</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {paged.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarImage src={u.avatar ?? undefined} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                    <div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={u.active} onCheckedChange={() => toggle.mutate(u)} />
                    <span className="text-xs text-muted-foreground">{u.active ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => reset.mutate(u.id)}><KeyRound className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(u); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this user?")) del.mutate(u.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No users found.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{filtered.length} users</span>
        <div className="inline-flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="px-3 py-1.5 text-xs text-muted-foreground">Page {page} / {pageCount}</span>
          <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      <UserEditor open={editorOpen} onOpenChange={setEditorOpen} initial={editing} />
    </div>
  );
}