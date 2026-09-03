"use client"

import Link from "next/link"
import { KeyRound, BookOpen, ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { MultiLlmStrategyForm } from "@/components/llm-strategy"
import { Callout } from "@/components/ui/callout"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES, API_DOCS_URL } from "@/lib/routes"

export default function LlmStrategyPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <PageHeader
        title="LLM strategy"
        description="See what actually drives model choice in production runs, and keep a personal provider priority and routing policy in this browser."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5 min-w-0">
          <div className="rounded-lg border border-border bg-muted/15 p-4 sm:p-5 text-sm text-muted-foreground space-y-3">
            <p>
              <span className="text-foreground font-medium">What this page is for.</span> MasterNode runs each
              pipeline stage against the models you configure on tasks and agent templates, using the API keys you
              store for your tenant. This screen adds a <span className="text-foreground">workspace playbook</span>:
              an ordered list of provider + model pairs and policy toggles that describe how you <em>want</em> traffic
              to behave—useful for planning, demos, or wiring your own client that reads the same{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">localStorage</code> key.
            </p>
            <p>
              <span className="text-foreground font-medium">What affects live runs today.</span> Valid keys on{" "}
              <Link href={ROUTES.apiKeys} className="text-amber hover:underline">
                API Keys
              </Link>
              , per-task / template model fields, and server-side settings (for example parallel multi-provider
              aggregation when several keys exist). The form below does <span className="text-foreground">not</span>{" "}
              replace those—it is not sent to the backend automatically yet.
            </p>
          </div>

          <Callout type="info" title="Production behavior (summary)">
            <ul className="list-disc pl-4 space-y-1.5 text-foreground/90">
              <li>
                Calls use the models attached to your task or agent templates, subject to keys you have configured.
              </li>
              <li>
                When multiple provider keys are available, the service may invoke them in parallel for a stage and
                aggregate responses—see{" "}
                <code className="text-xs bg-background/80 px-1 py-0.5 rounded border border-border/60">
                  USE_MULTI_LLM_AGGREGATE
                </code>{" "}
                in the backend README / deployment env.
              </li>
              <li>
                Fine-grained temperature and model IDs still come from templates and API payloads, not from this page.
              </li>
            </ul>
          </Callout>

          <Callout type="note" title="About the form on the right">
            <p>
              Routing priority and checkboxes are saved only in this browser under a fixed key (shown at the bottom of
              the form). Treat them as documentation and a future hook for tenant-level routing—not as the live
              orchestration config unless you explicitly integrate them.
            </p>
          </Callout>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={ROUTES.apiKeys} className="block group">
              <Card noGrid className="h-full transition-colors group-hover:border-amber/40">
                <CardContent className="pt-5 flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm mb-0.5 group-hover:text-amber transition-colors">API Keys</h2>
                    <p className="text-xs text-muted-foreground">Add providers so runs can reach real models.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.docs} className="block group">
              <Card noGrid className="h-full transition-colors group-hover:border-amber/40">
                <CardContent className="pt-5 flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm mb-0.5 group-hover:text-amber transition-colors">
                      Product docs
                    </h2>
                    <p className="text-xs text-muted-foreground">Tasks, agents, and APIs.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-amber hover:underline"
          >
            Open backend Swagger
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          <MultiLlmStrategyForm />
        </div>
      </div>
    </div>
  )
}
