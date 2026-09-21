import { createFileRoute, useRouter } from "@tanstack/react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Minus, Trash2, Receipt } from "lucide-react";
import { inr } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type PaymentMethod = Database["public"]["Enums"]["payment_method"];

interface CartLine {
  product: Product;
  quantity: number;
}

export const Route = createFileRoute("/_authenticated/sales/new")({
  component: NewSalePage,
  head: () => ({
    meta: [
      { title: "New Sale — FreshMart ERP" },
      { name: "description", content: "Create a new invoice and record a sale." },
      { property: "og:title", content: "New Sale — FreshMart ERP" },
      { property: "og:description", content: "Create a new invoice and record a sale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function NewSalePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<string>("walkin");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: products } = useRows<Product>("products", { orderBy: "name", ascending: true });
  const { data: customers } = useRows<Customer>("customers", { orderBy: "name", ascending: true });

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return (products ?? [])
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode ?? "").includes(q))
      .slice(0, 6);
  }, [products, search]);

  const addProduct = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch("");
  };

  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.product.id !== id));

  const totals = useMemo(() => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    for (const line of cart) {
      const price = Number(line.product.selling_price);
      const gross = price * line.quantity;
      const disc = (gross * Number(line.product.discount ?? 0)) / 100;
      const net = gross - disc;
      subtotal += gross;
      discountAmount += disc;
      taxAmount += (net * Number(line.product.tax_rate ?? 0)) / 100;
    }
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  }, [cart]);

  const paid = Number(amountPaid || 0);
  const changeDue = Math.max(0, paid - totals.total);

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Add at least one product to the bill.");
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const customer = (customers ?? []).find((c) => c.id === customerId);
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          invoice_number: invoiceNumber,
          customer_id: customer?.id ?? null,
          customer_name: customer?.name ?? "Walk-in",
          cashier_name: userData.user?.email ?? "Cashier",
          cashier_id: userData.user?.id ?? null,
          subtotal: totals.subtotal,
          discount_amount: totals.discountAmount,
          tax_amount: totals.taxAmount,
          total: totals.total,
          amount_paid: paid || totals.total,
          change_due: changeDue,
          payment_method: paymentMethod,
          status: "completed",
        })
        .select("id")
        .single();

      if (saleError || !sale) throw new Error(friendly(saleError?.message ?? "insert failed"));

      const items = cart.map((line) => {
        const gross = Number(line.product.selling_price) * line.quantity;
        const disc = (gross * Number(line.product.discount ?? 0)) / 100;
        const net = gross - disc;
        return {
          sale_id: sale.id,
          product_id: line.product.id,
          product_name: line.product.name,
          sku: line.product.sku,
          quantity: line.quantity,
          unit_price: Number(line.product.selling_price),
          discount: disc,
          tax_rate: Number(line.product.tax_rate ?? 0),
          total: net + (net * Number(line.product.tax_rate ?? 0)) / 100,
        };
      });

      const { error: itemsError } = await supabase.from("sale_items").insert(items);
      if (itemsError) throw new Error(friendly(itemsError.message));

      for (const line of cart) {
        const newStock = Number(line.product.stock) - line.quantity;
        await supabase.from("products").update({ stock: newStock }).eq("id", line.product.id);
        await supabase.from("inventory_movements").insert({
          product_id: line.product.id,
          product_name: line.product.name,
          movement_type: "sale",
          previous_qty: Number(line.product.stock),
          new_qty: newStock,
          difference: -line.quantity,
          reason: `Sale ${invoiceNumber}`,
          performed_by: userData.user?.email ?? "system",
        });
      }

      await logAudit("create", "Sales", invoiceNumber, `Total ${totals.total.toFixed(2)}`);
      queryClient.invalidateQueries();
      toast.success(`Sale ${invoiceNumber} completed.`);
      router.navigate({ to: "/sales" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete the sale.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Sale</h2>
        <p className="text-sm text-muted-foreground">Scan or search products, then take payment.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search product by name, SKU or barcode..."
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
                      <span className="num">{inr(p.selling_price)}</span>
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
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No items yet. Search a product to start billing.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((line) => (
                      <TableRow key={line.product.id}>
                        <TableCell className="font-medium">{line.product.name}</TableCell>
                        <TableCell className="num">{inr(line.product.selling_price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeQty(line.product.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="num w-6 text-center">{line.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeQty(line.product.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="num font-medium">
                          {inr(Number(line.product.selling_price) * line.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeLine(line.product.id)}>
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

        <Card className="shadow-card h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in customer</SelectItem>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["cash", "card", "upi", "wallet", "bank_transfer"] as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m === "bank_transfer" ? "Bank transfer" : m.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 border-t pt-3 text-sm">
              <Row label="Subtotal" value={inr(totals.subtotal)} />
              <Row label="Discount" value={`- ${inr(totals.discountAmount)}`} />
              <Row label="Tax" value={inr(totals.taxAmount)} />
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span className="num">{inr(totals.total)}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paid">Amount paid</Label>
              <Input
                id="paid"
                inputMode="decimal"
                placeholder={totals.total.toFixed(2)}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              {paid > 0 && <p className="text-xs text-muted-foreground">Change due: {inr(changeDue)}</p>}
            </div>

            <Button className="w-full" disabled={saving || cart.length === 0} onClick={completeSale}>
              <Receipt className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Complete sale"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
