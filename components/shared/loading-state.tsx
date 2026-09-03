import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { icon: "h-5 w-5", padding: "py-4" },
  md: { icon: "h-8 w-8", padding: "py-12" },
  lg: { icon: "h-12 w-12", padding: "py-20" },
} as const

export function LoadingState({ message = "Loading...", className, size = "md" }: LoadingStateProps) {
  const s = sizeMap[size]
  return (
    <div className={cn("text-center", s.padding, className)}>
      <Loader2 className={cn("animate-spin mx-auto mb-4 text-muted-foreground", s.icon)} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
