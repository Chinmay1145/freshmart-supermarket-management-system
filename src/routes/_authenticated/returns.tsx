import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { inr, shortDate, titleCase } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type ReturnRow = Database["public"]["Tables"]["returns"]["Row"];
type ReturnStatus = Database["public"]["Enums"]["return_status"];

const statuses: ReturnStatus[] = ["requested", "approved", "completed", "rejected"];

const newNumber = () => `RET-${Date.now().toString().slice(-6)}`;

const emptyForm = () => ({
  return_number: newNumber(),
  invoice_number: "",
  customer_name: "",
  refund_amount: "0",
  status: "requested" as ReturnStatus,
  reason: "",
});

export const Route = createFileRoute("/_authenticated/returns")({
  component: ReturnsPage,
  head: () => ({
    meta: [
      { title: "Returns & Refunds — FreshMart ERP" },
      { name: "description", content: "Record customer returns and track refund amounts and approvals." },
    ],
  }),
});

function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: returns, isLoading } = useRows<ReturnRow>("returns", { orderBy: "created_at", ascending: false });
  const save = useSaveRow("returns", "Return");
  const remove = useDeleteRow("returns", "Return");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (r: ReturnRow) => {
    setEditingId(r.id);
    setForm({
      return_number: r.return_number,
      invoice_number: r.invoice_number ?? "",
      customer_name: r.customer_name ?? "",
      refund_amount: String(r.refund_amount ?? 0),
      status: r.status,
      reason: r.reason ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    await save.mutateAsync({
      id: editingId ?? undefined,
      return_number: form.return_number,
      invoice_number: form.invoice_number || null,
      customer_name: form.customer_name || null,
      refund_amount: Number(form.refund_amount) || 0,
      status: form.status,
      reason: form.reason || null,
    });
    setOpen(false);
  };

  const setStatus = (r: ReturnRow, status: ReturnStatus) => save.mutate({ id: r.id, status });

  const q = search.toLowerCase();
  const filtered = (returns ?? []).filter(
    (r) =>
      r.return_number.toLowerCase().includes(q) ||
      (r.invoice_number ?? "").toLowerCase().includes(q) ||
      (r.customer_name ?? "").toLowerCase().includes(q),
  );

  const refunded = (returns ?? [])
    .filter((r) => r.status === "completed")
    .reduce((s, r) => s + Number(r.refund_amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Returns & refunds</h2>
          <p className="text-sm text-muted-foreground">Log returned goods and keep refunds accountable.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New return
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total returns" value={String((returns ?? []).length)} />
        <StatCard
          label="Awaiting action"
          value={String((returns ?? []).filter((r) => r.status === "requested").length)}
        />
        <StatCard label="Refunded" value={inr(refunded)} />
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by return, invoice or customer..."
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
                    <TableHead>Return no.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Refund</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No returns recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.return_number}</TableCell>
                        <TableCell className="text-muted-foreground">{shortDate(r.created_at)}</TableCell>
                        <TableCell className="text-muted-foreground">{r.invoice_number ?? "—"}</TableCell>
                        <TableCell className="font-medium">{r.customer_name ?? "Walk-in"}</TableCell>
                        <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                          {r.reason ?? "—"}
                        </TableCell>
                        <TableCell className="num text-right">{inr(r.refund_amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === "completed" ? "secondary" : r.status === "rejected" ? "destructive" : "outline"
                            }
                          >
                            {titleCase(r.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(r)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {statuses
                                .filter((s) => s !== r.status)
                                .map((s) => (
                                  <DropdownMenuItem key={s} onClick={() => setStatus(r, s)}>
                                    Mark {titleCase(s)}
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(r.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit return" : "New return"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Return number</Label>
                <Input
                  value={form.return_number}
                  onChange={(e) => setForm({ ...form, return_number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Invoice number</Label>
                <Input
                  placeholder="INV-1024"
                  value={form.invoice_number}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Customer</Label>
                <Input
                  placeholder="Walk-in"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Refund amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.refund_amount}
                  onChange={(e) => setForm({ ...form, refund_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ReturnStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Damaged packaging, wrong item, expired stock..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending || !form.return_number}>
                {save.isPending ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="num mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
