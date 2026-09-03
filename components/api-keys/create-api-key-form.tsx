"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2, BookOpen } from "lucide-react"
import type { CreateApiKeyRequest } from "@/types/api"
import { ROUTES } from "@/lib/routes"

interface CreateApiKeyFormProps {
  onSubmit: (payload: CreateApiKeyRequest) => void
  isPending: boolean
  layout?: "inline" | "stacked"
}

export function CreateApiKeyForm({ onSubmit, isPending, layout = "inline" }: CreateApiKeyFormProps) {
  const [name, setName] = useState("")
  const [read, setRead] = useState(true)
  const [write, setWrite] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!read && !write) return
    onSubmit({ name: name.trim(), read, write })
    setName("")
    setRead(true)
    setWrite(true)
  }

  const canSubmit = name.trim().length > 0 && (read || write)

  return (
    <form
      onSubmit={handleSubmit}
      className={layout === "inline"
        ? "flex flex-col gap-3"
        : "space-y-3"
      }
    >
      <div className={layout === "inline" ? "flex flex-col sm:flex-row sm:gap-2 gap-3" : ""}>
        <div className="flex-1">
          <Label htmlFor="keyName">Key Name</Label>
          <Input
            id="keyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production API Key"
            required
            className="mt-1 border-border/50 focus:border-amber/40"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-full sm:w-auto bg-amber text-amber-foreground hover:bg-amber/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/15 px-3 py-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Permissions</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
              Same idea as scoped keys on OpenAI: you decide how much this secret can do <strong>before</strong> it exists.
              Enforcement is per HTTP request using <code className="text-[11px] bg-background/80 px-1 rounded">X-API-Key</code>.
              Browser sessions are separate and not limited by these toggles.
            </p>
          </div>
          <Link
            href={`${ROUTES.docs}#api-key-permissions`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Full reference
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox checked={read} onChange={() => setRead((v) => !v)} className="mt-0.5" />
              <span>
                <span className="text-sm font-medium text-foreground block">Read</span>
                <span className="text-xs text-muted-foreground font-mono">GET · HEAD</span>
              </span>
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed pl-7 border-l-2 border-cyan/30 ml-1">
              List and fetch tasks, results, usage, metrics, API keys, wallet balance, health, RAG file lists, and
              other read-only routes. Use for monitors and CI that must <strong>never</strong> enqueue work or change
              data.
            </p>
            <p className="text-[11px] text-muted-foreground pl-7 ml-1">
              If Read is off, every GET/HEAD returns <strong className="text-foreground">403</strong> (even when Write
              is on).
            </p>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox checked={write} onChange={() => setWrite((v) => !v)} className="mt-0.5" />
              <span>
                <span className="text-sm font-medium text-foreground block">Write</span>
                <span className="text-xs text-muted-foreground font-mono">POST · PUT · PATCH · DELETE</span>
              </span>
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed pl-7 border-l-2 border-amber/30 ml-1">
              Create or cancel tasks, create or revoke keys, RAG uploads, wallet top-ups, feedback, template writes,
              and any mutating API. Required for IDEs and pipelines that submit work.
            </p>
            <p className="text-[11px] text-muted-foreground pl-7 ml-1">
              If Write is off, POST/PUT/PATCH/DELETE return <strong className="text-foreground">403</strong>.
            </p>
          </div>
        </div>

        {!read && !write && (
          <p className="text-xs text-destructive">Enable at least one permission.</p>
        )}
      </div>
    </form>
  )
}
