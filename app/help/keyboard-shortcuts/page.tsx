"use client"

import { Keyboard } from "lucide-react"
import { HelpResourceLayout } from "@/components/help/help-resource-layout"
import { KeyboardShortcutsTable } from "@/components/help/keyboard-shortcuts-table"

export default function KeyboardShortcutsPage() {
  return (
    <HelpResourceLayout
      title="Keyboard shortcuts"
      description="Handy keys for chat, dialogs, and navigation in the workspace."
      icon={Keyboard}
    >
      <KeyboardShortcutsTable />
    </HelpResourceLayout>
  )
}
