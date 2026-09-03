"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSectionCard } from "./product-ui"
import { LoadingState } from "@/components/shared/loading-state"
import { useRagFileDetail } from "@/hooks/use-rag"
import type { ProductLinkedFile } from "@/types/api"

function formatBytes(n?: number) {
  if (n == null || !Number.isFinite(n)) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

interface ProductFileDetailPanelProps {
  file: ProductLinkedFile
  onClose: () => void
}

export function ProductFileDetailPanel({ file, onClose }: ProductFileDetailPanelProps) {
  const { data, isLoading, error } = useRagFileDetail(file.missing ? null : file.file_id)

  return (
    <ProductSectionCard accent="cyan">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold truncate">{file.filename || file.file_id}</CardTitle>
          <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{file.file_id}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {file.missing ? (
          <p className="text-sm text-destructive">
            This file is no longer in your knowledge base. Remove it from the product or re-upload in Memory.
          </p>
        ) : isLoading ? (
          <LoadingState message="Loading file details…" size="sm" />
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load file details."}
          </p>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{data?.file_type || "—"}</dd>
            <dt className="text-muted-foreground">Size</dt>
            <dd>{formatBytes(data?.size_bytes ?? data?.file_size)}</dd>
            <dt className="text-muted-foreground">Chunks</dt>
            <dd>{data?.chunks_count ?? "—"}</dd>
            <dt className="text-muted-foreground">Uploaded</dt>
            <dd className="text-xs">
              {data?.created_at ? new Date(data.created_at).toLocaleString() : "—"}
            </dd>
          </dl>
        )}
      </CardContent>
    </ProductSectionCard>
  )
}
