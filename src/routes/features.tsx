import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Package,
  Users,
  Truck,
  BarChart3,
  ShieldCheck,
  Wallet,
  Boxes,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — FreshMart Retail Management" },
      {
        name: "description",
        content:
          "Billing, inventory, purchases, suppliers, expenses and reporting — everything a retail store needs in one system.",
      },
      { property: "og:title", content: "Features — FreshMart Retail Management" },
      {
        property: "og:description",
        content: "Billing, inventory, purchases, suppliers, expenses and reporting for retail stores.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/features" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/features" }],
  }),
});

const features = [
  {
    icon: Receipt,
    title: "Fast counter billing",
    body: "Create invoices in seconds with barcode-friendly search, split payments, discounts and instant change calculation.",
  },
  {
    icon: Package,
    title: "Live inventory",
    body: "Every sale and purchase updates stock automatically, with minimum and maximum levels per product.",
  },
  {
    icon: Boxes,
    title: "Stock adjustments",
    body: "Record damage, wastage and recounts with a full movement history so your numbers always reconcile.",
  },
  {
    icon: Truck,
    title: "Purchases & suppliers",
    body: "Log supplier bills, track outstanding balances and keep payment terms in one shared place.",
  },
  {
    icon: Users,
    title: "Customer records",
    body: "Loyalty points, outstanding balances and purchase history for every regular buyer.",
  },
  {
    icon: Wallet,
    title: "Expense tracking",
    body: "Capture rent, salaries, utilities and other costs so profit figures reflect reality.",
  },
  {
    icon: BarChart3,
    title: "Reports that matter",
    body: "Revenue trends, best-selling products, payment mix and profit summaries across any date range.",
  },
  {
    icon: ShieldCheck,
    title: "Secure accounts",
    body: "Staff sign in with their own account, and every record is protected behind your store's login.",
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Everything your store runs on, in one place
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            FreshMart replaces spreadsheets, paper registers and disconnected billing software with a single system your
            whole team can use.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="shadow-card">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold tracking-tight">Ready to see it with your own products?</h2>
          <p className="mt-2 text-muted-foreground">Create an account and start billing in minutes.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/auth/signup">Get started free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
