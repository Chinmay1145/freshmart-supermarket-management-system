import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Plus, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRestockPlan } from "@/lib/restock.functions";
import { downloadPdf, pdfNumber } from "@/lib/pdf";
import { downloadCsv } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStorePdf } from "@/hooks/use-store-pdf";

export const Route = createFileRoute("/_authenticated/restock")({
  component: RestockPage,
  head: () => ({
    meta: [
      { title: "AI Restock Planner — FreshMart ERP" },
      { name: "description", content: "Get AI-powered, prioritized restock recommendations from current stock and recent sales." },
    ],
  }),
});

type Item = { key: string; name: string; unit: string; stock: string; min_stock: string; max_stock: string; sold: string };
type Plan = Extract<Awaited<ReturnType<typeof getRestockPlan>>, { ok: true }>["plan"];

const tone: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  urgent: "destructive", high: "default", medium: "secondary", low: "outline",
};

function RestockPage() {
  const [period, setPeriod] = useState("30");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const { storeName, storeMeta } = useStorePdf();
  const runPlan = useServerFn(getRestockPlan);

  const data = useQuery({
    queryKey: ["restock-source", period],
    queryFn: async () => {
      const since = new Date(Date.now() - Number(period) * 86_400_000).toISOString();
      const [{ data: products, error: pe }, { data: sales, error: se }] = await Promise.all([
        supabase.from("products").select("id,name,unit,stock,min_stock,max_stock").eq("is_active", true).order("name"),
        supabase.from("sales").select("id, sale_items(product_id, quantity)").gte("created_at", since),
      ]);
      if (pe || se) throw new Error("Could not load stock and sales data.");
      const sold = new Map<string, number>();
      for (const s of sales ?? []) for (const li of (s as { sale_items: { product_id: string | null; quantity: number }[] }).sale_items ?? [])
        if (li.product_id) sold.set(li.product_id, (sold.get(li.product_id) ?? 0) + Number(li.quantity));
      return (products ?? []).map((p) => ({
        key: p.id, name: p.name, unit: p.unit, stock: String(p.stock), min_stock: String(p.min_stock),
        max_stock: String(p.max_stock ?? 0), sold: String(sold.get(p.id) ?? 0),
      }));
    },
  });

  useEffect(() => { if (data.data) setItems(data.data); }, [data.data]);

  const update = (key: string, field: keyof Item, value: string) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, [field]: value } : i)));

  const invalid = useMemo(() => items.some((i) =>
    !i.name.trim() || [i.stock, i.min_stock, i.max_stock, i.sold].some((v) => v === "" || isNaN(Number(v)) || Number(v) < 0)), [items]);

  const generate = useMutation({
    mutationFn: async () => {
      const res = await runPlan({
        data: {
          periodDays: Number(period),
          notes,
          items: items.slice(0, 200).map((i) => ({
            name: i.name.trim(), unit: i.unit.trim() || "pcs", stock: Number(i.stock), min_stock: Number(i.min_stock),
            max_stock: Number(i.max_stock), sold_last_period: Number(i.sold),
          })),
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res.plan;
    },
    onSuccess: (p) => { setPlan(p); toast.success(`${p.recommendations.length} restock recommendations ready.`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportPdf = () => plan && downloadPdf({
    filename: "freshmart-restock-plan.pdf",
    title: "AI Restock Plan",
    subtitle: `Based on the last ${period} days of sales`,
    storeName, storeMeta,
    notes: plan.summary,
    tables: [{
      title: "Recommendations",
      head: ["Product", "Priority", "Order qty", "Days left", "Reason"],
      rows: plan.recommendations.map((r) => [r.product, r.priority.toUpperCase(), pdfNumber(r.suggested_quantity, 0),
        r.days_of_stock_left === null ? "—" : pdfNumber(r.days_of_stock_left, 1), r.reason]),
    }],
  } as Parameters<typeof downloadPdf>[0]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Sparkles className="h-5 w-5 text-primary" /> AI Restock Planner</h2>
        <p className="text-sm text-muted-foreground">Review current stock and recent sales, adjust anything, then get prioritized reorder quantities.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">1. Stock & sales data</CardTitle>
            <CardDescription>Pre-filled from your store. Edit values or add items not yet in the system.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["7", "14", "30", "60", "90"].map((d) => <SelectItem key={d} value={d}>Last {d} days</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => data.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Reload</Button>
            <Button variant="outline" onClick={() => setItems((l) => [...l, { key: crypto.randomUUID(), name: "", unit: "pcs", stock: "0", min_stock: "0", max_stock: "0", sold: "0" }])}>
              <Plus className="mr-2 h-4 w-4" />Add item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.isLoading ? <div className="p-4"><Skeleton className="h-40 w-full" /></div> : (
            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead><TableHead>Unit</TableHead><TableHead>In stock</TableHead>
                    <TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>Sold ({period}d)</TableHead><TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No products yet — add items manually to get recommendations.</TableCell></TableRow>
                  ) : items.map((i) => (
                    <TableRow key={i.key}>
                      <TableCell><Input value={i.name} maxLength={120} onChange={(e) => update(i.key, "name", e.target.value)} className={!i.name.trim() ? "border-destructive" : ""} /></TableCell>
                      <TableCell><Input value={i.unit} maxLength={20} className="w-20" onChange={(e) => update(i.key, "unit", e.target.value)} /></TableCell>
                      {(["stock", "min_stock", "max_stock", "sold"] as const).map((f) => (
                        <TableCell key={f}>
                          <Input type="number" min="0" value={i[f]} className={`w-24 ${i[f] === "" || Number(i[f]) < 0 ? "border-destructive" : ""}`} onChange={(e) => update(i.key, f, e.target.value)} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => setItems((l) => l.filter((x) => x.key !== i.key))}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">2. Notes for the planner (optional)</CardTitle>
          <CardDescription>E.g. "Diwali next week", "supplier delivers only on Mondays".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the AI should consider..." />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{items.length} items{items.length > 200 ? " (first 200 will be analysed)" : ""}</p>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending || invalid || items.length === 0}>
              <Sparkles className="mr-2 h-4 w-4" />{generate.isPending ? "Analysing..." : "Generate recommendations"}
            </Button>
          </div>
          {invalid && <p className="text-xs text-destructive">Fix the highlighted fields: names are required and numbers can't be empty or negative.</p>}
        </CardContent>
      </Card>

      {plan && (
        <Card className="shadow-card">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">3. Recommendations</CardTitle>
              <CardDescription className="max-w-2xl">{plan.summary}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => downloadCsv("restock-plan.csv", plan.recommendations.map((r) => ({ ...r })))}>CSV</Button>
              <Button variant="outline" onClick={exportPdf}>PDF</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Priority</TableHead><TableHead>Order qty</TableHead><TableHead>Days left</TableHead><TableHead>Why</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {plan.recommendations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Nothing needs restocking right now.</TableCell></TableRow>
                  ) : plan.recommendations.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{r.product}</TableCell>
                      <TableCell><Badge variant={tone[r.priority]}>{r.priority}</Badge></TableCell>
                      <TableCell className="font-semibold">{r.suggested_quantity}</TableCell>
                      <TableCell>{r.days_of_stock_left === null ? "—" : r.days_of_stock_left.toFixed(1)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
