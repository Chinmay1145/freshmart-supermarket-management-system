import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inr, num } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { pdfAmount, pdfNumber } from "@/lib/pdf";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CustomerForm = z.infer<typeof customerSchema>;

export const Route = createFileRoute("/_authenticated/customers/")({
  component: CustomersPage,
  head: () => ({
    meta: [{ title: "Customers — FreshMart ERP" }, { name: "description", content: "Manage customer records." }],
  }),
});

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const { data: customers, isLoading } = useRows<Customer>("customers", { orderBy: "name", ascending: true });
  const save = useSaveRow("customers", "Customer");
  const remove = useDeleteRow("customers", "Customer");

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerForm>,
    defaultValues: { name: "", phone: "", email: "", address: "", date_of_birth: "", is_active: true },
  });

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    form.reset({
      id: customer.id,
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      date_of_birth: customer.date_of_birth ?? "",
      is_active: customer.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", phone: "", email: "", address: "", date_of_birth: "", is_active: true });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CustomerForm) => {
    await save.mutateAsync({ ...values, id: editing?.id });
    setDialogOpen(false);
    setEditing(null);
    form.reset();
  };

  const filtered = (customers ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-sm text-muted-foreground">Track buyers, loyalty points and balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <ExportButtons
          pdfLabel="Customer report PDF"
          csv={{
            filename: "customers.csv",
            rows: () =>
              filtered.map((c) => ({
                Name: c.name,
                Phone: c.phone ?? "",
                Email: c.email ?? "",
                LoyaltyPoints: Number(c.loyalty_points),
                TotalPurchases: Number(c.total_purchases),
                Outstanding: Number(c.outstanding_balance),
              })),
          }}
          pdf={() => ({
            filename: "customer-report.pdf",
            title: "Customer Report",
            subtitle: `${filtered.length} customers`,
            stats: [
              { label: "Customers", value: pdfNumber(filtered.length, 0) },
              {
                label: "Lifetime purchases",
                value: pdfAmount(filtered.reduce((a, c) => a + Number(c.total_purchases), 0)),
              },
              {
                label: "Outstanding",
                value: pdfAmount(filtered.reduce((a, c) => a + Number(c.outstanding_balance), 0)),
                hint: "to be collected",
              },
              {
                label: "Loyalty points",
                value: pdfNumber(filtered.reduce((a, c) => a + Number(c.loyalty_points), 0), 0),
              },
            ],
            tables: [
              {
                heading: "Customer directory",
                head: ["Name", "Phone", "Email", "Purchases", "Points", "Outstanding"],
                alignRight: [3, 4, 5],
                rows: filtered.map((c) => [
                  c.name,
                  c.phone ?? "—",
                  c.email ?? "—",
                  pdfAmount(c.total_purchases),
                  pdfNumber(c.loyalty_points, 0),
                  pdfAmount(c.outstanding_balance),
                ]),
                empty: "No customers added yet.",
              },
            ],
            totals: [
              {
                label: "Total outstanding",
                value: pdfAmount(filtered.reduce((a, c) => a + Number(c.outstanding_balance), 0)),
                strong: true,
              },
            ],
          })}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit customer" : "Add customer"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl><Input placeholder="Ravi Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+91 98765 43210" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="ravi@example.com" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="14 MG Road, Pune" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
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
            <Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Loyalty</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No customers found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
                        <TableCell className="num">{num(customer.loyalty_points)}</TableCell>
                        <TableCell className="num">{inr(customer.outstanding_balance)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(customer)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(customer.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
