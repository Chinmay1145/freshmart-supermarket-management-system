import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/site-layout";
import { ShoppingBag, BarChart3, Users, Receipt } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "FreshMart ERP — Retail Management" },
      { name: "description", content: "Inventory, billing, purchases and customer management for retail stores." },
      { property: "og:title", content: "FreshMart ERP — Retail Management" },
      { property: "og:description", content: "Inventory, billing, purchases and customer management for retail stores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <SiteLayout>
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Run your retail store <span className="text-primary">smarter</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Inventory, billing, purchases, suppliers and customers — all in one simple ERP built for Indian retail.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/auth/signup"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get started free"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">Explore features</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShoppingBag, title: "Inventory", text: "Track stock, SKUs and low-stock alerts." },
              { icon: Receipt, title: "Billing", text: "Invoices with GST, discounts and payments." },
              { icon: Users, title: "Customers", text: "Loyalty points and purchase history." },
              { icon: BarChart3, title: "Insights", text: "Daily sales and stock overviews." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border p-5 text-left">
                <f.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-semibold">{f.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
    </SiteLayout>
  );
}