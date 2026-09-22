import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { inr, num, dateTime, titleCase } from "@/lib/format";
import { downloadPdf, pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];

export const Route = createFileRoute("/_authenticated/sales/$id")({
  component: SaleDetailPage,
  head: () => ({
    meta: [
      { title: "Invoice details — FreshMart ERP" },
      { name: "description", content: "View a completed sale, its items, taxes and payment, and print the receipt." },
      { property: "og:title", content: "Invoice details — FreshMart ERP" },
      { property: "og:description", content: "View a completed sale, its items, taxes and payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SaleDetailPage() {
  const { id } = Route.useParams();

  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as Sale | null;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["sale-items", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("sale_items").select("*").eq("sale_id", id);
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as SaleItem[];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["store-settings-single"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as StoreSettings | null;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sale) {
    return (
      <Card className="shadow-card">
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">This invoice could not be found.</p>
          <Button asChild variant="outline"><Link to="/sales">Back to sales</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const lines = items ?? [];

  const exportPdf = () =>
    downloadPdf({
      filename: `${sale.invoice_number}.pdf`,
      title: `Tax Invoice ${sale.invoice_number}`,
      subtitle: `${sale.customer_name ?? "Walk-in customer"}`,
      storeName: settings?.store_name ?? "FreshMart Supermarket",
      storeMeta: [
        settings?.address,
        [settings?.phone, settings?.email].filter(Boolean).join("  ·  ") || null,
        settings?.gst_number ? `GSTIN ${settings.gst_number}` : null,
      ],
      meta: [
        { label: "Invoice no.", value: sale.invoice_number },
        { label: "Date", value: dateTime(sale.created_at) },
        { label: "Customer", value: sale.customer_name ?? "Walk-in" },
        { label: "Billed by", value: sale.cashier_name ?? "—" },
        { label: "Payment", value: titleCase(sale.payment_method) },
        { label: "Status", value: titleCase(sale.status) },
      ],
      tables: [
        {
          heading: "Items",
          subheading: `${lines.length} line item${lines.length === 1 ? "" : "s"}`,
          head: ["Product", "SKU", "Qty", "Price", "Discount", "Tax %", "Total"],
          alignRight: [2, 3, 4, 5, 6],
          rows: lines.map((l) => [
            l.product_name,
            l.sku ?? "—",
            pdfNumber(l.quantity, 2),
            pdfAmount(l.unit_price),
            pdfAmount(l.discount),
            pdfNumber(l.tax_rate, 2),
            pdfAmount(l.total),
          ]),
          empty: "No items on this invoice.",
        },
      ],
      totals: [
        { label: "Subtotal", value: pdfAmount(sale.subtotal) },
        { label: "Discount", value: `- ${pdfAmount(sale.discount_amount)}` },
        { label: "Tax", value: pdfAmount(sale.tax_amount) },
        { label: "Grand total", value: pdfAmount(sale.total), strong: true },
        { label: "Amount paid", value: pdfAmount(sale.amount_paid) },
        { label: "Change due", value: pdfAmount(sale.change_due) },
      ],
      notes: [sale.notes],
      closingNote: "Thank you for shopping with us.",
    });


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to sales">
            <Link to="/sales"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Invoice {sale.invoice_number}</h2>
            <p className="text-sm text-muted-foreground">
              {sale.customer_name ?? "Walk-in"} · {dateTime(sale.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={sale.status === "completed" ? "default" : sale.status === "refunded" ? "destructive" : "secondary"}>
            {titleCase(sale.status)}
          </Badge>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={exportPdf}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle>{settings?.store_name ?? "FreshMart Supermarket"}</CardTitle>
          <p className="text-sm text-muted-foreground">{settings?.address ?? ""}</p>
          <p className="text-sm text-muted-foreground">
            {settings?.phone ?? ""}{settings?.gst_number ? ` · GST ${settings.gst_number}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Detail label="Invoice" value={sale.invoice_number} />
            <Detail label="Customer" value={sale.customer_name ?? "Walk-in"} />
            <Detail label="Billed by" value={sale.cashier_name ?? "—"} />
            <Detail label="Date" value={dateTime(sale.created_at)} />
            <Detail label="Payment" value={titleCase(sale.payment_method)} />
            <Detail label="Items" value={num(lines.length)} />
          </div>

          <Separator />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No items were recorded on this invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        {l.product_id ? (
                          <Link to="/products/$id" params={{ id: l.product_id }} className="hover:underline">
                            {l.product_name}
                          </Link>
                        ) : (
                          l.product_name
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{l.sku ?? "—"}</TableCell>
                      <TableCell className="num text-right">{num(l.quantity, 2)}</TableCell>
                      <TableCell className="num text-right">{inr(l.unit_price)}</TableCell>
                      <TableCell className="num text-right">{inr(l.discount)}</TableCell>
                      <TableCell className="num text-right">{num(l.tax_rate, 2)}%</TableCell>
                      <TableCell className="num text-right font-medium">{inr(l.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={inr(sale.subtotal)} />
            <Row label="Discount" value={`- ${inr(sale.discount_amount)}`} />
            <Row label="Tax" value={inr(sale.tax_amount)} />
            <Separator />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span className="num">{inr(sale.total)}</span>
            </div>
            <Row label="Amount paid" value={inr(sale.amount_paid)} />
            <Row label="Change due" value={inr(sale.change_due)} />
          </div>

          {sale.notes && <p className="text-sm text-muted-foreground">Note: {sale.notes}</p>}
          <p className="text-center text-xs text-muted-foreground">Thank you for shopping with us.</p>
        </CardContent>
      </Card>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
