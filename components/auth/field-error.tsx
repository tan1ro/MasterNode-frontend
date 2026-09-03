import { cn } from "@/lib/utils"

export function FieldError({
  id,
  message,
  className,
}: {
  id?: string
  message?: string
  className?: string
}) {
  if (!message) return null
  return (
    <p id={id} role="alert" className={cn("text-sm text-destructive", className)}>
      {message}
    </p>
  )
}

export function inputErrorClass(hasError: boolean): string {
  return hasError ? "border-destructive focus-visible:ring-destructive/40" : ""
}
