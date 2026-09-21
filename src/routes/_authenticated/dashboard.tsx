import { createFileRoute, Link } from "@tanstack/react-router";
import { useRows } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { inr, num, shortDate, stockStatus, titleCase } from "@/lib/format";
import {
  Package,
  Users,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Sale = Database["public"]["Tables"]["sales"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard — FreshMart ERP" }, { name: "description", content: "Retail dashboard overview." }],
  }),
});

function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useRows<Product>("products", { limit: 100 });
  const { data: customers, isLoading: customersLoading } = useRows<Customer>("customers", { limit: 100 });
  const { data: sales, isLoading: salesLoading } = useRows<Sale>("sales", { orderBy: "created_at", ascending: false, limit: 10 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = (sales ?? []).filter((s) => new Date(s.created_at) >= today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0);

  const lowStock = (products ?? []).filter((p) => Number(p.stock) <= Number(p.min_stock) && Number(p.stock) > 0);
  const outOfStock = (products ?? []).filter((p) => Number(p.stock) <= 0);

  const statCards = [
    { label: "Today's Sales", value: inr(todayRevenue), sub: `${todaySales.length} invoices`, icon: Receipt, tone: "primary" as const },
    { label: "Products", value: num(products?.length ?? 0), sub: `${lowStock.length} low stock`, icon: Package, tone: "warning" as const },
    { label: "Customers", value: num(customers?.length ?? 0), sub: "total records", icon: Users, tone: "info" as const },
    { label: "Out of Stock", value: num(outOfStock.length), sub: "need restocking", icon: AlertTriangle, tone: "destructive" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Here's what's happening in your store today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/sales/new">New Sale</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/products">Manage Products</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 text-${stat.tone}`} />
            </CardHeader>
            <CardContent>
              {productsLoading || customersLoading || salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sales" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {salesLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (sales ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <div className="divide-y">
                {(sales ?? []).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{sale.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{sale.customer_name ?? "Walk-in"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold num">{inr(sale.total)}</p>
                      <p className="text-xs text-muted-foreground">{shortDate(sale.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Stock Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products" className="gap-1">
                View products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {productsLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Stock levels look healthy.</p>
            ) : (
              <div className="divide-y">
                {[...outOfStock, ...lowStock].slice(0, 8).map((product) => {
                  const status = stockStatus(Number(product.stock), Number(product.min_stock), Number(product.max_stock));
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={status.tone === "destructive" ? "destructive" : "secondary"}>{status.label}</Badge>
                        <p className="mt-1 text-xs text-muted-foreground num">{num(product.stock)} left</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
