import { useRows } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["store_settings"]["Row"];

/**
 * Shared branding for exported PDFs: store name plus the address / contact
 * lines printed under it in the document header.
 */
export function useStorePdf() {
  const { data } = useRows<Settings>("store_settings", { limit: 1 });
  const s = data?.[0];
  const storeName = s?.store_name?.trim() || "FreshMart ERP";
  const storeMeta = [
    s?.address,
    [s?.phone, s?.email].filter(Boolean).join("  ·  ") || null,
    s?.gst_number ? `GSTIN ${s.gst_number}` : null,
  ].filter((l): l is string => !!l && !!l.trim());

  return { settings: s ?? null, storeName, storeMeta };
}
