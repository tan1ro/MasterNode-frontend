import type { AppPlan } from "@/lib/app-auth"
import { planMeetsMinimum } from "@/lib/app-auth"
import { planDisplayName } from "@/constants/pricing-plans"

/** User-facing plan label for chat chrome (e.g. "Infinity plan"). */
export function formatChatPlanLabel(plan: AppPlan | null | undefined): string {
  return `${planDisplayName((plan || "free") as AppPlan)} plan`
}

/** Tier accent colors — used to tint the plan label and avatar per tier. */
export interface PlanAccent {
  /** Text color class for the plan label. */
  text: string
  /** Avatar background + text classes. */
  avatar: string
  /** Subtle ring/border class for the avatar. */
  ring: string
}

const PLAN_ACCENTS: Record<AppPlan, PlanAccent> = {
  free: {
    text: "text-muted-foreground",
    avatar: "bg-muted text-foreground",
    ring: "ring-border/60",
  },
  pro: {
    text: "text-sky-500 dark:text-sky-400",
    avatar: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500/40",
  },
  pro_plus: {
    text: "text-violet-500 dark:text-violet-400",
    avatar: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
    ring: "ring-violet-500/40",
  },
  premium: {
    text: "text-amber-500 dark:text-amber-400",
    avatar: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/40",
  },
  enterprise: {
    text: "text-emerald-500 dark:text-emerald-400",
    avatar: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/40",
  },
}

/** Accent color set for a plan tier (falls back to Free styling). */
export function planAccent(plan: AppPlan | null | undefined): PlanAccent {
  return PLAN_ACCENTS[(plan || "free") as AppPlan] ?? PLAN_ACCENTS.free
}

/** Show plan pill + Upgrade until Premium or Enterprise. */
export function shouldShowChatPlanUpgrade(
  plan: AppPlan | null | undefined,
  isSuperUser?: boolean
): boolean {
  if (isSuperUser) return false
  return !planMeetsMinimum(plan, "premium")
}
