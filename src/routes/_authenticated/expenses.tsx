import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Download } from "lucide-react";
import { inr, shortDate, titleCase, downloadCsv } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];

const CATEGORIES = ["Rent", "Salaries", "Electricity", "Transport", "Packaging", "Maintenance", "Marketing", "Miscellaneous"];
const METHODS = ["cash", "card", "upi", "wallet", "bank_transfer"] as const;

export const Route = createFileRoute("/_authenticated/expenses")({
  component: ExpensesPage,
  head: () => ({
    meta: [
      { title: "Expenses — FreshMart ERP" },
      { name: "description", content: "Record and track daily store expenses by category and payment method." },
    ],
  }),
});

function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Miscellaneous",
    amount: "",
    payment_method: "cash",
    expense_date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const { data: expenses, isLoading } = useRows<Expense>("expenses", { orderBy: "expense_date", ascending: false });
  const save = useSaveRow("expenses", "Expense");
  const remove = useDeleteRow("expenses", "Expense");

  const rows = useMemo(
    () =>
      (expenses ?? []).filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [expenses, search],
  );

  const now = new Date();
  const monthTotal = (expenses ?? [])
    .filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + Number(e.amount), 0);
  const allTotal = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const topCategory = Object.entries(
    (expenses ?? []).reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({
      title: form.title,
      category: form.category,
      amount: Number(form.amount || 0),
      payment_method: form.payment_method,
      expense_date: form.expense_date,
      description: form.description || null,
    });
    setOpen(false);
    setForm({
      title: "",
      category: "Miscellaneous",
      amount: "",
      payment_method: "cash",
      expense_date: new Date().toISOString().slice(0, 10),
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-sm text-muted-foreground">Track every rupee that leaves the store.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                "expenses.csv",
                (expenses ?? []).map((e) => ({
                  Date: e.expense_date,
                  Title: e.title,
                  Category: e.category,
                  Method: e.payment_method,
                  Amount: Number(e.amount),
                })),
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    required
                    placeholder="Shop electricity bill"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paid by</label>
                  <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => <SelectItem key={m} value={m}>{titleCase(m)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={form.expense_date}
                    onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Optional details"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This month</CardTitle></CardHeader>
          <CardContent className="num text-2xl font-bold">{inr(monthTotal)}</CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">All time</CardTitle></CardHeader>
          <CardContent className="num text-2xl font-bold">{inr(allTotal)}</CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Biggest category</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {topCategory ? topCategory[0] : "—"}
            {topCategory && <span className="num ml-2 text-sm font-normal text-muted-foreground">{inr(topCategory[1])}</span>}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid by</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No expenses recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-muted-foreground">{shortDate(e.expense_date)}</TableCell>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                        <TableCell>{titleCase(e.payment_method)}</TableCell>
                        <TableCell className="num text-right">{inr(e.amount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
