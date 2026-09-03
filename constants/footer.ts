import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  Key,
  CreditCard,
  Info,
  Phone,
  Brain,
  Bot,
  Settings,
  MessageSquare,
  Mail,
  FileText,
  Shield,
  HelpCircle,
  Lock,
  Building2,
  Cookie,
  Download,
} from "lucide-react"
import { ROUTES } from "@/lib/routes"
import type { FeatureId } from "@/constants/entitlements"

export interface FooterLinkItem {
  href: string
  label: string
  icon: LucideIcon
  external?: boolean
  /** Show when signed out (public teasers) */
  publicTeaser?: boolean
  /** Requires sign-in */
  authRequired?: boolean
  /** Feature gate for signed-in users */
  feature?: FeatureId
}

export interface FooterSection {
  id: string
  title: string
  links: FooterLinkItem[]
}

/** In-app product routes (filtered by auth / entitlements in the footer). */
export const FOOTER_PRODUCT_LINKS: FooterLinkItem[] = [
  { href: ROUTES.chat, label: "Chat", icon: MessageSquare, publicTeaser: true, authRequired: true },
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, feature: "routes.dashboard", authRequired: true },
  { href: ROUTES.tasks, label: "Tasks", icon: ListChecks, feature: "routes.tasks", authRequired: true },
  { href: ROUTES.agents, label: "Assistants", icon: Bot, authRequired: true },
  { href: ROUTES.memory, label: "Memory", icon: Brain, authRequired: true },
  { href: ROUTES.apiKeys, label: "API Keys", icon: Key, feature: "routes.api_keys", authRequired: true },
  { href: ROUTES.settings, label: "Settings", icon: Settings, authRequired: true },
  { href: ROUTES.pricing, label: "Pricing", icon: CreditCard, publicTeaser: true },
]

/** Docs, help, and support — no company pages here. */
export const FOOTER_RESOURCE_LINKS: FooterLinkItem[] = [
  { href: ROUTES.docs, label: "Documentation", icon: BookOpen },
  { href: ROUTES.download, label: "Download desktop", icon: Download },
  { href: ROUTES.help, label: "Help Center", icon: HelpCircle },
  { href: ROUTES.helpFaq, label: "FAQ", icon: HelpCircle },
  { href: ROUTES.support, label: "Support", icon: Mail },
]

/** Company info — each link appears only in this column. */
export const FOOTER_COMPANY_LINKS: FooterLinkItem[] = [
  { href: ROUTES.about, label: "About", icon: Info },
  { href: ROUTES.contact, label: "Contact", icon: Phone },
  { href: `${ROUTES.legal}#imprint`, label: "Imprint", icon: Building2 },
]

/** @deprecated Use SITE_FOOTER_LEGAL_LINKS from constants/site-footer.ts */
export const FOOTER_LEGAL_LINKS: FooterLinkItem[] = [
  { href: ROUTES.privacy, label: "Privacy Policy", icon: Shield },
  { href: ROUTES.terms, label: "Terms of Service", icon: FileText },
  { href: ROUTES.trust, label: "Security", icon: Lock },
  { href: `${ROUTES.privacy}#cookies`, label: "Cookies", icon: Cookie },
]

export const FOOTER_SECTIONS: FooterSection[] = [
  { id: "product", title: "Product", links: FOOTER_PRODUCT_LINKS },
  { id: "resources", title: "Resources", links: FOOTER_RESOURCE_LINKS },
  { id: "company", title: "Company", links: FOOTER_COMPANY_LINKS },
  { id: "legal", title: "Legal", links: FOOTER_LEGAL_LINKS },
]

export function socialLinksFromEnv(): { github?: string; twitter?: string; linkedin?: string } {
  return {
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB?.trim() || undefined,
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER?.trim() || undefined,
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim() || undefined,
  }
}
