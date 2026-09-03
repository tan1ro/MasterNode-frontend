"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreatorTaskSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn("creator-task-section", className)}>
      <div className="creator-task-section-header">
        {Icon ? (
          <span className="creator-task-section-icon" aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="creator-task-section-title">{title}</h2>
          {description ? (
            <p className="creator-task-section-description">{description}</p>
          ) : null}
        </div>
      </div>
      <div className={cn("creator-task-section-body", contentClassName)}>{children}</div>
    </section>
  )
}
