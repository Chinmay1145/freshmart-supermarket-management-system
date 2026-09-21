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
        <Button asChild>
          <Link to="/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            New sale
          </Link>
        </Button>
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
