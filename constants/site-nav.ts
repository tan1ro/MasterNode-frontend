import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Box,
  Braces,
  Briefcase,
  Building2,
  CircleDollarSign,
  Compass,
  Download,
  FileText,
  HelpCircle,
  History,
  Library,
  LifeBuoy,
  Mail,
  MonitorPlay,
  Puzzle,
  Rss,
  Users,
  Video,
  Wand2,
} from "lucide-react"
import {
  SOLUTIONS,
  SOLUTION_CATEGORY_ORDER,
  type SolutionCategory,
} from "@/constants/solutions"
import { ROUTES } from "@/lib/routes"

/** A single link inside a mega-menu column. */
export interface SiteNavLink {
  label: string
  href: string
  /** Optional leading icon (amber-tinted in the panel). */
  icon?: LucideIcon
  /** Optional supporting copy shown under the label. */
  description?: string
  /** Opens in a new tab with an `ArrowUpRight` affordance. */
  external?: boolean
}

/** A titled column of links within a mega-menu panel. */
export interface SiteNavColumn {
  title: string
  links: SiteNavLink[]
}

/** A top-level nav trigger and the panel it reveals. */
export interface SiteNavMenu {
  label: string
  /** Icon shown beside the top-level nav trigger. */
  icon?: LucideIcon
  columns: SiteNavColumn[]
  /** Optional "view all" style link rendered at the foot of the panel. */
  footerLink?: { label: string; href: string }
}

/**
 * Route-aware Product menu. On the landing page the Features link scrolls to the
 * `#capabilities` section; elsewhere it deep-links back home.
 */
export function getProductMenu(onHome: boolean): SiteNavMenu {
  return {
    label: "Product",
    icon: Box,
    columns: [
      {
        title: "Explore",
        links: [
          {
            label: "Overview",
            href: ROUTES.home,
            icon: Compass,
            description: "What MasterNode is and how it works",
          },
          {
            label: "Features",
            href: onHome ? "#capabilities" : `${ROUTES.home}#capabilities`,
            icon: Wand2,
            description: "Parallel assistants, memory, and exports",
          },
          {
            label: "Desktop",
            href: onHome ? "#desktop" : ROUTES.download,
            icon: Download,
            description: "macOS .dmg, Windows .exe, and Linux zip",
          },
        ],
      },
      {
        title: "Plans & updates",
        links: [
          {
            label: "Pricing",
            href: ROUTES.pricing,
            icon: CircleDollarSign,
            description: "Plans for every team size",
          },
          {
            label: "Changelog",
            href: ROUTES.changelog,
            icon: History,
            description: "Version-by-version technical changes",
          },
        ],
      },
    ],
  }
}

/** Short blurbs surfaced under each solution in the Solutions mega-menu. */
const SOLUTION_MENU_BLURBS: Record<string, string> = {
  "everyday-work": "Research, summarize, and draft in parallel",
  engineering: "Plan, build, test, and review changes",
  "sales-marketing": "From market intel to a closed deal",
  finance: "Plan, forecast, and report with confidence",
  academics: "Teaching, research, and accreditation",
  "legal-compliance": "Contracts, privacy, and audits",
}

const SOLUTION_CATEGORY_TITLE: Record<SolutionCategory, string> = {
  "By workflow": "By workflow",
  "By team": "By team",
}

/**
 * Solutions menu built from {@link SOLUTIONS}, grouped by category so it always
 * mirrors the solutions catalog. Each item carries the solution's own icon.
 */
export function buildSolutionsMenu(): SiteNavMenu {
  const columns: SiteNavColumn[] = SOLUTION_CATEGORY_ORDER.map((category) => ({
    title: SOLUTION_CATEGORY_TITLE[category],
    links: SOLUTIONS.filter((solution) => solution.category === category).map(
      (solution) => ({
        label: solution.name,
        href: ROUTES.solution(solution.slug),
        icon: solution.icon,
        description: SOLUTION_MENU_BLURBS[solution.slug] ?? solution.eyebrow,
      })
    ),
  }))

  return {
    label: "Domains",
    icon: Puzzle,
    columns,
    footerLink: { label: "View all domains", href: ROUTES.solutions },
  }
}

/** Resources menu: things to learn and places to connect. */
export const RESOURCES_MENU: SiteNavMenu = {
  label: "Resources",
  icon: Library,
  columns: [
    {
      title: "Learn",
      links: [
        {
          label: "Documentation",
          href: ROUTES.docs,
          icon: BookOpen,
          description: "Guides, concepts, and how-tos",
        },
        {
          label: "API Reference",
          href: ROUTES.apiDocs,
          icon: Braces,
          description: "Endpoints and integration docs",
        },
        {
          label: "Tutorials",
          href: ROUTES.helpTutorials,
          icon: MonitorPlay,
          description: "Step-by-step walkthroughs",
        },
        {
          label: "Courses",
          href: ROUTES.helpCourses,
          icon: Video,
          description: "Guided learning paths",
        },
      ],
    },
    {
      title: "Connect",
      links: [
        {
          label: "Community",
          href: ROUTES.community,
          icon: Users,
          description: "Join the conversation",
        },
        {
          label: "Release notes",
          href: ROUTES.helpReleaseNotes,
          icon: FileText,
          description: "What shipped recently",
        },
        {
          label: "Support",
          href: ROUTES.support,
          icon: LifeBuoy,
          description: "Get help from our team",
        },
        {
          label: "Help Center",
          href: ROUTES.help,
          icon: HelpCircle,
          description: "Answers and troubleshooting",
        },
      ],
    },
  ],
}

/** Company menu: the single-column "about us" cluster. */
export const COMPANY_MENU: SiteNavMenu = {
  label: "Company",
  icon: Briefcase,
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", href: ROUTES.about, icon: Building2 },
        { label: "Blog", href: ROUTES.blog, icon: Rss },
        { label: "Contact", href: ROUTES.contact, icon: Mail },
      ],
    },
  ],
}

/** All top-level menus in display order, resolved for the current route. */
export function getSiteNavMenus(onHome: boolean): SiteNavMenu[] {
  return [
    getProductMenu(onHome),
    buildSolutionsMenu(),
    RESOURCES_MENU,
    COMPANY_MENU,
  ]
}
