import { cn } from "@/lib/utils"

export function HomeGridBackdrop({
  className,
  scoped = false,
}: {
  className?: string
  /** When true, grid is clipped to the parent instead of the full viewport. */
  scoped?: boolean
}) {
  return (
    <div
      className={cn(
        "pointer-events-none z-0 home-landing-grid opacity-60 dark:opacity-100",
        scoped ? "absolute inset-0" : "fixed inset-0",
        className
      )}
      aria-hidden
    />
  )
}
