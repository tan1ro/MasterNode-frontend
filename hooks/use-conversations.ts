"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAppAuth } from "@/hooks/use-app-auth"
import { chatService, type CreateConversationBody } from "@/services/chat"
import type { ChatConversation } from "@/types/api"

const CONVERSATION_LIST_LIMIT = 200

export function useConversations() {
  const queryClient = useQueryClient()
  const { isSignedIn, hydrated } = useAppAuth()
  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => chatService.listConversations({ limit: CONVERSATION_LIST_LIMIT }),
    enabled: hydrated && isSignedIn,
  })

  useEffect(() => {
    if (!hydrated || isSignedIn) return
    queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], [])
  }, [hydrated, isSignedIn, queryClient])

  const createConversation = useMutation({
    mutationFn: (body?: CreateConversationBody) => chatService.createConversation(body),
    onSuccess: (created) => {
      if (created.ghost_mode) return
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) => [created, ...prev])
    },
  })

  const renameConversation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      chatService.patchConversation(id, { title }),
    onSuccess: (updated) => {
      const id = updated.conversation_id
      if (updated.archived) {
        queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) =>
          prev.filter((c) => c.conversation_id !== id)
        )
        queryClient.setQueryData<ChatConversation[]>(["chat-conversations-archived"], (prev = []) => {
          const without = (prev || []).filter((c) => c.conversation_id !== id)
          return [updated, ...without]
        })
        return
      }
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations-archived"], (prev = []) =>
        (prev || []).filter((c) => c.conversation_id !== id)
      )
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) => {
        const without = (prev || []).filter((c) => c.conversation_id !== id)
        return [updated, ...without]
      })
    },
  })

  const deleteConversation = useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: (_ok, id) => {
      const remove = (prev: ChatConversation[] = []) =>
        prev.filter((c) => c.conversation_id !== id)
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], remove)
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations-archived"], remove)
    },
  })

  const archivedConversationsQuery = useQuery({
    queryKey: ["chat-conversations-archived"],
    queryFn: () =>
      chatService.listConversations({
        archivedOnly: true,
        limit: CONVERSATION_LIST_LIMIT,
      }),
    enabled: hydrated && isSignedIn,
  })

  const archiveConversation = useMutation({
    mutationFn: (id: string) => chatService.patchConversation(id, { archived: true }),
    onSuccess: (updated, id) => {
      const next = { ...updated, archived: true }
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) =>
        prev.filter((c) => c.conversation_id !== id)
      )
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations-archived"], (prev = []) => {
        const without = (prev || []).filter((c) => c.conversation_id !== id)
        return [next, ...without]
      })
    },
  })

  const unarchiveConversation = useMutation({
    mutationFn: (id: string) => chatService.patchConversation(id, { archived: false }),
    onSuccess: (updated) => {
      const restored = { ...updated, archived: false }
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations-archived"], (prev = []) =>
        (prev || []).filter(
          (c) => c.conversation_id !== restored.conversation_id && c.archived === true
        )
      )
      queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) => [
        restored,
        ...(prev || []).filter((c) => c.conversation_id !== restored.conversation_id),
      ])
    },
  })

  const archivedConversations = (archivedConversationsQuery.data || []).filter(
    (c) => c.archived === true
  )

  return {
    conversations: (conversationsQuery.data || []).filter((c) => c.archived !== true),
    archivedConversations,
    isLoading: conversationsQuery.isLoading,
    isArchivedLoading: archivedConversationsQuery.isLoading,
    refetch: conversationsQuery.refetch,
    createConversation,
    renameConversation,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
  }
}
