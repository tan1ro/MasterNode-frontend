"use client"

import Link from "next/link"
import { ExternalLink, LifeBuoy } from "lucide-react"
import { ChatAccountFlyoutRow } from "@/components/chat/sidebar/chat-account-flyout-row"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_SECTION_BORDER_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import {
  ACCOUNT_HELP_MENU_SECTIONS,
  type AccountHelpMenuAction,
} from "@/constants/account-help-menu"
import { isMacPlatform, shortcutsMenuHint } from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

export function ChatAccountHelpMenu({
  onClose,
  useFixedFlyout = true,
  onAction,
}: {
  onClose: () => void
  useFixedFlyout?: boolean
  onAction?: (action: AccountHelpMenuAction) => void
}) {
  const shortcutHint = shortcutsMenuHint(isMacPlatform())

  return (
    <ChatAccountFlyoutRow
      label="Get help"
      icon={LifeBuoy}
      useFixedFlyout={useFixedFlyout}
      submenuLabel="Help"
    >
      {ACCOUNT_HELP_MENU_SECTIONS.map((section, sectionIndex) => (
        <div
          key={section.items[0]?.key ?? sectionIndex}
          className={cn(
            sectionIndex > 0 && cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1"),
            sectionIndex === 0 && "py-1"
          )}
        >
          {section.items.map((item) => {
            const className = SIDEBAR_MENU_ITEM_CLASS
            const showOutboundIcon = Boolean(item.outbound || item.external)

            if (item.action) {
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onAction?.(item.action!)
                    onClose()
                  }}
                  className={className}
                >
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  {item.action === "keyboard-shortcuts" ? (
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {shortcutHint}
                    </span>
                  ) : null}
                </button>
              )
            }

            if (!item.href) return null

            return (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={onClose}
                className={className}
              >
                <span className="flex-1 truncate">{item.label}</span>
                {showOutboundIcon ? (
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
    </ChatAccountFlyoutRow>
  )
}
