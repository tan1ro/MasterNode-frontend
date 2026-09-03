import { cn } from "@/lib/utils"

const TRUST_AVATAR_COLORS = ["#F5C842", "#2DCFCF", "#7B5EA7"] as const

export function HomeHeroTrustStrip({
  className,
  textClassName,
  style,
}: {
  className?: string
  textClassName?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn("home-hero-trust flex items-center justify-center gap-3", className)}
      style={style}
    >
      <div className="home-hero-trust-avatars flex items-center" aria-hidden>
        {TRUST_AVATAR_COLORS.map((color, index) => (
          <span
            key={color}
            className="home-hero-trust-avatar size-7 shrink-0 border-2 border-background sm:size-8"
            style={{ backgroundColor: color, zIndex: TRUST_AVATAR_COLORS.length - index }}
          />
        ))}
      </div>
      <p className={cn("text-[0.9375rem] text-muted-foreground sm:text-base", textClassName)}>
        Trusted by <span className="font-semibold text-foreground">50+</span> users
      </p>
    </div>
  )
}

export function HomeHeroScrollHint({ className }: { className?: string }) {
  return (
    <div className={cn("home-hero-scroll-hint flex flex-col items-center gap-2", className)}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60 sm:text-xs">
        Scroll
      </span>
      <div
        className="h-10 w-px bg-gradient-to-b from-[#2DCFCF]/50 to-transparent"
        aria-hidden
      />
    </div>
  )
}
