import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/site-layout";
import { ShoppingBag, BarChart3, Users, Receipt, ArrowRight } from "lucide-react";

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

const features = [
  { icon: ShoppingBag, title: "Inventory", text: "Track stock, SKUs and low-stock alerts in real time." },
  { icon: Receipt, title: "Billing", text: "GST-ready invoices with discounts and payment modes." },
  { icon: Users, title: "Customers", text: "Loyalty points and complete purchase history." },
  { icon: BarChart3, title: "Insights", text: "Daily sales, profit and stock reports at a glance." },
];

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Built for Indian retail
            </span>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Run your retail store <span className="text-primary">smarter.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Inventory, billing, purchases, suppliers and customers — all in one simple ERP built for Indian retail.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="w-full rounded-2xl px-8 py-6 text-base font-bold shadow-glow transition-all hover:scale-[1.02] sm:w-auto"
            >
              <Link to={isAuthenticated ? "/dashboard" : "/auth/signup"}>
                {isAuthenticated ? "Go to Dashboard" : "Get started free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full rounded-2xl px-8 py-6 text-base font-bold sm:w-auto"
            >
              <Link to="/features">Explore features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 pb-32">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
