"use client"

import Link from "next/link"
import { AlertTriangle, Home, LayoutDashboard, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES, httpErrorRoute } from "@/lib/routes"

export interface ApplicationErrorPanelProps {
  error: Error & { digest?: string }
  reset: () => void
  /** Set when rendered from `global-error` (root layout failed — no chrome). */
  rootLayoutFailed?: boolean
}

export function ApplicationErrorPanel({
  error,
  reset,
  rootLayoutFailed,
}: ApplicationErrorPanelProps) {
  return (
    <div className="w-full max-w-5xl px-1">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[#8B92A9]">
        {rootLayoutFailed ? "SYSTEM — CRITICAL" : "SYSTEM — RECOVERY"}
      </p>
      <div className="auth-surface p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 lg:min-w-[11rem] lg:border-r lg:border-white/10 lg:pr-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-destructive/25 bg-destructive/15 text-destructive">
              <AlertTriangle className="h-10 w-10" aria-hidden />
            </div>
            <p className="text-4xl font-black leading-none tracking-tight text-gradient-amber sm:text-5xl">
              !
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#F0F2F8] sm:text-4xl">
              <span className="text-gradient-amber">Error</span>
            </h1>
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-[#8B92A9] sm:text-base">
              {rootLayoutFailed
                ? "App failed to load. Retry or go home."
                : "Something went wrong. Retry or go back."}
            </p>
            {process.env.NODE_ENV === "development" && error?.message ? (
              <p className="mb-4 w-full max-w-xl break-words rounded-md border border-white/10 bg-black/40 p-3 text-left font-mono text-xs text-[#8B92A9]">
                {error.message}
              </p>
            ) : null}
            {error?.digest ? (
              <p className="mb-8 text-xs text-[#8B92A9]">
                Reference{" "}
                <span className="font-mono text-[#F0F2F8]">{error.digest}</span>
              </p>
            ) : null}

            <div className="mb-6 flex w-full flex-row flex-wrap justify-center gap-3 lg:justify-start">
              <Button size="lg" onClick={reset} className="auth-submit sm:min-w-[10rem]">
                <RotateCcw className="mr-2 h-5 w-5" aria-hidden />
                Try again
              </Button>
              <Link href={ROUTES.dashboard}>
                <Button variant="outline" size="lg" className="auth-outline-btn sm:min-w-[10rem]">
                  <LayoutDashboard className="mr-2 h-5 w-5" aria-hidden />
                  Dashboard
                </Button>
              </Link>
              <Link href={ROUTES.home}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-[#8B92A9] hover:bg-white/5 hover:text-[#F0F2F8] sm:min-w-[10rem]"
                >
                  <Home className="mr-2 h-5 w-5" aria-hidden />
                  Home
                </Button>
              </Link>
            </div>

            <p className="w-full border-t border-white/10 pt-6 text-xs leading-relaxed text-[#8B92A9] lg:text-left">
              <Link href={ROUTES.errorsIndex} className="underline underline-offset-2 hover:text-[#F0F2F8]">
                HTTP status reference
              </Link>
              {" · "}
              <Link href={httpErrorRoute(500)} className="underline underline-offset-2 hover:text-[#F0F2F8]">
                HTTP 500
              </Link>
              {" · "}
              <Link href={httpErrorRoute(503)} className="underline underline-offset-2 hover:text-[#F0F2F8]">
                HTTP 503
              </Link>
              {" · "}
              <Link href={ROUTES.docs} className="underline underline-offset-2 hover:text-[#F0F2F8]">
                Docs
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
