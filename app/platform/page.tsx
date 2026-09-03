"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Factory,
  GitBranch,
  Layers,
  Users,
} from "lucide-react"
import { FactoryVisualization } from "@/components/visualizations/factory-visualization"
import {
  MarketingCard,
  MarketingFeatureCard,
  MarketingHero,
  MarketingSection,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { PRODUCT_AVAILABLE_FEATURES, PRODUCT_STATUS } from "@/constants/product-roadmap"
import { ROUTES } from "@/lib/routes"

const STAGES = [
  {
    icon: Factory,
    title: "Master Agent",
    description:
      "Receives the task, analyzes scope and complexity, and decides how to decompose it for parallel execution.",
  },
  {
    icon: GitBranch,
    title: "Decomposer",
    description:
      "Splits the work into independent subtasks that can run concurrently. Each subtask is assigned to a parallel agent.",
  },
  {
    icon: Users,
    title: "Parallel Agents",
    description:
      "Multiple LLM agents run subtasks at the same time. You can use different models (OpenAI, Gemini, Claude, etc.) via Settings.",
  },
  {
    icon: Layers,
    title: "Aggregator",
    description:
      "Collects results from all parallel agents and merges them into a single, coherent response.",
  },
  {
    icon: Cpu,
    title: "Supervisor",
    description:
      "Validates the aggregated output for quality and consistency, then delivers the final result to your app.",
  },
]

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "")
  if (!id) return
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function PlatformPage() {
  useEffect(() => {
    if (typeof window === "undefined") return
    scrollToHash(window.location.hash)
    const onHashChange = () => scrollToHash(window.location.hash)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Platform"
        title="How MasterNode runs work"
        description={`Agent Factory explains the parallel pipeline from one request to one result. Features below match what ships in ${PRODUCT_STATUS.phase} (${PRODUCT_STATUS.lastUpdated}).`}
      />

      <MarketingSection id="agent-factory" className="scroll-mt-24 pb-14">
        <MarketingSectionTitle
          eyebrow="01 — agent factory"
          title="From one request to parallel execution"
        />
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-white/60">
          How tasks flow through MasterNode.ai: from a single request to parallel execution and back
          to one coherent result. This is the same pipeline used in Tasks and optional pipeline mode
          in Chat.
        </p>
        <MarketingCard className="overflow-hidden p-0">
          <FactoryVisualization />
        </MarketingCard>
        <p className="mt-4 text-center text-sm text-white/50">
          High-level flow: Master Agent → Decomposer → Parallel Agents → Aggregator → Supervisor
        </p>
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle eyebrow="02 — pipeline" title="Pipeline stages" />
        <div className="grid gap-4 sm:grid-cols-2">
          {STAGES.map((stage) => (
            <MarketingFeatureCard
              key={stage.title}
              icon={stage.icon}
              title={stage.title}
              description={stage.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection width="narrow" className="pb-20">
        <MarketingSectionTitle eyebrow="03 — rationale" title="Why parallel?" />
        <p className="text-sm leading-relaxed text-white/60">
          Complex tasks are broken into smaller pieces and run at the same time. That means faster
          results and better use of your LLM quota. You get one coherent answer without managing
          threads or queues yourself.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Deliverable routing sends document and presentation requests down fast paths; code and
          research tasks use the full swarm. Configure task text, parallelism, RAG, and model
          providers via the API — see docs for request shapes and WebSocket events.
        </p>
      </MarketingSection>

      <MarketingSection id="features" className="scroll-mt-24 border-t border-white/10 pt-16">
        <MarketingSectionTitle
          eyebrow="04 — features"
          title="What you can use today"
          description={`Updated ${PRODUCT_STATUS.lastUpdated}. Every item below is available in the product.`}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCT_AVAILABLE_FEATURES.map((feature) => (
            <MarketingCard key={feature.area} className="h-full">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-white">{feature.area}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.detail}</p>
                </div>
              </div>
            </MarketingCard>
          ))}
        </div>
        <p className="mt-10 text-sm text-white/50">
          Have a request?{" "}
          <Link href={ROUTES.contact} className="text-amber underline-offset-4 hover:underline">
            Share feedback
          </Link>
          , read the{" "}
          <Link href={ROUTES.about} className="text-amber underline-offset-4 hover:underline">
            about page
          </Link>
          , or check the{" "}
          <Link
            href={ROUTES.changelog}
            className="text-amber underline-offset-4 hover:underline"
          >
            changelog
          </Link>{" "}
          for what shipped.
        </p>
      </MarketingSection>

      <MarketingSection width="narrow">
        <MarketingCard className="border-amber/20 bg-amber/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-amber" aria-hidden />
              <div>
                <p className="font-semibold text-white">Documentation & endpoints</p>
                <p className="text-sm text-white/55">
                  Guides, API reference, and route index in the repo
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.docs}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-white/85 underline-offset-4 hover:text-amber hover:underline"
            >
              View docs
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </MarketingCard>
      </MarketingSection>
    </main>
  )
}
