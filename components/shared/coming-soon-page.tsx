import Link from "next/link"
import type { ComponentType, ReactNode } from "react"
import { ArrowLeft, Clock3 } from "lucide-react"
import { MarketingHero } from "@/components/marketing/marketing-page"
import { PageHeader } from "@/components/shared/page-header"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export interface ComingSoonPageProps {
  title: string
  description: string
  /** Marketing pages: hero eyebrow label. */
  eyebrow?: string
  icon?: ComponentType<{ className?: string }>
  variant?: "marketing" | "workspace" | "help"
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
}

function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber/35 bg-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber",
        className
      )}
    >
      <Clock3 className="h-3.5 w-3.5" aria-hidden />
      Coming soon
    </span>
  )
}

function DefaultActions() {
  return (
    <>
      <Link
        href={ROUTES.chat}
        className="home-cta-gradient inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-[#0A0A14]"
      >
        Open workspace
      </Link>
      <Link
        href={ROUTES.contact}
        className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber"
      >
        Contact us
      </Link>
    </>
  )
}

export function ComingSoonPage({
  title,
  description,
  eyebrow,
  icon: Icon,
  variant = "marketing",
  backHref,
  backLabel = "Back",
  actions,
  className,
}: ComingSoonPageProps) {
  if (variant === "workspace") {
    return (
      <div className={className}>
        <PageHeader title={title} description={description} />
        <div className="flex flex-col items-center py-12 text-center">
          <ComingSoonBadge className="mb-4" />
          {actions ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <DefaultActions />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === "help") {
    return (
      <main className={cn("min-h-screen", className)}>
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← {backLabel}
            </Link>
          ) : null}
          <div className="mb-8 mt-3 flex items-center gap-3">
            {Icon ? (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
            ) : null}
            <div>
              <div className="mb-2">
                <ComingSoonBadge />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-1 text-white/60">{description}</p>
            </div>
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            {actions ? (
              <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <DefaultActions />
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={cn("pb-24", className)}>
      <MarketingHero
        eyebrow={eyebrow ?? title}
        title="Coming soon"
        description={description}
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {backLabel}
              </Link>
            ) : null}
            {actions ?? <DefaultActions />}
          </div>
        }
      />
    </main>
  )
}
