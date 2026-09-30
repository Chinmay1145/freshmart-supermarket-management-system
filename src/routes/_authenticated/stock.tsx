import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileText, PackageCheck } from "lucide-react";
import { inr, num, dateTime, downloadCsv, stockStatus, titleCase } from "@/lib/format";
import { downloadPdf, pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Movement = Database["public"]["Tables"]["inventory_movements"]["Row"];
type Settings = Database["public"]["Tables"]["store_settings"]["Row"];

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockPage,
  head: () => ({
    meta: [
      { title: "Stock Control — FreshMart ERP" },
      { name: "description", content: "Monitor stock levels, adjust quantities and review inventory movement history." },
    ],
  }),
});

function StockPage() {
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"add" | "remove" | "set">("add");
  const qc = useQueryClient();

  const { data: products, isLoading } = useRows<Product>("products", { orderBy: "name", ascending: true });
  const { data: movements } = useRows<Movement>("inventory_movements", { limit: 100 });
  const { data: settingsRows } = useRows<Settings>("store_settings", { limit: 1 });
  const storeName = settingsRows?.[0]?.store_name ?? "FreshMart ERP";

  const adjust = useMutation({
    mutationFn: async () => {
      if (!target) return;
      const previous = Number(target.stock);
      const entered = Number(newQty);
      if (newQty.trim() === "" || !Number.isFinite(entered) || entered < 0) throw new Error("Enter a valid quantity (0 or more).");
      const next = mode === "add" ? previous + entered : mode === "remove" ? previous - entered : entered;
      if (next < 0) throw new Error(`You can remove at most ${previous} units.`);
      if (next === previous) throw new Error("Quantity is unchanged.");
      if (reason.trim().length > 200) throw new Error("Reason is too long (max 200 characters).");
      const { data: userData } = await supabase.auth.getUser();
      const { error: upErr } = await supabase.from("products").update({ stock: next }).eq("id", target.id);
      if (upErr) throw new Error(friendly(upErr.message));
      const { error: movErr } = await supabase.from("inventory_movements").insert({
        product_id: target.id,
        product_name: target.name,
        movement_type: next > previous ? "stock_in" : "stock_out",
        previous_qty: previous,
        new_qty: next,
        difference: next - previous,
        reason: reason.trim() || (mode === "add" ? "Stock received" : mode === "remove" ? "Stock removed" : "Manual recount"),
        performed_by: userData.user?.email ?? "system",
      });
      if (movErr) throw new Error(friendly(movErr.message));
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Stock updated.");
      setTarget(null);
      setNewQty("");
      setReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(
    () =>
      (products ?? []).filter(
        (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const lowStock = rows.filter((p) => Number(p.stock) > 0 && Number(p.stock) < Number(p.min_stock));
  const outOfStock = rows.filter((p) => Number(p.stock) <= 0);
  const stockValue = (products ?? []).reduce((s, p) => s + Number(p.stock) * Number(p.purchase_price), 0);

  const openAdjust = (p: Product) => {
    setTarget(p);
    setMode("add");
    setNewQty("");
    setReason("");
  };

  const ProductTable = ({ list }: { list: Product[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nothing to show here.</TableCell>
            </TableRow>
          ) : (
            list.map((p) => {
              const status = stockStatus(Number(p.stock), Number(p.min_stock), Number(p.max_stock));
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="num text-right">{num(p.stock, 2)}</TableCell>
                  <TableCell className="num text-right text-muted-foreground">{num(p.min_stock)}</TableCell>
                  <TableCell className="num text-right">{inr(Number(p.stock) * Number(p.purchase_price))}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status.tone === "success" ? "default" : status.tone === "destructive" ? "destructive" : "secondary"
                      }
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openAdjust(p)}>Adjust</Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stock control</h2>
          <p className="text-sm text-muted-foreground">Adjust quantities and keep a full audit trail.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            downloadCsv(
              "stock.csv",
              (products ?? []).map((p) => ({
                Product: p.name,
                SKU: p.sku,
                Stock: Number(p.stock),
                MinStock: Number(p.min_stock),
                StockValue: Number(p.stock) * Number(p.purchase_price),
              })),
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          CSV
        </Button>
        <Button
          onClick={() =>
            downloadPdf({
              filename: "freshmart-stock-report.pdf",
              title: "Stock Status Report",
              subtitle: `${(products ?? []).length} products tracked`,
              storeName,
              stats: [
                { label: "Stock value", value: pdfAmount(stockValue), hint: "at purchase price" },
                { label: "Low stock", value: String(lowStock.length), hint: "below minimum level" },
                { label: "Out of stock", value: String(outOfStock.length), hint: "needs reordering" },
                { label: "Products", value: String((products ?? []).length), hint: "in catalogue" },
              ],
              tables: [
                {
                  heading: "Needs attention",
                  head: ["Product", "SKU", "Stock", "Min", "Status"],
                  alignRight: [2, 3],
                  rows: [...outOfStock, ...lowStock].map((p) => [
                    p.name,
                    p.sku,
                    pdfNumber(p.stock),
                    pdfNumber(p.min_stock, 0),
                    stockStatus(Number(p.stock), Number(p.min_stock), Number(p.max_stock)).label,
                  ]),
                  empty: "Every product is stocked above its minimum level.",
                },
                {
                  heading: "Full stock list",
                  head: ["Product", "SKU", "Stock", "Min", "Stock value", "Status"],
                  alignRight: [2, 3, 4],
                  rows: (products ?? []).map((p) => [
                    p.name,
                    p.sku,
                    pdfNumber(p.stock),
                    pdfNumber(p.min_stock, 0),
                    pdfAmount(Number(p.stock) * Number(p.purchase_price)),
                    stockStatus(Number(p.stock), Number(p.min_stock), Number(p.max_stock)).label,
                  ]),
                  empty: "No products added yet.",
                },
                {
                  heading: "Recent stock movements",
                  head: ["When", "Product", "Type", "Change", "Reason", "By"],
                  alignRight: [3],
                  rows: (movements ?? []).slice(0, 40).map((m) => [
                    dateTime(m.created_at),
                    m.product_name ?? "—",
                    titleCase(m.movement_type),
                    `${Number(m.difference) > 0 ? "+" : ""}${pdfNumber(m.difference)}`,
                    m.reason ?? "—",
                    m.performed_by ?? "—",
                  ]),
                  empty: "No movements recorded yet.",
                },
              ],
            })
          }
        >
          <FileText className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        </div>
      </div>


      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stock value</CardTitle></CardHeader>
          <CardContent className="num text-2xl font-bold">{inr(stockValue)}</CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Low stock items</CardTitle></CardHeader>
          <CardContent className="num text-2xl font-bold text-amber-600">{lowStock.length}</CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Out of stock</CardTitle></CardHeader>
          <CardContent className="num text-2xl font-bold text-destructive">{outOfStock.length}</CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
            </div>
          ) : (
            <Tabs defaultValue="all">
              <div className="px-4">
                <TabsList>
                  <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
                  <TabsTrigger value="low">Low ({lowStock.length})</TabsTrigger>
                  <TabsTrigger value="out">Out ({outOfStock.length})</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-3"><ProductTable list={rows} /></TabsContent>
              <TabsContent value="low" className="mt-3"><ProductTable list={lowStock} /></TabsContent>
              <TabsContent value="out" className="mt-3"><ProductTable list={outOfStock} /></TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageCheck className="h-4 w-4" /> Recent movements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(movements ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No movements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (movements ?? []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">{dateTime(m.created_at)}</TableCell>
                      <TableCell className="font-medium">{m.product_name ?? "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{titleCase(m.movement_type)}</Badge></TableCell>
                      <TableCell className={`num text-right ${Number(m.difference) < 0 ? "text-destructive" : "text-emerald-600"}`}>
                        {Number(m.difference) > 0 ? "+" : ""}
                        {num(m.difference, 2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.reason ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{m.performed_by ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust stock — {target?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current quantity: <span className="num font-medium text-foreground">{num(target?.stock ?? 0, 2)}</span>
            </p>
            <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); setNewQty(v === "set" ? String(Number(target?.stock ?? 0)) : ""); }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add">Add stock</TabsTrigger>
                <TabsTrigger value="remove">Remove</TabsTrigger>
                <TabsTrigger value="set">Set exact</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              <label htmlFor="adj-qty" className="text-sm font-medium">
                {mode === "add" ? "Quantity to add" : mode === "remove" ? "Quantity to remove" : "New quantity"}
              </label>
              <Input id="adj-qty" type="number" step="0.01" min="0" autoFocus value={newQty} onChange={(e) => setNewQty(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adjust.mutate()} />
              {(() => {
                const cur = Number(target?.stock ?? 0), q = Number(newQty);
                if (newQty.trim() === "" || !Number.isFinite(q)) return null;
                const next = mode === "add" ? cur + q : mode === "remove" ? cur - q : q;
                return (
                  <p className={`text-xs ${next < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    New stock will be <span className="num font-medium">{num(next, 2)}</span> {target?.unit}
                    {next < 0 ? " (not allowed)" : ""}
                  </p>
                );
              })()}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                maxLength={200}
                placeholder="Damaged goods, recount, delivery..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
              <Button onClick={() => adjust.mutate()} disabled={adjust.isPending}>
                {adjust.isPending ? "Saving..." : "Update stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
