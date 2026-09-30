import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inr, num, stockStatus, titleCase } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  sku: z.string().trim().min(1, "SKU is required").max(40).regex(/^[A-Za-z0-9_-]+$/, "Letters, digits, - or _ only"),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().default("piece"),
  purchase_price: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  selling_price: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  mrp: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  tax_rate: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  discount: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  stock: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  min_stock: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  max_stock: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Must be 0 or more"),
  location: z.string().default("Main Store"),
  is_active: z.boolean().default(true),
}).superRefine((v, ctx) => {
  if (v.mrp > 0 && v.selling_price > v.mrp) ctx.addIssue({ code: "custom", path: ["selling_price"], message: "Selling price can't exceed MRP" });
  if (v.max_stock < v.min_stock) ctx.addIssue({ code: "custom", path: ["max_stock"], message: "Max stock must be at least min stock" });
  if (v.tax_rate > 100) ctx.addIssue({ code: "custom", path: ["tax_rate"], message: "Tax rate must be 0-100%" });
  if (v.discount > 100) ctx.addIssue({ code: "custom", path: ["discount"], message: "Discount must be 0-100%" });
  if (v.barcode && !/^[0-9A-Za-z-]{4,32}$/.test(v.barcode)) ctx.addIssue({ code: "custom", path: ["barcode"], message: "Use 4-32 letters or digits" });
});

type ProductForm = z.infer<typeof productSchema>;

export const Route = createFileRoute("/_authenticated/products/")({
  component: ProductsPage,
  head: () => ({
    meta: [{ title: "Products — FreshMart ERP" }, { name: "description", content: "Manage products and inventory." }],
  }),
});

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products, isLoading } = useRows<Product>("products", { orderBy: "name", ascending: true });
  const { data: categories } = useRows<Category>("categories", { orderBy: "name", ascending: true });
  const save = useSaveRow("products", "Product");
  const remove = useDeleteRow("products", "Product");

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as Resolver<ProductForm>,
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
      is_active: true,
    },
  });

  const openEdit = (product: Product) => {
    setEditing(product);
    form.reset({
      id: product.id,
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
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({
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
      is_active: true,
    });
    setDialogOpen(true);
  };

  const [toDelete, setToDelete] = useState<Product | null>(null);
  const genSku = () => {
    const base = (form.getValues("name") || "ITEM").replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "ITEM";
    form.setValue("sku", `${base}-${Math.floor(1000 + Math.random() * 9000)}`, { shouldValidate: true });
  };
  const onSubmit = async (values: ProductForm) => {
    const { id: _omit, ...rest } = values;
    await save.mutateAsync({ ...rest, id: editing?.id });
    setDialogOpen(false);
    setEditing(null);
    form.reset();
  };

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">Manage inventory, pricing and stock levels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <ExportButtons
          pdfLabel="Catalogue PDF"
          csv={{
            filename: "product-catalogue.csv",
            rows: () =>
              filtered.map((p) => ({
                Product: p.name,
                SKU: p.sku,
                Barcode: p.barcode ?? "",
                Brand: p.brand ?? "",
                Unit: p.unit,
                PurchasePrice: Number(p.purchase_price),
                SellingPrice: Number(p.selling_price),
                MRP: Number(p.mrp),
                Tax: Number(p.tax_rate),
                Stock: Number(p.stock),
              })),
          }}
          pdf={() => ({
            filename: "product-catalogue.pdf",
            title: "Product Catalogue & Price List",
            subtitle: `${filtered.length} products`,
            stats: [
              { label: "Products", value: pdfNumber(filtered.length, 0) },
              {
                label: "Stock value",
                value: pdfAmount(filtered.reduce((a, p) => a + Number(p.stock) * Number(p.purchase_price), 0)),
                hint: "at purchase price",
              },
              {
                label: "Retail value",
                value: pdfAmount(filtered.reduce((a, p) => a + Number(p.stock) * Number(p.selling_price), 0)),
                hint: "at selling price",
              },
              { label: "Inactive", value: pdfNumber(filtered.filter((p) => !p.is_active).length, 0) },
            ],
            tables: [
              {
                heading: "Price list",
                head: ["Product", "SKU", "Unit", "Cost", "Selling", "MRP", "Tax %", "Stock"],
                alignRight: [3, 4, 5, 6, 7],
                rows: filtered.map((p) => [
                  p.name,
                  p.sku,
                  p.unit,
                  pdfAmount(p.purchase_price),
                  pdfAmount(p.selling_price),
                  pdfAmount(p.mrp),
                  pdfNumber(p.tax_rate, 2),
                  pdfNumber(p.stock),
                ]),
                empty: "No products added yet.",
              },
            ],
            closingNote: "Prices include applicable taxes unless stated otherwise.",
          })}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product name</FormLabel>
                    <FormControl><Input placeholder="Tata Salt 1kg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <div className="flex gap-2">
                      <FormControl><Input placeholder="SALT-001" {...field} /></FormControl>
                      <Button type="button" variant="outline" size="sm" onClick={genSku}>Auto</Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="barcode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl><Input placeholder="8901234567890" {...field} value={field.value ?? ""} /></FormControl>
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
                    <FormControl><Input placeholder="Tata" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl><Input placeholder="piece / kg / litre" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="purchase_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase price</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="selling_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling price</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mrp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tax_rate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax rate (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current stock</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="min_stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min stock</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="max_stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max stock</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Main Store" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="discount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="is_active" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-xs text-muted-foreground">Inactive products are hidden from billing.</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <MarginHint cost={Number(form.watch("purchase_price")) || 0} sell={Number(form.watch("selling_price")) || 0} />
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU or barcode..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Selling</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((product) => {
                      const status = stockStatus(Number(product.stock), Number(product.min_stock), Number(product.max_stock));
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                          <TableCell className="num">{num(product.stock)}</TableCell>
                          <TableCell className="num">{inr(product.mrp)}</TableCell>
                          <TableCell className="num">{inr(product.selling_price)}</TableCell>
                          <TableCell><Badge variant={status.tone === "success" ? "default" : status.tone === "destructive" ? "destructive" : "secondary"}>{status.label}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(product)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(product)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone. Products used in past sales can't be deleted, so mark them inactive instead.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (toDelete) remove.mutate(toDelete.id); setToDelete(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MarginHint({ cost, sell }: { cost: number; sell: number }) {
  const margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
  return (
    <p className={`sm:col-span-2 text-sm ${margin < 0 ? "text-destructive" : "text-muted-foreground"}`}>
      Profit per unit: <span className="num font-medium">{inr(sell - cost)}</span> · Margin {margin.toFixed(1)}%
    </p>
  );
}
