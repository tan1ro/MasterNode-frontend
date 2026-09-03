"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CHAT_ATTACHED_ASSISTANTS_CHANGED,
  isTemplateAttachedToChat,
  loadChatAttachedTemplates,
} from "@/lib/chat-attached-assistants"
import {
  emptyPipelineTemplateSelection,
  type PipelineTemplateSelection,
} from "@/lib/pipeline-run-context"

export function useChatAttachedAssistants() {
  // Start empty so SSR and the first client render match; hydrate from localStorage in useEffect.
  const [attached, setAttached] = useState<PipelineTemplateSelection>(emptyPipelineTemplateSelection)

  const refresh = useCallback(() => {
    setAttached(loadChatAttachedTemplates())
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window === "undefined") return
    window.addEventListener(CHAT_ATTACHED_ASSISTANTS_CHANGED, refresh)
    return () => window.removeEventListener(CHAT_ATTACHED_ASSISTANTS_CHANGED, refresh)
  }, [refresh])

  const isAttached = useCallback(
    (templateId: string) => isTemplateAttachedToChat(templateId, attached),
    [attached]
  )

  const attachedCount = Object.values(attached).reduce(
    (count, ids) => count + (ids?.length || 0),
    0
  )

  return { attached, isAttached, attachedCount, refresh }
}
