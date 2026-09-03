"use client"

import { chordToKeycaps, defaultChord, type KeyChord, type ShortcutDefinition } from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

export function ShortcutKeycaps({
  chord,
  isMac,
  className,
}: {
  chord: KeyChord
  isMac: boolean
  className?: string
}) {
  const caps = chordToKeycaps(chord, isMac)

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {caps.map((cap, index) => (
        <kbd
          key={`${cap}-${index}`}
          className={cn(
            "inline-flex min-h-[1.625rem] min-w-[1.625rem] items-center justify-center rounded-md",
            "border border-border/80 bg-muted/50 px-1.5 font-mono text-[11px] text-muted-foreground"
          )}
        >
          {cap}
        </kbd>
      ))}
    </span>
  )
}

export function ShortcutDefinitionKeycaps({
  def,
  isMac,
  className,
}: {
  def: ShortcutDefinition
  isMac: boolean
  className?: string
}) {
  return (
    <ShortcutKeycaps chord={defaultChord(def, isMac)} isMac={isMac} className={className} />
  )
}
