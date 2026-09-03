import { cn } from "@/lib/utils"

export function HomeSectionHeader({
  sectionNum,
  sectionTag,
  title,
  titleAccent,
  accentClass,
  description,
  align = "left",
  id,
}: {
  sectionNum: string
  sectionTag: string
  title: string
  titleAccent?: string
  accentClass?: string
  description: string
  align?: "left" | "right"
  id?: string
}) {
  return (
    <header
      className={cn(
        "mb-8 sm:mb-10",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <p className="font-mono text-[11px] lowercase tracking-[0.2em] text-muted-foreground">
        {sectionNum} — {sectionTag}
      </p>
      <h2
        id={id}
        className="mt-2 font-heading text-2xl font-semibold uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl"
      >
        {title}
        {titleAccent != null && accentClass != null ? (
          <>
            {" "}
            <span className={accentClass}>{titleAccent}</span>
          </>
        ) : null}
      </h2>
      <p
        className={cn(
          "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base",
          align === "right" ? "ml-auto" : ""
        )}
      >
        {description}
      </p>
    </header>
  )
}

export function HomeSectionDivider() {
  return (
    <div className="overflow-x-hidden px-4 sm:px-6 lg:px-10" aria-hidden>
      <div className="mx-auto w-full max-w-7xl py-4 sm:py-6">
        <div className="h-px w-full bg-border" />
      </div>
    </div>
  )
}
