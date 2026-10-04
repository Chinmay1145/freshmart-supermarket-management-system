import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  periodDays: z.number().int().min(1).max(365),
  notes: z.string().trim().max(500),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        unit: z.string().trim().max(20),
        stock: z.number().min(0).max(1_000_000),
        min_stock: z.number().min(0).max(1_000_000),
        max_stock: z.number().min(0).max(1_000_000),
        sold_last_period: z.number().min(0).max(10_000_000),
      }),
    )
    .min(1)
    .max(200),
});

export const getRestockPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { generateRestockPlan, GatewayError } = await import("./restock.server");
    try {
      return { ok: true as const, plan: await generateRestockPlan(data.items, data.periodDays, data.notes) };
    } catch (e) {
      const message = e instanceof GatewayError ? e.message : "Could not generate recommendations. Please try again.";
      console.error("restock plan failed", e);
      return { ok: false as const, error: message };
    }
  });
