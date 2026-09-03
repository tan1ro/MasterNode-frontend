"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HelpCircle, Settings, Sparkles } from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { SidebarNavItem } from "@/components/chat/sidebar/chat-sidebar-nav"
import { chatSignInHref } from "@/lib/chat-auth-links"
import {
  SIDEBAR_INSET_X_CLASS,
  SIDEBAR_NAV_LIST_GAP_CLASS,
  SIDEBAR_META_TEXT_CLASS,
  SIDEBAR_SECTION_TEXT_CLASS,
  SIDEBAR_TEXT_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

/** Recents area when the user is not signed in. */
export function ChatSidebarGuestChatsSection() {
  const pathname = usePathname()
  const signInHref = chatSignInHref(pathname)

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col pt-2", SIDEBAR_INSET_X_CLASS)}>
      <h2 className={cn("px-2.5 pb-1.5 pt-4", SIDEBAR_SECTION_TEXT_CLASS, "text-foreground")}>
        Chats
      </h2>
      <div
        className={cn(
          "rounded-[10px] border border-border/50 bg-muted/30 p-4",
          "flex flex-col gap-2"
        )}
      >
        <p className={cn("font-semibold text-foreground", SIDEBAR_TEXT_CLASS)}>
          Sign in to start saving your chats
        </p>
        <p className={SIDEBAR_META_TEXT_CLASS}>
          Once you&apos;re signed in, you can access your recent chats here.
        </p>
        <Link
          href={signInHref}
          className={cn(
            "mt-1 w-fit font-semibold text-primary hover:underline underline-offset-4",
            SIDEBAR_TEXT_CLASS
          )}
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

/** Bottom of expanded sidebar for guests (quick links only). */
export function ChatSidebarGuestFooter() {
  const { openSettings } = useAppShell()

  return (
    <nav
      className={cn(SIDEBAR_NAV_LIST_GAP_CLASS, "flex w-full flex-col py-2", SIDEBAR_INSET_X_CLASS)}
      aria-label="Guest menu"
    >
      <SidebarNavItem href={ROUTES.pricing} label="See Plans & Pricing" icon={Sparkles} />
      <SidebarNavItem label="Settings" icon={Settings} onClick={() => openSettings()} />
      <SidebarNavItem href={ROUTES.help} label="Help" icon={HelpCircle} />
    </nav>
  )
}
