import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { inr, num, shortDate, titleCase } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type PurchaseItem = Database["public"]["Tables"]["purchase_items"]["Row"];

export const Route = createFileRoute("/_authenticated/purchases/$id")({
  component: PurchaseDetailPage,
  head: () => ({
    meta: [
      { title: "Purchase order — FreshMart ERP" },
      { name: "description", content: "See the items, supplier and status of a purchase order." },
      { property: "og:title", content: "Purchase order — FreshMart ERP" },
      { property: "og:description", content: "See the items, supplier and status of a purchase order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PurchaseDetailPage() {
  const { id } = Route.useParams();

  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchases").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as Purchase | null;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["purchase-items", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchase_items").select("*").eq("purchase_id", id);
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as PurchaseItem[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <Card className="shadow-card">
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">This purchase order could not be found.</p>
          <Button asChild variant="outline"><Link to="/purchases">Back to purchases</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const list = items ?? [];
  const units = list.reduce((sum, i) => sum + Number(i.quantity), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to purchases">
          <Link to="/purchases"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{purchase.purchase_number}</h2>
            <Badge
              variant={
                purchase.status === "received" ? "default" : purchase.status === "cancelled" ? "destructive" : "secondary"
              }
            >
              {titleCase(purchase.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {purchase.supplier_name ?? "No supplier"} · {shortDate(purchase.purchase_date)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Order total" value={inr(purchase.total)} />
        <Stat label="Items" value={num(list.length)} />
        <Stat label="Units" value={num(units)} />
        <Stat label="Payment" value={titleCase(purchase.payment_status)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Order info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Detail label="Supplier" value={purchase.supplier_name ?? "—"} />
            <Detail label="Supplier invoice" value={purchase.invoice_number ?? "—"} />
            <Detail label="Purchase date" value={shortDate(purchase.purchase_date)} />
            <Detail label="Subtotal" value={inr(purchase.subtotal)} />
            <Detail label="Tax" value={inr(purchase.tax_amount)} />
            <Detail label="Discount" value={inr(purchase.discount_amount)} />
            <Detail label="Notes" value={purchase.notes ?? "—"} />
            <Detail label="Created" value={shortDate(purchase.created_at)} />
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Items ordered</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit cost</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        No items on this order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    list.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.product_name}</TableCell>
                        <TableCell className="num">{num(i.quantity)}</TableCell>
                        <TableCell className="num">{inr(i.unit_cost)}</TableCell>
                        <TableCell className="num font-medium">{inr(i.total)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="num mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
