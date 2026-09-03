import { cn } from "@/lib/utils"

/** Expanded sidebar width (ChatGPT-style). */
export const SIDEBAR_WIDTH = "17.5rem"
export const SIDEBAR_WIDTH_CLASS = "w-[17.5rem]"

/** Collapsed icon rail width. */
export const SIDEBAR_RAIL_WIDTH = "4rem"
export const SIDEBAR_RAIL_WIDTH_CLASS = "w-16"

/** Primary nav + conversation list text. */
export const SIDEBAR_TEXT_CLASS = "text-sm leading-normal"

/** Secondary / meta text. */
export const SIDEBAR_META_TEXT_CLASS = "text-sm leading-normal text-foreground/60"

/** Section labels (e.g. Recents). */
export const SIDEBAR_SECTION_TEXT_CLASS = "text-sm font-semibold leading-normal"

/** Outer horizontal gutter — extra left inset so nav rows do not hug the rail edge. */
export const SIDEBAR_INSET_X_CLASS = "pl-3 pr-2"

/** Vertical list of rows. */
export const SIDEBAR_LIST_CLASS = "flex w-full flex-col gap-0"

/** Scrollable recents list. */
export const SIDEBAR_SCROLL_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden scrollbar-thin"

/** Vertical gap between recents conversation rows. */
export const SIDEBAR_RECENTS_LIST_GAP_CLASS = "gap-[2px]"

export const SIDEBAR_GRID_GAP_CLASS = "gap-2.5"
export const SIDEBAR_GRID_NAV_CLASS = "grid-cols-[1.125rem_minmax(0,1fr)]"
export const SIDEBAR_GRID_RECENTS_CLASS = "grid-cols-[minmax(0,1fr)_auto]"

export const SIDEBAR_ROW_HEIGHT_CLASS = "min-h-9 py-1.5"
export const SIDEBAR_ROW_PADDING_CLASS = "px-2.5"

export const SIDEBAR_ROW_SURFACE_CLASS = cn(
  "w-full min-w-0 rounded-[10px] transition-colors",
  SIDEBAR_ROW_HEIGHT_CLASS,
  SIDEBAR_ROW_PADDING_CLASS
)

const sidebarRowGridClass = cn("grid items-center", SIDEBAR_GRID_GAP_CLASS)

export const SIDEBAR_NAV_ROW_CLASS = cn(
  SIDEBAR_ROW_SURFACE_CLASS,
  sidebarRowGridClass,
  SIDEBAR_GRID_NAV_CLASS
)

export const SIDEBAR_RECENTS_ROW_PADDING_CLASS = "pl-4 pr-2.5"

/** Recents block — slightly more left inset than primary nav. */
export const SIDEBAR_RECENTS_INSET_X_CLASS = "pl-4 pr-2"

/** Recents section header — same inset as conversation rows. */
export const SIDEBAR_RECENTS_HEADER_PADDING_CLASS = "pl-4 pr-2.5"

export const SIDEBAR_RECENTS_ROW_CLASS = cn(
  "w-full min-w-0 rounded-[10px] transition-colors",
  SIDEBAR_ROW_HEIGHT_CLASS,
  SIDEBAR_RECENTS_ROW_PADDING_CLASS,
  sidebarRowGridClass,
  SIDEBAR_GRID_RECENTS_CLASS
)

export const SIDEBAR_SECTION_HEADER_CLASS = cn(
  "grid w-full min-w-0 items-center text-left",
  SIDEBAR_ROW_PADDING_CLASS,
  "pt-4 pb-1.5",
  sidebarRowGridClass,
  SIDEBAR_GRID_NAV_CLASS,
  SIDEBAR_SECTION_TEXT_CLASS,
  "text-foreground"
)

export const SIDEBAR_ICON_SLOT_CLASS =
  "flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center"

export const SIDEBAR_ICON_CLASS = "h-[1.125rem] w-[1.125rem] shrink-0"

export const SIDEBAR_NAV_LABEL_CLASS = "min-w-0 truncate"

export const SIDEBAR_RECENTS_LABEL_CLASS = cn("col-start-1 min-w-0 truncate text-left")

export const SIDEBAR_RECENTS_ACTIONS_COLUMN_CLASS = "col-start-2 flex shrink-0 items-center"

export const SIDEBAR_ACTIONS_COLUMN_CLASS = "col-start-3 flex shrink-0 items-center"

export const SIDEBAR_NAV_CONTROL_CLASS =
  "border-0 bg-transparent text-left outline-none focus-visible:ring-2 focus-visible:ring-amber/40"

export const SIDEBAR_HEADER_CLASS = cn("shrink-0", SIDEBAR_INSET_X_CLASS, "pt-4 pb-2")

/** Vertical gap between nav rows so hover/active surfaces do not touch. */
export const SIDEBAR_NAV_LIST_GAP_CLASS = "gap-[2px]"

export const SIDEBAR_NAV_SECTION_CLASS = cn(
  "flex w-full min-w-0 flex-col",
  SIDEBAR_NAV_LIST_GAP_CLASS,
  "shrink-0 py-0.5",
  SIDEBAR_INSET_X_CLASS
)

export const SIDEBAR_RAIL_ROW_CLASS =
  "inline-flex h-9 w-full items-center justify-center rounded-lg transition-colors"

export const SIDEBAR_PI_MARK_CLASS = "h-8 w-8"

export const SIDEBAR_FOOTER_CLASS = cn(
  "relative z-30 mt-auto shrink-0 py-2",
  SIDEBAR_INSET_X_CLASS
)

export const SIDEBAR_ASIDE_CLASS = "z-50 h-full border-r border-border/40 bg-background"

export const SIDEBAR_TRANSITION_CLASS =
  "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"

export const SIDEBAR_PANEL_TRANSITION_CLASS =
  "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"

export function sidebarRowStateClass(active: boolean) {
  return active
    ? "bg-muted text-foreground"
    : "text-foreground/90 hover:bg-muted/90 hover:text-foreground"
}

export function sidebarNavItemClass(active: boolean) {
  return cn(
    SIDEBAR_NAV_ROW_CLASS,
    SIDEBAR_NAV_CONTROL_CLASS,
    SIDEBAR_TEXT_CLASS,
    sidebarRowStateClass(active)
  )
}

export function sidebarNewChatItemClass(active: boolean) {
  return cn(
    SIDEBAR_NAV_ROW_CLASS,
    SIDEBAR_NAV_CONTROL_CLASS,
    SIDEBAR_TEXT_CLASS,
    "bg-muted/80 text-foreground hover:bg-muted",
    active && "ring-1 ring-white/[0.06]"
  )
}

export function sidebarRecentsItemClass(active: boolean) {
  return cn(SIDEBAR_RECENTS_ROW_CLASS, sidebarRowStateClass(active))
}

/** Floating menus (account, recents context, flyouts). */
export const SIDEBAR_MENU_PANEL_CLASS = cn(
  "overflow-hidden rounded-xl border border-border/50",
  "bg-card text-card-foreground shadow-2xl py-1",
  "dark:border-white/[0.07] dark:bg-secondary"
)

export const SIDEBAR_MENU_ITEM_CLASS = cn(
  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
  SIDEBAR_TEXT_CLASS,
  "text-foreground/85 hover:bg-muted/90 hover:text-foreground",
  "[&_svg]:text-current"
)

export const SIDEBAR_MENU_ITEM_DESTRUCTIVE_CLASS = cn(
  SIDEBAR_MENU_ITEM_CLASS,
  "text-destructive/90 hover:bg-destructive/10 hover:text-destructive"
)

export const SIDEBAR_MENU_SEPARATOR_CLASS = "my-1 h-px bg-border/40"

export const SIDEBAR_MENU_SECTION_BORDER_CLASS = "border-t border-border/50"

/** Chat-styled modal shell (logout, delete chat, etc.) — matches ConfirmDialog. */
export const SIDEBAR_DIALOG_SHELL_CLASS = cn(
  "relative z-10 w-full max-w-[26rem] rounded-lg border border-border",
  "bg-card px-6 py-5 text-card-foreground shadow-lg"
)

export const SIDEBAR_DIALOG_BACKDROP_CLASS = "absolute inset-0 bg-black/60"
