import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRows } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileText } from "lucide-react";
import { inr, shortDate, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];

export const Route = createFileRoute("/_authenticated/purchases/")({
  component: PurchasesPage,
  head: () => ({
    meta: [{ title: "Purchases — FreshMart ERP" }, { name: "description", content: "View purchase orders." }],
  }),
});

function PurchasesPage() {
  const [search, setSearch] = useState("");
  const { data: purchases, isLoading } = useRows<Purchase>("purchases", { orderBy: "created_at", ascending: false });

  const filtered = (purchases ?? []).filter(
    (p) =>
      p.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Purchases</h2>
          <p className="text-sm text-muted-foreground">Track orders from suppliers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButtons
            pdfLabel="Purchase report PDF"
            csv={{
              filename: "purchase-register.csv",
              rows: () =>
                filtered.map((p) => ({
                  Purchase: p.purchase_number,
                  Supplier: p.supplier_name ?? "",
                  Date: p.purchase_date,
                  Status: p.status,
                  Payment: p.payment_status,
                  Total: Number(p.total),
                })),
            }}
            pdf={() => ({
              filename: "purchase-register.pdf",
              title: "Purchase Register",
              subtitle: `${filtered.length} purchase orders`,
              stats: [
                { label: "Orders", value: pdfNumber(filtered.length, 0) },
                { label: "Order value", value: pdfAmount(filtered.reduce((a, p) => a + Number(p.total), 0)) },
                {
                  label: "Unpaid",
                  value: pdfAmount(
                    filtered.filter((p) => p.payment_status !== "paid").reduce((a, p) => a + Number(p.total), 0),
                  ),
                  hint: "awaiting settlement",
                },
                {
                  label: "Pending receipt",
                  value: pdfNumber(filtered.filter((p) => p.status !== "received").length, 0),
                  hint: "orders not received",
                },
              ],
              tables: [
                {
                  heading: "Purchase orders",
                  head: ["Purchase #", "Supplier", "Date", "Status", "Payment", "Total"],
                  alignRight: [5],
                  rows: filtered.map((p) => [
                    p.purchase_number,
                    p.supplier_name ?? "—",
                    shortDate(p.purchase_date),
                    titleCase(p.status),
                    titleCase(p.payment_status),
                    pdfAmount(p.total),
                  ]),
                  empty: "No purchase orders recorded yet.",
                },
              ],
              totals: [
                { label: "Subtotal", value: pdfAmount(filtered.reduce((a, p) => a + Number(p.subtotal), 0)) },
                { label: "Tax", value: pdfAmount(filtered.reduce((a, p) => a + Number(p.tax_amount), 0)) },
                {
                  label: "Total ordered",
                  value: pdfAmount(filtered.reduce((a, p) => a + Number(p.total), 0)),
                  strong: true,
                },
              ],
            })}
          />
          <Button asChild>
            <Link to="/purchases/new"><Plus className="mr-2 h-4 w-4" />New purchase</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search purchase or supplier..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <TableHead>Purchase #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No purchases found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.purchase_number}</TableCell>
                        <TableCell className="text-muted-foreground">{p.supplier_name ?? "—"}</TableCell>
                        <TableCell>{shortDate(p.purchase_date)}</TableCell>
                        <TableCell className="num font-medium">{inr(p.total)}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "received" ? "default" : p.status === "cancelled" ? "destructive" : "secondary"}>
                            {titleCase(p.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{titleCase(p.payment_status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild aria-label="View purchase order">
                            <Link to="/purchases/$id" params={{ id: p.id }}><FileText className="h-4 w-4" /></Link>
                          </Button>
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
