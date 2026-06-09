"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Node {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  type: "start" | "end" | "main" | "sub" | "tool" | "error";
}

interface Edge {
  from: string;
  to: string;
  dashed?: boolean;
  kind?: "normal" | "error" | "retry" | "cyan" | "tool";
  label?: string;
  labelX?: number;
  labelY?: number;
}

// ── Layout ───────────────────────────────────────────────────────────────────
// Wider viewBox to give error path room on the left
// Subgraph sits lower so tool nodes fit inside

const NODES: Node[] = [
  // Main graph
  { id: "start",      label: "START",           x: 360, y: 36,  type: "start" },
  { id: "enhancer",   label: "prompt_enhancer", x: 360, y: 110, type: "main"  },
  { id: "planner",    label: "planner",         x: 360, y: 196, type: "main"  },
  { id: "fanout",     label: "fan_out",         x: 360, y: 286, type: "main"  },

  // Parallel researcher subgraphs (each contains researcher → web_search → worker)
  { id: "r1",         label: "researcher", sub: "#1", x: 140, y: 410, type: "sub"  },
  { id: "ws1",        label: "web_search", sub: "#1", x: 140, y: 490, type: "tool" },
  { id: "w1",         label: "worker",     sub: "#1", x: 140, y: 570, type: "sub"  },

  { id: "r2",         label: "researcher", sub: "#2", x: 360, y: 410, type: "sub"  },
  { id: "ws2",        label: "web_search", sub: "#2", x: 360, y: 490, type: "tool" },
  { id: "w2",         label: "worker",     sub: "#2", x: 360, y: 570, type: "sub"  },

  { id: "r3",         label: "researcher", sub: "#3", x: 580, y: 410, type: "sub"  },
  { id: "ws3",        label: "web_search", sub: "#3", x: 580, y: 490, type: "tool" },
  { id: "w3",         label: "worker",     sub: "#3", x: 580, y: 570, type: "sub"  },

  // Main graph continued
  { id: "aggregator", label: "aggregator",      x: 360, y: 670, type: "main"  },
  { id: "final",      label: "final_result",    x: 360, y: 756, type: "main"  },
  { id: "end",        label: "END",             x: 360, y: 840, type: "end"   },

  // Error / retry nodes — left side
  { id: "failed",     label: "plan_failed",     x: 80,  y: 380, type: "error" },
];

const EDGES: Edge[] = [
  // Happy path — main graph
  { from: "start",      to: "enhancer"                                                    },
  { from: "enhancer",   to: "planner"                                                     },
  { from: "planner",    to: "fanout"                                                      },

  // fan_out → 3 parallel researchers
  { from: "fanout",     to: "r1",    kind: "cyan",  label: "plan ok",  labelX: 220, labelY: 348 },
  { from: "fanout",     to: "r2",    kind: "cyan"                                         },
  { from: "fanout",     to: "r3",    kind: "cyan"                                         },

  // Inside each subgraph: researcher → web_search (tool) → back → worker
  { from: "r1",  to: "ws1", kind: "tool" },
  { from: "ws1", to: "r1",  kind: "tool" },   // loop back (tools_condition)
  { from: "r1",  to: "w1",  kind: "cyan" },   // __end__ branch → worker

  { from: "r2",  to: "ws2", kind: "tool" },
  { from: "ws2", to: "r2",  kind: "tool" },
  { from: "r2",  to: "w2",  kind: "cyan" },

  { from: "r3",  to: "ws3", kind: "tool" },
  { from: "ws3", to: "r3",  kind: "tool" },
  { from: "r3",  to: "w3",  kind: "cyan" },

  // workers → aggregator
  { from: "w1",  to: "aggregator", kind: "cyan" },
  { from: "w2",  to: "aggregator", kind: "cyan" },
  { from: "w3",  to: "aggregator", kind: "cyan" },

  { from: "aggregator", to: "final"                                                       },
  { from: "final",      to: "end"                                                         },

  // fan_out → retry planner (plan_error, retries < 3)
  {
    from: "fanout", to: "planner",
    kind: "retry", dashed: true,
    label: "retry (<3)",
    labelX: 390, labelY: 240,
  },

  // fan_out → plan_failed (retries ≥ 3)
  {
    from: "fanout", to: "failed",
    kind: "error", dashed: true,
    label: "≥3 fails",
    labelX: 96, labelY: 338,
  },

  // plan_failed → END
  { from: "failed", to: "end", kind: "error", dashed: true },
];

// ── Theme-aware colours ───────────────────────────────────────────────────────
function useThemeColors(resolvedTheme: string | undefined) {
  const dark = resolvedTheme !== "light";
  return {
    bg:       dark ? "transparent"  : "transparent",
    grid:     dark ? "#38bdf8"      : "#0ea5e9",
    gridOp:   dark ? 0.04           : 0.07,

    node: {
      start:  { bg: dark?"#0f172a":"#f0f9ff", border: dark?"#38bdf8":"#0284c7", text: dark?"#38bdf8":"#0369a1" },
      end:    { bg: dark?"#0f172a":"#f0f9ff", border: dark?"#38bdf8":"#0284c7", text: dark?"#38bdf8":"#0369a1" },
      main:   { bg: dark?"#0f1f35":"#eff6ff", border: dark?"#3b82f6":"#2563eb", text: dark?"#93c5fd":"#1d4ed8" },
      sub:    { bg: dark?"#0d1f2d":"#ecfeff", border: dark?"#06b6d4":"#0891b2", text: dark?"#67e8f9":"#0e7490" },
      tool:   { bg: dark?"#1a1a0d":"#fefce8", border: dark?"#eab308":"#ca8a04", text: dark?"#fde047":"#92400e" },
      error:  { bg: dark?"#1f0f0f":"#fff1f2", border: dark?"#ef4444":"#dc2626", text: dark?"#fca5a5":"#991b1b" },
    },

    edge: {
      normal: dark ? "#3b82f6" : "#2563eb",
      cyan:   dark ? "#06b6d4" : "#0891b2",
      tool:   dark ? "#eab308" : "#ca8a04",
      error:  dark ? "#ef4444" : "#dc2626",
      retry:  dark ? "#f97316" : "#ea580c",
    },

    label:    dark ? "#94a3b8"  : "#475569",
    subbox:   dark ? "#06b6d4"  : "#0891b2",
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

function edgePath(from: Node, to: Node, kind?: string): string {
  const fh = nodeHeight(from);
  const th = nodeHeight(to);
  const fx = from.x, fy = from.y + fh / 2;
  const tx = to.x,   ty = to.y - th / 2;

  // tool loop-back edges: curve to the right of the node
  if (kind === "tool" && from.id.startsWith("ws") && to.id.startsWith("r")) {
    const mx = from.x + 56;
    return `M ${fx + 60} ${fy - 10} C ${mx + 40} ${fy - 10}, ${mx + 40} ${ty + 10}, ${tx + 60} ${ty + 10}`;
  }
  // tool forward edges: straight
  if (kind === "tool") {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }
  // retry loop: curve to the right
  if (kind === "retry") {
    return `M ${fx + 80} ${fy - 8} C ${fx + 140} ${fy - 8}, ${tx + 140} ${ty + 8}, ${tx + 80} ${ty + 8}`;
  }
  // straight vertical
  if (Math.abs(fx - tx) < 8) {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }
  // bezier curve for fan-out / fan-in
  const cy = (fy + ty) / 2;
  return `M ${fx} ${fy} C ${fx} ${cy}, ${tx} ${cy}, ${tx} ${ty}`;
}

function nodeHeight(n: Node) {
  return n.type === "start" || n.type === "end" ? 36 : 44;
}

function nodeWidth(n: Node) {
  if (n.type === "start" || n.type === "end") return 104;
  if (n.type === "tool") return 140;
  return 152;
}

// ── Animated pulse dot ────────────────────────────────────────────────────────
function PulseDot({ path, delay, color, dur = "2.2s" }: { path: string; delay: number; color: string; dur?: string }) {
  return (
    <circle r={3.5} fill={color} opacity={0}>
      <animateMotion dur={dur} begin={`${delay}s`} repeatCount="indefinite" path={path} rotate="auto" />
      <animate attributeName="opacity" values="0;0.95;0.95;0" dur={dur} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

// ── Single node ───────────────────────────────────────────────────────────────
function GraphNode({
  node, index, active, colors,
}: {
  node: Node; index: number; active: boolean; colors: ReturnType<typeof useThemeColors>;
}) {
  const s = colors.node[node.type];
  const w = nodeWidth(node);
  const h = nodeHeight(node);
  const isRound = node.type === "start" || node.type === "end";
  const rx = isRound ? h / 2 : 8;

  return (
    <motion.g
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
    >
      {/* glow */}
      <motion.rect
        x={node.x - w / 2 - 5} y={node.y - h / 2 - 5}
        width={w + 10} height={h + 10} rx={rx + 4}
        fill={s.border}
        animate={{ opacity: active ? [0.08, 0.2, 0.08] : 0.04 }}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      />
      {/* box */}
      <motion.rect
        x={node.x - w / 2} y={node.y - h / 2}
        width={w} height={h} rx={rx}
        fill={s.bg}
        stroke={s.border}
        strokeWidth={active ? 1.8 : 1}
        animate={{ strokeOpacity: active ? [0.6, 1, 0.6] : 0.55 }}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
      />
      {/* primary label */}
      <text
        x={node.x}
        y={node.sub ? node.y - 6 : node.y + 1}
        textAnchor="middle" dominantBaseline="central"
        fill={s.text}
        fontSize={isRound ? 11 : node.type === "tool" ? 10 : 10.5}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={600}
        letterSpacing={isRound ? 2 : 0.3}
      >
        {node.label}
      </text>
      {/* sub badge */}
      {node.sub && (
        <text
          x={node.x} y={node.y + 9}
          textAnchor="middle" dominantBaseline="central"
          fill={s.border} fontSize={11}
          fontFamily="'JetBrains Mono', monospace" fontWeight={700}
        >
          {node.sub}
        </text>
      )}
    </motion.g>
  );
}

// ── Theme toggle button ───────────────────────────────────────────────────────
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all
        dark:bg-[#0f172a] dark:border-[#38bdf8] dark:text-[#38bdf8] dark:hover:bg-[#1e3a5f]
        bg-white border-sky-400 text-sky-700 hover:bg-sky-50"
    >
      {dark ? "☀ light" : "◑ dark"}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ResearchGraph() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => setMounted(true), []);

  const ORDER = [
    "start","enhancer","planner","fanout",
    "r1","ws1","w1",
    "r2","ws2","w2",
    "r3","ws3","w3",
    "aggregator","final","end",
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((p) => (p + 1) % ORDER.length), 800);
    return () => clearInterval(t);
  }, []);

  const colors = useThemeColors(mounted ? resolvedTheme : "dark");
  const activeNodeId = ORDER[activeIdx];

  // Subgraph bounding boxes — one per parallel instance
  const SUBGRAPHS = [
    { x: 68,  y: 386, w: 144, label: "subgraph #1" },
    { x: 288, y: 386, w: 144, label: "subgraph #2" },
    { x: 508, y: 386, w: 144, label: "subgraph #3" },
  ];

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: colors.gridOp,
        }}
      />

      <motion.svg
        viewBox="0 0 720 890"
        className="w-full max-w-[540px] relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          {(["blue","cyan","yellow","red","orange"] as const).map((c) => {
            const stroke = { blue:"#3b82f6", cyan:"#06b6d4", yellow:"#eab308", red:"#ef4444", orange:"#f97316" }[c];
            return (
              <marker key={c} id={`arr-${c}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 2L8 5L2 8" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
              </marker>
            );
          })}
        </defs>

        {/* ── Subgraph bounding boxes ── */}
        {SUBGRAPHS.map((sg, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <rect
              x={sg.x} y={sg.y} width={sg.w} height={210}
              rx={10} fill="none"
              stroke={colors.subbox} strokeWidth={0.8}
              strokeDasharray="6 4" strokeOpacity={0.22}
            />
            <text x={sg.x + 8} y={sg.y - 6}
              fill={colors.subbox} fontSize={8}
              fontFamily="'JetBrains Mono', monospace" opacity={0.45}
            >
              {sg.label}
            </text>
          </motion.g>
        ))}

        {/* ── Edges ── */}
        {EDGES.map((edge, i) => {
          const f = getNode(edge.from);
          const t = getNode(edge.to);
          const p = edgePath(f, t, edge.kind);

          const kindColor: Record<string, string> = {
            normal: colors.edge.normal,
            cyan:   colors.edge.cyan,
            tool:   colors.edge.tool,
            error:  colors.edge.error,
            retry:  colors.edge.retry,
          };
          const kindMarker: Record<string, string> = {
            normal: "arr-blue",
            cyan:   "arr-cyan",
            tool:   "arr-yellow",
            error:  "arr-red",
            retry:  "arr-orange",
          };
          const k = edge.kind ?? "normal";
          const strokeColor = kindColor[k];
          const markerId    = kindMarker[k];

          // don't animate tool loop-back or error dashed edges
          const shouldPulse = !edge.dashed && k !== "tool";

          return (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.04 }}>
              <path
                d={p} fill="none"
                stroke={strokeColor} strokeWidth={1.2}
                strokeOpacity={0.38}
                strokeDasharray={edge.dashed ? "5 4" : undefined}
                markerEnd={`url(#${markerId})`}
              />
              {/* condition label */}
              {edge.label && (
                <text
                  x={edge.labelX ?? (f.x + t.x) / 2 + 4}
                  y={edge.labelY ?? (f.y + t.y) / 2}
                  fill={strokeColor} fontSize={8.5}
                  fontFamily="'JetBrains Mono', monospace" opacity={0.8}
                >
                  {edge.label}
                </text>
              )}
              {shouldPulse && (
                <PulseDot path={p} delay={i * 0.28} color={strokeColor} />
              )}
            </motion.g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => (
          <GraphNode
            key={node.id}
            node={node}
            index={i}
            active={activeNodeId === node.id}
            colors={colors}
          />
        ))}

        {/* ── Legend ── */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          {[
            { color: colors.edge.normal, label: "main flow"     },
            { color: colors.edge.cyan,   label: "subgraph flow" },
            { color: colors.edge.tool,   label: "tool call"     },
            { color: colors.edge.retry,  label: "retry"         },
            { color: colors.edge.error,  label: "error path"    },
          ].map((item, i) => (
            <g key={i} transform={`translate(12, ${810 + i * 14})`}>
              <line x1={0} y1={4} x2={16} y2={4} stroke={item.color} strokeWidth={1.5} strokeOpacity={0.8}/>
              <text x={22} y={8} fill={colors.label} fontSize={8.5} fontFamily="'JetBrains Mono', monospace">
                {item.label}
              </text>
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
}