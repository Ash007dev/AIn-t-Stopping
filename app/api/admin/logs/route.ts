// app/api/admin/logs/route.ts - Admin API for AI logs, pipeline traces, and metrics
import { NextResponse } from "next/server";
import { getLogs, getPipelineTraces, getMetrics } from "@/lib/ai-logger";

export async function GET() {
  return NextResponse.json({
    metrics: getMetrics(),
    pipelines: getPipelineTraces(),
    logs: getLogs(),
  });
}
