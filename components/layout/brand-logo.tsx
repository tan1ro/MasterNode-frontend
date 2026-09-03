import Link from "next/link"
import Image from "next/image"
import { BRANDING } from "@/constants/branding"
import {
  MASTERNODE_WORDMARK,
  MASTERNODE_WORDMARK_DARK,
  PI_MARK,
} from "@/constants/branding-assets"
import { cn } from "@/lib/utils"

const SIZE_CLASS = {
  /** Nav π mark on phone / tablet */
  xs: "h-4 w-4",
  sm: "h-4 w-4",
  /** Nav / compact wordmark height (full SVG incl. tagline) */
  md: "h-9 xl:h-10",
  lg: "h-12 xl:h-14",
  /** Footer / hero placements */
  xl: "h-16 sm:h-20 xl:h-24",
} as const

/** Max display width for full horizontal wordmark SVG (incl. tagline). */
const WORDMARK_MAX_W = {
  sm: "max-w-[11rem]",
  md: "max-w-[13.5rem] xl:max-w-[15.5rem]",
  lg: "max-w-[18rem] xl:max-w-[22rem]",
  xl: "max-w-[24rem] sm:max-w-[28rem] xl:max-w-[32rem]",
} as const

export type BrandLogoSize = keyof typeof SIZE_CLASS
export type BrandLogoVariant = "full" | "icon"

export interface BrandLogoProps {
  className?: string
  /** full = black/white wordmark SVG with tagline; icon = π app mark only */
  variant?: BrandLogoVariant
  /** sm = compact; md = nav; lg = large; xl = footer */
  size?: BrandLogoSize
  /** @deprecated Tagline is baked into the wordmark SVG — kept for API compat. */
  showTagline?: boolean
  /** Show Beta superscript beside the wordmark. Defaults to BRANDING.isBeta. */
  showBeta?: boolean
  asLink?: boolean
  /** Preload above-the-fold wordmarks (sidebar header, nav). */
  priority?: boolean
}

export function BetaBadge({ className }: { className?: string }) {
  if (!BRANDING.isBeta) {
    return null
  }

  return (
    <sup
      className={cn(
        "ml-0.5 align-super text-[0.58em] font-semibold uppercase leading-none tracking-wide text-amber",
        className
      )}
    >
      Beta
    </sup>
  )
}

/**
 * Sit BETA just after `.ai` — nudged left for optical proximity to the wordmark.
 */
const WORDMARK_BETA_CLASS =
  "absolute left-[88%] top-[2%] ml-0 align-top text-[8px] font-semibold leading-none tracking-wide sm:left-[89%] sm:top-[3%] sm:text-[9px]"

export function BrandPiMark({
  className,
  size = "md",
  markClassName,
  showBeta = BRANDING.isBeta,
}: {
  className?: string
  size?: BrandLogoSize
  markClassName?: string
  showBeta?: boolean
}) {
  return (
    <span className={cn("inline-flex items-start", className)}>
      <PiMark size={size} title="" className={markClassName} />
      {showBeta ? (
        <BetaBadge className="ml-0.5 mt-0.5 text-[7px] leading-none sm:text-[8px]" />
      ) : null}
    </span>
  )
}

export function PiMark({
  className,
  size = "md",
  title,
}: {
  className?: string
  size?: BrandLogoSize
  /** Defaults to product name; pass "" for decorative (aria-hidden). */
  title?: string
}) {
  const label = title === "" ? undefined : title ?? BRANDING.productName
  return (
    <Image
      src={PI_MARK.src}
      alt={label ?? ""}
      width={PI_MARK.width}
      height={PI_MARK.height}
      unoptimized
      aria-hidden={label ? undefined : true}
      className={cn("aspect-square shrink-0 object-contain", SIZE_CLASS[size], className)}
    />
  )
}

function WordmarkImages({
  heightClass,
  maxWClass,
  priority = false,
}: {
  heightClass: string
  maxWClass: string
  priority?: boolean
}) {
  return (
    <>
      <Image
        src={MASTERNODE_WORDMARK.src}
        alt={BRANDING.productName}
        width={MASTERNODE_WORDMARK.width}
        height={MASTERNODE_WORDMARK.height}
        unoptimized
        priority={priority}
        className={cn(
          "h-auto w-auto object-contain object-left dark:hidden",
          heightClass,
          maxWClass
        )}
      />
      <Image
        src={MASTERNODE_WORDMARK_DARK.src}
        alt={BRANDING.productName}
        width={MASTERNODE_WORDMARK_DARK.width}
        height={MASTERNODE_WORDMARK_DARK.height}
        unoptimized
        priority={priority}
        className={cn(
          "hidden h-auto w-auto object-contain object-left dark:block",
          heightClass,
          maxWClass
        )}
      />
    </>
  )
}

function BrandLogoFull({
  className,
  size = "md",
  showBeta = BRANDING.isBeta,
  priority = false,
}: Pick<BrandLogoProps, "className" | "size" | "showBeta" | "priority">) {
  const heightClass = SIZE_CLASS[size]
  const maxWKey =
    size === "xl" ? "xl" : size === "lg" ? "lg" : size === "sm" ? "sm" : "md"
  const preload = priority || size === "md"

  return (
    <span className={cn("relative inline-flex min-w-0 items-center pr-7 sm:pr-8", className)}>
      <WordmarkImages
        heightClass={heightClass}
        maxWClass={WORDMARK_MAX_W[maxWKey]}
        priority={preload}
      />
      {showBeta ? <BetaBadge className={WORDMARK_BETA_CLASS} /> : null}
    </span>
  )
}

function BrandLogoInner({
  className,
  variant = "full",
  size = "md",
  showBeta = BRANDING.isBeta,
  priority = false,
}: Omit<BrandLogoProps, "asLink" | "showTagline">) {
  if (variant === "icon") {
    return <PiMark className={className} size={size} />
  }

  return (
    <BrandLogoFull
      className={className}
      size={size}
      showBeta={showBeta}
      priority={priority}
    />
  )
}

export function BrandLogo({
  className,
  variant = "full",
  size = "md",
  showTagline: _showTagline = false,
  showBeta = BRANDING.isBeta,
  asLink = true,
  priority = false,
}: BrandLogoProps) {
  void _showTagline
  const content = (
    <BrandLogoInner
      className={className}
      variant={variant}
      size={size}
      showBeta={showBeta}
      priority={priority}
    />
  )

  if (!asLink) {
    return content
  }

  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
      aria-label={variant === "icon" ? BRANDING.productName : undefined}
    >
      {content}
    </Link>
  )
}

/**
 * Nav wordmark — full `full_logo_*_with_tagline.svg` (light/dark), plus BETA badge.
 * Black SVG on light theme; white SVG on dark theme.
 */
export function BrandLogoNav({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-w-0 max-w-full shrink-0 items-center leading-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50",
        className
      )}
      aria-label={BRANDING.productName}
    >
      <span className="relative inline-flex min-w-0 items-center pr-7 sm:pr-8">
        <WordmarkImages
          heightClass="h-8 sm:h-9 xl:h-10"
          maxWClass="max-w-[min(100%,11rem)] sm:max-w-[13rem] xl:max-w-[15rem]"
          priority
        />
        {BRANDING.isBeta ? <BetaBadge className={WORDMARK_BETA_CLASS} /> : null}
      </span>
    </Link>
  )
}
