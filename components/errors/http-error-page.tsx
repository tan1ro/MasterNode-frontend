import { ErrorPageShell } from "@/components/layout/error-page-shell"
import { HttpStatusErrorPanel } from "@/components/layout/http-status-error-panel"
import type { HttpErrorCode } from "@/lib/http-errors"

/** Canonical UI for `/errors/[code]` and `not-found`. */
export function HttpErrorPage({
  code,
  backendUnavailable = false,
  returnTo,
}: {
  code: HttpErrorCode
  backendUnavailable?: boolean
  returnTo?: string | null
}) {
  return (
    <ErrorPageShell>
      <HttpStatusErrorPanel
        code={code}
        backendUnavailable={backendUnavailable}
        returnTo={returnTo}
      />
    </ErrorPageShell>
  )
}
