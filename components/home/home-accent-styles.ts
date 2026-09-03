export const HOME_SHELL = "mx-auto w-full max-w-7xl"
export const PRICING_SHELL = "mx-auto w-full max-w-7xl"

export const homePillButton =
  "rounded-full border border-foreground/25 px-4 py-1.5 text-xs lowercase tracking-wide transition-colors hover:border-amber/50 hover:text-amber"

export const homePillButtonActive =
  "rounded-full border border-amber/40 bg-amber/10 px-4 py-1.5 text-xs lowercase tracking-wide text-amber"

export const homeMinimalPanel =
  "rounded-lg border border-border bg-background/40 p-5 sm:p-6"

/** Pipeline stage detail — large card (numeral straddles left edge via wrapper) */
export const homePipelineStageBox =
  "relative z-0 w-full rounded-[2rem] border border-border bg-background px-8 py-12 text-right sm:px-10 sm:py-14 md:min-h-[18rem] md:px-12 md:py-16 lg:min-h-[20rem] lg:px-14 lg:py-20"

export const homePipelineStageWrap =
  "relative w-full overflow-visible md:ml-auto md:max-w-2xl lg:max-w-3xl xl:max-w-[42rem]"

export const accentMap: Record<
  string,
  { icon: string; title: string; dot: string }
> = {
  amber: {
    icon: "bg-amber/10 text-amber border border-amber/25",
    title: "text-amber",
    dot: "bg-amber",
  },
  cyan: {
    icon: "bg-cyan/10 text-cyan border border-cyan/25",
    title: "text-cyan",
    dot: "bg-cyan",
  },
  violet: {
    icon: "bg-violet/10 text-violet border border-violet/25",
    title: "text-violet",
    dot: "bg-violet",
  },
  emerald: {
    icon: "bg-emerald/10 text-emerald border border-emerald/25",
    title: "text-emerald",
    dot: "bg-emerald",
  },
  sky: {
    icon: "bg-sky/10 text-sky border border-sky/25",
    title: "text-sky",
    dot: "bg-sky",
  },
  oc: {
    icon: "bg-oc/10 text-oc border border-oc/25",
    title: "text-oc",
    dot: "bg-oc",
  },
}
