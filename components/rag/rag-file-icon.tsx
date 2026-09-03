"use client"

import { iconForRagFileExt, ragFileIconTileClass } from "@/lib/rag-file-icons"
import { cn } from "@/lib/utils"

export function RagFileIcon({
  ext,
  size = "md",
  className,
}: {
  ext: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const Icon = iconForRagFileExt(ext)
  const sizeClass =
    size === "lg" ? "h-10 w-10 rounded-lg [&_svg]:h-5 [&_svg]:w-5" : size === "sm" ? "h-8 w-8 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5" : "h-9 w-9 rounded-lg [&_svg]:h-4 [&_svg]:w-4"

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border",
        sizeClass,
        ragFileIconTileClass(ext),
        className
      )}
    >
      <Icon aria-hidden />
    </div>
  )
}
