"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ROUTES } from "@/lib/routes"
import { sdlcPhaseLabel, type ProductSdlcPhaseId } from "@/constants/product-sdlc"
import { cn } from "@/lib/utils"

const linkClass =
  "hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"

export function ProductBreadcrumbs({
  productId,
  productName,
  sdlcPhase,
  taskId,
  taskLabel,
  className,
}: {
  productId?: string
  productName?: string
  sdlcPhase?: ProductSdlcPhaseId
  taskId?: string
  taskLabel?: string
  className?: string
}) {
  return (
    <nav
      aria-label="Product breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground",
        className
      )}
    >
      <Link href={ROUTES.product} className={linkClass}>
        Products
      </Link>
      {productId ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
          <Link
            href={ROUTES.productDetail(productId)}
            className={cn(linkClass, "truncate max-w-[10rem] sm:max-w-xs")}
          >
            {productName || productId}
          </Link>
        </>
      ) : null}
      {productId && sdlcPhase ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
          <Link href={ROUTES.productSdlc(productId, sdlcPhase)} className={linkClass}>
            {sdlcPhaseLabel(sdlcPhase)}
          </Link>
        </>
      ) : null}
      {taskId ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
          <span className="text-foreground font-medium truncate max-w-[12rem] sm:max-w-md">
            {taskLabel || taskId}
          </span>
        </>
      ) : null}
    </nav>
  )
}
