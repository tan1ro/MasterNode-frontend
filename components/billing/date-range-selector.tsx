"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type BillingDateRange = "week" | "month" | "year"

interface DateRangeSelectorProps {
  value: BillingDateRange
  onChange: (range: BillingDateRange) => void
  className?: string
}

const RANGES: BillingDateRange[] = ["week", "month", "year"]

export function billingRangeDays(range: BillingDateRange): number {
  if (range === "week") return 7
  if (range === "year") return 365
  return 30
}

export function billingRangeLabel(range: BillingDateRange): string {
  return range.charAt(0).toUpperCase() + range.slice(1)
}

export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  return (
    <div className={cn("flex gap-2 w-full sm:w-auto", className)}>
      {RANGES.map((range) => (
        <Button
          key={range}
          type="button"
          variant={value === range ? "default" : "outline"}
          size="sm"
          className="flex-1 sm:flex-none capitalize"
          onClick={() => onChange(range)}
        >
          {billingRangeLabel(range)}
        </Button>
      ))}
    </div>
  )
}
