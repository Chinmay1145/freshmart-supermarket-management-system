import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText } from "lucide-react";
import { inr, num, shortDate, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfDate } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/_authenticated/suppliers/$id")({
  component: SupplierDetailPage,
  head: () => ({
    meta: [
      { title: "Supplier details — FreshMart ERP" },
      { name: "description", content: "See a supplier's purchase history, products supplied and outstanding amount." },
      { property: "og:title", content: "Supplier details — FreshMart ERP" },
      { property: "og:description", content: "See a supplier's purchase history and outstanding amount." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SupplierDetailPage() {
  const { id } = Route.useParams();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as Supplier | null;
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ["supplier-purchases", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("supplier_id", id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as Purchase[];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["supplier-products", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("supplier_id", id).order("name");
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as Product[];
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

  if (!supplier) {
    return (
      <Card className="shadow-card">
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">This supplier could not be found.</p>
          <Button asChild variant="outline"><Link to="/suppliers">Back to suppliers</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const list = purchases ?? [];
  const purchased = list.reduce((sum, p) => sum + Number(p.total), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to suppliers">
          <Link to="/suppliers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{supplier.name}</h2>
            <Badge variant={supplier.is_active ? "default" : "secondary"}>
              {supplier.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {supplier.company || "No company"} · {supplier.phone || "No phone"}
          </p>
        </div>
        <ExportButtons
          className="ml-auto"
          pdfLabel="Statement PDF"
          csv={{
            filename: `${supplier.name.replace(/\s+/g, "-").toLowerCase()}-orders.csv`,
            rows: () =>
              list.map((p) => ({
                Purchase: p.purchase_number,
                Date: shortDate(p.purchase_date),
                Status: titleCase(p.status),
                Payment: titleCase(p.payment_status),
                Total: Number(p.total),
              })),
          }}
          pdf={() => ({
            filename: `statement-${supplier.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
            title: "Supplier Statement",
            subtitle: supplier.company || supplier.name,
            meta: [
              { label: "Supplier", value: supplier.name },
              { label: "Company", value: supplier.company || "—" },
              { label: "Phone", value: supplier.phone || "—" },
              { label: "Email", value: supplier.email || "—" },
              { label: "GSTIN", value: supplier.gst_number || "—" },
              { label: "Payment terms", value: supplier.payment_terms || "—" },
            ],
            stats: [
              { label: "Total purchased", value: pdfAmount(purchased) },
              { label: "Orders", value: String(list.length) },
              { label: "Products supplied", value: String((products ?? []).length) },
              { label: "Outstanding", value: pdfAmount(supplier.outstanding_amount) },
            ],
            tables: [
              {
                heading: "Purchase orders",
                head: ["Purchase #", "Date", "Status", "Payment", "Total"],
                alignRight: [4],
                rows: list.map((p) => [
                  p.purchase_number,
                  pdfDate(p.purchase_date),
                  titleCase(p.status),
                  titleCase(p.payment_status),
                  pdfAmount(p.total),
                ]),
                empty: "No purchase orders recorded for this supplier yet.",
              },
            ],
            totals: [
              { label: "Total purchased", value: pdfAmount(purchased) },
              { label: "Outstanding payable", value: pdfAmount(supplier.outstanding_amount), strong: true },
            ],
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total purchased" value={inr(purchased)} />
        <Stat label="Orders" value={num(list.length)} />
        <Stat label="Products supplied" value={num((products ?? []).length)} />
        <Stat label="Outstanding" value={inr(supplier.outstanding_amount)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Detail label="Company" value={supplier.company || "—"} />
            <Detail label="Phone" value={supplier.phone || "—"} />
            <Detail label="Email" value={supplier.email || "—"} />
            <Detail label="Address" value={supplier.address || "—"} />
            <Detail label="GST number" value={supplier.gst_number || "—"} />
            <Detail label="Payment terms" value={supplier.payment_terms || "—"} />
            <Detail label="Supplier since" value={shortDate(supplier.created_at)} />
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Purchase history</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No purchase orders recorded for this supplier yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    list.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.purchase_number}</TableCell>
                        <TableCell>{shortDate(p.purchase_date)}</TableCell>
                        <TableCell className="num font-medium">{inr(p.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "received" ? "default" : p.status === "cancelled" ? "destructive" : "secondary"
                            }
                          >
                            {titleCase(p.status)}
                          </Badge>
                        </TableCell>
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
