import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const selectFieldClass =
  "flex h-10 w-full min-w-0 appearance-none rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40 focus-visible:border-amber/40 disabled:cursor-not-allowed disabled:opacity-50"

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative inline-flex w-full min-w-0", className)}>
        <select
          className={cn(selectFieldClass, className)}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-muted-foreground",
            disabled && "opacity-50"
          )}
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
