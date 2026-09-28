import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Printer, Barcode, Cloud, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
  head: () => ({
    meta: [
      { title: "Integrations — FreshMart Retail Management" },
      {
        name: "description",
        content:
          "FreshMart works with the tools your store already uses: spreadsheet exports, PDF reports, receipt printing, barcode scanners and cloud sync.",
      },
      { property: "og:title", content: "Integrations — FreshMart Retail Management" },
      {
        property: "og:description",
        content: "Spreadsheet exports, PDF reports, receipt printing and barcode scanners — FreshMart fits your existing workflow.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/integrations" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/integrations" }],
  }),
});

const integrations = [
  {
    icon: FileSpreadsheet,
    title: "Spreadsheet exports (CSV)",
    body: "Every list — sales, purchases, products, customers, suppliers, expenses — exports to CSV in one click, ready for Excel or Google Sheets.",
    status: "Built in",
  },
  {
    icon: FileText,
    title: "PDF reports & invoices",
    body: "Branded tax invoices, stock reports, customer statements and purchase orders download as professional PDFs with your store details.",
    status: "Built in",
  },
  {
    icon: Printer,
    title: "Receipt printing",
    body: "Print invoices and receipts directly from the browser on any standard thermal or A4 printer — no extra software needed.",
    status: "Built in",
  },
  {
    icon: Barcode,
    title: "Barcode scanners",
    body: "Any USB or Bluetooth barcode scanner works out of the box at the billing counter — just scan and the product appears.",
    status: "Built in",
  },
  {
    icon: Cloud,
    title: "Cloud sync",
    body: "Your data syncs securely to the cloud in real time, so the owner can check reports from home while staff bill at the counter.",
    status: "Built in",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp & SMS alerts",
    body: "Send invoice copies and low-stock alerts to customers and staff over WhatsApp or SMS.",
    status: "Coming soon",
  },
];

function IntegrationsPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Works with the tools you already use
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            FreshMart fits into your existing workflow — no rip-and-replace, no special hardware, no IT team required.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => {
            const Icon = i.icon;
            return (
              <Card key={i.title} className="shadow-card">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={
                        i.status === "Built in"
                          ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {i.status}
                    </span>
                  </div>
                  <CardTitle className="text-base">{i.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{i.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold tracking-tight">Need a specific integration?</h2>
          <p className="mt-2 text-muted-foreground">
            Tell us what your store depends on and we'll let you know what's possible.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/contact">Request an integration</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/features">See all features</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
