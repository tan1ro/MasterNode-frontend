"use client"

import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Minimal panel card — matches task list, assistants, and new-task form sections. */
export function TaskDetailSection({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  headerExtra,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  /** Optional row beside the title (actions, badges). */
  headerExtra?: ReactNode
}) {
  return (
    <Card variant="minimal" interactive={false} className={className}>
      <CardHeader className={cn("space-y-1.5 pb-4", headerClassName)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-base font-semibold font-heading leading-snug sm:text-lg">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
            ) : null}
          </div>
          {headerExtra ? <div className="shrink-0">{headerExtra}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4 pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export const taskDetailInsetPanel =
  "rounded-lg border border-border/50 bg-muted/20 p-4"
