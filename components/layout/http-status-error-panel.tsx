"use client"

import Link from "next/link"
import {
  BookOpen,
  Home,
  LayoutDashboard,
  LogIn,
  RefreshCw,
  LifeBuoy,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CardAccent } from "@/components/ui/card"
import { ROUTES } from "@/lib/routes"
import { getHttpErrorPageDefinition } from "@/lib/http-status-error-pages"
import type { HttpErrorCode } from "@/lib/http-errors"
import { cn } from "@/lib/utils"
import { BackendUnavailableRecovery } from "@/components/errors/backend-unavailable-recovery"

const titleAccentClass: Record<CardAccent, string> = {
  violet: "text-violet",
  amber: "text-amber",
  destructive: "text-destructive",
  cyan: "text-[#2DCFCF]",
  emerald: "text-emerald",
  sky: "text-sky",
  oc: "text-oc",
}

const iconWrapClass: Record<CardAccent, string> = {
  violet: "bg-violet/10 text-violet border border-violet/20",
  amber: "bg-amber/10 text-amber border border-amber/20",
  destructive: "bg-destructive/15 text-destructive border border-destructive/25",
  cyan: "bg-cyan/10 text-cyan border border-cyan/20",
  emerald: "bg-emerald/10 text-emerald border border-emerald/20",
  sky: "bg-sky/10 text-sky border border-sky/20",
  oc: "bg-oc/10 text-oc border border-oc/20",
}

export interface HttpStatusErrorPanelProps {
  code: HttpErrorCode
  backendUnavailable?: boolean
  returnTo?: string | null
}

export function HttpStatusErrorPanel({
  code,
  backendUnavailable = false,
  returnTo,
}: HttpStatusErrorPanelProps) {
  const def = getHttpErrorPageDefinition(code)
  const Icon = def.icon
  const ta = titleAccentClass[def.accent]
  const iw = iconWrapClass[def.accent]
  const codeClassName =
    code === 404 ? "text-gradient-oc" : "text-gradient-amber"

  return (
    <div className="w-full max-w-5xl px-1">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[#8B92A9]">
        {def.secLabel}
      </p>
      <div className="auth-surface p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 lg:min-w-[11rem] lg:border-r lg:border-white/10 lg:pr-10">
            <p
              className={cn(
                "text-6xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl",
                codeClassName
              )}
            >
              {code}
            </p>
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${iw}`}>
              <Icon className="h-8 w-8" aria-hidden />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-[#F0F2F8] sm:text-3xl">
              {backendUnavailable ? (
                <>
                  Backend <span className={ta}>unavailable</span>
                </>
              ) : (
                <>
                  {def.heading ? <span>{def.heading}</span> : null}
                  <span className={ta}>{def.headingAccent}</span>
                  {def.headingRest ? <span>{def.headingRest}</span> : null}
                </>
              )}
            </h1>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-[#8B92A9] sm:text-base">
              {backendUnavailable
                ? "The MasterNode API is not reachable right now — it may be stopped or another app may be using the API port. We will keep checking and bring you back automatically when the backend is healthy."
                : def.description}
            </p>

            {backendUnavailable ? <BackendUnavailableRecovery returnTo={returnTo} /> : null}

            <div className="mb-8 flex w-full flex-row flex-wrap justify-center gap-3 lg:justify-start">
              {def.showReload ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="auth-submit sm:min-w-[10rem]"
                >
                  <RefreshCw className="mr-2 h-5 w-5" aria-hidden />
                  Reload page
                </Button>
              ) : null}
              {code === 401 ? (
                <Link href={ROUTES.signIn}>
                  <Button size="lg" className="auth-submit sm:min-w-[10rem]">
                    <LogIn className="mr-2 h-5 w-5" aria-hidden />
                    Sign in
                  </Button>
                </Link>
              ) : null}
              <Link href={ROUTES.home}>
                <Button
                  size="lg"
                  variant={def.showReload || code === 401 ? "outline" : "default"}
                  className={cn(
                    "sm:min-w-[10rem]",
                    def.showReload || code === 401 ? "auth-outline-btn" : "auth-submit"
                  )}
                >
                  <Home className="mr-2 h-5 w-5" aria-hidden />
                  Home
                </Button>
              </Link>
              <Link href={ROUTES.dashboard}>
                <Button variant="outline" size="lg" className="auth-outline-btn sm:min-w-[10rem]">
                  <LayoutDashboard className="mr-2 h-5 w-5" aria-hidden />
                  Dashboard
                </Button>
              </Link>
              {code === 401 ? (
                <Link href={ROUTES.signUp}>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-[#8B92A9] hover:bg-white/5 hover:text-[#F0F2F8]"
                  >
                    Create account
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="w-full border-t border-white/10 pt-6 lg:pt-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[#8B92A9] lg:text-left">
                Helpful links
              </p>
              <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                <li>
                  <Link
                    href={ROUTES.docs}
                    className="inline-flex items-center gap-2 text-sm text-[#8B92A9] transition-colors hover:text-[#F0F2F8]"
                  >
                    <BookOpen className={cn("h-4 w-4 shrink-0", ta)} aria-hidden />
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.help}
                    className="inline-flex items-center gap-2 text-sm text-[#8B92A9] transition-colors hover:text-[#F0F2F8]"
                  >
                    <LifeBuoy className={cn("h-4 w-4 shrink-0", ta)} aria-hidden />
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.contact}
                    className="inline-flex items-center gap-2 text-sm text-[#8B92A9] transition-colors hover:text-[#F0F2F8]"
                  >
                    <Mail className={cn("h-4 w-4 shrink-0", ta)} aria-hidden />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.errorsIndex}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm underline underline-offset-2 hover:text-[#F0F2F8]",
                      ta
                    )}
                  >
                    All HTTP errors
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
