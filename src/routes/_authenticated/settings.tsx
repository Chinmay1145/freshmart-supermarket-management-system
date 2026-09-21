import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRows, friendly } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Save } from "lucide-react";
import { dateTime } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["store_settings"]["Row"];
type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Store Settings — FreshMart ERP" },
      { name: "description", content: "Update store details, tax defaults, invoice numbering and billing preferences." },
    ],
  }),
});

const empty = {
  store_name: "",
  address: "",
  phone: "",
  email: "",
  gst_number: "",
  currency: "INR",
  default_tax: 5,
  invoice_prefix: "INV",
  auto_print: false,
};

function SettingsPage() {
  const qc = useQueryClient();
  const { data: rows, isLoading } = useRows<Settings>("store_settings", { orderBy: "updated_at" });
  const { data: logs } = useRows<AuditLog>("audit_logs", { limit: 20 });
  const current = rows?.[0];
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (current) {
      setForm({
        store_name: current.store_name ?? "",
        address: current.address ?? "",
        phone: current.phone ?? "",
        email: current.email ?? "",
        gst_number: current.gst_number ?? "",
        currency: current.currency ?? "INR",
        default_tax: Number(current.default_tax ?? 5),
        invoice_prefix: current.invoice_prefix ?? "INV",
        auto_print: current.auto_print ?? false,
      });
    }
  }, [current]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, default_tax: Number(form.default_tax), updated_at: new Date().toISOString() };
      const query = current
        ? supabase.from("store_settings").update(payload).eq("id", current.id)
        : supabase.from("store_settings").insert(payload);
      const { error } = await query;
      if (error) throw new Error(friendly(error.message));
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Store settings saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store settings</h2>
        <p className="text-sm text-muted-foreground">These details appear on every invoice you print.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Store className="h-4 w-4" /> Store profile</CardTitle>
          <CardDescription>Name, address and tax identity of your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Store name</label>
              <Input required value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST number</label>
              <Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default tax (%)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.default_tax}
                onChange={(e) => setForm({ ...form, default_tax: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice prefix</label>
              <Input value={form.invoice_prefix} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Print receipt automatically</p>
                <p className="text-xs text-muted-foreground">Open the print dialog as soon as a sale is completed.</p>
              </div>
              <Switch checked={form.auto_print} onCheckedChange={(v) => setForm({ ...form, auto_print: v })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {save.isPending ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>The latest changes recorded across your store.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Area</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No activity yet.</TableCell>
                  </TableRow>
                ) : (
                  (logs ?? []).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-muted-foreground">{dateTime(l.created_at)}</TableCell>
                      <TableCell>{l.user_email ?? "system"}</TableCell>
                      <TableCell className="font-medium">{l.action}</TableCell>
                      <TableCell><Badge variant="secondary">{l.module}</Badge></TableCell>
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
