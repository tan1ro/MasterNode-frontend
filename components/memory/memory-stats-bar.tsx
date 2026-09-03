"use client"

import { Database, FileStack, HardDrive, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRagFiles, useHealth } from "@/hooks"
import type { RagFile } from "@/types/api"

function sumChunks(files: RagFile[]): number {
  return files.reduce((acc, file) => acc + (file.chunks_count ?? 0), 0)
}

const statTileClass =
  "flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"

/** Superuser-only vector store diagnostics. */
export function MemoryStatsBar() {
  const { data: files, isLoading } = useRagFiles()
  const { data: health } = useHealth()
  const list: RagFile[] = Array.isArray(files) ? files : []
  const chunks = sumChunks(list)
  const totalBytes = list.reduce((acc, file) => acc + (file.size_bytes ?? file.file_size ?? 0), 0)
  const vector = health?.components?.find((component) => component.id === "vector_store")
  const storeOnline = vector?.online

  const stats: {
    label: string
    value: string
    icon: typeof FileStack
    detail: string
    valueClass?: string
  }[] = [
    {
      label: "Indexed files",
      value: isLoading ? "—" : String(list.length),
      icon: FileStack,
      detail: list.length === 1 ? "document" : "documents",
    },
    {
      label: "Vector chunks",
      value: isLoading ? "—" : chunks.toLocaleString(),
      icon: Layers,
      detail: "approx. embeddings",
    },
    {
      label: "Source size",
      value: isLoading ? "—" : totalBytes > 0 ? `${(totalBytes / 1024 / 1024).toFixed(2)} MB` : "—",
      icon: HardDrive,
      detail: "uploaded originals",
    },
    {
      label: "Vector store",
      value: isLoading ? "—" : vector ? (storeOnline ? "Online" : "Offline") : "—",
      icon: Database,
      detail:
        vector?.latency_ms != null ? `${vector.latency_ms}ms probe` : "retrieval backend",
      valueClass: storeOnline === true ? "text-emerald" : storeOnline === false ? "text-destructive" : undefined,
    },
  ]

  return (
    <Card variant="minimal" interactive={false}>
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, detail, valueClass }) => (
            <div key={label} className={statTileClass}>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
              </div>
              <p className={cn("text-lg font-semibold tabular-nums text-foreground", valueClass)}>
                {value}
              </p>
              <p className="text-[11px] text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
