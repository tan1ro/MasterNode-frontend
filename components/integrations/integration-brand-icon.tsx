"use client"

import { INTEGRATION_LOGOS } from "@/constants/integration-logos"
import { cn } from "@/lib/utils"

interface IntegrationBrandIconProps {
  providerId: string
  brandColor?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASS = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const

const IMG_CLASS = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-9 w-9",
} as const

export function IntegrationBrandIcon({
  providerId,
  brandColor,
  className,
  size = "md",
}: IntegrationBrandIconProps) {
  const config = INTEGRATION_LOGOS[providerId]
  const src = config?.src
  const alt = config?.alt ?? providerId

  if (!config || !src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40",
          SIZE_CLASS[size],
          className
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white shadow-sm dark:bg-muted/20",
        SIZE_CLASS[size],
        className
      )}
      style={
        brandColor
          ? { boxShadow: `0 0 0 1px ${brandColor}22, 0 1px 2px rgb(0 0 0 / 0.06)` }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size === "sm" ? 24 : size === "lg" ? 36 : 28}
        height={size === "sm" ? 24 : size === "lg" ? 36 : 28}
        className={cn(IMG_CLASS[size], "object-contain")}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
