"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type NodeStatus = "pending" | "running" | "completed" | "error";

interface NodeData {
  id: string;
  name: string;
  status: NodeStatus;
  timestamp: string;
}

interface GraphComponentProps {
  nodes: NodeData[];
}

// ── Static config (never recalculated) ──────────────────────────────
const STATUS_STYLES: Record<
  NodeStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  pending: {
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  running: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  completed: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-500",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const STATUS_LABELS: Record<NodeStatus, string> = {
  pending: "Queued",
  running: "Executing...",
  completed: "Finished",
  error: "Failed",
};

// ── Memoized SVG icons (rendered once) ──────────────────────────────
const Icons = {
  Check: memo(() => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )),
  Spinner: memo(() => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )),
  Cross: memo(() => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )),
};

// ── Memoized individual node (prevents parent re-render cascade) ───
const PipelineNode = memo(function PipelineNode({
  node,
  index,
  isLast,
  nextStatus,
}: {
  node: NodeData;
  index: number;
  isLast: boolean;
  nextStatus?: NodeStatus;
}) {
  const style = STATUS_STYLES[node.status];
  const label = STATUS_LABELS[node.status];

  const statusIcon = useMemo(() => {
    switch (node.status) {
      case "completed": return <Icons.Check />;
      case "running": return <Icons.Spinner />;
      case "error": return <Icons.Cross />;
      default: return <span className="text-sm font-medium">{index + 1}</span>;
    }
  }, [node.status, index]);

  const isRunning = node.status === "running";
  const isCompleted = node.status === "completed";
  const showFlow = isCompleted && nextStatus === "running";

  return (
    <div className="relative rounded-none">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-0.5 h-10">
          <div
            className={`w-full h-full rounded-full transition-colors duration-500 ${
              isCompleted ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
          {showFlow && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-400/60 to-transparent animate-flow" />
            </div>
          )}
        </div>
      )}

      {/* Node row */}
      <div className="flex items-center gap-3 py-1.5">
        {/* Status badge */}
        <div className="relative shrink-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isRunning
                ? "bg-blue-500 text-white shadow-md"
                : isCompleted
                ? "bg-emerald-500 text-white"
                : node.status === "error"
                ? "bg-red-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            {statusIcon}
          </div>
          {isRunning && (
            <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-ping" />
          )}
        </div>

        {/* Info card */}
        <div
          className={`flex-1 p-4 rounded-lg border transition-all duration-300 ${style.bg} ${style.border} ${
            isRunning ? "shadow-sm scale-[1.01]" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${style.text}`}>
              {node.name}
            </span>
            {isRunning && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 whitespace-nowrap">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs text-muted-foreground/50 font-mono">
              {node.timestamp}
            </span>
          </div>
          {isRunning && (
            <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full w-2/3 bg-blue-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Memoized header dots ──────────────────────────────────────────────
const HeaderDots = memo(function HeaderDots({ nodes }: { nodes: NodeData[] }) {
  return (
    <div className="flex gap-1">
      {nodes.map((n, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            n.status === "completed"
              ? "bg-emerald-500"
              : n.status === "running"
              ? "bg-blue-500"
              : "bg-slate-300 dark:bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
});

// ── Main component ──────────────────────────────────────────────────
export function NodeStream({ nodes }: GraphComponentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  // Derive state without causing re-renders
  const isRunning = useMemo(() => nodes.some((n) => n.status === "running"), [nodes]);
  const isComplete = useMemo(
    () => nodes.length > 0 && nodes.every((n) => n.status === "completed"),
    [nodes]
  );

  // Auto-scroll — only when new nodes are added, not on every status update
  const scrollToBottom = useCallback(() => {
    const viewport = scrollRef.current?.closest(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (nodes.length > prevLenRef.current) {
      prevLenRef.current = nodes.length;
      const raf = requestAnimationFrame(scrollToBottom);
      return () => cancelAnimationFrame(raf);
    }
  }, [nodes.length, scrollToBottom]);

  // Memoize header status text
  const statusText = useMemo(() => {
    if (isRunning) return { text: "Processing", color: "text-blue-600", dot: "bg-blue-500 animate-pulse" };
    if (isComplete) return { text: "Complete", color: "text-emerald-600", dot: "bg-emerald-500" };
    return { text: "Waiting to start", color: "text-muted-foreground", dot: "" };
  }, [isRunning, isComplete]);

  return (
    <Card className="rounded-none overflow-hidden lg:col-span-2 border">
      <CardHeader className="pb-3 bg-muted/40">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Execution Pipeline
            </CardTitle>
            <p className="text-xs mt-0.5 flex items-center gap-1.5">
              {statusText.dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${statusText.dot}`} />
              )}
              <span className={statusText.color}>{statusText.text}</span>
              <span className="opacity-50">Usually takes 2-4 minutes</span>
            </p>
          </div>
          <HeaderDots nodes={nodes} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <div ref={scrollRef} className="p-5">
            {nodes.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/25 animate-spin-slow" />
                <span className="text-sm">Nodes will appear here</span>
              </div>
            ) : (
              <div className="relative max-w-lg mx-auto space-y-0">
                {nodes.map((node, index) => (
                  <PipelineNode
                    key={node.id}
                    node={node}
                    index={index}
                    isLast={index === nodes.length - 1}
                    nextStatus={nodes[index + 1]?.status}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Single global keyframe — no per-render style injection */}
      <style jsx global>{`
        @keyframes flow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-flow {
          animation: flow 1.5s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </Card>
  );
}