import type { Metadata } from "next"
import { ErrorPageShell } from "@/components/layout/error-page-shell"
import { HttpErrorsIndex } from "@/components/errors/http-errors-index"

export const metadata: Metadata = {
  title: "HTTP status codes — MasterNode",
  description:
    "Reference pages for documented HTTP client and server errors. Aligns with statuses the MasterNode API may return (see each code page for API context where applicable).",
}

export default function HttpErrorsIndexPage() {
  return (
    <ErrorPageShell>
      <HttpErrorsIndex />
    </ErrorPageShell>
  )
}
