import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  Headphones,
  Home,
  Info,
  Layers,
  Mail,
  Newspaper,
  Search,
  Sparkles,
  CircleDollarSign,
  Download,
} from "lucide-react"
import { COOKIE_POLICY_HREF } from "@/constants/legal"
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_RESOURCE_LINKS,
  type FooterLinkItem,
} from "@/constants/footer"
import { FOOTER_SOLUTION_SLUGS, getSolution } from "@/constants/solutions"
import { ROUTES } from "@/lib/routes"

const SOLUTION_FOOTER_LINKS: SiteFooterLink[] = withResearchSolutionLink(
  FOOTER_SOLUTION_SLUGS.flatMap((slug) => {
    const solution = getSolution(slug)
    if (!solution) return []
    return [{ label: solution.name, href: ROUTES.solution(slug), icon: solution.icon }]
  })
)

function withResearchSolutionLink(links: SiteFooterLink[]): SiteFooterLink[] {
  const research: SiteFooterLink = {
    label: "Research",
    href: ROUTES.solution("everyday-work"),
    icon: Search,
  }
  const everydayIndex = links.findIndex((link) => link.href === ROUTES.solution("everyday-work"))
  if (everydayIndex < 0) return [...links, research]
  return [...links.slice(0, everydayIndex + 1), research, ...links.slice(everydayIndex + 1)]
}

export type SiteFooterLink = {
  label: string
  href: string
  icon: LucideIcon
  external?: boolean
}

export function footerItemToSiteLink(item: FooterLinkItem): SiteFooterLink {
  return {
    label: item.label,
    href: item.href,
    icon: item.icon,
    external: item.external,
  }
}

/** Legal column + bottom bar — maps to consolidated `/legal/*` pages. */
export const SITE_FOOTER_LEGAL_LINKS: SiteFooterLink[] = FOOTER_LEGAL_LINKS.map(footerItemToSiteLink)

export type SiteFooterColumn = {
  id: string
  title: string
  links: SiteFooterLink[]
}

/** Marketing home footer columns. */
export const HOME_SITE_FOOTER_COLUMNS: SiteFooterColumn[] = [
  {
    id: "product",
    title: "Product",
    links: [
      { label: "Overview", href: ROUTES.home, icon: Home },
      { label: "Platform", href: ROUTES.platform, icon: Layers },
      { label: "Capabilities", href: `${ROUTES.home}#capabilities`, icon: Sparkles },
      { label: "Desktop", href: ROUTES.download, icon: Download },
      { label: "Pricing", href: ROUTES.pricing, icon: CircleDollarSign },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    links: SOLUTION_FOOTER_LINKS,
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About", href: ROUTES.about, icon: Info },
      { label: "Blog", href: ROUTES.blog, icon: Newspaper },
      { label: "Contact", href: ROUTES.contact, icon: Mail },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { label: "Help Center", href: ROUTES.help, icon: BookOpen },
      { label: "Documentation", href: ROUTES.docs, icon: BookOpen },
      { label: "API Reference", href: ROUTES.apiDocs, icon: Code2 },
      { label: "Support", href: ROUTES.support, icon: Headphones },
      { label: "Tutorials", href: ROUTES.helpTutorials, icon: GraduationCap },
      { label: "Release notes", href: ROUTES.helpReleaseNotes, icon: FileText },
    ],
  },
]

/** In-app footer columns (product links filtered at render time). */
export const APP_SITE_FOOTER_COLUMNS: SiteFooterColumn[] = [
  {
    id: "product",
    title: "Product",
    links: FOOTER_PRODUCT_LINKS.map(footerItemToSiteLink),
  },
  {
    id: "solutions",
    title: "Solutions",
    links: SOLUTION_FOOTER_LINKS,
  },
  {
    id: "resources",
    title: "Resources",
    links: FOOTER_RESOURCE_LINKS.map(footerItemToSiteLink),
  },
  {
    id: "company",
    title: "Company",
    links: FOOTER_COMPANY_LINKS.map(footerItemToSiteLink),
  },
]
