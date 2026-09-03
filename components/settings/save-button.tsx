"use client"

import { Save, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  onClick: () => void
  disabled: boolean
  saved: boolean
  label?: string
  savedLabel?: string
  className?: string
}

export function SaveButton({
  onClick,
  disabled,
  saved,
  label = "Save",
  savedLabel = "Saved",
  className,
}: SaveButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-amber text-amber-foreground hover:bg-amber/90",
        className
      )}
    >
      {saved ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {savedLabel}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
