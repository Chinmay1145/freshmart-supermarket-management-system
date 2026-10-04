import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export type RestockItemInput = {
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  sold_last_period: number;
};

export const recommendationSchema = z.object({
  summary: z.string(),
  recommendations: z.array(
    z.object({
      product: z.string(),
      priority: z.enum(["urgent", "high", "medium", "low"]),
      suggested_quantity: z.number(),
      days_of_stock_left: z.number().nullable(),
      reason: z.string(),
    }),
  ),
});

export type RestockResult = z.infer<typeof recommendationSchema>;

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return res;
  };
}

export async function generateRestockPlan(
  items: RestockItemInput[],
  periodDays: number,
  notes: string,
): Promise<RestockResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayError(401, "AI is not configured for this app yet.");

  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });

  const lines = items
    .map(
      (i) =>
        `- ${i.name} | unit: ${i.unit} | in stock: ${i.stock} | min: ${i.min_stock} | max: ${i.max_stock || "none"} | sold in last ${periodDays} days: ${i.sold_last_period}`,
    )
    .join("\n");

  let streamError: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    output: Output.object({ schema: recommendationSchema }),
    system:
      "You are an inventory planner for an Indian supermarket. Recommend restocking using sales velocity, minimum/maximum levels and stock on hand. " +
      "Only include products that need restocking. Sort by priority (urgent first). Suggested quantities are whole numbers that bring stock to roughly 2 weeks of demand and never above the max level when a max is given. " +
      "days_of_stock_left = stock / daily sales (null if no sales). Keep each reason under 25 words and the summary under 60 words. Return at most 30 recommendations.",
    prompt: `Sales period: last ${periodDays} days.\n${notes ? `Manager notes: ${notes}\n` : ""}Products:\n${lines}`,
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return {
      summary: output.summary,
      recommendations: output.recommendations.map((r) => ({
        ...r,
        suggested_quantity: Math.max(0, Math.round(r.suggested_quantity)),
      })),
    };
  } catch (e) {
    const err = (streamError ?? e) as { statusCode?: number; message?: string };
    if (NoObjectGeneratedError.isInstance(e) && !streamError) {
      throw new GatewayError(500, "The AI response could not be read. Please try again.");
    }
    const status = err.statusCode ?? 500;
    if (status === 429) throw new GatewayError(429, "Too many AI requests right now. Please wait a minute and try again.");
    if (status === 402) throw new GatewayError(402, "AI credits are used up. Add credits in your workspace billing settings to continue.");
    if (status === 403) throw new GatewayError(403, "AI access is blocked for this workspace. A workspace admin needs to check AI settings.");
    throw new GatewayError(status, "AI service is unavailable at the moment. Please try again later.");
  }
}
