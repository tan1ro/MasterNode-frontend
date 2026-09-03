import type { ClientChannel } from "@/types/api"

/** UI labels for the ``web`` vs ``api`` task/usage/log filters (values stay ``web`` | ``api`` for the API). */
export const CLIENT_CHANNEL_UI: Record<ClientChannel, string> = {
  web: "In-App",
  api: "API",
}

export function clientChannelLabel(ch: ClientChannel | string | undefined | null): string {
  if (ch === "web" || ch === "api") return CLIENT_CHANNEL_UI[ch]
  return ""
}
