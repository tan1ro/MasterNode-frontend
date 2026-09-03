"use client"

import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/layout/page-shell"

export function ProductsShell({ children }: { children: React.ReactNode }) {
  return (
    <PageShell maxWidth="7xl">
      <PageHeader
        title="Products"
        description="Manage multiple products in your workspace. Each product gets a unique ID and can link knowledge-base files used for that product."
      />
      <div className="min-w-0 pt-1">{children}</div>
    </PageShell>
  )
}
