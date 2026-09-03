import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  BookOpen,
  CreditCard,
  Download,
  FileQuestion,
  FileText,
  GraduationCap,
  Headphones,
  Key,
  Keyboard,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react"
import { ROUTES } from "@/lib/routes"

export interface HelpLinkItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

/** Help Center — Learn / self-service guides. */
export const HELP_RESOURCES: HelpLinkItem[] = [
  {
    title: "FAQ",
    description: "Quick answers about chat, tasks, memory, and billing",
    icon: FileQuestion,
    href: ROUTES.helpFaq,
  },
  {
    title: "Tutorials",
    description: "Step-by-step guides for first runs and pipeline mode",
    icon: Rocket,
    href: ROUTES.helpTutorials,
  },
  {
    title: "Courses",
    description: "Longer learning paths for creators and educators",
    icon: GraduationCap,
    href: ROUTES.helpCourses,
  },
  {
    title: "Keyboard shortcuts",
    description: "Keys for chat and workspace panels",
    icon: Keyboard,
    href: ROUTES.helpKeyboardShortcuts,
  },
  {
    title: "Release notes",
    description: "What shipped recently in the product",
    icon: FileText,
    href: ROUTES.helpReleaseNotes,
  },
  {
    title: "Download apps",
    description: "Laptop desktop package and web app",
    icon: Download,
    href: ROUTES.helpDownloadApps,
  },
]

/** Topic chips on Help — learning categories (not tickets). */
export const HELP_TOPICS: HelpLinkItem[] = [
  { title: "Getting started", icon: Rocket, href: ROUTES.helpTutorials, description: "" },
  { title: "Features", icon: Sparkles, href: `${ROUTES.platform}#features`, description: "" },
  { title: "Account", icon: Users, href: ROUTES.helpFaq, description: "" },
  { title: "Billing", icon: CreditCard, href: ROUTES.pricing, description: "" },
  { title: "Privacy", icon: Shield, href: ROUTES.privacy, description: "" },
  { title: "API", icon: Key, href: ROUTES.apiDocs, description: "" },
]

export const HELP_QUICK_LINKS: HelpLinkItem[] = [
  {
    title: "Documentation",
    description: "Guides coming soon — API reference available now",
    icon: BookOpen,
    href: ROUTES.docs,
  },
  {
    title: "Support",
    description: "Something broken? Troubleshoot or open an issue",
    icon: Wrench,
    href: ROUTES.support,
  },
  {
    title: "Contact",
    description: "Sales, partnerships, and company inquiries",
    icon: MessageSquare,
    href: ROUTES.contact,
  },
]

/** Support page — Fix / problem categories. */
export const SUPPORT_ISSUE_CATEGORIES = [
  {
    value: "technical",
    label: "Technical issue",
    description: "Uploads, chat errors, pipeline failures, or model routing",
    icon: AlertCircle,
  },
  {
    value: "account",
    label: "Account issue",
    description: "Sign-in, workspace access, or profile settings",
    icon: Users,
  },
  {
    value: "billing",
    label: "Billing issue",
    description: "Invoices, plans, usage, or payment methods",
    icon: CreditCard,
  },
  {
    value: "subscription",
    label: "Subscription issue",
    description: "Upgrades, downgrades, or plan entitlements",
    icon: Headphones,
  },
] as const

export const SUPPORT_TROUBLESHOOT = [
  "Confirm you’re signed into the right workspace",
  "Retry after refreshing — rate limits and brief outages clear quickly",
  "Check Help Center FAQ for the same symptom",
  "If it still fails, open an issue below with steps to reproduce",
] as const

export const SUPPORT_COVERAGE = [
  "Chat, pipeline, and deliverable failures",
  "API keys, authentication, and rate limits",
  "Billing, plans, and usage",
  "Account access and workspace problems",
] as const

/**
 * Contact page — Reach / communication departments.
 * Technical bugs belong on Support, not here.
 */
export const CONTACT_DEPARTMENTS = [
  {
    value: "sales",
    label: "Sales",
    description: "Pricing questions and buying for your team",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Security reviews, SSO, and custom deployment",
  },
  {
    value: "partnership",
    label: "Partnerships",
    description: "Integrations, co-marketing, and alliances",
  },
  {
    value: "press",
    label: "Press",
    description: "Media kits and interview requests",
  },
  {
    value: "legal",
    label: "Legal",
    description: "Contracts, privacy, and compliance",
  },
] as const

/** @deprecated Prefer CONTACT_DEPARTMENTS on Contact; SUPPORT_ISSUE_CATEGORIES on Support. */
export const CONTACT_SUBJECTS = [
  { value: "sales", label: "Sales" },
  { value: "enterprise", label: "Enterprise" },
  { value: "partnership", label: "Partnership" },
  { value: "press", label: "Press" },
  { value: "legal", label: "Legal" },
  { value: "general", label: "General inquiry" },
] as const
