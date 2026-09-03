"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HomeGridBackdrop } from "@/components/home/home-grid-backdrop"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { BrandLogoNav } from "@/components/layout/brand-logo"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import "./auth.css"

type AuthNavLink = {
  href: string
  label: string
  variant?: "primary" | "outline"
}

export function AuthPageShell({
  children,
  className,
  navLink,
  showBackToHome = true,
}: {
  children: React.ReactNode
  className?: string
  navLink?: AuthNavLink
  showBackToHome?: boolean
}) {
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
      <header className="auth-page-nav relative z-50 hidden shrink-0 border-b border-white/[0.08] bg-black/80 backdrop-blur-md md:block">
        <div className={cn(HOME_SHELL, "flex items-center justify-between gap-4 px-4 py-3 sm:px-6")}>
          <BrandLogoNav />
          {navLink ? (
            <Link
              href={navLink.href}
              className={cn(
                "auth-nav-btn",
                navLink.variant === "outline" ? "auth-nav-btn--outline" : "auth-nav-btn--primary"
              )}
            >
              {navLink.label}
            </Link>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-10 xl:px-14">
        {showBackToHome ? (
          <Link
            href={ROUTES.home}
            className="auth-page-back absolute left-4 top-4 z-20 hidden text-sm text-muted-foreground transition-colors hover:text-[#B0F900] md:inline-flex sm:left-6 lg:left-10 xl:left-14"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </span>
          </Link>
        ) : null}

        <div className="flex justify-center pt-5 md:hidden">
          <BrandLogoNav />
        </div>

        <div className="auth-page-body mx-auto my-auto flex w-full max-w-6xl flex-col items-center overflow-visible py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
