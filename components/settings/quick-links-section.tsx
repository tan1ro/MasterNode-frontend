"use client"

import Link from "next/link"
import { BookOpen, Bot, Brain, KeyRound, Route } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/lib/routes"

const LINKS = [
  {
    href: ROUTES.apiKeys,
    icon: KeyRound,
    title: "API Keys",
    description: "MasterNode API key and per-provider LLM keys for model calls.",
  },
  {
    href: ROUTES.llmStrategy,
    icon: Route,
    title: "LLM Strategy",
    description: "Full routing priority editor and provider playbook.",
  },
  {
    href: ROUTES.memory,
    icon: Brain,
    title: "Memory",
    description: "Upload and enable documents used in chat and task responses.",
  },
  {
    href: ROUTES.agents,
    icon: Bot,
    title: "Assistants",
    description: "Attach specialists that shape chat answers and exportable deliverables.",
  },
  {
    href: ROUTES.docs,
    icon: BookOpen,
    title: "Documentation",
    description: "API reference, webhooks, and troubleshooting.",
  },
] as const

export function QuickLinksSection() {
  return (
    <Card variant="minimal" interactive={false} id="quick-links" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Integrations & related pages</CardTitle>
        <CardDescription>
          Keys, knowledge, and routing live on dedicated pages. Settings below controls defaults and browser behavior.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {LINKS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border/60 bg-muted/10 p-3 hover:border-amber/40 transition-colors"
          >
            <div className="flex gap-3">
              <Icon className="h-5 w-5 text-amber shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium group-hover:text-amber transition-colors">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
