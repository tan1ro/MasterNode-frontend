"use client"

import { fileTypeStyleForExt } from "@/constants/rag"
import { cn } from "@/lib/utils"

interface FileTypeBadgeProps {
  ext: string
}

export function FileTypeBadge({ ext }: FileTypeBadgeProps) {
  const style = fileTypeStyleForExt(ext)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        style.badge
      )}
    >
      {style.label}
    </span>
  )
}
