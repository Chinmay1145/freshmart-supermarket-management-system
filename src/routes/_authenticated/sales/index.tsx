import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRows } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { inr, num, shortDate, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];

export const Route = createFileRoute("/_authenticated/sales/")({
  component: SalesPage,
  head: () => ({
    meta: [{ title: "Sales — FreshMart ERP" }, { name: "description", content: "View sales invoices." }],
  }),
});

function SalesPage() {
  const [search, setSearch] = useState("");
  const { data: sales, isLoading } = useRows<Sale>("sales", { orderBy: "created_at", ascending: false });

  const filtered = (sales ?? []).filter(
    (s) =>
      s.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (s.customer_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales</h2>
          <p className="text-sm text-muted-foreground">Recent invoices and transactions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButtons
            pdfLabel="Sales register PDF"
            csv={{
              filename: "sales-register.csv",
              rows: () =>
                filtered.map((s) => ({
                  Invoice: s.invoice_number,
                  Date: shortDate(s.created_at),
                  Customer: s.customer_name ?? "Walk-in",
                  Payment: s.payment_method,
                  Status: s.status,
                  Subtotal: Number(s.subtotal),
                  Tax: Number(s.tax_amount),
                  Total: Number(s.total),
                })),
            }}
            pdf={() => ({
              filename: "sales-register.pdf",
              title: "Sales Register",
              subtitle: `${filtered.length} invoices listed`,
              stats: [
                { label: "Invoices", value: pdfNumber(filtered.length, 0) },
                { label: "Revenue", value: pdfAmount(filtered.reduce((a, s) => a + Number(s.total), 0)) },
                { label: "Tax collected", value: pdfAmount(filtered.reduce((a, s) => a + Number(s.tax_amount), 0)) },
                {
                  label: "Discounts given",
                  value: pdfAmount(filtered.reduce((a, s) => a + Number(s.discount_amount), 0)),
                },
              ],
              tables: [
                {
                  heading: "Invoices",
                  head: ["Invoice", "Date", "Customer", "Payment", "Status", "Tax", "Total"],
                  alignRight: [5, 6],
                  rows: filtered.map((s) => [
                    s.invoice_number,
                    shortDate(s.created_at),
                    s.customer_name ?? "Walk-in",
                    titleCase(s.payment_method),
                    titleCase(s.status),
                    pdfAmount(s.tax_amount),
                    pdfAmount(s.total),
                  ]),
                  empty: "No invoices recorded yet.",
                },
              ],
              totals: [
                { label: "Subtotal", value: pdfAmount(filtered.reduce((a, s) => a + Number(s.subtotal), 0)) },
                { label: "Tax", value: pdfAmount(filtered.reduce((a, s) => a + Number(s.tax_amount), 0)) },
                {
                  label: "Grand total",
                  value: pdfAmount(filtered.reduce((a, s) => a + Number(s.total), 0)),
                  strong: true,
                },
              ],
            })}
          />
          <Button asChild>
            <Link to="/sales/new">
              <Plus className="mr-2 h-4 w-4" />
              New sale
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoice or customer..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No sales found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                        <TableCell className="text-muted-foreground">{sale.customer_name ?? "Walk-in"}</TableCell>
                        <TableCell>{shortDate(sale.created_at)}</TableCell>
                        <TableCell className="num">{num(sale.total)}</TableCell>
                        <TableCell className="num font-medium">{inr(sale.total)}</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === "completed" ? "default" : sale.status === "refunded" ? "destructive" : "secondary"}>
                            {titleCase(sale.status)}
                          </Badge>
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
