import { ROUTES } from "@/lib/routes"

export type AccountHelpMenuAction = "keyboard-shortcuts" | "report-bug"

export interface AccountHelpMenuItem {
  key: string
  label: string
  href?: string
  action?: AccountHelpMenuAction
  /** Opens in a new tab. */
  external?: boolean
  /** Shows outbound link icon (Claude-style) for in-app navigation. */
  outbound?: boolean
}

export interface AccountHelpMenuSection {
  items: AccountHelpMenuItem[]
}

/** Sidebar account menu → Help flyout. */
export const ACCOUNT_HELP_MENU_SECTIONS: AccountHelpMenuSection[] = [
  {
    items: [
      { key: "help", label: "Help center", href: ROUTES.help, outbound: true },
      { key: "release-notes", label: "Release notes", href: ROUTES.helpReleaseNotes, outbound: true },
      { key: "apps", label: "Download apps", href: ROUTES.helpDownloadApps, outbound: true },
      { key: "shortcuts", label: "Keyboard shortcuts", action: "keyboard-shortcuts" },
    ],
  },
  {
    items: [
      { key: "terms", label: "Terms of Service", href: ROUTES.terms, outbound: true },
      { key: "privacy", label: "Privacy Policy", href: ROUTES.privacy, outbound: true },
      { key: "bug", label: "Report a bug", action: "report-bug" },
    ],
  },
]
