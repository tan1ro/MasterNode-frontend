"use client"

import { Plug } from "lucide-react"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"
import { BRANDING } from "@/constants/branding"
import { workspacePageClass } from "@/constants/chat-layout"

export default function IntegrationsPage() {
  return (
    <div className={workspacePageClass()}>
      <ComingSoonPage
        variant="workspace"
        title="Integrations"
        description="Connect apps and automations to your workspace — n8n, Notion, Google Docs, and more are on the way."
        actions={
          <a
            href={`mailto:${BRANDING.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber"
          >
            <Plug className="h-4 w-4" aria-hidden />
            Request an integration
          </a>
        }
      />
    </div>
  )
}
