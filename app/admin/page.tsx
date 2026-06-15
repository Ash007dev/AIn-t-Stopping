// app/admin/page.tsx - Admin Dashboard for AI Traceability, Logging & Metrics
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AgentStat {
  calls: number;
  avgLatency: number;
  errors: number;
}

interface Metrics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  fallbackCount: number;
  successRate: number;
  avgLatencyMs: number;
  agentStats: Record<string, AgentStat>;
  modeCounts: Record<string, number>;
  modelCounts: Record<string, number>;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  status: "success" | "error" | "fallback";
  latencyMs: number;
  input: string;
  output: string;
  model: string;
  tokenEstimate?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

interface PipelineStep {
  id: string;
  agent: string;
  status: string;
  latencyMs: number;
  model: string;
  input: string;
  output: string;
}

interface Pipeline {
  id: string;
  timestamp: string;
  userIntent: string;
  mode: string;
  steps: PipelineStep[];
  totalLatencyMs: number;
  status: "success" | "partial" | "error";
  cartItemCount?: number;
  clarifyingQuestion?: string | null;
}

interface AdminData {
  metrics: Metrics;
  pipelines: Pipeline[];
  logs: LogEntry[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  success: { bg: "bg-amazon-success-light/10 dark:bg-amazon-success-dark/10", text: "text-amazon-success-light dark:text-amazon-success-dark", border: "border-amazon-success-light/20 dark:border-amazon-success-dark/20", dot: "bg-amazon-success-light dark:bg-amazon-success-dark" },
  error: { bg: "bg-amazon-error-light/10 dark:bg-amazon-error-dark/10", text: "text-amazon-error-light dark:text-amazon-error-dark", border: "border-amazon-error-light/20 dark:border-amazon-error-dark/20", dot: "bg-amazon-error-light dark:bg-amazon-error-dark" },
  fallback: { bg: "bg-amazon-warning-light/10 dark:bg-amazon-warning-dark/10", text: "text-amazon-warning-light dark:text-amazon-warning-dark", border: "border-amazon-warning-light/20 dark:border-amazon-warning-dark/20", dot: "bg-amazon-warning-light dark:bg-amazon-warning-dark" },
  partial: { bg: "bg-amazon-warning-light/10 dark:bg-amazon-warning-dark/10", text: "text-amazon-warning-light dark:text-amazon-warning-dark", border: "border-amazon-warning-light/20 dark:border-amazon-warning-dark/20", dot: "bg-amazon-warning-light dark:bg-amazon-warning-dark" },
};

function AgentIcon({ agent }: { agent: string }) {
  const cls = "w-5 h-5";
  switch (agent) {
    case "intent-parser":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M10 21v1h4v-1"/></svg>;
    case "cart-curator":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    case "modification-handler":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "vision":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    case "stt":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
    case "tts":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "pipelines" | "logs">("overview");
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return (
      <main className="min-h-screen bg-amazon-background-light dark:bg-amazon-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-amazon-text-muted-light dark:text-amazon-text-muted-dark">
          <svg className="animate-spin w-8 h-8 text-amazon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          <span className="font-medium text-sm">Loading admin dashboard...</span>
        </div>
      </main>
    );
  }

  const metrics = data?.metrics;
  const pipelines = data?.pipelines || [];
  const logs = data?.logs || [];

  return (
    <main className="min-h-screen bg-amazon-secondaryBg-light dark:bg-amazon-secondaryBg-dark text-amazon-text-primary-light dark:text-amazon-text-primary-dark pb-12">
      {/* Header */}
      <div className="bg-amazon-background-light dark:bg-amazon-background-dark border-b border-amazon-border-light dark:border-amazon-border-dark shadow-subtle relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Back to storefront" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-amazon-secondaryBg-light dark:hover:bg-amazon-surface-dark transition-colors text-amazon-text-muted-light dark:text-amazon-text-muted-dark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-amazon-text-muted-light dark:text-amazon-text-muted-dark font-medium">AI Traceability & Metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-button text-sm font-bold transition-all border ${
                autoRefresh
                  ? "bg-amazon-success-light/10 dark:bg-amazon-success-dark/10 text-amazon-success-light dark:text-amazon-success-dark border-amazon-success-light/20 dark:border-amazon-success-dark/20"
                  : "bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark text-amazon-text-muted-light dark:text-amazon-text-muted-dark border-amazon-border-light dark:border-amazon-border-dark"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? "bg-amazon-success-light dark:bg-amazon-success-dark animate-pulse" : "bg-gray-400"}`} />
              {autoRefresh ? "Live" : "Paused"}
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-button text-sm font-bold bg-white dark:bg-amazon-surface-dark text-amazon-text-primary-light dark:text-amazon-text-primary-dark border border-amazon-border-light dark:border-amazon-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Metric cards */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard label="Total Requests" value={metrics?.totalRequests || 0} />
          <MetricCard label="Success Rate" value={`${metrics?.successRate || 0}%`} color="success" />
          <MetricCard label="Avg Latency" value={`${((metrics?.avgLatencyMs || 0) / 1000).toFixed(1)}s`} color="blue" />
          <MetricCard label="Fallbacks" value={metrics?.fallbackCount || 0} color="warning" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-amazon-border-light dark:border-amazon-border-dark">
          {(["overview", "pipelines", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? "border-amazon text-amazon"
                  : "border-transparent text-amazon-text-muted-light dark:text-amazon-text-muted-dark hover:text-amazon-text-primary-light dark:hover:text-amazon-text-primary-dark"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "pipelines" ? `Pipelines (${pipelines.length})` : `Logs (${logs.length})`}
            </button>
          ))}
        </div>

        {/* Agent breakdown cards */}
        {(activeTab === "overview") && metrics?.agentStats && Object.keys(metrics.agentStats).length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4">AGENT PERFORMANCE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.agentStats).map(([agent, stat]) => (
                <div key={agent} className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark flex items-center justify-center text-amazon-blue dark:text-amazon-blueDark">
                      <AgentIcon agent={agent} />
                    </div>
                    <span className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{agent}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark rounded-lg p-2 text-center">
                      <p className="text-xl font-bold">{stat.calls}</p>
                      <p className="text-[10px] font-bold text-amazon-text-muted-light dark:text-amazon-text-muted-dark uppercase mt-1">Calls</p>
                    </div>
                    <div className="bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-amazon-blue dark:text-amazon-blueDark">{(stat.avgLatency / 1000).toFixed(1)}s</p>
                      <p className="text-[10px] font-bold text-amazon-text-muted-light dark:text-amazon-text-muted-dark uppercase mt-1">Avg Latency</p>
                    </div>
                    <div className="bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-amazon-error-light dark:text-amazon-error-dark">{stat.errors}</p>
                      <p className="text-[10px] font-bold text-amazon-text-muted-light dark:text-amazon-text-muted-dark uppercase mt-1">Errors</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model & Mode usage */}
        {(activeTab === "overview") && (metrics?.modelCounts || metrics?.modeCounts) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics?.modelCounts && Object.keys(metrics.modelCounts).length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4">MODEL USAGE</h2>
                <div className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark p-5 space-y-3">
                  {Object.entries(metrics.modelCounts).map(([model, count]) => (
                    <div key={model} className="flex items-center justify-between pb-3 border-b border-amazon-border-light dark:border-amazon-border-dark last:border-0 last:pb-0">
                      <span className="font-mono text-sm font-medium text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">{model}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {metrics?.modeCounts && Object.keys(metrics.modeCounts).length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4">SHOPPING MODES</h2>
                <div className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark p-5 space-y-3">
                  {Object.entries(metrics.modeCounts).map(([mode, count]) => (
                    <div key={mode} className="flex items-center justify-between pb-3 border-b border-amazon-border-light dark:border-amazon-border-dark last:border-0 last:pb-0">
                      <span className="capitalize text-sm font-medium text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">{mode}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pipeline traces */}
        {(activeTab === "pipelines") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">PIPELINE TRACES</h2>
              <span className="text-sm text-amazon-text-muted-light dark:text-amazon-text-muted-dark font-medium">{pipelines.length} requests traced</span>
            </div>
            
            {pipelines.length === 0 ? (
              <div className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark p-12 text-center text-amazon-text-muted-light dark:text-amazon-text-muted-dark font-medium">
                No pipeline traces yet. Make a cart request to see traces here.
              </div>
            ) : (
              <div className="space-y-3">
                {pipelines.map((pipe) => {
                  const sc = STATUS_COLORS[pipe.status] || STATUS_COLORS.success;
                  const isExpanded = expandedPipeline === pipe.id;
                  return (
                    <div key={pipe.id} className={`bg-amazon-card-light dark:bg-amazon-card-dark rounded-card border transition-all ${isExpanded ? 'border-amazon shadow-medium' : 'border-amazon-border-light dark:border-amazon-border-dark shadow-subtle hover:border-amazon/50'}`}>
                      <button
                        onClick={() => setExpandedPipeline(isExpanded ? null : pipe.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 text-left"
                      >
                        <div className={`w-3 h-3 rounded-full ${sc.dot} flex-shrink-0 shadow-sm`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark truncate">
                            &quot;{pipe.userIntent}&quot;
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-amazon-text-muted-light dark:text-amazon-text-muted-dark">
                            <span>{new Date(pipe.timestamp).toLocaleTimeString()}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="capitalize text-amazon-blue dark:text-amazon-blueDark">{pipe.mode} Mode</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span>{(pipe.totalLatencyMs / 1000).toFixed(1)}s</span>
                            {pipe.cartItemCount !== undefined && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span>{pipe.cartItemCount} items</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}>
                          {pipe.status}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark flex items-center justify-center text-amazon-text-muted-light dark:text-amazon-text-muted-dark">
                          <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-amazon-border-light dark:border-amazon-border-dark pt-4 bg-amazon-secondaryBg-light/30 dark:bg-amazon-surface-dark/30 rounded-b-card">
                          {pipe.clarifyingQuestion && (
                            <div className="mb-4 px-4 py-3 bg-amazon-warning-light/10 dark:bg-amazon-warning-dark/10 border border-amazon-warning-light/20 dark:border-amazon-warning-dark/20 rounded-lg text-sm text-amazon-warning-light dark:text-amazon-warning-dark font-medium flex items-start gap-2">
                              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                              <span><strong className="font-bold">AI asked:</strong> {pipe.clarifyingQuestion}</span>
                            </div>
                          )}
                          
                          <h3 className="text-xs font-bold text-amazon-text-muted-light dark:text-amazon-text-muted-dark uppercase tracking-wider mb-3">Agent Execution Flow</h3>
                          <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
                            {pipe.steps.map((step, i) => {
                              const stepColor = STATUS_COLORS[step.status] || STATUS_COLORS.success;
                              return (
                                <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                                  <div className={`p-3 rounded-lg border bg-white dark:bg-[#1A2332] ${stepColor.border} min-w-[160px] shadow-sm relative overflow-hidden`}>
                                    <div className={`absolute top-0 left-0 w-1 h-full ${stepColor.dot}`} />
                                    <div className="flex items-center gap-2 mb-2 pl-1">
                                      <div className={`text-gray-500 dark:text-gray-400`}>
                                        <AgentIcon agent={step.agent} />
                                      </div>
                                      <span className={`text-xs font-bold ${stepColor.text}`}>{step.agent}</span>
                                    </div>
                                    <div className="pl-1 space-y-1">
                                      <p className="text-[10px] font-mono text-amazon-text-muted-light dark:text-amazon-text-muted-dark bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark px-1.5 py-0.5 rounded inline-block">
                                        {step.model}
                                      </p>
                                      <p className="text-[11px] font-bold text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">
                                        {(step.latencyMs / 1000).toFixed(1)}s
                                      </p>
                                    </div>
                                  </div>
                                  {i < pipe.steps.length - 1 && (
                                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {pipe.steps.length === 0 && (
                            <p className="text-sm text-amazon-text-muted-light dark:text-amazon-text-muted-dark italic py-2">No agent steps recorded for this pipeline.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Individual logs */}
        {(activeTab === "logs") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">RAW AGENT LOGS</h2>
              <span className="text-sm text-amazon-text-muted-light dark:text-amazon-text-muted-dark font-medium">{logs.length} logs recorded</span>
            </div>
            
            {logs.length === 0 ? (
              <div className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark p-12 text-center text-amazon-text-muted-light dark:text-amazon-text-muted-dark font-medium">
                No agent logs yet. Make a request to see individual AI call logs here.
              </div>
            ) : (
              <div className="bg-amazon-card-light dark:bg-amazon-card-dark rounded-card shadow-subtle border border-amazon-border-light dark:border-amazon-border-dark overflow-hidden">
                <div className="divide-y divide-amazon-border-light dark:divide-amazon-border-dark">
                  {logs.slice(0, 100).map((log) => {
                    const sc = STATUS_COLORS[log.status] || STATUS_COLORS.success;
                    const isExpanded = expandedLog === log.id;
                    return (
                      <div key={log.id} className="transition-colors hover:bg-amazon-secondaryBg-light/50 dark:hover:bg-amazon-surface-dark/50">
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className="w-full px-5 py-3 flex items-center gap-4 text-left"
                        >
                          <div className={`p-1.5 rounded-lg ${sc.bg} ${sc.text} ${sc.border} border`}>
                            <AgentIcon agent={log.agent} />
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <span className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark truncate block">{log.agent}</span>
                            <span className="text-[10px] text-amazon-text-muted-light dark:text-amazon-text-muted-dark">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}>
                                {log.status}
                              </span>
                              <span className="text-[11px] font-mono text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark px-1.5 py-0.5 bg-amazon-secondaryBg-light dark:bg-amazon-surface-dark rounded border border-amazon-border-light dark:border-amazon-border-dark hidden sm:inline-block">
                                {log.model}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden md:block">
                              <p className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{(log.latencyMs / 1000).toFixed(1)}s</p>
                              {log.tokenEstimate && <p className="text-[10px] text-amazon-text-muted-light dark:text-amazon-text-muted-dark">~{log.tokenEstimate} tkns</p>}
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 space-y-4 bg-amazon-secondaryBg-light/30 dark:bg-[#1A2332]">
                            {log.errorMessage && (
                              <div className="px-4 py-3 bg-amazon-error-light/10 dark:bg-amazon-error-dark/10 border border-amazon-error-light/20 dark:border-amazon-error-dark/20 rounded-lg text-xs text-amazon-error-light dark:text-amazon-error-dark font-mono break-all font-medium">
                                {log.errorMessage}
                              </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-amazon-blue dark:text-amazon-blueDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                  <p className="text-[11px] font-bold text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark uppercase tracking-wider">Input Prompt Payload</p>
                                </div>
                                <div className="bg-white dark:bg-[#0F1111] border border-amazon-border-light dark:border-amazon-border-dark rounded-lg p-3 overflow-x-auto max-h-60 custom-scrollbar">
                                  <pre className="text-[11px] text-amazon-text-primary-light dark:text-amazon-text-primary-dark font-mono whitespace-pre-wrap break-all">
                                    {log.input || "(empty)"}
                                  </pre>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-amazon-success-light dark:text-amazon-success-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                  <p className="text-[11px] font-bold text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark uppercase tracking-wider">AI Output JSON</p>
                                </div>
                                <div className="bg-white dark:bg-[#0F1111] border border-amazon-border-light dark:border-amazon-border-dark rounded-lg p-3 overflow-x-auto max-h-60 custom-scrollbar">
                                  <pre className="text-[11px] text-amazon-text-primary-light dark:text-amazon-text-primary-dark font-mono whitespace-pre-wrap break-all">
                                    {log.output || "(empty)"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, color = "default" }: { label: string; value: string | number; color?: "default" | "success" | "blue" | "warning" }) {
  const styles = {
    default: "bg-white dark:bg-amazon-card-dark text-amazon-text-primary-light dark:text-white border-amazon-border-light dark:border-amazon-border-dark",
    success: "bg-amazon-success-light/5 dark:bg-amazon-success-dark/10 text-amazon-success-light dark:text-amazon-success-dark border-amazon-success-light/20 dark:border-amazon-success-dark/20",
    blue: "bg-amazon-blue/5 dark:bg-amazon-blueDark/10 text-amazon-blue dark:text-amazon-blueDark border-amazon-blue/20 dark:border-amazon-blueDark/20",
    warning: "bg-amazon-warning-light/5 dark:bg-amazon-warning-dark/10 text-amazon-warning-light dark:text-amazon-warning-dark border-amazon-warning-light/20 dark:border-amazon-warning-dark/20",
  };
  
  return (
    <div className={`rounded-card border p-5 shadow-subtle ${styles[color]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}
