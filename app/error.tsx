"use client"

import { useEffect } from "react"
import { ErrorPageShell } from "@/components/layout/error-page-shell"
import { HttpStatusErrorPanel } from "@/components/layout/http-status-error-panel"
import { logClientError } from "@/lib/log-error"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error }: ErrorPageProps) {
  useEffect(() => {
    logClientError("app/error", error, { digest: error.digest })
  }, [error])

  return (
    <ErrorPageShell>
      <HttpStatusErrorPanel code={500} />
    </ErrorPageShell>
  )
}
