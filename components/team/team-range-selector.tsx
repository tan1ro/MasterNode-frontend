"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TEAM_RANGE_PRESETS, type TeamRangePreset } from "@/lib/team-analytics"

interface TeamRangeSelectorProps {
  value: TeamRangePreset
  onChange: (range: TeamRangePreset) => void
  className?: string
}

export function TeamRangeSelector({ value, onChange, className }: TeamRangeSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {TEAM_RANGE_PRESETS.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          variant={value === preset.id ? "default" : "outline"}
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
