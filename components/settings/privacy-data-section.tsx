"use client"

import { useState } from "react"
import { Database, Download, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import {
  SettingsSectionCard,
  SettingsSelectField,
  SettingsToggleRow,
} from "@/components/settings/settings-pref-controls"
import { RETENTION_PERIOD_OPTIONS } from "@/constants/user-settings"
import type { RetentionPeriodPref } from "@/constants/user-settings"
import { TrainingCorpusSection } from "@/components/settings/training-corpus-section"
import { privacyService } from "@/services/preferences"
import { useAppAuth } from "@/hooks/use-app-auth"

interface PrivacyDataSectionProps {
  allowTrainingData: boolean
  retentionPeriodDays: RetentionPeriodPref
  onAllowTrainingDataChange: (value: boolean) => void
  onRetentionPeriodChange: (value: RetentionPeriodPref) => void
}

export function PrivacyDataSection({
  allowTrainingData,
  retentionPeriodDays,
  onAllowTrainingDataChange,
  onRetentionPeriodChange,
}: PrivacyDataSectionProps) {
  const { isSignedIn } = useAppAuth()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!isSignedIn) {
      setExportError("Sign in to download your account data package.")
      return
    }
    setExporting(true)
    setExportError(null)
    try {
      const payload = await privacyService.exportJson()
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `masternode-data-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError("Could not build the export. Try again or contact support.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card variant="minimal" interactive={false} id="privacy-data" accent="emerald" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <CardTitle>Privacy & data</CardTitle>
            <CardDescription>Training opt-out, retention, and data export controls.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={ShieldCheck}
          title="Training data opt-out"
          description="Choose whether your conversations may be used to improve AI models."
        >
          <SettingsToggleRow
            id="allowTrainingData"
            checked={allowTrainingData}
            onChange={onAllowTrainingDataChange}
            label="Allow my data for model training"
            description="When on, each chat turn may be saved to your workspace training corpus for future SLM/LLM fine-tuning (server must have collection enabled)."
          />
        </SettingsSectionCard>

        <TrainingCorpusSection />

        <SettingsSectionCard
          icon={Database}
          title="Data retention"
          description="How long conversation history is kept before automatic deletion."
        >
          <SettingsSelectField
            id="retentionPeriod"
            label="Retention period"
            description="Saved to your account. Conversations older than this period are automatically removed when you open chat or list conversations."
            value={retentionPeriodDays}
            onChange={(v) => onRetentionPeriodChange(v as RetentionPeriodPref)}
            options={RETENTION_PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <p className="text-xs text-muted-foreground">
            {RETENTION_PERIOD_OPTIONS.find((o) => o.value === retentionPeriodDays)?.description}
          </p>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Download}
          title="Download all my data"
          description="GDPR/CCPA JSON export of conversations, settings, memory, and knowledge metadata."
        >
          <Callout type="info">
            Downloads an on-demand JSON package from the server. ZIP-via-email remains a follow-up for
            very large accounts.
          </Callout>
          {exportError ? (
            <p className="text-xs text-destructive" role="alert">
              {exportError}
            </p>
          ) : null}
          <Button type="button" variant="outline" disabled={exporting} onClick={() => void handleExport()}>
            {exporting ? "Preparing export…" : "Download data export (JSON)"}
          </Button>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
