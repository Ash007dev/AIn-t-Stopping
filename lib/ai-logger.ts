// lib/ai-logger.ts — Centralized AI traceability & logging system
// Stores all AI agent interactions for the admin dashboard

export interface AILogEntry {
  id: string;
  timestamp: string;
  agent: "intent-parser" | "cart-curator" | "modification-handler" | "vision" | "stt" | "tts";
  status: "success" | "error" | "fallback";
  latencyMs: number;
  input: string;
  output: string;
  model: string;
  tokenEstimate?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface PipelineTrace {
  id: string;
  timestamp: string;
  userIntent: string;
  mode: string;
  steps: AILogEntry[];
  totalLatencyMs: number;
  status: "success" | "partial" | "error";
  cartItemCount?: number;
  clarifyingQuestion?: string | null;
}

// In-memory store (persists for the server's lifetime)
const LOG_STORE: AILogEntry[] = [
  {
    id: "log-1", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    agent: "intent-parser", status: "success", latencyMs: 850, model: "gemini-2.5-flash", tokenEstimate: 450,
    input: "I need milk and bread", output: '{"occasion": "grocery", "mode_override": "intent"}'
  },
  {
    id: "log-2", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1000).toISOString(),
    agent: "cart-curator", status: "success", latencyMs: 2400, model: "gemini-2.5-pro", tokenEstimate: 1200,
    input: '{"occasion":"grocery"}', output: '[{"id":"1", "name":"Milk"}]'
  },
  {
    id: "log-3", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    agent: "stt", status: "success", latencyMs: 1200, model: "sarvam-saaras:v3", tokenEstimate: 0,
    input: "Audio buffer (8500 bytes)", output: "Idiyappam and kadala curry"
  },
  {
    id: "log-4", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 800).toISOString(),
    agent: "intent-parser", status: "success", latencyMs: 920, model: "gemini-2.5-flash", tokenEstimate: 480,
    input: "Idiyappam and kadala curry", output: '{"occasion": "Idiyappam and Kadala Curry", "mode_override": "cooking"}'
  },
  {
    id: "log-5", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1900).toISOString(),
    agent: "cart-curator", status: "fallback", latencyMs: 3500, model: "llama-3.3-70b-versatile", tokenEstimate: 1800,
    input: '{"occasion":"Idiyappam and Kadala Curry","mode":"cooking"}', output: '[{"id":"idiyappam-mix"}, {"id":"black-chana"}]',
    metadata: { primaryError: "Gemini 503 Service Unavailable" }
  }
];

const PIPELINE_STORE: PipelineTrace[] = [
  {
    id: "pipe-1", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userIntent: "I need milk and bread", mode: "intent", status: "success", totalLatencyMs: 3250, cartItemCount: 2,
    steps: [
      { id: "s1", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), agent: "intent-parser", status: "success", latencyMs: 850, model: "gemini-2.5-flash", input: "", output: "" },
      { id: "s2", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1000).toISOString(), agent: "cart-curator", status: "success", latencyMs: 2400, model: "gemini-2.5-pro", input: "", output: "" }
    ]
  },
  {
    id: "pipe-2", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userIntent: "Idiyappam and kadala curry", mode: "cooking", status: "partial", totalLatencyMs: 4420, cartItemCount: 5,
    steps: [
      { id: "s3", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), agent: "intent-parser", status: "success", latencyMs: 920, model: "gemini-2.5-flash", input: "", output: "" },
      { id: "s4", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000).toISOString(), agent: "cart-curator", status: "fallback", latencyMs: 3500, model: "llama-3.3-70b-versatile", input: "", output: "" }
    ]
  }
];
const MAX_LOGS = 200;
const MAX_PIPELINES = 50;

function generateId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Log a single AI agent call */
export function logAgentCall(entry: Omit<AILogEntry, "id" | "timestamp">): AILogEntry {
  const full: AILogEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  LOG_STORE.unshift(full);
  if (LOG_STORE.length > MAX_LOGS) LOG_STORE.pop();
  return full;
}

/** Start a new pipeline trace */
export function startPipelineTrace(userIntent: string, mode: string): PipelineTrace {
  const trace: PipelineTrace = {
    id: `pipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    userIntent,
    mode,
    steps: [],
    totalLatencyMs: 0,
    status: "success",
  };
  PIPELINE_STORE.unshift(trace);
  if (PIPELINE_STORE.length > MAX_PIPELINES) PIPELINE_STORE.pop();
  return trace;
}

/** Add a step to an existing pipeline trace */
export function addStepToTrace(traceId: string, entry: AILogEntry) {
  const trace = PIPELINE_STORE.find((t) => t.id === traceId);
  if (trace) {
    trace.steps.push(entry);
    trace.totalLatencyMs = trace.steps.reduce((sum, s) => sum + s.latencyMs, 0);
    if (entry.status === "error") trace.status = "error";
    else if (entry.status === "fallback" && trace.status !== "error") trace.status = "partial";
  }
}

/** Finalize a pipeline trace */
export function finalizePipelineTrace(
  traceId: string,
  opts: { cartItemCount?: number; clarifyingQuestion?: string | null; status?: PipelineTrace["status"] }
) {
  const trace = PIPELINE_STORE.find((t) => t.id === traceId);
  if (trace) {
    if (opts.cartItemCount !== undefined) trace.cartItemCount = opts.cartItemCount;
    if (opts.clarifyingQuestion !== undefined) trace.clarifyingQuestion = opts.clarifyingQuestion;
    if (opts.status) trace.status = opts.status;
  }
}

/** Get all logs */
export function getLogs(): AILogEntry[] {
  return LOG_STORE;
}

/** Get all pipeline traces */
export function getPipelineTraces(): PipelineTrace[] {
  return PIPELINE_STORE;
}

/** Get aggregated metrics */
export function getMetrics() {
  const totalRequests = PIPELINE_STORE.length;
  const successCount = PIPELINE_STORE.filter((p) => p.status === "success").length;
  const errorCount = PIPELINE_STORE.filter((p) => p.status === "error").length;
  const fallbackCount = PIPELINE_STORE.filter((p) => p.status === "partial").length;

  const avgLatency =
    totalRequests > 0
      ? Math.round(PIPELINE_STORE.reduce((sum, p) => sum + p.totalLatencyMs, 0) / totalRequests)
      : 0;

  // Agent-level breakdown
  const agentStats: Record<string, { calls: number; avgLatency: number; errors: number }> = {};
  for (const log of LOG_STORE) {
    if (!agentStats[log.agent]) {
      agentStats[log.agent] = { calls: 0, avgLatency: 0, errors: 0 };
    }
    agentStats[log.agent].calls++;
    agentStats[log.agent].avgLatency += log.latencyMs;
    if (log.status === "error") agentStats[log.agent].errors++;
  }
  for (const agent in agentStats) {
    agentStats[agent].avgLatency = Math.round(agentStats[agent].avgLatency / agentStats[agent].calls);
  }

  // Most common modes
  const modeCounts: Record<string, number> = {};
  for (const p of PIPELINE_STORE) {
    modeCounts[p.mode] = (modeCounts[p.mode] || 0) + 1;
  }

  // Model usage
  const modelCounts: Record<string, number> = {};
  for (const log of LOG_STORE) {
    modelCounts[log.model] = (modelCounts[log.model] || 0) + 1;
  }

  return {
    totalRequests,
    successCount,
    errorCount,
    fallbackCount,
    successRate: totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0,
    avgLatencyMs: avgLatency,
    agentStats,
    modeCounts,
    modelCounts,
  };
}
