"use client"

import type { LucideIcon } from "lucide-react"
import { SidebarNavItem } from "@/components/chat/sidebar/chat-sidebar-nav"

/** @deprecated Use SidebarNavItem from sidebar module */
export function ChatSidebarNavButton({
  label,
  icon,
  onClick,
  active = false,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  active?: boolean
}) {
  return <SidebarNavItem label={label} icon={icon} onClick={onClick} active={active} />
}
