import { ROUTES } from "@/lib/routes"

export interface LearnMoreMenuItem {
  key: string
  label: string
  href: string
  external?: boolean
}

export interface LearnMoreMenuSection {
  items: LearnMoreMenuItem[]
}

/** Account menu → More flyout. */
export const ACCOUNT_MORE_MENU_SECTIONS: LearnMoreMenuSection[] = [
  {
    items: [
      { key: "help", label: "Help Center", href: ROUTES.help },
      { key: "faq", label: "FAQ", href: ROUTES.helpFaq },
      { key: "support", label: "Support", href: ROUTES.support },
    ],
  },
  {
    items: [
      { key: "about", label: "About MasterNode", href: ROUTES.about },
      { key: "tutorials", label: "Tutorials", href: ROUTES.helpTutorials },
      { key: "courses", label: "Courses", href: ROUTES.helpCourses },
      { key: "docs", label: "Documentation", href: ROUTES.docs },
    ],
  },
  {
    items: [
      { key: "usage", label: "Usage policy", href: ROUTES.usagePolicy },
      { key: "privacy", label: "Privacy policy", href: ROUTES.privacy },
      { key: "privacy-choices", label: "Your privacy choices", href: ROUTES.privacyChoices },
    ],
  },
  {
    items: [
      { key: "shortcuts", label: "Keyboard shortcuts", href: ROUTES.helpKeyboardShortcuts },
      { key: "api", label: "API reference", href: ROUTES.apiDocs },
    ],
  },
]

/** @deprecated Use ACCOUNT_MORE_MENU_SECTIONS */
export const LEARN_MORE_MENU_SECTIONS = ACCOUNT_MORE_MENU_SECTIONS
