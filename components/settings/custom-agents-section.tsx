"use client"

import { Bot } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PipelineTemplateSelectors } from "@/components/agent-templates"
import { persistChatAttachedTemplates, loadChatAttachedTemplates } from "@/lib/chat-attached-assistants"
import {
  countSelectedTemplates,
  decodeTemplateSelection,
  encodeTemplateSelection,
} from "@/lib/pipeline-run-context"
import type { AgentTemplateApi } from "@/types/api"

interface CustomAgentsSectionProps {
  templateIds: Record<string, string>
  templates: AgentTemplateApi[] | undefined
  loading?: boolean
  onChange: (next: Record<string, string>) => void
}

export function CustomAgentsSection({ templateIds, templates, loading, onChange }: CustomAgentsSectionProps) {
  const selection = decodeTemplateSelection(templateIds)

  return (
    <Card variant="minimal" interactive={false} id="custom-agents" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle className="text-base font-semibold leading-snug">Default assistants for Chat (optional)</CardTitle>
            <CardDescription>
              Pre-select assistants used when Chat starts a pipeline. You can choose more than one per step.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PipelineTemplateSelectors
          value={selection}
          onChange={(next) => {
            onChange(encodeTemplateSelection(next))
            if (countSelectedTemplates(loadChatAttachedTemplates()) === 0) {
              persistChatAttachedTemplates(next)
            }
          }}
          templates={templates}
          loading={loading}
          idPrefix="settings-pipeline"
        />
      </CardContent>
    </Card>
  )
}
