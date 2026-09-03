"use client"

import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatConversation } from "@/types/api"

interface Props {
  open: boolean
  conversations: ChatConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export function ConversationSidebar({ open, conversations, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/60 bg-card/40 transition-all duration-300 overflow-hidden",
        open ? "w-[280px]" : "w-0 border-r-0"
      )}
    >
      <div className="p-3">
        <button
          type="button"
          className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted/60"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>
      <div className="px-3 pb-2 text-xs text-muted-foreground">Recent</div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {conversations.map((item) => (
          <button
            type="button"
            key={item.conversation_id}
            onClick={() => onSelect(item.conversation_id)}
            className={cn(
              "w-full group rounded-xl px-3 py-2.5 text-left text-sm flex items-center gap-2 transition-colors",
              activeId === item.conversation_id
                ? "bg-muted text-foreground border border-border/70"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="truncate flex-1">{item.title || "New chat"}</span>
            <span
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.conversation_id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
