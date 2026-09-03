"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import Link from "next/link"
import { HomePricing } from "@/components/home/home-pricing"
import { HomeGridBackdrop } from "@/components/home/home-grid-backdrop"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface ChatPricingModalProps {
  open: boolean
  onClose: () => void
  /** When signed in, plan CTAs go to billing. */
  signedIn?: boolean
}

export function ChatPricingModal({ open, onClose, signedIn = false }: ChatPricingModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={cn(
        "home-landing dark fixed inset-0 z-[110] flex flex-col overflow-hidden bg-black/95 font-sans text-foreground backdrop-blur-sm",
        HOME_FONT_CLASS
      )}
      role="presentation"
    >
      <HomeGridBackdrop />
      <button
        type="button"
        aria-label="Close pricing"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <h2 className="text-sm font-semibold">Plans & pricing</h2>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              href={ROUTES.billing}
              onClick={onClose}
              className="text-xs font-medium text-amber hover:underline"
            >
              Billing
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <HomePricing
          className="pb-12"
          embedded
          defaultRole="creator"
          tierHref={signedIn ? ROUTES.billing : ROUTES.signUp}
        />
      </div>
    </div>
  )
}
