export { ChatSidebarFooter as ChatSidebarAccount } from "@/components/chat/sidebar/chat-sidebar-footer"

import { ChatSidebarFooter } from "@/components/chat/sidebar/chat-sidebar-footer"

/** @deprecated Use ChatSidebarFooter */
export function ChatSidebarRailUser() {
  return <ChatSidebarFooter variant="rail" />
}
