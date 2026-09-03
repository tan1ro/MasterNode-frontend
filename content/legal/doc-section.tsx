import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/** Major section within a legal document (supports in-page anchors). */
export function LegalDocSection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id?: string
  title: string
  icon?: LucideIcon
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-amber">
            <Icon className="size-[18px]" aria-hidden />
          </span>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
