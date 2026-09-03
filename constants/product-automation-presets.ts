import type { AgentTemplateApi } from "@/types/api"
import type { PipelineTemplateSelection } from "@/lib/pipeline-run-context"

export type ProductAutomationPresetId =
  | ""
  | "full_product"
  | "go_to_market"
  | "marketing_deep_research"
  | "enterprise_presales_sales"
  | "full_marketing_lifecycle"
  | "full_revenue_engine"
  | "growth_ops"
  | "higher_ed_academics"
  | "full_academics_lifecycle"
  | "legal_compliance_cycle"
  | "finance_planning"

export interface ProductAutomationPreset {
  label: string
  executionMode: "parallel" | "sequential"
  humanInLoop: boolean
  useMemory: boolean
  defaultTask: string
  templateCandidates: Record<string, string[]>
}

export const PRODUCT_AUTOMATION_PRESETS: Record<
  Exclude<ProductAutomationPresetId, "">,
  ProductAutomationPreset
> = {
  full_product: {
    label: "End-to-end product automation",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Run an end-to-end product cycle: market research, positioning, roadmap, launch campaign plan, financial impact, and execution checklist with owners.",
    templateCandidates: {
      master: ["sample-market-intel-engine", "sample-marketing-gtm-architect"],
      decomposer: [
        "sample-marketing-competitor-financials",
        "sample-marketing-icp-mapping",
        "sample-marketing-customer-swot",
      ],
      parallel: [
        "sample-marketing-campaign-planner",
        "sample-marketing-competitive-battlecards",
        "sample-marketing-ad-copy",
      ],
      aggregator: ["sample-marketing-customer-swot", "sample-finance-unit-economics"],
      supervisor: ["sample-marketing-product-launch", "sample-custom-summarizer"],
    },
  },
  go_to_market: {
    label: "Go-to-market automation",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Create a complete go-to-market plan: ICP, channel strategy, campaign assets, and measurable weekly KPI targets.",
    templateCandidates: {
      master: ["sample-market-intel-engine", "sample-marketing-gtm-architect"],
      decomposer: ["sample-marketing-icp-mapping", "sample-marketing-positioning-messaging"],
      parallel: ["sample-marketing-ad-copy", "sample-marketing-seo-brief", "sample-marketing-abm-campaign"],
      aggregator: ["sample-marketing-customer-swot", "sample-custom-summarizer"],
      supervisor: ["sample-marketing-product-launch"],
    },
  },
  marketing_deep_research: {
    label: "Marketing deep research",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Run deep marketing intelligence: competitor analysis, customer SWOT, pricing comparison, battlecards, and board-ready GTM recommendation with citations.",
    templateCandidates: {
      master: ["sample-market-intel-engine"],
      decomposer: [
        "sample-marketing-competitor-financials",
        "sample-marketing-customer-swot",
        "sample-marketing-icp-mapping",
      ],
      parallel: [
        "sample-marketing-competitive-battlecards",
        "sample-marketing-positioning-messaging",
        "sample-marketing-gtm-architect",
      ],
      aggregator: ["sample-marketing-attribution-model", "sample-custom-summarizer"],
      supervisor: ["sample-marketing-campaign-planner", "sample-custom-summarizer"],
    },
  },
  enterprise_presales_sales: {
    label: "Enterprise presales & sales cycle",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Qualify, discover needs, design solution, run demo/PoC, draft proposal/SOW, assess risks, and produce mutual close plan with stakeholder map.",
    templateCandidates: {
      master: ["sample-sales-discovery-facilitator", "sample-sales-stakeholder-engagement"],
      decomposer: [
        "sample-sales-lead-qualification-engine",
        "sample-sales-needs-analysis",
        "sample-presales-technical-qualifier",
      ],
      parallel: [
        "sample-presales-integration-architect",
        "sample-presales-demo-specialist",
        "sample-presales-poc-executor",
        "sample-presales-proposal-engineer",
        "sample-sales-proposal-sow",
        "sample-sales-rfp-response",
      ],
      aggregator: [
        "sample-presales-feasibility-review",
        "sample-sales-negotiation-coach",
        "sample-sales-pipeline-forecast",
      ],
      supervisor: ["sample-sales-closing-coach", "sample-presales-delivery-handoff", "sample-custom-summarizer"],
    },
  },
  full_marketing_lifecycle: {
    label: "Full marketing lifecycle",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "End-to-end marketing: research, positioning, brand, content, digital/social, demand gen, events, CRO, analytics, lifecycle, and PR — with KPIs.",
    templateCandidates: {
      master: ["sample-market-intel-engine", "sample-marketing-gtm-architect"],
      decomposer: [
        "sample-marketing-icp-mapping",
        "sample-marketing-positioning-messaging",
        "sample-marketing-customer-swot",
      ],
      parallel: [
        "sample-marketing-campaign-planner",
        "sample-marketing-seo-brief",
        "sample-marketing-email-nurture",
        "sample-marketing-abm-campaign",
        "sample-marketing-inbound-routing",
      ],
      aggregator: ["sample-marketing-attribution-model", "sample-custom-summarizer"],
      supervisor: ["sample-marketing-product-launch", "sample-custom-summarizer"],
    },
  },
  full_revenue_engine: {
    label: "Full revenue engine (marketing → sales → presales)",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "End-to-end revenue: GTM and demand gen, qualification, discovery, solution design, demos/PoC, proposals/RFPs, competitive positioning, negotiation, close, and expansion.",
    templateCandidates: {
      master: ["sample-market-intel-engine", "sample-sales-discovery-facilitator"],
      decomposer: [
        "sample-marketing-inbound-routing",
        "sample-sales-lead-qualification-engine",
        "sample-sales-needs-analysis",
        "sample-presales-technical-qualifier",
      ],
      parallel: [
        "sample-marketing-campaign-planner",
        "sample-sales-prospecting-planner",
        "sample-presales-demo-specialist",
        "sample-presales-integration-architect",
        "sample-presales-proposal-engineer",
        "sample-sales-roi-business-case",
        "sample-sales-rfp-response",
      ],
      aggregator: [
        "sample-presales-feasibility-review",
        "sample-sales-negotiation-coach",
        "sample-sales-pipeline-forecast",
      ],
      supervisor: [
        "sample-sales-closing-coach",
        "sample-presales-delivery-handoff",
        "sample-custom-summarizer",
      ],
    },
  },
  growth_ops: {
    label: "Growth & content automation",
    executionMode: "parallel",
    humanInLoop: false,
    useMemory: true,
    defaultTask:
      "Generate a 4-week growth plan across SEO, social, paid, and lifecycle email with prioritized backlog.",
    templateCandidates: {
      master: ["sample-marketing-campaign-planner"],
      decomposer: ["sample-marketing-seo-brief"],
      parallel: ["sample-marketing-email-nurture", "sample-marketing-abm-campaign"],
      aggregator: ["sample-custom-summarizer"],
      supervisor: ["sample-marketing-ad-copy"],
    },
  },
  higher_ed_academics: {
    label: "Higher education academics cycle",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Run an end-to-end academics workflow: audit syllabus and outcomes, plan lessons and assessments, support research and publication, prepare accreditation evidence, and coach students through capstone and placement readiness.",
    templateCandidates: {
      master: [
        "sample-academics-research-architect",
        "sample-academics-bloom-course-planner",
      ],
      decomposer: [
        "sample-academics-syllabus-auditor",
        "sample-academics-literature-synthesizer",
        "sample-academics-thesis-planner",
      ],
      parallel: [
        "sample-academics-lesson-planner",
        "sample-academics-rubric-designer",
        "sample-academics-quiz-generator",
        "sample-academics-paper-journal-writer",
        "sample-academics-systematic-review",
        "sample-academics-grant-proposal",
        "sample-academics-capstone-coach",
      ],
      aggregator: [
        "sample-academics-naac-nba-prep",
        "sample-academics-aqar-writer",
        "sample-academics-obe-attainment",
        "sample-academics-citation-auditor",
      ],
      supervisor: [
        "sample-academics-project-mentor",
        "sample-academics-defense-coach",
        "sample-academics-placement-coordinator",
        "sample-custom-tutor",
      ],
    },
  },
  full_academics_lifecycle: {
    label: "Full academics lifecycle",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Run end-to-end higher-ed academics: course design and delivery, assessment and feedback, research and publication, student success and placement, and accreditation evidence — with measurable outcomes.",
    templateCandidates: {
      master: [
        "sample-academics-bloom-course-planner",
        "sample-academics-research-architect",
        "sample-academics-outcome-framework",
      ],
      decomposer: [
        "sample-academics-syllabus-auditor",
        "sample-academics-course-outline",
        "sample-academics-literature-synthesizer",
        "sample-academics-thesis-planner",
        "sample-academics-criteria-evidence",
      ],
      parallel: [
        "sample-academics-lesson-planner",
        "sample-academics-lms-course-builder",
        "sample-academics-exam-blueprint",
        "sample-academics-grading-feedback",
        "sample-academics-paper-journal-writer",
        "sample-academics-journal-matcher",
        "sample-academics-study-skills-workshop",
        "sample-academics-academic-advisor",
        "sample-academics-peer-tutoring",
      ],
      aggregator: [
        "sample-academics-naac-nba-prep",
        "sample-academics-nba-sar",
        "sample-academics-obe-attainment",
        "sample-academics-self-study-report",
      ],
      supervisor: [
        "sample-academics-defense-coach",
        "sample-academics-placement-coordinator",
        "sample-academics-career-portfolio",
        "sample-custom-tutor",
      ],
    },
  },
  legal_compliance_cycle: {
    label: "Legal & compliance cycle",
    executionMode: "parallel",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Run an end-to-end legal and compliance workflow: map regulatory obligations, review contracts and DPAs, assess privacy (GDPR/CCPA/HIPAA/PCI), vendor and third-party risk, security frameworks (SOC2/ISO/NIST), employment and AML programs, IP governance, and audit readiness — with evidence checklist and remediation plan. Not legal advice.",
    templateCandidates: {
      master: [
        "sample-legal-compliance-orchestrator",
        "sample-legal-obligation-mapper",
        "sample-legal-board-governance",
      ],
      decomposer: [
        "sample-legal-policy-drafter",
        "sample-legal-ropa-data-map",
        "sample-legal-dpia-privacy-risk",
        "sample-legal-vendor-compliance-screen",
        "sample-legal-tprm-assessment",
        "sample-legal-ai-governance",
      ],
      parallel: [
        "sample-legal-contract-risk-lens",
        "sample-legal-nda-reviewer",
        "sample-legal-saas-msa-review",
        "sample-legal-dpa-baa-reviewer",
        "sample-legal-indemnity-liability",
        "sample-legal-sow-scope-reviewer",
        "sample-legal-gdpr-dsar",
        "sample-legal-ccpa-cpra-mapper",
        "sample-legal-cross-border-transfer",
        "sample-legal-hipaa-security-gap",
        "sample-legal-pci-dss-scoper",
        "sample-legal-aml-kyc-review",
        "sample-legal-sanctions-export",
        "sample-legal-anti-bribery",
        "sample-legal-trade-secret-program",
        "sample-legal-ip-oss-compliance",
      ],
      aggregator: [
        "sample-legal-audit-readiness",
        "sample-legal-soc2-readiness",
        "sample-legal-iso27001-gap",
        "sample-legal-nist-csf-assessment",
        "sample-legal-control-testing",
        "sample-legal-sox-controls",
        "sample-legal-records-retention",
        "sample-legal-litigation-hold",
      ],
      supervisor: [
        "sample-legal-compliance-training-plan",
        "sample-legal-whistleblower-program",
        "sample-legal-incident-triage",
        "sample-legal-breach-response",
        "sample-legal-subpoena-response",
        "sample-custom-summarizer",
      ],
    },
  },
  finance_planning: {
    label: "Finance planning automation",
    executionMode: "sequential",
    humanInLoop: true,
    useMemory: true,
    defaultTask:
      "Build an operating finance plan: budget, 12-week cash flow forecast, unit economics review, and investor-ready summary.",
    templateCandidates: {
      master: ["sample-finance-budget-planner"],
      decomposer: ["sample-finance-pricing-sensitivity"],
      parallel: ["sample-finance-cashflow-forecast"],
      aggregator: ["sample-finance-unit-economics"],
      supervisor: ["sample-finance-pnl-review", "sample-finance-investor-update"],
    },
  },
}

export function buildAutomationTemplateSelection(
  preset: ProductAutomationPreset,
  templates: AgentTemplateApi[] | undefined
): PipelineTemplateSelection {
  const available = new Set(
    (templates || []).map((t) => String(t.template_id || "").trim()).filter(Boolean)
  )
  const next: PipelineTemplateSelection = {}
  for (const [slot, candidates] of Object.entries(preset.templateCandidates)) {
    next[slot] = candidates.filter((id) => available.has(id)).slice(0, 2)
  }
  return next
}
