/**
 * Plan feature comparison matrix — keep credit limits in sync with
 * backend/code/services/plan_prompt_quota.py and PLAN_LIMITS with policy_engine.py.
 */
import { PLAN_LIMITS } from "@/constants/entitlements"
import {
  LANDING_PRICING_PLAN_IDS,
  planDisplayName,
  type PricingPlanId,
} from "@/constants/pricing-plans"

export type PlanFeatureCell = boolean | string

export interface PricingFeatureRow {
  id: string
  label: string
  hint?: string
  values: Record<PricingPlanId, PlanFeatureCell>
}

export interface PricingFeatureCategory {
  id: string
  title: string
  rows: PricingFeatureRow[]
}

/** Rolling 5-hour chat credit window (total tokens). */
export const PLAN_CREDIT_LIMITS: Record<PricingPlanId, number | null> = {
  free: 40_000,
  pro: 400_000,
  pro_plus: 1_500_000,
  premium: 6_000_000,
  enterprise: null,
}

const PUBLIC_PLANS = LANDING_PRICING_PLAN_IDS

function planValue(
  plans: PricingPlanId[],
  value: PlanFeatureCell
): Record<PricingPlanId, PlanFeatureCell> {
  return Object.fromEntries(
    PUBLIC_PLANS.map((plan) => [plan, plans.includes(plan) ? value : false])
  ) as Record<PricingPlanId, PlanFeatureCell>
}

function fromMinPlan(
  minPlan: PricingPlanId,
  value: PlanFeatureCell = true
): Record<PricingPlanId, PlanFeatureCell> {
  const minIdx = PUBLIC_PLANS.indexOf(minPlan)
  return Object.fromEntries(
    PUBLIC_PLANS.map((plan, idx) => [plan, idx >= minIdx ? value : false])
  ) as Record<PricingPlanId, PlanFeatureCell>
}

function formatCredits(tokens: number | null): string {
  if (tokens === null) return "Unlimited"
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (tokens >= 1_000) {
    const k = tokens / 1_000
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(0)}k`
  }
  return String(tokens)
}

function limitValues(
  pick: (plan: PricingPlanId) => PlanFeatureCell
): Record<PricingPlanId, PlanFeatureCell> {
  return Object.fromEntries(PUBLIC_PLANS.map((plan) => [plan, pick(plan)])) as Record<
    PricingPlanId,
    PlanFeatureCell
  >
}

export const PRICING_FEATURE_CATEGORIES: PricingFeatureCategory[] = [
  {
    id: "chat",
    title: "Chat & workspace",
    rows: [
      {
        id: "multi_agent_chat",
        label: "Multi-agent parallel chat",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "parallel_agents",
        label: "Parallel agents per run",
        hint: "Infinity scales with the task; hard ceiling is 60 agents per run",
        values: limitValues((plan) =>
          plan === "premium" ? "∞" : String(PLAN_LIMITS[plan].maxParallelAgents)
        ),
      },
      {
        id: "chat_attachments",
        label: "Chat file & image attachments",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "working_memory",
        label: "Working memory in conversations",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "advanced_memory",
        label: "Advanced memory across chats",
        hint: "Longer retention and richer recall",
        values: fromMinPlan("pro_plus"),
      },
      {
        id: "web_search",
        label: "Web search in chat",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "rich_links",
        label: "Rich link previews & music cards",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "conversation_history",
        label: "Unlimited conversation history",
        values: planValue(PUBLIC_PLANS, true),
      },
    ],
  },
  {
    id: "knowledge",
    title: "Knowledge & uploads",
    rows: [
      {
        id: "rag_files",
        label: "Memory (RAG) documents",
        hint: "RAG upload requires Pro or higher",
        values: limitValues((plan) =>
          plan === "free" ? "—" : String(PLAN_LIMITS[plan].maxRagFiles)
        ),
      },
      {
        id: "doc_upload_mb",
        label: "Max document upload size",
        values: limitValues((plan) => `${PLAN_LIMITS[plan].chatMaxDocumentMb} MB`),
      },
      {
        id: "image_upload_mb",
        label: "Max image upload size",
        values: limitValues((plan) => `${PLAN_LIMITS[plan].chatMaxImageMb} MB`),
      },
      {
        id: "files_per_chat",
        label: "Files per conversation",
        values: limitValues((plan) => String(PLAN_LIMITS[plan].chatMaxFilesPerConversation)),
      },
      {
        id: "project_knowledge",
        label: "Project knowledge uploads",
        values: limitValues((plan) => `${PLAN_LIMITS[plan].projectMaxMb} MB / file`),
      },
    ],
  },
  {
    id: "assistants",
    title: "Assistants & pipelines",
    rows: [
      {
        id: "browse_templates",
        label: "Browse assistant templates",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "custom_templates",
        label: "Create & save custom assistants",
        values: fromMinPlan("pro"),
      },
      {
        id: "premium_templates",
        label: "Infinity assistant packs",
        values: fromMinPlan("premium"),
      },
      {
        id: "chat_pipeline",
        label: "Multi-agent pipelines in chat",
        values: planValue(PUBLIC_PLANS, true),
      },
      {
        id: "model_routing",
        label: "Advanced model routing controls",
        values: fromMinPlan("pro_plus"),
      },
    ],
  },
  {
    id: "usage",
    title: "Usage & performance",
    rows: [
      {
        id: "credits_5h",
        label: "Chat credits (per 5-hour window)",
        hint: "Rolling token budget for messages",
        values: limitValues((plan) => formatCredits(PLAN_CREDIT_LIMITS[plan])),
      },
      {
        id: "priority_traffic",
        label: "Priority access at peak traffic",
        values: fromMinPlan("premium"),
      },
      {
        id: "usage_analytics",
        label: "Usage analytics in billing",
        values: fromMinPlan("pro"),
      },
    ],
  },
  {
    id: "support",
    title: "Support & billing",
    rows: [
      {
        id: "community_support",
        label: "Community support",
        values: planValue(["free"], true),
      },
      {
        id: "email_support",
        label: "Priority email support",
        values: fromMinPlan("pro"),
      },
      {
        id: "sla_support",
        label: "Faster SLA support",
        values: fromMinPlan("premium"),
      },
      {
        id: "billing_portal",
        label: "Self-serve billing portal",
        values: fromMinPlan("pro"),
      },
      {
        id: "monthly_annual",
        label: "Monthly & annual billing",
        values: {
          free: "—",
          pro: "Both",
          pro_plus: "Both",
          premium: "Both",
          enterprise: "Both",
        },
      },
      {
        id: "card_payment",
        label: "Credit / debit card checkout",
        values: {
          free: "—",
          pro: true,
          pro_plus: true,
          premium: true,
          enterprise: "Custom",
        },
      },
    ],
  },
]

export function pricingMatrixPlanLabels(): { id: PricingPlanId; name: string }[] {
  return PUBLIC_PLANS.map((id) => ({ id, name: planDisplayName(id) }))
}

export function filterPricingFeatureCategories(
  query: string
): PricingFeatureCategory[] {
  const q = query.trim().toLowerCase()
  if (!q) return PRICING_FEATURE_CATEGORIES

  return PRICING_FEATURE_CATEGORIES.map((category) => ({
    ...category,
    rows: category.rows.filter(
      (row) =>
        row.label.toLowerCase().includes(q) ||
        row.hint?.toLowerCase().includes(q) ||
        category.title.toLowerCase().includes(q)
    ),
  })).filter((category) => category.rows.length > 0)
}
