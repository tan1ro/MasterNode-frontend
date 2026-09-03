"use client"

import { useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { ChatConversationSidebarRow } from "@/components/chat/chat-conversation-sidebar-row"
import {
  SIDEBAR_ICON_CLASS,
  SIDEBAR_ICON_SLOT_CLASS,
  SIDEBAR_RECENTS_INSET_X_CLASS,
  SIDEBAR_META_TEXT_CLASS,
  SIDEBAR_RECENTS_LABEL_CLASS,
  SIDEBAR_RECENTS_ROW_CLASS,
  SIDEBAR_RECENTS_HEADER_PADDING_CLASS,
  SIDEBAR_RECENTS_LIST_GAP_CLASS,
  SIDEBAR_SCROLL_CLASS,
  SIDEBAR_SECTION_TEXT_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { useConversations } from "@/hooks/use-conversations"
import { usePinnedChatConversations } from "@/hooks/use-pinned-chat-conversations"
import { useToast } from "@/hooks/use-toast"
import { sortConversationsWithPins } from "@/lib/chat-pinned-conversations"
import { cn } from "@/lib/utils"
import type { ChatConversation } from "@/types/api"

interface Props {
  conversations: ChatConversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onCreateChat: () => void
}

export function ChatSidebarRecents({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateChat,
}: Props) {
  const [recentsOpen, setRecentsOpen] = useState(true)
  const {
    renameConversation,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    archivedConversations,
  } = useConversations()
  const [archivedOpen, setArchivedOpen] = useState(false)
  const { pinnedIds, togglePinned, isPinned, unpin } = usePinnedChatConversations()
  const { showToast } = useToast()

  const sortedConversations = useMemo(
    () => sortConversationsWithPins(conversations, pinnedIds),
    [conversations, pinnedIds]
  )

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "flex w-full min-w-0 shrink-0 items-center gap-1",
          SIDEBAR_RECENTS_HEADER_PADDING_CLASS,
          SIDEBAR_RECENTS_INSET_X_CLASS,
          "pt-4 pb-1.5"
        )}
      >
        <button
          type="button"
          onClick={() => setRecentsOpen((v) => !v)}
          aria-expanded={recentsOpen}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg text-left",
            SIDEBAR_SECTION_TEXT_CLASS,
            "text-foreground hover:bg-transparent"
          )}
        >
          <span className="min-w-0 flex-1 truncate">Recents</span>
          <span className={SIDEBAR_ICON_SLOT_CLASS}>
            <ChevronRight
              className={cn(
                SIDEBAR_ICON_CLASS,
                "text-foreground/60 transition-transform",
                recentsOpen && "rotate-90"
              )}
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </button>
      </div>

      {recentsOpen ? (
        <div
          className={cn(
            SIDEBAR_SCROLL_CLASS,
            SIDEBAR_RECENTS_LIST_GAP_CLASS,
            SIDEBAR_RECENTS_INSET_X_CLASS,
            "pb-2"
          )}
        >
          {conversations.length === 0 ? (
            <div className={cn(SIDEBAR_RECENTS_ROW_CLASS, SIDEBAR_META_TEXT_CLASS)}>
              <span className={SIDEBAR_RECENTS_LABEL_CLASS}>No chats yet</span>
            </div>
          ) : (
            sortedConversations.map((item) => (
              <ChatConversationSidebarRow
                key={item.conversation_id}
                conversation={item}
                active={activeConversationId === item.conversation_id}
                pinned={isPinned(item.conversation_id)}
                onSelect={() => onSelectConversation(item.conversation_id)}
                onTogglePin={() => togglePinned(item.conversation_id)}
                onRename={async (title) => {
                  await renameConversation.mutateAsync({
                    id: item.conversation_id,
                    title,
                  })
                }}
                onArchive={async () => {
                  await archiveConversation.mutateAsync(item.conversation_id)
                  unpin(item.conversation_id)
                  if (activeConversationId === item.conversation_id) {
                    onCreateChat()
                  }
                }}
                onDelete={async () => {
                  await deleteConversation.mutateAsync(item.conversation_id)
                  unpin(item.conversation_id)
                  if (activeConversationId === item.conversation_id) {
                    onCreateChat()
                  }
                }}
                onNotice={(message, variant = "info") => showToast(message, variant)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}

      {archivedConversations.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setArchivedOpen((v) => !v)}
            aria-expanded={archivedOpen}
            className={cn(
              "flex w-full min-w-0 shrink-0 items-center justify-between gap-2 rounded-lg text-left",
              SIDEBAR_RECENTS_HEADER_PADDING_CLASS,
              SIDEBAR_RECENTS_INSET_X_CLASS,
              "pt-2 pb-1.5",
              SIDEBAR_SECTION_TEXT_CLASS,
              "text-foreground hover:bg-transparent"
            )}
          >
            <span className="min-w-0 flex-1 truncate">Archived</span>
            <span className={SIDEBAR_ICON_SLOT_CLASS}>
              <ChevronRight
                className={cn(
                  SIDEBAR_ICON_CLASS,
                  "text-foreground/60 transition-transform",
                  archivedOpen && "rotate-90"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
          </button>
          {archivedOpen ? (
            <div
              className={cn(
                SIDEBAR_SCROLL_CLASS,
                SIDEBAR_RECENTS_LIST_GAP_CLASS,
                SIDEBAR_RECENTS_INSET_X_CLASS,
                "pb-2 max-h-40"
              )}
            >
              {archivedConversations.map((item) => (
                <ChatConversationSidebarRow
                  key={`archived-${item.conversation_id}`}
                  conversation={item}
                  active={activeConversationId === item.conversation_id}
                  pinned={false}
                  onSelect={() => onSelectConversation(item.conversation_id)}
                  onTogglePin={() => false}
                  onRename={async (title) => {
                    await renameConversation.mutateAsync({
                      id: item.conversation_id,
                      title,
                    })
                  }}
                  onArchive={async () => {
                    await unarchiveConversation.mutateAsync(item.conversation_id)
                  }}
                  onDelete={async () => {
                    await deleteConversation.mutateAsync(item.conversation_id)
                    if (activeConversationId === item.conversation_id) {
                      onCreateChat()
                    }
                  }}
                  onNotice={(message, variant = "info") => showToast(message, variant)}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
