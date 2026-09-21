import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useSaveRow, friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inr, num, shortDate, dateTime, stockStatus, titleCase } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Movement = Database["public"]["Tables"]["inventory_movements"]["Row"];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().default("piece"),
  purchase_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  min_stock: z.coerce.number().min(0),
  max_stock: z.coerce.number().min(0),
  location: z.string().default("Main Store"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/products/$id")({
  component: ProductDetailPage,
  head: () => ({
    meta: [
      { title: "Product details — FreshMart ERP" },
      { name: "description", content: "View and edit a single product, its pricing and stock history." },
      { property: "og:title", content: "Product details — FreshMart ERP" },
      { property: "og:description", content: "View and edit a single product, its pricing and stock history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(friendly(error.message));
      return data as Product | null;
    },
  });

  const { data: categories } = useRows<Category>("categories", { orderBy: "name", ascending: true });
  const { data: movements } = useQuery({
    queryKey: ["product-movements", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as Movement[];
    },
  });

  const save = useSaveRow("products", "Product");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      category_id: "",
      brand: "",
      unit: "piece",
      purchase_price: 0,
      selling_price: 0,
      mrp: 0,
      tax_rate: 5,
      discount: 0,
      stock: 0,
      min_stock: 10,
      max_stock: 500,
      location: "Main Store",
    },
  });

  useEffect(() => {
    if (!product) return;
    form.reset({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? "",
      category_id: product.category_id ?? "",
      brand: product.brand ?? "",
      unit: product.unit,
      purchase_price: Number(product.purchase_price),
      selling_price: Number(product.selling_price),
      mrp: Number(product.mrp),
      tax_rate: Number(product.tax_rate),
      discount: Number(product.discount),
      stock: Number(product.stock),
      min_stock: Number(product.min_stock),
      max_stock: Number(product.max_stock),
      location: product.location ?? "Main Store",
    });
  }, [product, form]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="shadow-card">
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">This product could not be found.</p>
          <Button asChild variant="outline">
            <Link to="/products">Back to products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = stockStatus(Number(product.stock), Number(product.min_stock), Number(product.max_stock));
  const categoryName = (categories ?? []).find((c) => c.id === product.category_id)?.name ?? "—";
  const margin = Number(product.selling_price) - Number(product.purchase_price);

  const onSubmit = async (values: FormValues) => {
    await save.mutateAsync({ ...values, category_id: values.category_id || null, id: product.id });
    setEditing(false);
    router.invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to products">
            <Link to="/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
            <p className="text-sm text-muted-foreground">
              SKU {product.sku} · {categoryName} · {product.brand || "No brand"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              status.tone === "destructive" ? "destructive" : status.tone === "warning" ? "secondary" : "default"
            }
          >
            {status.label}
          </Badge>
          <Button variant={editing ? "outline" : "default"} onClick={() => setEditing((v) => !v)}>
            {editing ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Pencil className="mr-2 h-4 w-4" /> Edit</>}
          </Button>
        </div>
      </div>

      {editing ? (
        <Card className="shadow-card">
          <CardHeader><CardTitle>Edit product</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="barcode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="purchase_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase price</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="selling_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling price</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mrp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tax_rate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax rate (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="discount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="min_stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="max_stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save changes"}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-card lg:col-span-2">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail label="Selling price" value={inr(product.selling_price)} />
              <Detail label="Purchase price" value={inr(product.purchase_price)} />
              <Detail label="MRP" value={inr(product.mrp)} />
              <Detail label="Margin per unit" value={inr(margin)} />
              <Detail label="Tax rate" value={`${num(product.tax_rate, 2)}%`} />
              <Detail label="Discount" value={`${num(product.discount, 2)}%`} />
              <Detail label="Barcode" value={product.barcode || "—"} />
              <Detail label="Unit" value={titleCase(product.unit)} />
              <Detail label="Location" value={product.location || "—"} />
              <Detail label="Expiry" value={shortDate(product.expiry_date)} />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader><CardTitle>Stock</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">On hand</p>
                <p className="num text-3xl font-bold">{num(product.stock, 2)}</p>
              </div>
              <Detail label="Minimum level" value={num(product.min_stock)} />
              <Detail label="Maximum level" value={num(product.max_stock)} />
              <Detail label="Stock value" value={inr(Number(product.stock) * Number(product.purchase_price))} />
              <Detail label="Added on" value={shortDate(product.created_at)} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader><CardTitle>Recent stock movements</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(movements ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No stock movements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (movements ?? []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{dateTime(m.created_at)}</TableCell>
                      <TableCell>{titleCase(m.movement_type)}</TableCell>
                      <TableCell className="num">{num(m.previous_qty, 2)}</TableCell>
                      <TableCell className="num">{num(m.new_qty, 2)}</TableCell>
                      <TableCell className="num font-medium">{Number(m.difference) > 0 ? "+" : ""}{num(m.difference, 2)}</TableCell>
                      <TableCell className="text-muted-foreground">{m.reason ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
