"use client"

import Link from "next/link"
import { FileSearch } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { CITATION_MODE_OPTIONS, FRESHNESS_MODE_OPTIONS } from "@/constants/settings"
import { ROUTES } from "@/lib/routes"
import type { CitationMode, FreshnessMode } from "@/lib/settings-preferences"

interface RagResearchSectionProps {
  defaultUseRag: boolean
  citationMode: CitationMode
  freshnessMode: FreshnessMode
  onDefaultUseRagChange: (value: boolean) => void
  onCitationModeChange: (value: CitationMode) => void
  onFreshnessModeChange: (value: FreshnessMode) => void
}

export function RagResearchSection({
  defaultUseRag,
  citationMode,
  freshnessMode,
  onDefaultUseRagChange,
  onCitationModeChange,
  onFreshnessModeChange,
}: RagResearchSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="rag-research" accent="cyan" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-cyan-400" />
          <div>
            <CardTitle>RAG & research</CardTitle>
            <CardDescription>
              Defaults for knowledge retrieval on new tasks. Upload sources on{" "}
              <Link href={ROUTES.rag} className="text-amber hover:underline">
                Memory
              </Link>
              .
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer rounded-md border border-border/60 bg-muted/10 p-3">
          <Checkbox
            id="defaultUseRagRagSection"
            checked={defaultUseRag}
            onChange={(e) => onDefaultUseRagChange(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="text-sm font-medium text-foreground block">Enable RAG on new tasks</span>
            <span className="text-xs text-muted-foreground">
              Pre-check “Use RAG” on Create task and include retrieval in API payloads when supported.
            </span>
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="citationMode">Citation mode</Label>
            <Select
              id="citationMode"
              value={citationMode}
              onChange={(e) => onCitationModeChange(e.target.value as CitationMode)}
              className="mt-1.5"
            >
              {CITATION_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="freshnessMode">Source freshness</Label>
            <Select
              id="freshnessMode"
              value={freshnessMode}
              onChange={(e) => onFreshnessModeChange(e.target.value as FreshnessMode)}
              className="mt-1.5"
            >
              {FRESHNESS_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
