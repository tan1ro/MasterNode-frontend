import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bot,
  Brain,
  Crown,
  GitBranch,
  Key,
  Layers,
  MessageSquare,
  Shield,
  Sparkles,
  Upload,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import { ROUTES } from "@/lib/routes"
import type { AccountPlan } from "@/services/auth"

export type PricingAudience = "creator" | "business"

export type PricingPlanId = AccountPlan

/** Every plan card renders this many feature rows for uniform height. */
export const PRICING_FEATURE_SLOT_COUNT = 6

/** Annual billing discount (17% off monthly rate). */
export const PRICING_ANNUAL_DISCOUNT = 0.17

export const PRICING_ANNUAL_MULTIPLIER = 1 - PRICING_ANNUAL_DISCOUNT

/** Competitor list prices (USD/mo) shown as reference during beta. */
export const PRICING_COMPETITOR_USD: Partial<Record<PricingPlanId, number>> = {
  pro: 49,
  pro_plus: 99,
  premium: 299,
}

export interface PricingFeature {
  text: string
  icon: LucideIcon
}

export interface PricingPlanDefinition {
  id: PricingPlanId
  name: string
  price: string
  priceNote: string
  /** Short subtitle under the plan name. */
  subtitle: string
  tagline: string
  highlighted?: boolean
  businessOnly?: boolean
  /** Line above the feature list on paid tiers. */
  featureIntro?: string
  /** Prefix price with “From” (Infinity-style tiers). */
  priceFrom?: boolean
  landingIcon: LucideIcon
  creatorFeatures: PricingFeature[]
  businessFeatures: PricingFeature[]
  ctaLabel: string
  contactSales?: boolean
}

export const PRICING_PLAN_ORDER: PricingPlanId[] = [
  "free",
  "pro",
  "pro_plus",
  "premium",
  "enterprise",
]

export const PRICING_PLANS: PricingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "USD / month",
    subtitle: "Meet MasterNode",
    tagline: "See what parallel agents can do",
    landingIcon: Sparkles,
    ctaLabel: "Start free",
    creatorFeatures: [
      { icon: Sparkles, text: "Core chat with multi-agent replies" },
      { icon: MessageSquare, text: "Fair-use credits (5h window)" },
      { icon: GitBranch, text: "Up to 4 parallel agents per run" },
      { icon: Upload, text: "Chat file & image attachments" },
      { icon: Brain, text: "Working memory for recent context" },
      { icon: Layers, text: "Community support" },
    ],
    businessFeatures: [
      { icon: Sparkles, text: "Product hub preview & chat workspace" },
      { icon: MessageSquare, text: "10 tasks per month" },
      { icon: GitBranch, text: "Up to 4 parallel agents" },
      { icon: Upload, text: "Chat file & image attachments" },
      { icon: Brain, text: "Basic memory & assistant samples" },
      { icon: Layers, text: "Community support" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    priceNote: "USD / month",
    subtitle: "Research, build, and organize more",
    tagline: "Expanded limits for serious work",
    highlighted: true,
    featureIntro: "Everything in Free, and:",
    landingIcon: Bot,
    ctaLabel: "Upgrade to Pro",
    creatorFeatures: [
      { icon: Bot, text: "5× more credits per 5h window" },
      { icon: GitBranch, text: "8 parallel agents" },
      { icon: Upload, text: "20 RAG documents" },
      { icon: Layers, text: "Saved assistant templates" },
      { icon: BarChart3, text: "Usage analytics in billing" },
      { icon: MessageSquare, text: "Priority email support" },
    ],
    businessFeatures: [
      { icon: Workflow, text: "Tasks, logs & API key workspace" },
      { icon: Bot, text: "5,000 tasks per month" },
      { icon: GitBranch, text: "8 parallel agents" },
      { icon: Upload, text: "20 RAG documents" },
      { icon: BarChart3, text: "Usage analytics & billing portal" },
      { icon: MessageSquare, text: "Priority email support" },
    ],
  },
  {
    id: "pro_plus",
    name: "Premium",
    price: "$99",
    priceNote: "USD / month",
    subtitle: "Higher limits and priority access",
    tagline: "For advanced builders and heavier usage",
    featureIntro: "Everything in Pro, plus:",
    landingIcon: Crown,
    ctaLabel: "Upgrade to Premium",
    creatorFeatures: [
      { icon: Sparkles, text: "Advanced models & routing controls" },
      { icon: Bot, text: "15× more credits per 5h window" },
      { icon: GitBranch, text: "16 parallel agents" },
      { icon: Upload, text: "50 RAG documents" },
      { icon: Brain, text: "Expanded memory across chats" },
      { icon: Layers, text: "Template-driven multi-agent pipelines" },
    ],
    businessFeatures: [
      { icon: Sparkles, text: "Full product hub & SDLC assistants" },
      { icon: Users, text: "Team workflows across PM, eng & ops" },
      { icon: Bot, text: "15,000 tasks per month" },
      { icon: GitBranch, text: "16 parallel agents" },
      { icon: Upload, text: "50 RAG documents" },
      { icon: Key, text: "API keys, webhooks & integrations" },
    ],
  },
  {
    id: "premium",
    name: "Infinity",
    price: "$299",
    priceNote: "USD / month",
    subtitle: "Maximum throughput and highest limits",
    tagline: "For power users who want the full ceiling",
    featureIntro: "Everything in Premium, plus:",
    landingIcon: Zap,
    ctaLabel: "Get Infinity",
    creatorFeatures: [
      { icon: Zap, text: "Maximum credits per 5h window" },
      { icon: GitBranch, text: "Infinite parallel agents" },
      { icon: Upload, text: "200 RAG documents" },
      { icon: Brain, text: "Maximum memory & context windows" },
      { icon: BarChart3, text: "Priority support with faster SLAs" },
      { icon: Shield, text: "Advanced workspace controls" },
    ],
    businessFeatures: [
      { icon: Zap, text: "50,000 tasks per month" },
      { icon: GitBranch, text: "Infinite parallel agents" },
      { icon: Upload, text: "200 RAG documents" },
      { icon: Shield, text: "Team governance & policy controls" },
      { icon: BarChart3, text: "Advanced analytics & SLA support" },
      { icon: Users, text: "Expanded team operations" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "Contact sales",
    subtitle: "SSO, governance, and dedicated scale",
    tagline: "Custom contracts and onboarding",
    landingIcon: Shield,
    businessOnly: true,
    ctaLabel: "Talk to sales",
    contactSales: true,
    creatorFeatures: [
      { icon: Shield, text: "SSO, MFA & advanced security" },
      { icon: Users, text: "Custom tenant & seat limits" },
      { icon: Bot, text: "Unlimited tasks (fair use)" },
      { icon: GitBranch, text: "Custom parallel agent ceilings" },
      { icon: Key, text: "Dedicated onboarding & support" },
      { icon: Sparkles, text: "Available on Business plans" },
    ],
    businessFeatures: [
      { icon: Shield, text: "SSO, MFA & advanced security" },
      { icon: Users, text: "Custom tenant & seat limits" },
      { icon: Bot, text: "Unlimited tasks (fair use)" },
      { icon: GitBranch, text: "Custom parallel agent ceilings" },
      { icon: Key, text: "Dedicated onboarding & support" },
      { icon: Sparkles, text: "Privacy-first — your data stays yours" },
    ],
  },
]

/** Always five tiers so Creator and Business share the same grid footprint. */
export function plansForAudience(audience: PricingAudience): PricingPlanDefinition[] {
  return PRICING_PLANS
}

export function planFeaturesForAudience(
  plan: PricingPlanDefinition,
  audience: PricingAudience
): PricingFeature[] {
  const source = audience === "business" ? plan.businessFeatures : plan.creatorFeatures
  return source.slice(0, PRICING_FEATURE_SLOT_COUNT)
}

export function isBusinessOnlyPlan(plan: PricingPlanDefinition, audience: PricingAudience): boolean {
  return Boolean(plan.businessOnly) && audience === "creator"
}

export function planDisplayName(planId: PricingPlanId): string {
  return PRICING_PLANS.find((p) => p.id === planId)?.name ?? planId.replace(/_/g, " ")
}

export function planRank(planId: PricingPlanId): number {
  return PRICING_PLAN_ORDER.indexOf(planId)
}

export function isCurrentPlan(current: PricingPlanId | null | undefined, target: PricingPlanId): boolean {
  return (current ?? "free") === target
}

export function canUpgradeTo(
  current: PricingPlanId | null | undefined,
  target: PricingPlanId
): boolean {
  return planRank(target) > planRank(current ?? "free")
}

export function planActionHref(
  plan: PricingPlanDefinition,
  options: { signedIn: boolean; billingHref: string; signUpHref: string }
): string {
  if (plan.contactSales) return ROUTES.contact
  if (!options.signedIn) return options.signUpHref
  return options.billingHref
}

export const PRICING_BOARD_FOOTNOTE =
  "Limits are per workspace. Monthly and annual billing available."

export const PRICING_BOARD_HEADING = "Simple, transparent pricing"

export const PRICING_BOARD_SUBCOPY =
  "Start free and scale as you grow with clear monthly or annual pricing."

/** Public landing — four plan ladder (Free / Pro / Premium / Infinity). */
export const LANDING_PRICING_PLAN_IDS: PricingPlanId[] = ["free", "pro", "pro_plus", "premium"]

/** Marketing card title shown on pixel pricing cards (may differ from billing plan name). */
export const PRICING_CARD_TITLE: Record<PricingPlanId, string> = {
  free: "Starter",
  pro: "Pro",
  pro_plus: "Premium",
  premium: "Infinity",
  enterprise: "Enterprise",
}

/** Per-tier accent color for pixel pricing card decorations. */
export const PRICING_CARD_ACCENT: Record<PricingPlanId, string> = {
  free: "#00FFFE",
  pro: "#B0F900",
  pro_plus: "#FFA600",
  premium: "#8750CC",
  enterprise: "#A855F7",
}

/** Billing workspace — includes Premium for power upgrades. */
export const BILLING_PRICING_PLAN_IDS: PricingPlanId[] = [
  "free",
  "pro",
  "pro_plus",
  "premium",
]

export function landingPricingPlans(): PricingPlanDefinition[] {
  return LANDING_PRICING_PLAN_IDS.map(
    (id) => PRICING_PLANS.find((plan) => plan.id === id)!
  )
}

export function billingPricingPlans(): PricingPlanDefinition[] {
  return BILLING_PRICING_PLAN_IDS.map(
    (id) => PRICING_PLANS.find((plan) => plan.id === id)!
  )
}

function parseMonthlyUsd(price: string): number | null {
  const match = price.match(/\$([\d.]+)/)
  if (!match) return null
  const value = Number.parseFloat(match[1])
  return Number.isFinite(value) ? value : null
}

/** Annual per-month display (17% off list). */
export function landingAnnualPrice(monthlyPrice: string): string {
  const value = parseMonthlyUsd(monthlyPrice)
  if (value === null) return monthlyPrice
  return `$${Math.round(value * PRICING_ANNUAL_MULTIPLIER)}`
}
