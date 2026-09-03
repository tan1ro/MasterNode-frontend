"use client"

import { useState } from "react"
import { Brain, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import { useCorpusStats } from "@/hooks/use-corpus-stats"
import { corpusService } from "@/services/corpus"
import { cn } from "@/lib/utils"

function StatCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function TrainingCorpusSection() {
  const { data: stats, isLoading, refetch } = useCorpusStats()
  const [exporting, setExporting] = useState<"slm" | "llm" | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async (tier: "slm" | "llm") => {
    setExportError(null)
    setExporting(tier)
    try {
      await corpusService.downloadExport({ tier })
      void refetch()
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed")
    } finally {
      setExporting(null)
    }
  }

  const collectionOn = stats?.enabled
  const total = stats?.total ?? 0

  return (
    <SettingsSectionCard
      icon={Brain}
      title="Training corpus (SLM / LLM)"
      description="Examples collected from chat and pipeline runs for your future in-house models."
    >
      {!collectionOn && !isLoading ? (
        <Callout type="info">
          Server collection is off. Set <code className="text-xs">CHAT_CORPUS_COLLECTION_ENABLED=1</code> in{" "}
          <code className="text-xs">backend/.env</code> and restart the API to start building your corpus.
        </Callout>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCell label="Total examples" value={isLoading ? "—" : String(total)} />
        <StatCell
          label="SLM tier"
          value={isLoading ? "—" : String(stats?.slm ?? 0)}
          hint="short Q&A"
        />
        <StatCell
          label="LLM tier"
          value={isLoading ? "—" : String(stats?.llm ?? 0)}
          hint="long / tools"
        />
        <StatCell
          label="From chat"
          value={isLoading ? "—" : String(stats?.chat_turns ?? 0)}
          hint={stats?.pipeline_collection ? `+ ${stats?.pipeline_turns ?? 0} pipeline` : undefined}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!collectionOn || exporting !== null || (stats?.slm ?? 0) === 0}
          onClick={() => void handleExport("slm")}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {exporting === "slm" ? "Exporting…" : "Export SLM JSONL"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!collectionOn || exporting !== null || (stats?.llm ?? 0) === 0}
          onClick={() => void handleExport("llm")}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {exporting === "llm" ? "Exporting…" : "Export LLM JSONL"}
        </Button>
      </div>

      {exportError ? <p className="text-xs text-destructive">{exportError}</p> : null}

      <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 text-xs text-muted-foreground space-y-1.5">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
          Path to your own models
        </p>
        <p>
          <span className={cn(stats?.ready_for_slm_export && "text-emerald")}>
            SLM: {stats?.ready_for_slm_export ? "enough examples to start a small-model fine-tune" : "aim for 100+ SLM examples"}
          </span>
          {" · "}
          <span className={cn(stats?.ready_for_llm_export && "text-emerald")}>
            LLM: {stats?.ready_for_llm_export ? "enough for a larger fine-tune" : "aim for 50+ LLM examples"}
          </span>
        </p>
        <p>
          Export JSONL → fine-tune offline (Axolotl, Unsloth, OpenAI) → deploy weights → wire as a custom provider in
          MasterNode (coming soon).
        </p>
      </div>
    </SettingsSectionCard>
  )
}
