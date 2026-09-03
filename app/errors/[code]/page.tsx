import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpErrorPage } from "@/components/errors/http-error-page"
import {
  HTTP_ERROR_CODES,
  isHttpErrorCode,
  type HttpErrorCode,
} from "@/lib/http-errors"
import { httpStatusPageMetadata } from "@/lib/http-status-error-pages"
import { BACKEND_UNAVAILABLE_QUERY } from "@/lib/backend-unavailable"

interface PageProps {
  params: { code: string }
  searchParams?: { reason?: string; from?: string }
}

export function generateStaticParams() {
  return HTTP_ERROR_CODES.map((code) => ({ code: String(code) }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const code = parseInt(params.code, 10)
  if (!Number.isInteger(code) || !isHttpErrorCode(code)) {
    return { title: "Error" }
  }
  return httpStatusPageMetadata(code)
}

export default function HttpErrorCodePage({ params, searchParams }: PageProps) {
  const code = parseInt(params.code, 10)
  if (!Number.isInteger(code) || !isHttpErrorCode(code)) {
    notFound()
  }
  const backendUnavailable =
    code === 500 && searchParams?.reason === BACKEND_UNAVAILABLE_QUERY
  return (
    <HttpErrorPage
      code={code as HttpErrorCode}
      backendUnavailable={backendUnavailable}
      returnTo={searchParams?.from ?? null}
    />
  )
}
