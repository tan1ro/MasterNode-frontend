import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MarketingCard } from "@/components/marketing/marketing-page"
import { cn } from "@/lib/utils"

export interface HelpCardItem {
  title: string
  description: string
  href: string
  badge?: string
}

export function HelpCardGrid({
  items,
  className,
}: {
  items: HelpCardItem[]
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <Link key={item.title} href={item.href} className="group block h-full">
          <MarketingCard className="h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                {item.badge ? (
                  <span className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.badge}
                  </span>
                ) : null}
                <ArrowUpRight
                  className="size-4 text-muted-foreground/50 transition-colors group-hover:text-amber"
                  aria-hidden
                />
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </MarketingCard>
        </Link>
      ))}
    </div>
  )
}
