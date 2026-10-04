import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRows } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr, num, shortDate, titleCase, downloadCsv } from "@/lib/format";
import { downloadPdf, pdfAmount, pdfNumber } from "@/lib/pdf";
import { Download, FileText, TrendingUp, Receipt, Wallet, PiggyBank } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["store_settings"]["Row"];
type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Reports — FreshMart ERP" },
      { name: "description", content: "Revenue trends, best sellers, payment mix and profit summary." },
    ],
  }),
});

const RANGES = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
] as const;

const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#0ea5e9", "#8b5cf6", "#10b981", "#ef4444"];

function ReportsPage() {
  const [range, setRange] = useState<string>("30");
  const days = Number(range);

  const { data: sales, isLoading: salesLoading } = useRows<Sale>("sales", { orderBy: "created_at", ascending: false, limit: 1000 });
  const { data: saleItems, isLoading: itemsLoading } = useRows<SaleItem>("sale_items", { orderBy: "id", limit: 5000 });
  const { data: expenses } = useRows<Expense>("expenses", { orderBy: "expense_date", ascending: false, limit: 1000 });
  const { data: products } = useRows<Product>("products", { limit: 1000 });
  const { data: settingsRows } = useRows<Settings>("store_settings", { orderBy: "updated_at", limit: 1 });
  const storeName = settingsRows?.[0]?.store_name ?? "FreshMart ERP";

  const from = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1));
    return d;
  }, [days]);

  const periodSales = (sales ?? []).filter((s) => new Date(s.created_at) >= from && s.status !== "cancelled");
  const periodSaleIds = new Set(periodSales.map((s) => s.id));
  const periodItems = (saleItems ?? []).filter((i) => periodSaleIds.has(i.sale_id));
  const periodExpenses = (expenses ?? []).filter((e) => new Date(e.expense_date) >= from);

  const revenue = periodSales.reduce((s, r) => s + Number(r.total), 0);
  const expenseTotal = periodExpenses.reduce((s, r) => s + Number(r.amount), 0);

  const costMap = new Map((products ?? []).map((p) => [p.id, Number(p.purchase_price)]));
  const grossProfit = periodItems.reduce((sum, item) => {
    const cost = item.product_id ? (costMap.get(item.product_id) ?? 0) : 0;
    return sum + (Number(item.unit_price) - cost) * Number(item.quantity);
  }, 0);
  const netProfit = grossProfit - expenseTotal;

  const trend = useMemo(() => {
    const buckets = new Map<string, { day: string; revenue: number; invoices: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      buckets.set(d.toDateString(), {
        day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        revenue: 0,
        invoices: 0,
      });
    }
    for (const s of periodSales) {
      const key = new Date(s.created_at).toDateString();
      const b = buckets.get(key);
      if (b) {
        b.revenue += Number(s.total);
        b.invoices += 1;
      }
    }
    return [...buckets.values()];
  }, [periodSales, from, days]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const item of periodItems) {
      const entry = map.get(item.product_name) ?? { name: item.product_name, qty: 0, revenue: 0 };
      entry.qty += Number(item.quantity);
      entry.revenue += Number(item.total);
      map.set(item.product_name, entry);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [periodItems]);

  const paymentMix = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of periodSales) map.set(s.payment_method, (map.get(s.payment_method) ?? 0) + Number(s.total));
    return [...map.entries()].map(([name, value]) => ({ name: titleCase(name), value }));
  }, [periodSales]);

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of periodExpenses) map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [periodExpenses]);

  const loading = salesLoading || itemsLoading;

  const stats = [
    { label: "Revenue", value: inr(revenue), sub: `${periodSales.length} invoices`, icon: Receipt },
    { label: "Gross profit", value: inr(grossProfit), sub: "sales minus product cost", icon: TrendingUp },
    { label: "Expenses", value: inr(expenseTotal), sub: `${periodExpenses.length} entries`, icon: Wallet },
    { label: "Net profit", value: inr(netProfit), sub: "after expenses", icon: PiggyBank },
  ];

  const exportSales = () =>
    downloadCsv(
      `sales-report-${range}-days.csv`,
      periodSales.map((s) => ({
        invoice: s.invoice_number,
        date: shortDate(s.created_at),
        customer: s.customer_name ?? "Walk-in",
        payment: s.payment_method,
        total: Number(s.total),
      })),
    );

  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? `Last ${range} days`;

  const exportPdf = () =>
    downloadPdf({
      filename: `freshmart-business-report-${range}-days.pdf`,
      title: "Business Performance Report",
      subtitle: `${rangeLabel} · ${shortDate(from)} to ${shortDate(new Date())}`,
      storeName,
      stats: [
        { label: "Revenue", value: pdfAmount(revenue), hint: `${periodSales.length} invoices` },
        { label: "Gross profit", value: pdfAmount(grossProfit), hint: "sales minus product cost" },
        { label: "Expenses", value: pdfAmount(expenseTotal), hint: `${periodExpenses.length} entries` },
        { label: "Net profit", value: pdfAmount(netProfit), hint: "after expenses" },
      ],
      tables: [
        {
          heading: "Top products",
          head: ["Product", "Units", "Revenue"],
          alignRight: [1, 2],
          rows: topProducts.map((p) => [p.name, pdfNumber(p.qty), pdfAmount(p.revenue)]),
          empty: "No sales in this period.",
        },
        {
          heading: "Payment mix",
          head: ["Payment method", "Collected"],
          alignRight: [1],
          rows: paymentMix.map((p) => [p.name, pdfAmount(p.value)]),
          empty: "No payments recorded.",
        },
        {
          heading: "Expenses by category",
          head: ["Category", "Amount"],
          alignRight: [1],
          rows: expenseByCategory.map((e) => [titleCase(e.name), pdfAmount(e.value)]),
          empty: "No expenses in this period.",
        },
        {
          heading: "Invoices in period",
          head: ["Invoice", "Date", "Customer", "Payment", "Total"],
          alignRight: [4],
          rows: periodSales
            .slice(0, 60)
            .map((s) => [
              s.invoice_number,
              shortDate(s.created_at),
              s.customer_name ?? "Walk-in",
              titleCase(s.payment_method),
              pdfAmount(s.total),
            ]),
          empty: "No invoices in this period.",
        },
      ],
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground">Performance for the selected period, from your live records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportSales} disabled={!periodSales.length}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-24" />
                ) : (
                  <p className="mt-1 text-2xl font-bold tracking-tight num">{s.value}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Revenue trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => inr(v, true)} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Best selling products</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {topProducts.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No sales in this period yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => inr(v, true)} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => inr(v)} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Payment mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {paymentMix.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMix} dataKey="value" nameKey="name" outerRadius={90} label>
                    {paymentMix.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => inr(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseByCategory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      No expenses in this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseByCategory.map((e) => (
                    <TableRow key={e.name}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-right num">{inr(e.value)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Top products by quantity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No sales in this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right num">{num(p.qty, 2)}</TableCell>
                      <TableCell className="text-right num">{inr(p.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
