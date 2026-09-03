/**
 * App color tokens as hex for use in JS (charts, Three.js, exports).
 *
 * **Main four accents** — same hues as `globals.css` `:root` Tailwind tokens
 * (`--amber`, `--cyan`, `--violet`, `--emerald`); light theme, HSL → hex.
 *
 * **Gradient / lime pair** — hero text gradients & `--brand-hex-*` in CSS.
 */
export const MAIN_APP_COLORS = {
  amber: "#DC8D18",
  cyan: "#2B9690",
  violet: "#7E52C5",
  emerald: "#328F65",
} as const

export type MainAppColorKey = keyof typeof MAIN_APP_COLORS

/** Brighter amber + lime stops for gradients (see `app/globals.css` `--brand-hex-*`). */
export const BRAND_HEX = {
  amber: "#F4A429",
  amberLight: "#FFB84D",
  oc: "#B8F033",
  ocLight: "#CEFF52",
} as const

export type BrandHexKey = keyof typeof BRAND_HEX
