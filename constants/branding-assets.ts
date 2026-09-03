/**
 * Brand logo files — edit only under `frontend/imgs/logos/`.
 * Canonical π mark: `PI_transperant_bgless.svg` (mirrored to `public/logos/` by sync scripts).
 */
import wordmarkLightImg from "@/imgs/logos/full_logo_black_with_tagline.svg"
import wordmarkDarkImg from "@/imgs/logos/full_logo_white_with_tagline.svg"
import piMarkBglessImg from "@/imgs/logos/PI_transperant_bgless.svg"
import piLogoHeroImg from "@/imgs/logos/PI_logo_hero.svg"
import piAnimatedMarkImg from "@/imgs/logos/PI_gif.gif"
import piOutlineLogoImg from "@/imgs/logos/pi_only_outline_logo.png"

/** Update when you replace logo files (helps bust browser cache for /public copies). */
export const BRAND_ASSET_VERSION = 16

/** Wordmark SVG viewBox (both themes; includes tagline). */
const WORDMARK_VIEWBOX = { width: 269.74, height: 55.34 } as const

export const MASTERNODE_WORDMARK = {
  src: wordmarkLightImg,
  width: WORDMARK_VIEWBOX.width,
  height: WORDMARK_VIEWBOX.height,
  aspectRatio: WORDMARK_VIEWBOX.width / WORDMARK_VIEWBOX.height,
} as const

/** Dark theme: white wordmark + tagline (for dark backgrounds). */
export const MASTERNODE_WORDMARK_DARK = {
  src: wordmarkDarkImg,
  width: WORDMARK_VIEWBOX.width,
  height: WORDMARK_VIEWBOX.height,
  aspectRatio: WORDMARK_VIEWBOX.width / WORDMARK_VIEWBOX.height,
} as const

/** App-style π mark (rounded square) — nav icon, favicon-style placements. */
const PI_MARK_VIEWBOX = { width: 160, height: 160 } as const

export const PI_MARK = {
  src: piMarkBglessImg,
  width: PI_MARK_VIEWBOX.width,
  height: PI_MARK_VIEWBOX.height,
} as const

/**
 * Animated π mark (looping GIF) — chat "thinking" indicator + onboarding.
 * Source is 1080×1920 with a centered mark on a transparent backdrop; UI crops via CSS.
 */
const PI_MARK_ANIMATED_VIEWBOX = { width: 1080, height: 1920 } as const

export const PI_MARK_ANIMATED = {
  src: piAnimatedMarkImg,
  width: PI_MARK_ANIMATED_VIEWBOX.width,
  height: PI_MARK_ANIMATED_VIEWBOX.height,
} as const

/** Glowing π block mark for landing hero (left column). */
const PI_LOGO_HERO_VIEWBOX = { width: 160, height: 160 } as const

export const PI_LOGO_HERO = {
  src: piLogoHeroImg,
  width: PI_LOGO_HERO_VIEWBOX.width,
  height: PI_LOGO_HERO_VIEWBOX.height,
  aspectRatio: PI_LOGO_HERO_VIEWBOX.width / PI_LOGO_HERO_VIEWBOX.height,
} as const

/** Gradient π outline — legacy; incognito uses `PI_MARK` (bgless π). */
export const PI_OUTLINE_LOGO = {
  src: piOutlineLogoImg,
  width: 512,
  height: 512,
} as const
