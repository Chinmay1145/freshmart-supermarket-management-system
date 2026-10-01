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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.store_name.trim()) e.store_name = "Store name is required.";
    else if (form.store_name.trim().length > 100) e.store_name = "Store name must be under 100 characters.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (form.phone.trim() && !/^\+?[\d\s()-]{7,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number (7–15 digits).";
    if (form.gst_number.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gst_number.trim().toUpperCase()))
      e.gst_number = "Enter a valid 15-character GSTIN (e.g. 27AABCF1234M1ZP).";
    const tax = Number(form.default_tax);
    if (isNaN(tax) || tax < 0 || tax > 28) e.default_tax = "Tax must be between 0% and 28%.";
    if (!form.invoice_prefix.trim()) e.invoice_prefix = "Invoice prefix is required.";
    else if (!/^[A-Za-z0-9-]{1,10}$/.test(form.invoice_prefix.trim()))
      e.invoice_prefix = "Use up to 10 letters, numbers or dashes only.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
              if (!validate()) {
                toast.error("Please fix the highlighted fields.");
                return;
              }
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Store name <span className="text-destructive">*</span></label>
              <Input
                value={form.store_name}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, store_name: e.target.value }); setErrors((p) => ({ ...p, store_name: "" })); }}
                className={errors["store_name"] ? "border-destructive" : ""}
              />
              {errors["store_name"] && <p className="text-xs text-destructive">{errors["store_name"]}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST number</label>
              <Input
                value={form.gst_number}
                maxLength={15}
                placeholder="27AABCF1234M1ZP"
                onChange={(e) => { setForm({ ...form, gst_number: e.target.value.toUpperCase() }); setErrors((p) => ({ ...p, gst_number: "" })); }}
                className={errors["gst_number"] ? "border-destructive" : ""}
              />
              {errors["gst_number"] && <p className="text-xs text-destructive">{errors["gst_number"]}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={form.phone}
                maxLength={16}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors((p) => ({ ...p, phone: "" })); }}
                className={errors["phone"] ? "border-destructive" : ""}
              />
              {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: "" })); }}
                className={errors["email"] ? "border-destructive" : ""}
              />
              {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default tax (%)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="28"
                value={form.default_tax}
                onChange={(e) => { setForm({ ...form, default_tax: Number(e.target.value) }); setErrors((p) => ({ ...p, default_tax: "" })); }}
                className={errors["default_tax"] ? "border-destructive" : ""}
              />
              {errors["default_tax"] && <p className="text-xs text-destructive">{errors["default_tax"]}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice prefix <span className="text-destructive">*</span></label>
              <Input
                value={form.invoice_prefix}
                maxLength={10}
                onChange={(e) => { setForm({ ...form, invoice_prefix: e.target.value.toUpperCase() }); setErrors((p) => ({ ...p, invoice_prefix: "" })); }}
                className={errors["invoice_prefix"] ? "border-destructive" : ""}
              />
              {errors["invoice_prefix"] && <p className="text-xs text-destructive">{errors["invoice_prefix"]}</p>}
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
