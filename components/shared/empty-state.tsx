import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
      <p className="text-muted-foreground mb-2">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {children}
    </div>
  )
}
