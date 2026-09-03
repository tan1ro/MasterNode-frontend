"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type CardAccent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ProductBackLink } from "./product-back-link"

/** Vertical rhythm between product page sections. */
export const PRODUCT_PAGE_GAP = "flex flex-col gap-6"

export function ProductPageStack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(PRODUCT_PAGE_GAP, "w-full min-w-0", className)}>{children}</div>
}

export function ProductPageNav({
  backHref,
  backLabel,
  breadcrumbs,
  className,
}: {
  backHref?: string
  backLabel?: string
  breadcrumbs?: ReactNode
  className?: string
}) {
  if (!backHref && !breadcrumbs) return null
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 sm:px-5 sm:py-4",
        className
      )}
    >
      {backHref && backLabel ? (
        <ProductBackLink href={backHref} label={backLabel} className="self-start" />
      ) : null}
      {breadcrumbs}
    </div>
  )
}

export function ProductSectionCard({
  accent,
  children,
  className,
}: {
  accent?: CardAccent
  children: ReactNode
  className?: string
}) {
  return (
    <Card accent={accent} interactive={false} className={cn("shadow-sm", className)}>
      {children}
    </Card>
  )
}

export function ProductSectionCardHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}) {
  return (
    <CardHeader
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between space-y-0 pb-4",
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <CardTitle className="text-lg font-semibold leading-snug tracking-tight flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden /> : null}
          {title}
        </CardTitle>
        {description ? <CardDescription className="text-sm leading-relaxed">{description}</CardDescription> : null}
      </div>
      {action ? (
        <div className="w-full sm:w-auto shrink-0 flex sm:justify-end">{action}</div>
      ) : null}
    </CardHeader>
  )
}

const productLinkButtonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 whitespace-nowrap h-9 px-3 w-full sm:w-auto"

export function ProductLinkButton({
  href,
  children,
  variant = "outline",
  className,
}: {
  href: string
  children: ReactNode
  variant?: "outline" | "primary"
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        productLinkButtonBase,
        variant === "outline" &&
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "primary" &&
          "bg-amber text-amber-foreground hover:bg-amber/90 border border-amber/30",
        className
      )}
    >
      {children}
    </Link>
  )
}

export const productListShellClass =
  "rounded-lg border border-border/60 bg-muted/5 divide-y divide-border/50 overflow-hidden"

export const productListItemLinkClass = cn(
  "flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:py-4",
  "hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
)

export function ProductListEmpty({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/60 bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ProductInlineForm({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-border/60 bg-muted/15 p-4 sm:p-5 max-w-md",
        className
      )}
    >
      {children}
    </div>
  )
}
