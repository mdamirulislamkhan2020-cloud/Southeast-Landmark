import { useQuery } from "@tanstack/react-query";
import { listLeads } from "../api/client";
import { Card, CardContent } from "@/components/ui/card";

export function LeadsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: listLeads });
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl">Leads</h1>
        <p className="text-sm text-muted-foreground">All inquiries captured from the website.</p>
      </header>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-secondary/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>}
              {!isLoading && data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No leads yet.</td></tr>}
              {data.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.phone}</td>
                  <td className="px-4 py-3">{l.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}