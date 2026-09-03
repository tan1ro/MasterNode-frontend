import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-wide">{title}</h1>
        {description != null && (
          <div className="text-sm sm:text-base text-muted-foreground mt-0.5 [&_a]:text-amber [&_a]:underline-offset-2 [&_a]:hover:underline">
            {description}
          </div>
        )}
      </div>
      {children && (
        <div className="flex w-full min-w-0 flex-wrap items-center justify-stretch gap-2 sm:w-auto sm:justify-end">
          {children}
        </div>
      )}
    </div>
  )
}
