"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HomeGridBackdrop } from "@/components/home/home-grid-backdrop"
import { HomeScrollSquares } from "@/components/home/home-scroll-squares"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import "@/components/auth/auth.css"

interface ErrorPageShellProps {
  children: ReactNode
  className?: string
  showBackToHome?: boolean
}

/**
 * Shared shell for error / not-found views — matches home landing and auth page chrome.
 */
export function ErrorPageShell({
  children,
  className,
  showBackToHome = true,
}: ErrorPageShellProps) {
  useEffect(() => {
    document.documentElement.classList.add("auth-page-open")
    document.body.classList.add("auth-page-open")
    return () => {
      document.documentElement.classList.remove("auth-page-open")
      document.body.classList.remove("auth-page-open")
    }
  }, [])

  return (
    <div
      className={cn(
        "auth-page home-landing dark relative isolate flex h-svh flex-col overflow-hidden bg-black font-sans text-foreground",
        HOME_FONT_CLASS,
        className
      )}
    >
      <HomeGridBackdrop />
      <div className="auth-page-ambient-glow" aria-hidden />
      <HomeScrollSquares fixed revealedOnMount count={12} orientation="horizontal" />

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-10 xl:px-14">
        {showBackToHome ? (
          <Link
            href={ROUTES.home}
            className="auth-page-back sticky top-4 z-20 mb-4 w-fit text-sm text-muted-foreground transition-colors hover:text-[#B0F900]"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </span>
          </Link>
        ) : null}

        <div className="auth-page-body mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col items-center justify-start overflow-visible py-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
