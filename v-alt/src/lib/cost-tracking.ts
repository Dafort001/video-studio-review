import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// =============================================================================
// Kosten-Tracking — Zentrales Logging für alle API-Aufrufe
// =============================================================================

/**
 * Kostenmodelle (geschätzt) — Stand April 2026
 * Alle Werte in EUR-Cent pro Einheit.
 */
const COST_MODELS: Record<string, {
  perInputToken?: number;   // Cent pro 1K Input-Tokens
  perOutputToken?: number;  // Cent pro 1K Output-Tokens
  perImage?: number;        // Cent pro Bild (Input oder Output)
  perCall?: number;         // Cent pro Call (flat)
  perGpuSecond?: number;    // Cent pro GPU-Sekunde (Modal)
}> = {
  // Gemini Flash 2.0 — sehr günstig
  "gemini-2.0-flash": {
    perInputToken: 0.007,   // $0.075/1M = 0.007 ct/1K (EUR)
    perOutputToken: 0.028,  // $0.30/1M = 0.028 ct/1K
    perImage: 0.02,         // ~$0.0002 pro Bild
  },
  "gemini-2.0-flash-exp": {
    perInputToken: 0.007,
    perOutputToken: 0.028,
    perImage: 0.05,         // Experimental: etwas teurer wg. Image Gen
  },
  "gemini-2.5-flash-image": {
    perInputToken: 0.027,   // grob aus $0.30/1M
    perImage: 3.6,          // ca. $0.039 pro Output-Bild
  },
  "gpt-image-2": {
    perInputToken: 0.72,    // grob aus $8/1M Image-Input-Tokens
    perOutputToken: 2.7,    // grob aus $30/1M Output-Tokens
  },
  "gpt-5-mini": {
    perInputToken: 0.025,   // $0.25/1M = 0.025 ct/1K
    perOutputToken: 0.2,    // $2.00/1M = 0.20 ct/1K
  },
  "gpt-5.4-mini": {
    perInputToken: 0.075,   // $0.75/1M = 0.075 ct/1K
    perOutputToken: 0.45,   // $4.50/1M = 0.45 ct/1K
  },
  "gpt-4.1-mini": {
    perInputToken: 0.04,    // $0.40/1M = 0.04 ct/1K
    perOutputToken: 0.16,   // $1.60/1M = 0.16 ct/1K
  },

  // Modal GPU (A100/H100 Äquivalent)
  "modal-gpu": {
    perGpuSecond: 0.12,     // ~$0.001326/s ≈ 0.12 ct/s
  },
  "modal-cpu": {
    perGpuSecond: 0.003,    // CPU-only Container
  },

  // Pipeline-Stationen (Modal)
  "qwen-vl": {
    perImage: 0.8,          // ~$0.008 pro Bild (GPU-bound)
  },
  "qwen/qwen3-vl-235b-a22b-instruct": {
    perInputToken: 0.02,    // OpenRouter ca. $0.20/1M input tokens
    perOutputToken: 0.088,  // OpenRouter ca. $0.88/1M output tokens
  },
  "qwen/qwen3-vl-32b-instruct": {
    perInputToken: 0.0104,  // OpenRouter ca. $0.104/1M input tokens
    perOutputToken: 0.0416, // OpenRouter ca. $0.416/1M output tokens
  },
  "sam3": {
    perImage: 1.5,          // ~$0.015 pro Bild (GPU-heavy)
  },
  "da3": {
    perImage: 2.0,          // Lab-only DA3METRIC-LARGE tests with EXIF/Focal/Intrinsics
  },
  "room-dimensions": {
    perImage: 2.0,          // Isolated DA3METRIC-LARGE room-dimension spike, not PixImmo standard run
  },
  "processed-image-analysis": {
    perImage: 4.3,          // SAM3 + DA3 + Qwen Standardlauf
  },
  "enfuse": {
    perImage: 0.3,          // HDR Fusion
  },
  "correct": {
    perImage: 0.2,          // Lens correction
  },

  // R2 Storage
  "r2": {
    perCall: 0.0004,        // ~$0.0045/10K requests
  },
};

// =============================================================================
// Öffentliche Interfaces
// =============================================================================

export interface UsageLogInput {
  jobId?: string | null;
  imageId?: string | null;
  userId?: string | null;
  provider: string;
  model?: string | null;
  operation: string;
  inputTokens?: number;
  outputTokens?: number;
  inputImages?: number;
  outputImages?: number;
  durationMs?: number;
  status?: "success" | "error" | "partial";
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  currency?: string;
  /** Manueller Kostenwert in Cent (überschreibt Berechnung) */
  manualCostCents?: number;
}

/**
 * Loggt einen API-Aufruf und berechnet die geschätzten Kosten.
 * Feuer-und-Vergessen: Fehler werden geloggt, blockieren aber nicht.
 */
export async function logApiUsage(input: UsageLogInput): Promise<void> {
  try {
    const costCents = input.manualCostCents ?? estimateCost(input);

    await prisma.apiUsageLog.create({
      data: {
        jobId: input.jobId ?? undefined,
        imageId: input.imageId ?? undefined,
        userId: input.userId ?? undefined,
        provider: input.provider,
        model: input.model ?? undefined,
        operation: input.operation,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        inputImages: input.inputImages,
        outputImages: input.outputImages,
        durationMs: input.durationMs,
        costCents,
        costEstimated: input.manualCostCents == null,
        currency: input.currency ?? undefined,
        status: input.status ?? "success",
        errorMessage: input.errorMessage,
        metadata: input.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  } catch (err) {
    // Kosten-Logging darf NIEMALS den Hauptprozess blockieren
    console.error("[COST] Failed to log API usage:", err);
  }
}

/**
 * Wrapper: Misst Dauer eines async Calls und loggt automatisch.
 */
export async function withUsageTracking<T>(
  input: Omit<UsageLogInput, "durationMs" | "status" | "errorMessage">,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    await logApiUsage({ ...input, durationMs, status: "success" });
    return result;
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    await logApiUsage({
      ...input,
      durationMs,
      status: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err; // Fehler weiterwerfen
  }
}

// =============================================================================
// Kosten-Schätzung
// =============================================================================

function estimateCost(input: UsageLogInput): number {
  const model = input.model ?? input.provider;
  const rates = COST_MODELS[model];
  if (!rates) return 0;

  let cost = 0;

  // Token-basierte Kosten
  if (input.inputTokens && rates.perInputToken) {
    cost += (input.inputTokens / 1000) * rates.perInputToken;
  }
  if (input.outputTokens && rates.perOutputToken) {
    cost += (input.outputTokens / 1000) * rates.perOutputToken;
  }

  // Bild-basierte Kosten
  if (input.inputImages && rates.perImage) {
    cost += input.inputImages * rates.perImage;
  }
  if (input.outputImages && rates.perImage) {
    cost += input.outputImages * rates.perImage;
  }

  // GPU-Zeit-basierte Kosten (Modal)
  if (input.durationMs && rates.perGpuSecond) {
    cost += (input.durationMs / 1000) * rates.perGpuSecond;
  }

  // Flat-Rate pro Call
  if (rates.perCall) {
    cost += rates.perCall;
  }

  return cost > 0 ? Math.max(Math.round(cost), 1) : 0; // Minimum 1 ct wenn Kosten > 0
}

// =============================================================================
// Aggregation für Admin-Dashboard
// =============================================================================

export interface CostSummary {
  totalCostCents: number;
  totalCalls: number;
  byProvider: Record<string, { calls: number; costCents: number }>;
  byOperation: Record<string, { calls: number; costCents: number }>;
  byDay: { date: string; calls: number; costCents: number }[];
  topJobs: { jobId: string; calls: number; costCents: number }[];
}

export async function getCostSummary(
  from?: Date,
  to?: Date,
): Promise<CostSummary> {
  const where: Prisma.ApiUsageLogWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  // Total
  const totals = await prisma.apiUsageLog.aggregate({
    where,
    _sum: { costCents: true },
    _count: true,
  });

  // By provider
  const byProvider = await prisma.apiUsageLog.groupBy({
    by: ["provider"],
    where,
    _sum: { costCents: true },
    _count: true,
    orderBy: { _sum: { costCents: "desc" } },
  });

  // By operation
  const byOperation = await prisma.apiUsageLog.groupBy({
    by: ["operation"],
    where,
    _sum: { costCents: true },
    _count: true,
    orderBy: { _sum: { costCents: "desc" } },
  });

  // By day (last 30 days)
  const logs = await prisma.apiUsageLog.findMany({
    where,
    select: { createdAt: true, costCents: true },
    orderBy: { createdAt: "asc" },
  });

  const dayMap = new Map<string, { calls: number; costCents: number }>();
  for (const log of logs) {
    const date = log.createdAt.toISOString().split("T")[0];
    const entry = dayMap.get(date) ?? { calls: 0, costCents: 0 };
    entry.calls++;
    entry.costCents += log.costCents;
    dayMap.set(date, entry);
  }

  // Top Jobs by cost
  const topJobs = await prisma.apiUsageLog.groupBy({
    by: ["jobId"],
    where: { ...where, jobId: { not: null } },
    _sum: { costCents: true },
    _count: true,
    orderBy: { _sum: { costCents: "desc" } },
    take: 10,
  });

  return {
    totalCostCents: totals._sum.costCents ?? 0,
    totalCalls: totals._count,
    byProvider: Object.fromEntries(
      byProvider.map(p => [p.provider, { calls: p._count, costCents: p._sum.costCents ?? 0 }])
    ),
    byOperation: Object.fromEntries(
      byOperation.map(o => [o.operation, { calls: o._count, costCents: o._sum.costCents ?? 0 }])
    ),
    byDay: Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data })),
    topJobs: topJobs.map(j => ({
      jobId: j.jobId!,
      calls: j._count,
      costCents: j._sum.costCents ?? 0,
    })),
  };
}
