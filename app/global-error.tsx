"use client"

import { useEffect } from "react"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { ErrorPageShell } from "@/components/layout/error-page-shell"
import { HttpStatusErrorPanel } from "@/components/layout/http-status-error-panel"
import { logClientError } from "@/lib/log-error"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    logClientError("app/global-error", error, { digest: error.digest })
  }, [error])

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ErrorPageShell>
            <HttpStatusErrorPanel code={500} />
          </ErrorPageShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
