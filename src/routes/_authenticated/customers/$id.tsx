import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Receipt } from "lucide-react";
import { inr, num, shortDate, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfDate } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Sale = Database["public"]["Tables"]["sales"]["Row"];

export const Route = createFileRoute("/_authenticated/customers/$id")({
  component: CustomerDetailPage,
  head: () => ({
    meta: [
      { title: "Customer details — FreshMart ERP" },
      { name: "description", content: "See a customer's purchase history, loyalty points and outstanding balance." },
      { property: "og:title", content: "Customer details — FreshMart ERP" },
      { property: "og:description", content: "See a customer's purchase history, loyalty points and balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function CustomerDetailPage() {
  const { id } = Route.useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as Customer | null;
    },
  });

  const { data: sales } = useQuery({
    queryKey: ["customer-sales", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as Sale[];
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

  if (!customer) {
    return (
      <Card className="shadow-card">
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">This customer could not be found.</p>
          <Button asChild variant="outline"><Link to="/customers">Back to customers</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const list = sales ?? [];
  const spent = list.reduce((sum, s) => sum + Number(s.total), 0);
  const average = list.length ? spent / list.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to customers">
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
            <Badge variant={customer.is_active ? "default" : "secondary"}>
              {customer.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {customer.phone || "No phone"} · {customer.email || "No email"}
          </p>
        </div>
        <ExportButtons
          className="ml-auto"
          pdfLabel="Statement PDF"
          csv={{
            filename: `${customer.name.replace(/\s+/g, "-").toLowerCase()}-purchases.csv`,
            rows: () =>
              list.map((s) => ({
                Invoice: s.invoice_number,
                Date: shortDate(s.created_at),
                Payment: titleCase(s.payment_method),
                Status: titleCase(s.status),
                Total: Number(s.total),
              })),
          }}
          pdf={() => ({
            filename: `statement-${customer.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
            title: "Customer Statement",
            subtitle: customer.name,
            meta: [
              { label: "Customer", value: customer.name },
              { label: "Phone", value: customer.phone || "—" },
              { label: "Email", value: customer.email || "—" },
              { label: "Address", value: customer.address || "—" },
              { label: "Customer since", value: pdfDate(customer.created_at) },
              { label: "Last purchase", value: pdfDate(customer.last_purchase_at) },
            ],
            stats: [
              { label: "Total spent", value: pdfAmount(spent) },
              { label: "Invoices", value: String(list.length) },
              { label: "Average bill", value: pdfAmount(average) },
              { label: "Outstanding", value: pdfAmount(customer.outstanding_balance) },
            ],
            tables: [
              {
                heading: "Purchase history",
                head: ["Invoice", "Date", "Payment", "Status", "Total"],
                alignRight: [4],
                rows: list.map((s) => [
                  s.invoice_number,
                  pdfDate(s.created_at),
                  titleCase(s.payment_method),
                  titleCase(s.status),
                  pdfAmount(s.total),
                ]),
                empty: "No purchases recorded for this customer yet.",
              },
            ],
            totals: [
              { label: "Lifetime purchases", value: pdfAmount(spent) },
              { label: "Loyalty points", value: String(customer.loyalty_points) },
              { label: "Outstanding balance", value: pdfAmount(customer.outstanding_balance), strong: true },
            ],
            closingNote: "Thank you for shopping with us.",
          })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total spent" value={inr(spent)} />
        <Stat label="Invoices" value={num(list.length)} />
        <Stat label="Average bill" value={inr(average)} />
        <Stat label="Outstanding" value={inr(customer.outstanding_balance)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Detail label="Phone" value={customer.phone || "—"} />
            <Detail label="Email" value={customer.email || "—"} />
            <Detail label="Address" value={customer.address || "—"} />
            <Detail label="Date of birth" value={shortDate(customer.date_of_birth)} />
            <Detail label="Loyalty points" value={num(customer.loyalty_points)} />
            <Detail label="Last purchase" value={shortDate(customer.last_purchase_at)} />
            <Detail label="Customer since" value={shortDate(customer.created_at)} />
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Purchase history</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No purchases recorded for this customer yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    list.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.invoice_number}</TableCell>
                        <TableCell>{shortDate(s.created_at)}</TableCell>
                        <TableCell className="text-muted-foreground">{titleCase(s.payment_method)}</TableCell>
                        <TableCell className="num font-medium">{inr(s.total)}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "completed" ? "default" : s.status === "refunded" ? "destructive" : "secondary"}>
                            {titleCase(s.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild aria-label="View receipt">
                            <Link to="/sales/$id" params={{ id: s.id }}><Receipt className="h-4 w-4" /></Link>
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
