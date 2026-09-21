import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { shortDate, titleCase } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export const Route = createFileRoute("/_authenticated/activity")({
  component: ActivityPage,
  head: () => ({
    meta: [
      { title: "Activity Log — FreshMart ERP" },
      { name: "description", content: "Full history of actions taken by your team across the store." },
      { property: "og:title", content: "Activity Log — FreshMart ERP" },
      { property: "og:description", content: "Full history of actions taken by your team across the store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ActivityPage() {
  const [search, setSearch] = useState("");
  const { data: logs, isLoading } = useRows<AuditLog>("audit_logs", { orderBy: "created_at", ascending: false, limit: 500 });

  const q = search.trim().toLowerCase();
  const filtered = (logs ?? []).filter(
    (l) =>
      !q ||
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      (l.entity ?? "").toLowerCase().includes(q) ||
      (l.user_email ?? "").toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Log</h2>
        <p className="text-sm text-muted-foreground">Everything your team has recorded, newest first.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, area, record or user..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No activity recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{shortDate(l.created_at)}</TableCell>
                        <TableCell className="text-muted-foreground">{l.user_email ?? "system"}</TableCell>
                        <TableCell>
                          <Badge variant={l.action === "delete" ? "destructive" : "secondary"}>{titleCase(l.action)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{l.module}</TableCell>
                        <TableCell className="text-muted-foreground">{l.entity ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{l.details ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
