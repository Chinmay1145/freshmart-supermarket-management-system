import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Check, Search, Trash2 } from "lucide-react";
import { dateTime, titleCase } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Notifications & Activity — FreshMart ERP" },
      { name: "description", content: "Store alerts and a full record of who changed what in your store." },
    ],
  }),
});

function NotificationsPage() {
  const [search, setSearch] = useState("");

  const { data: notes, isLoading } = useRows<Notification>("notifications", {
    orderBy: "created_at",
    ascending: false,
  });
  const { data: logs, isLoading: logsLoading } = useRows<AuditLog>("audit_logs", {
    orderBy: "created_at",
    ascending: false,
    limit: 100,
  });
  const save = useSaveRow("notifications", "Notification");
  const remove = useDeleteRow("notifications", "Notification");

  const all = notes ?? [];
  const unread = all.filter((n) => !n.is_read);

  const markAllRead = async () => {
    for (const n of unread) await save.mutateAsync({ id: n.id, is_read: true });
  };

  const q = search.toLowerCase();
  const filteredLogs = (logs ?? []).filter(
    (l) =>
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      (l.user_email ?? "").toLowerCase().includes(q),
  );

  const list = (items: Notification[]) =>
    items.length === 0 ? (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <BellOff className="h-6 w-6" />
        <p className="text-sm">Nothing here right now.</p>
      </div>
    ) : (
      <ul className="divide-y">
        {items.map((n) => (
          <li key={n.id} className="flex items-start gap-3 p-4">
            <span className={n.is_read ? "mt-1 text-muted-foreground" : "mt-1 text-primary"}>
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className={n.is_read ? "font-medium text-muted-foreground" : "font-semibold"}>{n.title}</p>
                <Badge variant="outline">{titleCase(n.type)}</Badge>
                {!n.is_read && <Badge variant="secondary">New</Badge>}
              </div>
              {n.message && <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{dateTime(n.created_at)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              {!n.is_read && (
                <Button variant="ghost" size="icon" aria-label="Mark as read" onClick={() => save.mutate({ id: n.id, is_read: true })}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove.mutate(n.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications & activity</h2>
          <p className="text-sm text-muted-foreground">
            Store alerts plus a record of every change made by your team.
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unread.length === 0 || save.isPending}>
          <Check className="mr-2 h-4 w-4" /> Mark all read
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Alerts</CardTitle>
          <CardDescription>{unread.length} unread of {all.length} total</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="unread">
              <div className="px-4">
                <TabsList>
                  <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({all.length})</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="unread" className="mt-4">
                {list(unread)}
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                {list(all)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Activity log</CardTitle>
          <CardDescription>The last 100 actions recorded in your store.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 translate-y-1 text-muted-foreground" />
            <Input
              placeholder="Search by action, area or user..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logsLoading ? (
            <div className="space-y-2 p-4">
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
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No activity recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {dateTime(l.created_at)}
                        </TableCell>
                        <TableCell>{l.user_email ?? "system"}</TableCell>
                        <TableCell className="font-medium">{titleCase(l.action)}</TableCell>
                        <TableCell>{titleCase(l.module)}</TableCell>
                        <TableCell className="max-w-[18rem] truncate text-muted-foreground">
                          {l.details ?? l.entity ?? "—"}
                        </TableCell>
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
