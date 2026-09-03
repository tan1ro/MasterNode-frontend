"use client"

import { Button } from "@/components/ui/button"
import { Check, Copy, Key, Trash2 } from "lucide-react"
import type { ApiKeyRecord } from "@/types/api"

interface ApiKeyListItemProps {
  apiKey: ApiKeyRecord
  isActive: boolean
  isCopied: boolean
  isDeleting?: boolean
  compact?: boolean
  onCopy: (key: string) => void
  onSetActive?: (key: string) => void
  onDelete?: (keyId: string, name: string) => void
}

export function ApiKeyListItem({
  apiKey,
  isActive,
  isCopied,
  isDeleting,
  compact,
  onCopy,
  onSetActive,
  onDelete,
}: ApiKeyListItemProps) {
  const variant = compact ? "ghost" as const : "outline" as const
  const size = "sm" as const
  const canRead = apiKey.read !== false
  const canWrite = apiKey.write !== false

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 p-3 border border-border/50 rounded-lg hover:border-amber/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-medium text-sm truncate">{apiKey.name}</p>
          <span
            className={
              canRead
                ? "text-xs px-2 py-0.5 rounded border border-emerald/25 bg-emerald/10 text-emerald"
                : "text-xs px-2 py-0.5 rounded border border-border/60 text-muted-foreground line-through"
            }
            title="GET / HEAD allowed"
          >
            Read
          </span>
          <span
            className={
              canWrite
                ? "text-xs px-2 py-0.5 rounded border border-amber/30 bg-amber/10 text-amber"
                : "text-xs px-2 py-0.5 rounded border border-border/60 text-muted-foreground line-through"
            }
            title="POST / PUT / PATCH / DELETE allowed"
          >
            Write
          </span>
          {isActive && (
            <span className="text-xs px-2 py-0.5 bg-emerald/10 text-emerald border border-emerald/25 rounded font-mono">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono break-all truncate">
          {apiKey.api_key}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Created {new Date(apiKey.created_at).toLocaleDateString()}
          {apiKey.last_used && ` · Last used ${new Date(apiKey.last_used).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant={variant}
          size={size}
          onClick={() => onCopy(apiKey.api_key)}
          title="Copy key"
          className="text-muted-foreground hover:text-amber"
        >
          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        {!isActive && onSetActive && (
          <Button
            variant={variant}
            size={size}
            onClick={() => onSetActive(apiKey.api_key)}
            title="Set as active"
            className="text-muted-foreground hover:text-amber"
          >
            <Key className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant={variant}
            size={size}
            onClick={() => onDelete(apiKey.key_id, apiKey.name)}
            disabled={isDeleting}
            title="Delete key"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
