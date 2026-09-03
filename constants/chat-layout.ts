import { cn } from "@/lib/utils"

/** Centered content column width for chat thread, composer, and panels. */
export const CHAT_COLUMN_MAX = "max-w-3xl"

/** Empty-chat landing (greeting + composer + chips). */
export const CHAT_LANDING_MAX = "max-w-2xl"

// Re-export sidebar tokens for backward compatibility
export {
  SIDEBAR_WIDTH as CHAT_SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_CLASS as CHAT_SIDEBAR_WIDTH_CLASS,
  SIDEBAR_RAIL_WIDTH as CHAT_SIDEBAR_RAIL_WIDTH,
  SIDEBAR_RAIL_WIDTH_CLASS as CHAT_SIDEBAR_RAIL_WIDTH_CLASS,
  SIDEBAR_TEXT_CLASS as CHAT_SIDEBAR_TEXT_CLASS,
  SIDEBAR_META_TEXT_CLASS as CHAT_SIDEBAR_META_TEXT_CLASS,
  SIDEBAR_SECTION_TEXT_CLASS as CHAT_SIDEBAR_SECTION_TEXT_CLASS,
  SIDEBAR_INSET_X_CLASS as CHAT_SIDEBAR_INSET_X_CLASS,
  SIDEBAR_LIST_CLASS as CHAT_SIDEBAR_LIST_CLASS,
  SIDEBAR_SCROLL_CLASS as CHAT_SIDEBAR_SCROLL_CLASS,
  SIDEBAR_GRID_GAP_CLASS as CHAT_SIDEBAR_GRID_GAP_CLASS,
  SIDEBAR_GRID_NAV_CLASS as CHAT_SIDEBAR_GRID_NAV_CLASS,
  SIDEBAR_GRID_RECENTS_CLASS as CHAT_SIDEBAR_GRID_RECENTS_CLASS,
  SIDEBAR_ROW_HEIGHT_CLASS as CHAT_SIDEBAR_ROW_HEIGHT_CLASS,
  SIDEBAR_ROW_PADDING_CLASS as CHAT_SIDEBAR_ROW_PADDING_CLASS,
  SIDEBAR_ROW_SURFACE_CLASS as CHAT_SIDEBAR_ROW_SURFACE_CLASS,
  SIDEBAR_NAV_ROW_CLASS as CHAT_SIDEBAR_NAV_ROW_CLASS,
  SIDEBAR_RECENTS_ROW_CLASS as CHAT_SIDEBAR_RECENTS_ROW_CLASS,
  SIDEBAR_SECTION_HEADER_CLASS as CHAT_SIDEBAR_SECTION_HEADER_CLASS,
  SIDEBAR_ICON_SLOT_CLASS as CHAT_SIDEBAR_ICON_SLOT_CLASS,
  SIDEBAR_ICON_CLASS as CHAT_SIDEBAR_ICON_CLASS,
  SIDEBAR_NAV_LABEL_CLASS as CHAT_SIDEBAR_NAV_LABEL_CLASS,
  SIDEBAR_RECENTS_LABEL_CLASS as CHAT_SIDEBAR_RECENTS_LABEL_CLASS,
  SIDEBAR_ACTIONS_COLUMN_CLASS as CHAT_SIDEBAR_ACTIONS_COLUMN_CLASS,
  SIDEBAR_NAV_CONTROL_CLASS as CHAT_SIDEBAR_NAV_CONTROL_CLASS,
  SIDEBAR_TRANSITION_CLASS as CHAT_SIDEBAR_TRANSITION_CLASS,
  SIDEBAR_PANEL_TRANSITION_CLASS as CHAT_SIDEBAR_PANEL_TRANSITION_CLASS,
  sidebarRowStateClass as chatSidebarRowStateClass,
  sidebarNavItemClass as chatSidebarNavItemClass,
  sidebarRecentsItemClass as chatSidebarRecentsItemClass,
} from "@/components/chat/sidebar/chat-sidebar-tokens"

/** Main chat column transition (tracks sidebar open/close on desktop). */
export const CHAT_MAIN_TRANSITION_CLASS =
  "transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"

/** Primary body text for chat messages (user + assistant).
 * Line-height is capped at Claude-like ~1.55 — do not use leading-relaxed/7 here.
 */
export const CHAT_MESSAGE_TEXT_CLASS = "chat-pref-font-size leading-[1.55]"

/** Shared horizontal padding for thread, composer, and dock controls. */
export const CHAT_COLUMN_PAD_X = "px-3 sm:px-5 md:px-6"

/**
 * Symmetric edge nudge — user bubbles slightly right, assistant text slightly left,
 * so both sit equidistant from the column edge (matches composer width visually).
 * No left nudge on the smallest breakpoint so assistant text clears the screen edge.
 */
export const CHAT_USER_MESSAGE_ALIGN_CLASS = "sm:-mr-1.5 md:-mr-2"
export const CHAT_ASSISTANT_MESSAGE_ALIGN_CLASS = "sm:-ml-1.5 md:-ml-2"

/** Composer input text size — same line-height cap as message text. */
export const CHAT_COMPOSER_TEXT_CLASS = "chat-pref-font-size leading-[1.55]"

/** Composer textarea auto-grow cap (~8 lines), then scroll inside the box. */
export const CHAT_COMPOSER_MAX_HEIGHT_PX = 200
export const CHAT_COMPOSER_MAX_HEIGHT_CLASS = "max-h-[200px]"

/** Shared surface for dock pills (plan / Upgrade) — light frost over the thread. */
export const CHAT_DOCK_SURFACE_CLASS =
  "chat-dock-surface border border-border/50 bg-muted/55 shadow-sm backdrop-blur-sm transition-colors"

/**
 * Composer input shell — solid fill so scrolled thread content never shows through.
 */
export const CHAT_COMPOSER_SURFACE_CLASS =
  "chat-dock-surface border border-border/50 bg-muted shadow-sm transition-colors"

/** Attached assistant / pipeline / memory chips above the composer. */
export const CHAT_CONTEXT_CHIP_CLASS = cn(
  "chat-context-chip inline-flex max-w-full items-center gap-1.5 rounded-full border",
  "border-border/50 bg-background/45 text-foreground shadow-sm backdrop-blur-md",
  "px-2.5 py-1 text-xs font-medium transition-colors"
)

export const CHAT_CONTEXT_CHIP_ICON_CLASS =
  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background/70 text-foreground/75"

export const CHAT_CONTEXT_CHIP_CLEAR_CLASS =
  "ml-0.5 shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:opacity-50"

/** Compact centered pill (plan banner, feedback). */
export const CHAT_DOCK_PILL_CLASS = cn(
  CHAT_DOCK_SURFACE_CLASS,
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground"
)

/** Full-width dock composer — solid fill so thread never bleeds through. */
export const CHAT_DOCK_COMPOSER_CLASS = cn(
  CHAT_COMPOSER_SURFACE_CLASS,
  "rounded-full"
)

/** Shared wrapper classes for chat main column content. */
export function chatColumnClass(...parts: (string | undefined | false)[]) {
  return cn("mx-auto w-full", CHAT_COLUMN_MAX, ...parts)
}

/** Full-viewport chat shell (no global top navbar on /chat).
 * Mobile: `svh` so the shell doesn’t jump when the browser chrome shows/hides.
 * Desktop: `dvh` for the dynamic viewport.
 */
export const CHAT_SHELL_CLASS =
  "flex h-svh max-h-svh min-h-0 w-full overflow-hidden bg-background lg:h-dvh lg:max-h-dvh"

/** Mobile app-shell top bar (hidden from lg up). */
export const APP_SHELL_MOBILE_HEADER_HEIGHT_CLASS = "h-12"

/**
 * Sticky offsets inside the chat column.
 * Mobile shell header is in-flow above this column (not overlaying it), so
 * sticky/absolute tops start at 0 — not an extra 3rem.
 */
export const CHAT_STICKY_BELOW_MOBILE_HEADER = "top-0"

/** Sticky offsets below the in-column incognito bar (2.75rem / h-11). */
export const CHAT_STICKY_BELOW_MOBILE_HEADER_AND_INCOGNITO = "top-11"

/** Fixed plan-upgrade pill — stays at top while the thread scrolls underneath. */
export const CHAT_PLAN_BANNER_FIXED_TOP_CLASS = "top-0"
export const CHAT_PLAN_BANNER_FIXED_TOP_INCOGNITO_CLASS = "top-11"

/** Shared workspace page padding (tasks, assistants, memory). */
export function workspacePageClass(...parts: (string | undefined | false)[]) {
  return cn(
    "mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6",
    "pb-[max(1rem,env(safe-area-inset-bottom))]",
    ...parts
  )
}
