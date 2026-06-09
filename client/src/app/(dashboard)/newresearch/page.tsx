"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
export default function WelcomePage() {
    const {user}=useUser()
    const nodes = [
        { id: "left", x: 380, y: 450, label: "Planner" },
        { id: "top", x: 600, y: 250, label: "Researcher" },
        { id: "right", x: 820, y: 450, label: "Aggregator" },
        { id: "bottom", x: 600, y: 650, label: "Report" },
    ];

    const edges = [
        ["left", "top"],
        ["top", "right"],
        ["right", "bottom"],
        ["bottom", "left"],
        ["left", "right"],
        ["top", "bottom"],
    ];

    const getNode = (id: string) => nodes.find((n) => n.id === id)!;

    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.10),transparent_30%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,hsl(var(--secondary)/0.08),transparent_35%)]" />

            <motion.div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
                animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.35, 0.55, 0.35],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full text-foreground/30"
                viewBox="0 0 1200 900"
                fill="none"
            >
                <defs>
                    <linearGradient id="graphGradient" x1="300" y1="180" x2="900" y2="720" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
                    </linearGradient>

                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <circle
                    cx="600"
                    cy="450"
                    r="250"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="1.5"
                    strokeDasharray="6 10"
                />

                {edges.map(([a, b], i) => {
                    const start = getNode(a);
                    const end = getNode(b);

                    return (
                        <motion.line
                            key={`${a}-${b}`}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="url(#graphGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            filter="url(#softGlow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                duration: 1.8,
                                delay: i * 0.12,
                                ease: "easeOut",
                            }}
                        />
                    );
                })}

                {nodes.map((node, i) => (
                    <g key={node.id}>
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="12"
                            fill="currentColor"
                            opacity="0.95"
                            filter="url(#softGlow)"
                            animate={{
                                scale: [1, 1.22, 1],
                                opacity: [0.65, 1, 0.65],
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.4,
                            }}
                        />
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="22"
                            fill="currentColor"
                            opacity="0.08"
                            animate={{
                                scale: [1, 1.18, 1],
                                opacity: [0.06, 0.14, 0.06],
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.4,
                            }}
                        />
                        <text
                            x={node.x}
                            y={node.y + 38}
                            textAnchor="middle"
                            fontFamily="Inter, Arial, sans-serif"
                            fontSize="16"
                            fontWeight="600"
                            fill="currentColor"
                            opacity="0.55"
                        >
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>
            <section className="relative z-10 flex max-w-5xl flex-col items-center text-center">
                <div className="mb-6 text-6xl">
                    Welcome{" "}
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                        {user?.firstName}
                    </span>
                    {' ,'}
                </div>
                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mb-6 text-xs uppercase tracking-[0.5em] text-muted-foreground/80"
                >
                    Multi-Agent Research Platform
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85 }}
                    className="text-6xl  tracking-tight md:text-8xl"
                >
                    AGENT{" "}
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                        ATLAS
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.8 }}
                    className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg"
                >
                    Turn one prompt into a structured research report.
                    Planning, parallel research, synthesis, and final markdown output
                    — all orchestrated by autonomous agents.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mt-10"
                >
                    <Link href="/research/new">
                        <Button size="lg" className="h-14 gap-2 px-8 text-base">
                            <Sparkles className="h-4 w-4" />
                            Start Research
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.8 }}
                    className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3"
                >
                    <div className="rounded-2xl border bg-background/35 p-4 backdrop-blur-md">
                        <p className="text-sm font-medium">Prompt → Plan</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Build a focused research strategy.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-background/35 p-4 backdrop-blur-md">
                        <p className="text-sm font-medium">Parallel Agents</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Run multiple researchers at once.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-background/35 p-4 backdrop-blur-md">
                        <p className="text-sm font-medium">Markdown Report</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Export a clean, cited final report.
                        </p>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}