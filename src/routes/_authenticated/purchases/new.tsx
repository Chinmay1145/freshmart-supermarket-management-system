import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRows, friendly, logAudit } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Trash2, Truck } from "lucide-react";
import { inr } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type PurchaseStatus = Database["public"]["Enums"]["purchase_status"];

interface OrderLine {
  product: Product;
  quantity: number;
  unitCost: number;
}

export const Route = createFileRoute("/_authenticated/purchases/new")({
  component: NewPurchasePage,
  head: () => ({
    meta: [
      { title: "New Purchase Order — FreshMart ERP" },
      { name: "description", content: "Record a new stock purchase from a supplier." },
      { property: "og:title", content: "New Purchase Order — FreshMart ERP" },
      { property: "og:description", content: "Record a new stock purchase from a supplier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function NewPurchasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<PurchaseStatus>("received");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: products } = useRows<Product>("products", { orderBy: "name", ascending: true });
  const { data: suppliers } = useRows<Supplier>("suppliers", { orderBy: "name", ascending: true });

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return (products ?? [])
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 6);
  }, [products, search]);

  const addProduct = (product: Product) => {
    setLines((prev) =>
      prev.some((l) => l.product.id === product.id)
        ? prev
        : [...prev, { product, quantity: 1, unitCost: Number(product.purchase_price) }],
    );
    setSearch("");
  };

  const updateLine = (id: string, patch: Partial<OrderLine>) =>
    setLines((prev) => prev.map((l) => (l.product.id === id ? { ...l, ...patch } : l)));

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.product.id !== id));

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;
    for (const line of lines) {
      const net = line.unitCost * line.quantity;
      subtotal += net;
      taxAmount += (net * Number(line.product.tax_rate ?? 0)) / 100;
    }
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  }, [lines]);

  const savePurchase = async () => {
    if (!supplierId) {
      toast.error("Choose a supplier first.");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one product to the order.");
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const supplier = (suppliers ?? []).find((s) => s.id === supplierId);
      const purchaseNumber = `PO-${Date.now().toString().slice(-8)}`;

      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          purchase_number: purchaseNumber,
          supplier_id: supplier?.id ?? null,
          supplier_name: supplier?.name ?? null,
          invoice_number: invoiceNumber || null,
          purchase_date: purchaseDate,
          subtotal: totals.subtotal,
          tax_amount: totals.taxAmount,
          discount_amount: 0,
          total: totals.total,
          status,
          payment_status: paymentStatus,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (purchaseError || !purchase) throw new Error(friendly(purchaseError?.message ?? "insert failed"));

      const items = lines.map((line) => ({
        purchase_id: purchase.id,
        product_id: line.product.id,
        product_name: line.product.name,
        quantity: line.quantity,
        unit_cost: line.unitCost,
        total: line.unitCost * line.quantity,
      }));

      const { error: itemsError } = await supabase.from("purchase_items").insert(items);
      if (itemsError) throw new Error(friendly(itemsError.message));

      if (status === "received") {
        for (const line of lines) {
          const newStock = Number(line.product.stock) + line.quantity;
          await supabase.from("products").update({ stock: newStock }).eq("id", line.product.id);
          await supabase.from("inventory_movements").insert({
            product_id: line.product.id,
            product_name: line.product.name,
            movement_type: "purchase",
            previous_qty: Number(line.product.stock),
            new_qty: newStock,
            difference: line.quantity,
            reason: `Purchase ${purchaseNumber}`,
            performed_by: userData.user?.email ?? "system",
          });
        }
      }

      await logAudit("create", "Purchases", purchaseNumber, `Total ${totals.total.toFixed(2)}`);
      queryClient.invalidateQueries();
      toast.success(`Purchase ${purchaseNumber} saved.`);
      router.navigate({ to: "/purchases/$id", params: { id: purchase.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the purchase order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to purchases">
          <Link to="/purchases"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Purchase Order</h2>
          <p className="text-sm text-muted-foreground">Record stock bought from a supplier.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search product by name or SKU..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {results.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <span>
                        {p.name} <span className="text-muted-foreground">({p.sku})</span>
                      </span>
                      <span className="num">{inr(p.purchase_price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-28">Qty</TableHead>
                    <TableHead className="w-32">Unit cost</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No items yet. Search a product to add it to this order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line) => (
                      <TableRow key={line.product.id}>
                        <TableCell className="font-medium">{line.product.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            className="h-8"
                            value={line.quantity}
                            onChange={(e) => updateLine(line.product.id, { quantity: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-8"
                            value={line.unitCost}
                            onChange={(e) => updateLine(line.product.id, { unitCost: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell className="num font-medium">{inr(line.unitCost * line.quantity)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove item"
                            onClick={() => removeLine(line.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Order details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {(suppliers ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice">Supplier invoice no.</Label>
              <Input id="invoice" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Purchase date</Label>
              <Input id="date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PurchaseStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received (adds stock)</SelectItem>
                  <SelectItem value="partially_received">Partially received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partially paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-1 border-t pt-3 text-sm">
              <Row label="Subtotal" value={inr(totals.subtotal)} />
              <Row label="Tax" value={inr(totals.taxAmount)} />
              <div className="flex items-center justify-between pt-1 text-base font-bold">
                <span>Total</span>
                <span className="num">{inr(totals.total)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={savePurchase} disabled={saving}>
              <Truck className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save purchase order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
