"use client"

import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CHAT_HISTORY_TURN_OPTIONS, THINKING_MODE_OPTIONS } from "@/constants/settings"
import { CUSTOM_INSTRUCTIONS_MAX_LENGTH } from "@/constants/user-settings"
import { SettingsToggleRow } from "@/components/settings/settings-pref-controls"
import type { ThinkingMode } from "@/types/api"

interface ChatBehaviorSectionProps {
  chatThinkingMode: ThinkingMode
  chatConfirmBeforePipeline: boolean
  chatStreamResponses: boolean
  chatHistoryTurns: string
  showPipelineActivityPanel: boolean
  sendOnEnter: boolean
  autoNameConversations: boolean
  customInstructions: string
  onThinkingModeChange: (value: ThinkingMode) => void
  onConfirmBeforePipelineChange: (value: boolean) => void
  onStreamResponsesChange: (value: boolean) => void
  onHistoryTurnsChange: (value: string) => void
  onShowPipelineActivityChange: (value: boolean) => void
  onSendOnEnterChange: (value: boolean) => void
  onAutoNameConversationsChange: (value: boolean) => void
  onCustomInstructionsChange: (value: string) => void
}

export function ChatBehaviorSection({
  chatThinkingMode,
  chatConfirmBeforePipeline,
  chatStreamResponses,
  chatHistoryTurns,
  showPipelineActivityPanel,
  sendOnEnter,
  autoNameConversations,
  customInstructions,
  onThinkingModeChange,
  onConfirmBeforePipelineChange,
  onStreamResponsesChange,
  onHistoryTurnsChange,
  onShowPipelineActivityChange,
  onSendOnEnterChange,
  onAutoNameConversationsChange,
  onCustomInstructionsChange,
}: ChatBehaviorSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="chat-behavior" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle>Chat & pipeline from chat</CardTitle>
            <CardDescription>Controls how Chat starts agent runs and how much context is included.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="chatThinkingMode">Thinking mode (new conversations)</Label>
          <Select
            id="chatThinkingMode"
            value={chatThinkingMode}
            onChange={(e) => onThinkingModeChange(e.target.value as ThinkingMode)}
            className="mt-1.5"
          >
            {THINKING_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {THINKING_MODE_OPTIONS.find((o) => o.value === chatThinkingMode)?.description}
          </p>
        </div>

        <div>
          <Label htmlFor="chatHistoryTurns">Pipeline context from chat history</Label>
          <Select
            id="chatHistoryTurns"
            value={chatHistoryTurns}
            onChange={(e) => onHistoryTurnsChange(e.target.value)}
            className="mt-1.5"
          >
            {CHAT_HISTORY_TURN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <ul className="space-y-2 border-t border-border/50 pt-3">
          <li>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={chatConfirmBeforePipeline}
                onChange={(e) => onConfirmBeforePipelineChange(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Confirm before starting pipeline</span>
                <span className="block text-xs text-muted-foreground">
                  When on, pipeline runs from chat pause for plan review before agents execute. When off,
                  the pipeline starts immediately.
                </span>
              </span>
            </label>
          </li>
          <li>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={chatStreamResponses}
                onChange={(e) => onStreamResponsesChange(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Stream assistant responses</span>
                <span className="block text-xs text-muted-foreground">
                  When on, show tokens as they arrive. When off, the full reply appears when complete.
                </span>
              </span>
            </label>
          </li>
          <li>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={showPipelineActivityPanel}
                onChange={(e) => onShowPipelineActivityChange(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Show live pipeline activity in chat</span>
                <span className="block text-xs text-muted-foreground">Stage progress and events while a run is active.</span>
              </span>
            </label>
          </li>
          <li>
            <SettingsToggleRow
              id="sendOnEnter"
              checked={sendOnEnter}
              onChange={onSendOnEnterChange}
              label="Send message on Enter"
              description={
                sendOnEnter
                  ? "Enter sends; Shift+Enter adds a new line."
                  : "Enter adds a new line; Shift+Enter sends."
              }
            />
          </li>
          <li>
            <SettingsToggleRow
              id="autoNameConversations"
              checked={autoNameConversations}
              onChange={onAutoNameConversationsChange}
              label="Auto-name conversations"
              description="Generate a title from the first message. When off, chats stay as New Chat."
            />
          </li>
        </ul>

        <div className="border-t border-border/50 pt-4">
          <Label htmlFor="customInstructions">Custom instructions</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            Standing instructions prepended to every chat and pipeline run.
          </p>
          <Textarea
            id="customInstructions"
            value={customInstructions}
            onChange={(e) =>
              onCustomInstructionsChange(e.target.value.slice(0, CUSTOM_INSTRUCTIONS_MAX_LENGTH))
            }
            rows={5}
            placeholder="e.g. I am a senior Python developer; always give concise code examples."
            className="resize-y min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {customInstructions.length}/{CUSTOM_INSTRUCTIONS_MAX_LENGTH}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
