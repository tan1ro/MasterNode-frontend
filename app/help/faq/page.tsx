"use client"

import { AlertTriangle, ArrowUpRight, FileQuestion, LifeBuoy } from "lucide-react"
import Link from "next/link"
import { HelpResourceLayout } from "@/components/help/help-resource-layout"
import { FaqList } from "@/components/help/faq-list"
import { ROUTES } from "@/lib/routes"

const FAQ_FOOTER_LINKS = [
  {
    href: ROUTES.errorsIndex,
    title: "HTTP status reference",
    description: "Every status code we return, what it means, and how to resolve it.",
    icon: AlertTriangle,
  },
  {
    href: ROUTES.support,
    title: "Contact support",
    description: "Still stuck? Reach our team and we'll help you out.",
    icon: LifeBuoy,
  },
] as const

export default function FaqPage() {
  return (
    <HelpResourceLayout
      title="FAQ"
      description="Answers to common questions about chat, tasks, billing, and the API."
      icon={FileQuestion}
    >
      <FaqList />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FAQ_FOOTER_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/50 hover:bg-card/70"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-primary">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-foreground">{link.title}</h3>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{link.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </HelpResourceLayout>
  )
}
