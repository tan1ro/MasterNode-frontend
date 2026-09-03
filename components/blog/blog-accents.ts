import type { BlogAccent } from "@/constants/blog"

/** Gradient tile + icon color per blog accent (shared by index cards and post hero). */
export const BLOG_ACCENT_TILE: Record<BlogAccent, string> = {
  emerald: "from-emerald/30 to-emerald/5 text-emerald",
  amber: "from-amber/30 to-amber/5 text-amber",
  violet: "from-violet/30 to-violet/5 text-violet",
  sky: "from-sky/30 to-sky/5 text-sky",
}

/** Solid-ish text accent per blog accent. */
export const BLOG_ACCENT_TEXT: Record<BlogAccent, string> = {
  emerald: "text-emerald",
  amber: "text-amber",
  violet: "text-violet",
  sky: "text-sky",
}
