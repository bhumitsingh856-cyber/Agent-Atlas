"use client"
import Logo from "@/components/Logo";
import LogoMark from "@/components/LogoMark";
import { ThemeToggle } from "@/components/Theme-toggle";
import { SunRay } from "@/components/SunRay";
import ResearchGraph from "@/components/AgentFlow";
import { ArrowRight, Sparkles, Wand2, ListTree, Split, Wrench, Layers, AlertTriangle } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
export default function Landing() {
  return (
    <div style={{ fontFamily: "math" }} className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SunRay />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between   py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#cta" className="hover:text-foreground transition-colors">Git-Hub</a>
          <ThemeToggle />
        </nav>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-12 md:grid-cols-2 md:pt-20">
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-foreground/5 blur-3xl" />
            <LogoMark />
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3" /> Deep Research, on autopilot
          </span>
          <Logo />
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Research that thinks,
            <br />
            plans, and writes.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Agent Atlas decomposes any topic, dispatches parallel researchers across the web,
            and returns a structured, cited report — without the babysitting.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <SignUpButton forceRedirectUrl={"/newresearch"} >
              <Link
                href="/newresearch"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                Start a research run
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </SignUpButton>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              See the architecture
            </a>
          </div>
        </div>
      </section >

      {/* Architecture / Graph */}
      < section id="architecture" className="relative z-10 mx-auto max-w-7xl px-6 pb-24" >
        <div className="mb-8 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">The Graph</span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            A multi-agent workflow, end to end.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            From prompt enhancement to a fully cited report — every step is orchestrated,
            retried, and parallelized for you.
          </p>
        </div>
        <ResearchGraph />
      </section >


      {/* Features */}
      < section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24" >
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Capabilities</span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built for serious research.</h2>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {[
            { icon: Wand2, title: "prompt_enhancer", body: "Rewrites your raw query into a precise, well-scoped research brief before any planning starts." },
            { icon: ListTree, title: "planner", body: "Generates a structured plan of sub-tasks. If the plan is unusable, it loops back and replans." },
            { icon: Split, title: "fan_out", body: "A conditional edge dispatches each sub-task in parallel as its own researcher invocation via Send." },
            { icon: Wrench, title: "researcher subgraph", body: "Each researcher runs a tools ↔ worker loop — calling tools, reading results, and iterating until done." },
            { icon: Layers, title: "aggregator", body: "Merges every parallel researcher's output into a single, deduplicated result set." },
            { icon: AlertTriangle, title: "plan_generation_failed", body: "A dedicated failure path exits the graph cleanly when no valid plan can be produced." },
          ].map((f) => (
            <div key={f.title} className="group relative bg-background/60 p-8 backdrop-blur transition-colors hover:bg-background">
              <f.icon className="h-5 w-5 text-foreground/80" />
              <h3 className="mt-5 font-mono text-sm tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section >


      {/* Use cases */}
      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">How it works</span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">From prompt to cited report.</h2>
        </div>
        <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {[
            { n: "01", title: "prompt_enhancer", body: "Your raw query is rewritten into a precise, well-scoped research brief." },
            { n: "02", title: "planner", body: "A structured plan of sub-tasks is generated, with a self-loop to replan if invalid." },
            { n: "03", title: "fan_out → researchers", body: "Each sub-task is dispatched in parallel via Send into a tools ↔ worker subgraph." },
            { n: "04", title: "aggregator → final_result", body: "Parallel outputs are merged and deduped into a single cited report." },
          ].map((s) => (
            <li key={s.n} className="bg-background/60 p-8 backdrop-blur">
              <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
              <h3 className="mt-3 font-mono text-sm tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="use-cases" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Use cases</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">From market scans to literature reviews.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Atlas adapts to the depth you need — a one-page brief or a fully sourced dossier.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Investor memos and startup due diligence",
              "Product & competitor teardown reports",
              "Scientific literature surveys with citations",
              "Legal, policy, and regulatory briefings",
              "Travel, relocation, and lifestyle research",
              "Custom internal knowledge briefs for teams",
            ].map((u) => (
              <li key={u} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4 backdrop-blur">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>


      {/* CTA */}
      <section id="cta" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-background/40 p-10 backdrop-blur md:p-16">
          <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-foreground/10 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6">
            <h3 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
              Give it a topic. Get back a report.
            </h3>
            <p className="max-w-xl text-muted-foreground">
              Atlas runs the plan, the research, and the writing. You get the citations.
            </p>
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 pb-10 text-xs text-muted-foreground md:flex-row md:items-center">
        <div>© {new Date().getFullYear()} Agent Atlas</div>
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <span className="uppercase tracking-[0.2em]">Built with</span>
          {["FastAPI", "LangGraph", "Next.js", "PostgreSQL"].map((t) => (
            <span key={t} className="rounded-full border border-border bg-background/40 px-2.5 py-1 backdrop-blur">
              {t}
            </span>
          ))}
        </div>
      </footer>
    </div >
  );
}
