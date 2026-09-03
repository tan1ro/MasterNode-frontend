"use client"

import { PageHeader } from "@/components/shared"

/** Shared access-denied shell for `/superuser/*` pages. */
export function SuperuserAccessDenied({
  title,
  description = "This page is available only to the superuser account.",
}: {
  title: string
  description?: string
}) {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
        Access denied. Sign in as superuser to continue.
      </div>
    </div>
  )
}
