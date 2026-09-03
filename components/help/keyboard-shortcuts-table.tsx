"use client"

import { ShortcutDefinitionKeycaps } from "@/components/help/shortcut-keycaps"
import {
  HELP_KEYBOARD_SHORTCUTS,
  isMacPlatform,
  KEYBOARD_SHORTCUT_CATEGORIES,
} from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

export function KeyboardShortcutsTable() {
  const isMac = isMacPlatform()

  return (
    <div className="space-y-6">
      {KEYBOARD_SHORTCUT_CATEGORIES.map((category) => {
        const rows = HELP_KEYBOARD_SHORTCUTS.filter(
          (row) => row.definition.category === category.id
        )
        return (
          <section key={category.id}>
            <h3 className="mb-3 text-sm text-muted-foreground">{category.label}</h3>
            <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
              {rows.map((row) => (
                <div
                  key={row.definition.id}
                  className={cn(
                    "flex items-center justify-between gap-4 bg-muted/15 px-4 py-3 text-sm"
                  )}
                >
                  <dt className="text-foreground">{row.action}</dt>
                  <dd className="shrink-0">
                    <ShortcutDefinitionKeycaps def={row.definition} isMac={isMac} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
