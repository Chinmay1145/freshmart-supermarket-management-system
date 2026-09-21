import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { inr, num, shortDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Discount = Database["public"]["Tables"]["discounts"]["Row"];
type DiscountType = Database["public"]["Enums"]["discount_type"];

const typeLabels: Record<DiscountType, string> = {
  percentage: "Percentage off",
  fixed: "Flat amount off",
  bxgy: "Buy X get Y",
};

const empty = {
  name: "",
  code: "",
  discount_type: "percentage" as DiscountType,
  value: "10",
  min_purchase: "0",
  max_discount: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  usage_limit: "",
  is_active: true,
};

export const Route = createFileRoute("/_authenticated/discounts")({
  component: DiscountsPage,
  head: () => ({
    meta: [
      { title: "Discounts & Offers — FreshMart ERP" },
      { name: "description", content: "Create and manage discount codes and store offers." },
    ],
  }),
});

function DiscountsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: discounts, isLoading } = useRows<Discount>("discounts", { orderBy: "created_at", ascending: false });
  const save = useSaveRow("discounts", "Discount");
  const remove = useDeleteRow("discounts", "Discount");

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty });
    setOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      code: d.code ?? "",
      discount_type: d.discount_type,
      value: String(d.value ?? 0),
      min_purchase: String(d.min_purchase ?? 0),
      max_discount: d.max_discount == null ? "" : String(d.max_discount),
      start_date: d.start_date?.slice(0, 10) ?? empty.start_date,
      end_date: d.end_date?.slice(0, 10) ?? "",
      usage_limit: d.usage_limit == null ? "" : String(d.usage_limit),
      is_active: d.is_active,
    });
    setOpen(true);
  };

  const submit = async () => {
    await save.mutateAsync({
      id: editingId ?? undefined,
      name: form.name,
      code: form.code ? form.code.toUpperCase() : null,
      discount_type: form.discount_type,
      value: Number(form.value) || 0,
      min_purchase: Number(form.min_purchase) || 0,
      max_discount: form.max_discount === "" ? null : Number(form.max_discount),
      start_date: form.start_date,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
      is_active: form.is_active,
    });
    setOpen(false);
  };

  const today = new Date().toISOString().slice(0, 10);
  const isLive = (d: Discount) =>
    d.is_active && d.start_date.slice(0, 10) <= today && (!d.end_date || d.end_date.slice(0, 10) >= today);

  const q = search.toLowerCase();
  const filtered = (discounts ?? []).filter(
    (d) => d.name.toLowerCase().includes(q) || (d.code ?? "").toLowerCase().includes(q),
  );

  const showValue = (d: Discount) =>
    d.discount_type === "percentage" ? `${num(d.value, 2)}%` : d.discount_type === "fixed" ? inr(d.value) : `${num(d.value)} free`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discounts & offers</h2>
          <p className="text-sm text-muted-foreground">Set up coupon codes and store-wide offers for billing.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add discount
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total offers" value={String((discounts ?? []).length)} />
        <StatCard label="Running now" value={String((discounts ?? []).filter(isLive).length)} />
        <StatCard label="Times used" value={num((discounts ?? []).reduce((s, d) => s + Number(d.used_count ?? 0), 0))} />
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search offers or codes..."
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
                    <TableHead>Offer</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Min purchase</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead className="text-right">Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        No discounts yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="font-mono text-xs">{d.code ?? "—"}</TableCell>
                        <TableCell>{typeLabels[d.discount_type]}</TableCell>
                        <TableCell className="num text-right">{showValue(d)}</TableCell>
                        <TableCell className="num text-right">{inr(d.min_purchase)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {shortDate(d.start_date)} → {d.end_date ? shortDate(d.end_date) : "no end"}
                        </TableCell>
                        <TableCell className="num text-right">
                          {num(d.used_count)}
                          {d.usage_limit ? ` / ${num(d.usage_limit)}` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isLive(d) ? "secondary" : "outline"}>{isLive(d) ? "Running" : "Paused"}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(d)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(d.id)}>
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
            <DialogTitle>{editingId ? "Edit discount" : "Add discount"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Offer name</Label>
              <Input
                placeholder="Diwali weekend offer"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Coupon code (optional)</Label>
                <Input
                  placeholder="DIWALI10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v) => setForm({ ...form, discount_type: v as DiscountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(typeLabels) as DiscountType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {typeLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Min purchase</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.min_purchase}
                  onChange={(e) => setForm({ ...form, min_purchase: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max discount</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="No cap"
                  value={form.max_discount}
                  onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Starts</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ends</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Usage limit</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.is_active ? "active" : "paused"}
                onValueChange={(v) => setForm({ ...form, is_active: v === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending || !form.name}>
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
