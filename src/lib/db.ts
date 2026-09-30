import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown>;

export type TableName =
  | "products"
  | "categories"
  | "suppliers"
  | "customers"
  | "employees"
  | "sales"
  | "sale_items"
  | "purchases"
  | "purchase_items"
  | "inventory_movements"
  | "expenses"
  | "discounts"
  | "returns"
  | "return_items"
  | "notifications"
  | "audit_logs"
  | "store_settings"
  | "profiles";

export function useRows<T = Row>(
  table: TableName,
  options: { select?: string; orderBy?: string; ascending?: boolean; limit?: number } = {},
) {
  const { select = "*", orderBy = "created_at", ascending = false, limit } = options;
  return useQuery({
    queryKey: [table, select, orderBy, ascending, limit],
    queryFn: async () => {
      let q = supabase.from(table).select(select).order(orderBy, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw new Error(friendly(error.message));
      return (data ?? []) as T[];
    },
  });
}

export function useSaveRow(table: TableName, label = "Record") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row & { id?: string | undefined }) => {
      const { id, ...raw } = values;
      // Empty selects/dates can't be stored as "" in id/date columns — send null instead.
      const rest: Row = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === undefined) continue;
        if (typeof v === "string") {
          const t = v.trim();
          rest[k] = t === "" && (k.endsWith("_id") || k.includes("date") || k === "code" || k === "barcode" || k === "email") ? null : t;
        } else rest[k] = v;
      }
      const query = id
        ? supabase.from(table).update(rest as never).eq("id", id)
        : supabase.from(table).insert(rest as never);
      const { error } = await query;
      if (error) throw new Error(friendly(error.message));
      return { created: !id };
    },
    onSuccess: (r) => {
      qc.invalidateQueries();
      toast.success(`${label} ${r.created ? "added" : "updated"} successfully.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRow(table: TableName, label = "Record") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(friendly(error.message));
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(`${label} deleted.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function logAudit(action: string, module: string, entity?: string, details?: string) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_email: data.user?.email ?? "system",
    action,
    module,
    entity: entity ?? null,
    details: details ?? null,
  });
}

export function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("duplicate key") && m.includes("barcode")) return "That barcode is already used by another product.";
  if (m.includes("duplicate key") && m.includes("sku")) return "That SKU already exists.";
  if (m.includes("duplicate key")) return "A record with these details already exists.";
  if (m.includes("violates foreign key")) return "This record is linked to other data and can't be changed.";
  if (m.includes("permission") || m.includes("row-level security"))
    return "You don't have permission to perform this action.";
  if (m.includes("network") || m.includes("fetch")) return "Connection problem. Please try again.";
  if (m.includes("invalid input syntax") || m.includes("invalid input value")) return "One of the fields has an invalid value. Please check the form.";
  if (m.includes("null value") && m.includes("violates not-null")) return "Please fill in all required fields.";
  if (m.includes("check constraint")) return "One of the values is outside the allowed range.";
  return "Something went wrong. Please try again.";
}
