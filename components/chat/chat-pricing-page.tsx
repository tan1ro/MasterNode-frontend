"use client"

import Link from "next/link"
import { ArrowLeft, CreditCard } from "lucide-react"
import { HomePricing } from "@/components/home/home-pricing"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { useAppAuth } from "@/hooks/use-app-auth"
import { chatSignUpHref } from "@/lib/chat-auth-links"
import { normalizeAccountType } from "@/lib/account-types"
import { plansPricingHref } from "@/lib/chat-path"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface ChatPricingPageProps {
  chatId?: string | null
  className?: string
}

export function ChatPricingPage({ chatId, className }: ChatPricingPageProps) {
  const { isSignedIn, accountType } = useAppAuth()
  const backHref = chatId ? ROUTES.chatConversation(chatId) : ROUTES.chat
  const pricingHref = plansPricingHref(chatId)
  const defaultAudience = normalizeAccountType(accountType, "creator") === "business" ? "business" : "creator"

  return (
    <div
      className={cn(
        "relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-background font-sans text-foreground",
        HOME_FONT_CLASS,
        className
      )}
    >
      <div className="home-landing-grid pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-100" aria-hidden />
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to chat
        </Link>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href={ROUTES.billing}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber hover:underline"
            >
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Billing & usage
            </Link>
          ) : (
            <Link
              href={chatSignUpHref(pricingHref)}
              className="text-xs font-medium text-amber hover:underline"
            >
              Sign up
            </Link>
          )}
        </div>
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <HomePricing
          embedded
          defaultRole={defaultAudience}
          className="pb-12"
          tierHref={pricingHref}
          signUpHref={chatSignUpHref(pricingHref)}
        />
      </div>
    </div>
  )
}
