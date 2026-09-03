"use client"

import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowRight } from "lucide-react"
import { markdownComponents } from "@/components/markdown/markdown-components"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { CHAT_COLUMN_MAX, CHAT_MESSAGE_TEXT_CLASS } from "@/constants/chat-layout"
import { normalizeChatMarkdown } from "@/lib/chat-markdown"
import type { PublicChatShare } from "@/lib/chat-share-public"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { BRANDING } from "@/constants/branding"

export function SharedChatView({ share }: { share: PublicChatShare }) {
  const messages = (share.messages || []).filter(
    (m) => m.role === "user" || m.role === "assistant"
  )

  return (
    <main className="pb-24">
      <div
        className={cn(
          HOME_SHELL,
          CHAT_COLUMN_MAX,
          "px-4 pt-[calc(var(--home-landing-nav-height)+2.5rem)] sm:px-6"
        )}
      >
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          Shared chat
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {share.title || "Shared chat"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only snapshot from {BRANDING.productName}. Replies are not saved to this view.
        </p>

        <div className="mt-10 space-y-8">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">This shared chat has no messages.</p>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user"
              const text = (msg.content || "").trim()
              const attachmentNames =
                msg.attachments?.map((a) => a.filename).filter(Boolean) ?? []
              return (
                <article
                  key={msg.message_id || `${msg.role}-${msg.created_at}`}
                  className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,42rem)]",
                      isUser
                        ? "rounded-2xl bg-muted/70 px-4 py-3 text-foreground"
                        : "text-foreground"
                    )}
                  >
                    {!isUser ? (
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        {BRANDING.productName}
                      </p>
                    ) : null}
                    {text ? (
                      isUser ? (
                        <p className={cn(CHAT_MESSAGE_TEXT_CLASS, "whitespace-pre-wrap")}>{text}</p>
                      ) : (
                        <div className={CHAT_MESSAGE_TEXT_CLASS}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {normalizeChatMarkdown(text)}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : null}
                    {attachmentNames.length > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Attached: {attachmentNames.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </article>
              )
            })
          )}
        </div>

        <div className="mt-14 border-t border-border/60 pt-8">
          <p className="text-sm text-muted-foreground">
            Want to continue this conversation yourself?
          </p>
          <Link
            href={ROUTES.chat}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Start a chat on {BRANDING.productName}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  )
}
