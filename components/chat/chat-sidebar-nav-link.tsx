"use client"

import type { LucideIcon } from "lucide-react"
import { SidebarNavItem } from "@/components/chat/sidebar/chat-sidebar-nav"

/** @deprecated Use SidebarNavItem from sidebar module */
export function ChatSidebarNavLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string
  label: string
  icon: LucideIcon
  onClick?: () => void
}) {
  return <SidebarNavItem href={href} label={label} icon={icon} onClick={onClick} />
}
