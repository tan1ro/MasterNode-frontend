"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  PIPELINE_DOMAIN_EXAMPLES,
  pickRandomPipelineExample,
  type PipelineDomainExample,
} from "@/constants/pipeline-domain-examples"
import { cn } from "@/lib/utils"

const ROTATE_MS = 60_000
const DEFAULT_DOMAIN =
  PIPELINE_DOMAIN_EXAMPLES.find((example) => example.id === "discovery") ??
  PIPELINE_DOMAIN_EXAMPLES[0]

const PipelineDomainContext = createContext<{
  domain: PipelineDomainExample
  shuffleDomain: () => void
} | null>(null)

export function HomePipelineDomainProvider({ children }: { children: React.ReactNode }) {
  const [domain, setDomain] = useState<PipelineDomainExample>(DEFAULT_DOMAIN)

  const shuffleDomain = useCallback(() => {
    setDomain((current) => pickRandomPipelineExample(current.id))
  }, [])

  useEffect(() => {
    const id = window.setInterval(shuffleDomain, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [shuffleDomain])

  return (
    <PipelineDomainContext.Provider value={{ domain, shuffleDomain }}>
      {children}
    </PipelineDomainContext.Provider>
  )
}

export function usePipelineDomain() {
  const ctx = useContext(PipelineDomainContext)
  if (!ctx) {
    throw new Error("usePipelineDomain must be used within HomePipelineDomainProvider")
  }
  return ctx
}

export function HomePipelineActiveExample({ className }: { className?: string }) {
  const { domain } = usePipelineDomain()
  const Icon = domain.icon

  return (
    <div className={cn("home-pipeline-active-example-wrap flex justify-end", className)}>
      <div
        key={domain.id}
        className="home-pipeline-active-example inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs backdrop-blur-sm dark:border-white/12 dark:bg-white/[0.04] sm:text-sm"
        aria-live="polite"
      >
        <span className="size-1.5 shrink-0 rounded-full bg-[#2DCFCF] shadow-[0_0_8px_#2DCFCF]" aria-hidden />
        <span className="text-muted-foreground">Running example</span>
        <Icon className="size-3.5 shrink-0 text-[#2DCFCF]" aria-hidden />
        <span className="font-medium text-foreground">{domain.label}</span>
      </div>
    </div>
  )
}
