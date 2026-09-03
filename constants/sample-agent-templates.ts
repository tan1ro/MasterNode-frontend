import type { UpsertAgentTemplateBody } from "@/types/api"
import { enrichSampleAgentConfig } from "@/lib/sample-agent-capability-defaults"

export type SampleAgentCategory =
  | "general"
  | "sales_marketing"
  | "finance"
  | "codebase"
  | "sdlc"
  | "legal"
  | "compliance"
  | "academics"
  | "legal_compliance"
  /** User-created assistants saved via the API (not built-in gallery seeds). */
  | "custom"

export interface SampleAgentTemplate extends UpsertAgentTemplateBody {
  category: SampleAgentCategory
}

/**
 * Ready-made ``custom`` starters. ``template_id``s match
 * ``backend/code/database/seed_agent_templates.py`` so upserts align with server seed.
 */
const RAW_SAMPLE_AGENT_TEMPLATES: SampleAgentTemplate[] = [
  {
    category: "general",
    template_id: "sample-custom-research",
    name: "Research helper (custom)",
    description: "Optional specialty prompt for open-ended research-style steps.",
    prompt_template:
      "You are a research assistant. Summarize sources, cite uncertainty, and suggest next steps. Topic: {topic}",
    variables: ["topic"],
    config: {
      preferred_model: "auto",
      domain_focus: "Research",
      export_formats: ["pdf", "docx", "html", "research"],
      web_search_default: true,
    },
  },
  {
    category: "general",
    template_id: "sample-custom-summarizer",
    name: "Summarizer (custom)",
    description: "Optional specialty prompt for tight TL;DRs of long or dense material.",
    prompt_template:
      "Summarize the following for a busy reader: bullet key points, one-line takeaway, and note anything ambiguous. Content:\n{content}",
    variables: ["content"],
    config: {
      preferred_model: "auto",
      domain_focus: "Summaries",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "codebase",
    template_id: "sample-custom-code-review",
    name: "Code review (custom)",
    description: "Optional specialty prompt for correctness, risks, and small improvements.",
    prompt_template:
      "Review the code for bugs, edge cases, security issues, and readability. Be specific with line-level suggestions when possible. Language/stack if known: {context}\nCode:\n{code}",
    variables: ["code", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Code review",
      citation_mode: "required",
    },
  },
  {
    category: "general",
    template_id: "sample-custom-data-extractor",
    name: "Data extractor (custom)",
    description: "Optional specialty prompt to pull structured fields from messy text.",
    prompt_template:
      "Extract the requested fields as JSON only (no markdown). If a field is missing, use null. Schema hint: {schema}\nText:\n{text}",
    variables: ["text", "schema"],
    config: { preferred_model: "auto" },
  },
  {
    category: "general",
    template_id: "sample-custom-writer",
    name: "Writer / editor (custom)",
    description: "Optional specialty prompt to polish tone, clarity, and structure.",
    prompt_template:
      "Rewrite the draft for clarity and flow. Preserve facts and intent. Target tone: {tone}\nDraft:\n{draft}",
    variables: ["draft", "tone"],
    config: { preferred_model: "auto" },
  },
  {
    category: "general",
    template_id: "sample-custom-tutor",
    name: "Tutor (custom)",
    description:
      "Optional specialty prompt: hints and small steps without giving away the full solution.",
    prompt_template:
      "You are a patient tutor. Do not give the final answer outright unless the learner already showed substantial work. Offer hints, check understanding, and suggest the next small step. Topic: {topic}\nLearner question or attempt:\n{attempt}",
    variables: ["topic", "attempt"],
    config: { preferred_model: "auto" },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-copilot",
    name: "Codebase copilot",
    description: "Repository-aware copilot with safer code generation checks.",
    prompt_template:
      "You are a codebase copilot. Produce minimal safe diffs, explain trade-offs, and include citations to touched files. Goal: {task}\nRepo context:\n{context}",
    variables: ["task", "context"],
    config: { preferred_model: "auto", domain_pack: "codebase_copilot", citation_mode: "required" },
  },
  {
    category: "finance",
    template_id: "sample-finance-budget-planner",
    name: "Budget planner",
    description: "Builds monthly budget allocation and variance watchlist.",
    prompt_template:
      "Create a monthly budget plan.\nRevenue target: {revenue}\nKnown costs:\n{costs}\nReturn budget buckets, recommended caps, variance thresholds, and monitoring cadence.",
    variables: ["revenue", "costs"],
    config: { preferred_model: "auto" },
  },
  {
    category: "finance",
    template_id: "sample-finance-cashflow-forecast",
    name: "Cash flow forecaster",
    description: "Forecasts cash flow with optimistic/base/conservative scenarios.",
    prompt_template:
      "Build a 12-week cash flow forecast.\nOpening cash: {opening_cash}\nExpected inflows: {inflows}\nExpected outflows: {outflows}\nReturn 3 scenarios and liquidity risk alerts.",
    variables: ["opening_cash", "inflows", "outflows"],
    config: { preferred_model: "auto" },
  },
  {
    category: "finance",
    template_id: "sample-finance-unit-economics",
    name: "Unit economics analyzer",
    description: "Computes CAC, LTV, contribution margin, and payback guidance.",
    prompt_template:
      "Analyze unit economics.\nInputs:\n{metrics}\nReturn CAC, LTV, gross margin, payback period, warning flags, and top 5 improvement levers.",
    variables: ["metrics"],
    config: { preferred_model: "auto" },
  },
  {
    category: "finance",
    template_id: "sample-finance-pricing-sensitivity",
    name: "Pricing sensitivity planner",
    description: "Evaluates pricing scenarios with revenue and churn tradeoffs.",
    prompt_template:
      "Run pricing sensitivity analysis.\nCurrent pricing: {current_pricing}\nScenario candidates: {scenarios}\nCustomer mix: {customer_mix}\nReturn projected ARR impact, risk assumptions, and recommendation.",
    variables: ["current_pricing", "scenarios", "customer_mix"],
    config: { preferred_model: "auto" },
  },
  {
    category: "finance",
    template_id: "sample-finance-pnl-review",
    name: "P&L reviewer",
    description: "Reviews P&L trends and highlights margin anomalies.",
    prompt_template:
      "Review this P&L snapshot and trend data:\n{pnl_data}\nReturn key deltas, likely causes, anomaly checks, and corrective actions in priority order.",
    variables: ["pnl_data"],
    config: { preferred_model: "auto" },
  },
  {
    category: "finance",
    template_id: "sample-finance-investor-update",
    name: "Investor update drafter",
    description: "Drafts monthly investor update with metrics, narrative, and asks.",
    prompt_template:
      "Draft an investor update.\nPeriod: {period}\nKPIs: {kpis}\nWins: {wins}\nRisks: {risks}\nAsks: {asks}\nReturn concise sections with transparent tone and action items.",
    variables: ["period", "kpis", "wins", "risks", "asks"],
    config: { preferred_model: "auto" },
  },
  {
    category: "academics",
    template_id: "sample-academics-timetable-planner",
    name: "Academics timetable planner",
    description:
      "Creates institution-grade timetables with faculty, room, and clash constraints plus contingency plans.",
    prompt_template:
      "Design a timetable plan for the institution.\nConstraints: {constraints}\nResources: {resources}\nCourses: {courses}\nReturn: conflict-free weekly grid, faculty/room allocation rationale, backup slots, and risk flags.",
    variables: ["constraints", "resources", "courses"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-research-architect",
    name: "Research architect (literature + gap)",
    description:
      "Builds rigorous research plan: gap analysis, methodology options, and evidence-backed positioning.",
    prompt_template:
      "You are a research architect.\nTopic: {topic}\nContext: {context}\nReturn: research questions, novelty/gap map, literature themes, method options, expected limitations, and publication strategy.",
    variables: ["topic", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-paper-journal-writer",
    name: "Paper + journal submission copilot",
    description:
      "Drafts publication-ready sections and journal-fit matrix with quality/compliance checks.",
    prompt_template:
      "Prepare journal-ready output.\nDraft/material: {draft}\nTarget field: {field}\nReturn: abstract-intro-method-discussion-improvements, journal shortlist (scope fit, indexing, APC), formatting checklist, and reviewer-risk notes.",
    variables: ["draft", "field"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-bloom-course-planner",
    name: "Bloom taxonomy course planner",
    description:
      "Designs outcomes, assessments, and rubrics mapped across Bloom levels with attainment signals.",
    prompt_template:
      "Create a course plan based on Bloom's taxonomy.\nCourse: {course}\nProgram outcomes: {outcomes}\nTarget audience: {audience}\nCredits: {credits}\nL:T:P ratio: {ltp}\nReturn: CO-PO mapping, module-wise Bloom levels, assessment blueprint, rubric criteria, and attainment tracking approach.",
    variables: ["course", "outcomes", "audience", "credits", "ltp"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-market-intel-engine",
    name: "Market intelligence & research",
    description:
      "Synthesizes market size, trends, competitors, and buyer signals into an actionable intelligence brief.",
    prompt_template:
      "Run market intelligence research.\nMarket: {market}\nProduct: {product}\nGeography: {geo}\n\nReturn:\n1) Market overview and key trends\n2) Competitor landscape summary\n3) Buyer personas and pain themes\n4) Opportunities, threats, and white space\n5) Recommended next research with cited sources",
    variables: ["market", "product", "geo"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-competitor-financials",
    name: "Competitor financial analysis",
    description:
      "Benchmarks competitor revenue, growth, pricing, and unit economics from public data and filings.",
    prompt_template:
      "Run competitor financial analysis.\nCompetitors: {competitors}\nMarket: {market}\nOur product: {our_product}\n\nReturn:\n1) Competitor snapshot (revenue, growth, funding, scale)\n2) Pricing and packaging comparison\n3) Business model and unit economics signals\n4) Strategic implications for our GTM\n5) Citations and confidence notes per data point",
    variables: ["competitors", "market", "our_product"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-customer-swot",
    name: "Customer SWOT analysis",
    description:
      "Segment-level SWOT on target customers: strengths, weaknesses, opportunities, threats that drive buying.",
    prompt_template:
      "Build customer SWOT analysis.\nSegments: {segments}\nProduct: {product}\nMarket: {market}\n\nReturn:\n1) SWOT matrix per priority segment\n2) Buying triggers and blockers by quadrant\n3) Messaging hooks and required proof points\n4) Segment prioritization with rationale\n5) Validation gaps and research plan",
    variables: ["segments", "product", "market"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-icp-mapping",
    name: "ICP & persona mapping",
    description:
      "Defines ideal customer profiles, firmographics, personas, pain points, and buying committees.",
    prompt_template:
      "Map ICP and personas.\nProduct: {product}\nMarket: {market}\nKnown segments: {segments}\n\nReturn:\n1) ICP criteria (firmographic, technographic, behavioral)\n2) Persona cards (goals, pains, objections, KPIs)\n3) Buying committee map\n4) Disqualification rules\n5) Target account signals",
    variables: ["product", "market", "segments"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-positioning-messaging",
    name: "Positioning & messaging",
    description:
      "Develops positioning statement, value pillars, and message architecture by persona.",
    prompt_template:
      "Create positioning and messaging.\nProduct: {product}\nAudience: {audience}\nCompetitors: {competitors}\n\nReturn:\n1) Positioning statement (category, differentiation, proof)\n2) Value pillars with proof points\n3) Persona-specific message map\n4) Elevator pitch variants\n5) Messaging do/don't list",
    variables: ["product", "audience", "competitors"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-gtm-architect",
    name: "Go-to-market (GTM) planning",
    description:
      "Builds GTM strategy: segments, channels, motion, timeline, and success metrics.",
    prompt_template:
      "Architect go-to-market plan.\nProduct: {product}\nMarket: {market}\nGoal: {goal}\n\nReturn:\n1) GTM motion (PLG, sales-led, hybrid) recommendation\n2) Segment and channel strategy\n3) 90-day launch roadmap with milestones\n4) Team and budget assumptions\n5) KPI tree and review cadence",
    variables: ["product", "market", "goal"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pptx", "pdf", "docx"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-competitive-battlecards",
    name: "Competitive battlecards",
    description:
      "Sales-ready battlecards: strengths, weaknesses, landmines, and talk tracks vs competitors.",
    prompt_template:
      "Create competitive battlecards.\nProduct: {product}\nCompetitors: {competitors}\nUse cases: {use_cases}\n\nReturn:\n1) Comparison matrix (features, pricing, positioning)\n2) Win themes and proof per competitor\n3) Landmines and objection handling\n4) When we win / when we lose\n5) Discovery questions to expose gaps",
    variables: ["product", "competitors", "use_cases"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-campaign-planner",
    name: "Marketing campaign planning",
    description:
      "Plans multi-channel campaigns: audience, offer, channels, budget, and measurement.",
    prompt_template:
      "Plan marketing campaign.\nProduct: {product}\nAudience: {audience}\nGoal: {goal}\n\nReturn:\n1) Campaign objective and offer\n2) Channel mix and budget allocation\n3) Creative and content requirements\n4) Timeline and dependencies\n5) KPIs, tracking plan, and optimization triggers",
    variables: ["product", "audience", "goal"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pptx", "pdf", "docx"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-seo-brief",
    name: "SEO content brief",
    description:
      "Keyword research, search intent, outline, and on-page SEO recommendations for content.",
    prompt_template:
      "Create SEO content brief.\nTopic: {topic}\nAudience: {audience}\nSite context: {site}\n\nReturn:\n1) Target keywords and intent mapping\n2) SERP analysis and content angle\n3) Detailed outline with H-structure\n4) On-page SEO checklist\n5) Internal links and CTA recommendations",
    variables: ["topic", "audience", "site"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-ad-copy",
    name: "Paid ad copy",
    description:
      "Writes paid search/social ad variants with hooks, CTAs, and compliance notes.",
    prompt_template:
      "Write paid ad copy.\nProduct: {product}\nAudience: {audience}\nChannels: {channels}\n\nReturn:\n1) Primary headlines and descriptions per channel\n2) Variant set for A/B testing\n3) Landing page message match notes\n4) Compliance/disclaimer checklist\n5) Suggested bids and audience targeting hints",
    variables: ["product", "audience", "channels"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-email-nurture",
    name: "Email nurture sequences",
    description:
      "Designs drip/nurture journeys, subject lines, copy, and conversion triggers.",
    prompt_template:
      "Design email nurture sequence.\nProduct: {product}\nSegments: {segments}\nGoal: {goal}\n\nReturn:\n1) Journey map and trigger rules\n2) Email sequence (subject, preview, body) per step\n3) Branching logic for engagement\n4) Metrics and benchmarks\n5) Compliance (opt-in, unsubscribe) notes",
    variables: ["product", "segments", "goal"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-abm-campaign",
    name: "Account-based marketing (ABM)",
    description:
      "ABM plays for target accounts: tiers, channels, personalization, and sales alignment.",
    prompt_template:
      "Plan ABM campaign.\nTarget accounts: {accounts}\nProduct: {product}\nGoal: {goal}\n\nReturn:\n1) Account tiering and prioritization\n2) Persona plays per tier\n3) Channel orchestration (ads, email, events, direct)\n4) Sales marketing SLA and handoff\n5) Success metrics and pilot timeline",
    variables: ["accounts", "product", "goal"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-inbound-routing",
    name: "Inbound lead routing",
    description:
      "Routes demos, trials, and form leads with SLAs, scoring, and sales handoff rules.",
    prompt_template:
      "Design inbound lead routing.\nFunnel: {funnel}\nSales team: {team}\nCRM: {crm}\n\nReturn:\n1) Lead sources and routing matrix\n2) Scoring and qualification thresholds\n3) Round-robin / territory rules\n4) SLA and escalation paths\n5) Feedback loop to marketing",
    variables: ["funnel", "team", "crm"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-attribution-model",
    name: "Marketing attribution modeling",
    description:
      "Multi-touch attribution design, model selection, and reporting framework.",
    prompt_template:
      "Design marketing attribution.\nChannels: {channels}\nData available: {data}\nGoal: {goal}\n\nReturn:\n1) Recommended attribution model and rationale\n2) Touchpoint definitions and UTM governance\n3) Dashboard metrics and cohort views\n4) Known limitations and bias checks\n5) Implementation checklist",
    variables: ["channels", "data", "goal"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-marketing-product-launch",
    name: "Product launch planning",
    description:
      "Cross-functional launch checklist: messaging, channels, enablement, and day-one metrics.",
    prompt_template:
      "Plan product launch.\nProduct: {product}\nLaunch date: {launch_date}\nAudience: {audience}\n\nReturn:\n1) Launch narrative and key messages\n2) Channel and asset checklist\n3) Sales/customer enablement plan\n4) Risk register and contingencies\n5) Day 1 / Week 1 / Month 1 KPIs",
    variables: ["product", "launch_date", "audience"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Marketing",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-prospecting-planner",
    name: "Sales prospecting plan",
    description:
      "Target account list, outreach sequences, and weekly prospecting cadence.",
    prompt_template:
      "Build sales prospecting plan.\nTerritory: {territory}\nProduct: {product}\nQuota context: {quota}\n\nReturn:\n1) TAL criteria and prioritized accounts\n2) Outreach mix (email, call, social)\n3) Sequence templates and timing\n4) Weekly activity targets\n5) Conversion assumptions and pipeline math",
    variables: ["territory", "product", "quota"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-lead-qualification-engine",
    name: "Lead qualification (BANT)",
    description:
      "Qualifies leads on budget, authority, need, timeline with scorecard and next steps.",
    prompt_template:
      "Qualify sales lead (BANT).\nLead context: {lead}\nProduct: {product}\nHypothesis: {hypothesis}\n\nReturn:\n1) BANT scorecard with evidence\n2) Fit / no-fit recommendation\n3) Discovery questions for gaps\n4) Suggested sales stage and owner\n5) Disqualify or nurture path",
    variables: ["lead", "product", "hypothesis"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-discovery-facilitator",
    name: "Discovery call facilitation",
    description:
      "Structures discovery calls: agenda, questions, pain mapping, and mutual next steps.",
    prompt_template:
      "Facilitate sales discovery.\nProspect: {prospect}\nProduct: {product}\nStage: {stage}\n\nReturn:\n1) Call agenda and timeboxed flow\n2) Question bank by theme (pain, impact, process)\n3) Note-taking template\n4) Red flags and qualification signals\n5) Mutual action plan draft",
    variables: ["prospect", "product", "stage"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-needs-analysis",
    name: "Needs analysis & requirements",
    description:
      "Documents business and technical requirements, use cases, and success criteria.",
    prompt_template:
      "Run needs analysis.\nCustomer: {customer}\nKnown requirements: {requirements}\nProduct: {product}\n\nReturn:\n1) Problem statement and desired outcomes\n2) Use cases and priority ranking\n3) Current vs future state gap\n4) Success criteria and metrics\n5) Open requirements and validation plan",
    variables: ["customer", "requirements", "product"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-stakeholder-engagement",
    name: "Stakeholder engagement map",
    description:
      "Maps economic buyer, champions, influencers, blockers, and engagement plan.",
    prompt_template:
      "Map stakeholder engagement.\nAccount: {account}\nDeal: {deal}\nContacts: {contacts}\n\nReturn:\n1) Stakeholder map with roles and influence\n2) Position (champion/neutral/blocker) per contact\n3) Message and proof per stakeholder\n4) Meeting cadence and executive touchpoints\n5) Risk if single-threaded",
    variables: ["account", "deal", "contacts"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-demo-presenter",
    name: "Product demo presentation",
    description:
      "Demo storyline tailored to use case, persona flow, and proof points.",
    prompt_template:
      "Plan product demo.\nProspect: {prospect}\nUse case: {use_case}\nProduct: {product}\n\nReturn:\n1) Demo storyline (situation → solution → outcome)\n2) Scene-by-scene script with timing\n3) Discovery tie-ins and checkpoints\n4) Objection prep\n5) Call-to-action and follow-up",
    variables: ["prospect", "use_case", "product"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-roi-business-case",
    name: "ROI & business case",
    description:
      "Builds ROI model, assumptions, and executive summary for economic buyer approval.",
    prompt_template:
      "Build ROI business case.\nCustomer: {customer}\nSolution: {solution}\nMetrics: {metrics}\n\nReturn:\n1) Value drivers and baseline\n2) ROI / payback model with assumptions\n3) Sensitivity analysis\n4) Executive summary narrative\n5) Proof and validation needed",
    variables: ["customer", "solution", "metrics"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-proposal-sow",
    name: "Proposal & SOW drafting",
    description:
      "Commercial proposal structure, scope, deliverables, timeline, and assumptions.",
    prompt_template:
      "Draft proposal and SOW.\nDeal: {deal}\nScope: {scope}\nPricing: {pricing}\n\nReturn:\n1) Executive summary\n2) Scope and deliverables with acceptance criteria\n3) Timeline and milestones\n4) Commercial terms outline\n5) Assumptions, exclusions, and change control",
    variables: ["deal", "scope", "pricing"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-rfp-response",
    name: "RFP / RFI response",
    description:
      "Structures RFP/RFI compliance matrix, win themes, and response sections.",
    prompt_template:
      "Respond to RFP/RFI.\nRFP summary: {rfp}\nSolution: {solution}\nDeadline: {deadline}\n\nReturn:\n1) Compliance matrix outline\n2) Win themes and executive summary\n3) Section-by-section response plan\n4) Owner assignments and timeline\n5) Gaps requiring presales/legal input",
    variables: ["rfp", "solution", "deadline"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
      web_search_default: false,
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-negotiation-coach",
    name: "Negotiation support",
    description:
      "Negotiation prep: walk-away, tradeables, concessions, and talk tracks.",
    prompt_template:
      "Coach sales negotiation.\nDeal: {deal}\nKey terms: {terms}\nObjections: {objections}\n\nReturn:\n1) Negotiation objectives and walk-away\n2) Tradeable vs non-negotiable items\n3) Concession strategy and approval path\n4) Talk tracks per objection\n5) Close plan and timing",
    variables: ["deal", "terms", "objections"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-closing-coach",
    name: "Deal closing plan",
    description:
      "Mutual close plan, procurement steps, signatures, and implementation kickoff.",
    prompt_template:
      "Build deal closing plan.\nDeal: {deal}\nStakeholders: {stakeholders}\nTarget timeline: {timeline}\n\nReturn:\n1) Mutual close plan (MAP) with dates\n2) Remaining blockers and owners\n3) Procurement and legal checklist\n4) Signature and PO process\n5) Handoff to delivery/onboarding",
    variables: ["deal", "stakeholders", "timeline"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-sales-pipeline-forecast",
    name: "Pipeline forecast & review",
    description:
      "Pipeline inspection, forecast categories, risk flags, and commit/upside view.",
    prompt_template:
      "Run pipeline forecast review.\nPipeline: {pipeline}\nPeriod: {period}\nQuota: {quota}\n\nReturn:\n1) Forecast summary (commit, best case, pipeline)\n2) Deal-level inspection notes\n3) Slippage and risk flags\n4) Coverage ratio and gap to quota\n5) Actions for the week",
    variables: ["pipeline", "period", "quota"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Sales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-technical-qualifier",
    name: "Technical lead qualification",
    description:
      "Technical fit assessment: stack, integrations, constraints, and feasibility flags.",
    prompt_template:
      "Qualify lead technically.\nLead context: {lead}\nEnvironment: {environment}\nRequirements: {requirements}\n\nReturn:\n1) Technical fit score and rationale\n2) Integration and data constraints\n3) Security/compliance flags\n4) PoC or demo recommendation\n5) Escalation to architect if needed",
    variables: ["lead", "environment", "requirements"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-integration-architect",
    name: "Solution & integration design",
    description:
      "High-level architecture, integrations, data flows, and implementation phases.",
    prompt_template:
      "Design solution architecture.\nRequirements: {requirements}\nSystems: {systems}\nConstraints: {constraints}\n\nReturn:\n1) Architecture diagram narrative\n2) Integration points and APIs\n3) Data migration/sync approach\n4) Non-functional requirements (scale, security)\n5) Phased implementation outline",
    variables: ["requirements", "systems", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-demo-specialist",
    name: "Technical demo specialist",
    description:
      "Custom demo plan: environment, data, scenarios, and technical Q&A prep.",
    prompt_template:
      "Plan technical demo.\nProduct: {product}\nScenario: {scenario}\nAudience: {audience}\n\nReturn:\n1) Demo environment and data setup\n2) Scenario flow by persona\n3) Technical deep-dive backup slides\n4) Likely technical objections\n5) Success criteria for the demo",
    variables: ["product", "scenario", "audience"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-poc-executor",
    name: "Proof of concept (PoC) execution",
    description:
      "PoC scope, success criteria, timeline, resources, and exit recommendation.",
    prompt_template:
      "Plan PoC execution.\nUse case: {use_case}\nEnvironment: {environment}\nSuccess criteria: {criteria}\n\nReturn:\n1) PoC scope and out-of-scope\n2) Environment and data setup\n3) Test plan and milestones\n4) Roles and customer responsibilities\n5) Go/no-go decision framework",
    variables: ["use_case", "environment", "criteria"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-proposal-engineer",
    name: "Technical proposal engineering",
    description:
      "Technical proposal sections, solution blueprint, effort estimate, and assumptions.",
    prompt_template:
      "Engineer technical proposal.\nRequirements: {requirements}\nSolution: {solution}\nTimeline: {timeline}\n\nReturn:\n1) Technical approach and architecture summary\n2) Work breakdown and phases\n3) Effort estimate bands and assumptions\n4) Risks and dependencies\n5) Appendix list (diagrams, security, SLA)",
    variables: ["requirements", "solution", "timeline"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-feasibility-review",
    name: "Solution feasibility review",
    description:
      "Technical, delivery, and commercial feasibility with risk register.",
    prompt_template:
      "Review solution feasibility.\nDeal: {deal}\nSolution: {solution}\nConstraints: {constraints}\n\nReturn:\n1) Feasibility verdict with conditions\n2) Technical and delivery risks\n3) Resource and timeline realism check\n4) Commitments to avoid in contract\n5) Mitigations and presales follow-ups",
    variables: ["deal", "solution", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "sales_marketing",
    template_id: "sample-presales-delivery-handoff",
    name: "Presales → delivery handoff",
    description:
      "Implementation handoff pack: scope, assumptions, risks, and onboarding brief.",
    prompt_template:
      "Hand off to delivery.\nDeal: {deal}\nSolution sold: {solution}\nDelivery context: {delivery_team}\n\nReturn:\n1) Scope and contractual commitments summary\n2) Technical assumptions and open items\n3) Customer environment and access needs\n4) Risk register for implementation\n5) Kickoff agenda and 30-day plan",
    variables: ["deal", "solution", "delivery_team"],
    config: {
      preferred_model: "auto",
      domain_pack: "market_research",
      domain_focus: "Presales",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-compliance-orchestrator",
    name: "Legal & compliance orchestrator",
    description:
      "Creates regulatory workstreams, policy gaps, remediation plans, and audit evidence map.",
    prompt_template:
      "You are a legal/compliance orchestrator (not legal advice).\nOrganization context: {org}\nJurisdiction/standards: {regulations}\nReturn: obligations matrix, policy gaps, remediation backlog, owners/timelines, and audit evidence requirements.",
    variables: ["org", "regulations"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-contract-risk-lens",
    name: "Contract risk + negotiation lens",
    description:
      "Performs clause-level risk review and proposes fallback language + negotiation posture.",
    prompt_template:
      "Review the contract text for legal/commercial risk (not legal advice).\nContract: {contract}\nReturn: clause-by-clause risk rating, missing protections, fallback wording, negotiation priorities, and escalation triggers.",
    variables: ["contract"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-audit-readiness",
    name: "Audit readiness + controls planner",
    description:
      "Generates control mapping, evidence checklist, retention map, and monitoring cadence.",
    prompt_template:
      "Prepare an audit readiness package.\nFrameworks: {frameworks}\nCurrent controls: {controls}\nReturn: control-to-requirement map, evidence checklist, retention policy matrix, monitoring metrics, and remediation SLA plan.",
    variables: ["frameworks", "controls"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-exam-blueprint",
    name: "Exam blueprint and rubric planner",
    description:
      "Builds exam blueprint, difficulty balance, Bloom-level alignment, and grading rubric with moderation checks.",
    prompt_template:
      "Create an exam blueprint.\nCourse: {course}\nOutcomes: {outcomes}\nAssessment constraints: {constraints}\nReturn marks distribution, Bloom mapping, section-wise objectives, rubric dimensions, and moderation checklist.",
    variables: ["course", "outcomes", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-syllabus-auditor",
    name: "Syllabus coverage auditor",
    description:
      "Audits syllabus coverage against outcomes and identifies weak/overloaded modules with correction plan.",
    prompt_template:
      "Audit syllabus coverage.\nSyllabus: {syllabus}\nCO/PO mapping: {mapping}\nReturn coverage gaps, overlap risks, sequencing issues, and a corrected module progression.",
    variables: ["syllabus", "mapping"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-dpia-privacy-risk",
    name: "DPIA and privacy risk assessor",
    description:
      "Performs data-processing impact analysis with lawful basis, controls, and residual-risk scoring.",
    prompt_template:
      "Run a privacy impact assessment (not legal advice).\nProcessing activity: {processing}\nData categories: {data}\nJurisdiction: {jurisdiction}\nReturn lawful basis candidates, risk matrix, controls, residual risk, and action owners.",
    variables: ["processing", "data", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-vendor-compliance-screen",
    name: "Vendor compliance due-diligence screener",
    description:
      "Creates vendor compliance screening checklist (security, privacy, legal, operational) and remediation terms.",
    prompt_template:
      "Create a vendor due-diligence checklist (not legal advice).\nVendor profile: {vendor}\nControl framework: {framework}\nReturn required evidence, critical controls, red flags, contractual safeguards, and go/no-go criteria.",
    variables: ["vendor", "framework"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "general",
    template_id: "sample-general-meeting-brief",
    name: "Meeting brief generator",
    description: "Turns scattered notes into focused pre-read and action-ready meeting briefs.",
    prompt_template:
      "Create a concise meeting brief.\nTopic: {topic}\nStakeholders: {stakeholders}\nNotes: {notes}\nReturn objective, key context, decisions needed, discussion agenda, and action items.",
    variables: ["topic", "stakeholders", "notes"],
    config: { preferred_model: "auto" },
  },
  {
    category: "general",
    template_id: "sample-general-risk-register",
    name: "Risk register builder",
    description: "Builds a practical risk register with owners, triggers, and mitigation plans.",
    prompt_template:
      "Build a risk register.\nProgram context: {context}\nKnown risks: {risks}\nReturn probability/impact scoring, early-warning triggers, owners, mitigations, and review cadence.",
    variables: ["context", "risks"],
    config: { preferred_model: "auto" },
  },
  {
    category: "general",
    template_id: "sample-general-decision-memo",
    name: "Decision memo drafter",
    description: "Creates decision-ready memos with options, tradeoffs, and recommendations.",
    prompt_template:
      "Draft a decision memo.\nDecision question: {question}\nContext: {context}\nConstraints: {constraints}\nReturn options matrix, tradeoffs, recommendation, and implementation next steps.",
    variables: ["question", "context", "constraints"],
    config: { preferred_model: "auto" },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-refactor-planner",
    name: "Refactor planner",
    description: "Designs low-risk refactor plans with dependency and rollout awareness.",
    prompt_template:
      "Plan a safe refactor.\nTarget module: {module}\nCode context: {context}\nReturn scope boundaries, migration steps, test strategy, rollback plan, and expected risks.",
    variables: ["module", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Refactors",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-test-gap-hunter",
    name: "Test gap hunter",
    description: "Finds high-value missing tests and proposes targeted test cases.",
    prompt_template:
      "Analyze this code and test suite for coverage gaps.\nCode context: {code_context}\nTest context: {test_context}\nReturn highest-risk untested behaviors and example test cases.",
    variables: ["code_context", "test_context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Testing",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-api-contract-auditor",
    name: "API contract auditor",
    description: "Checks API request/response contracts, edge cases, and backward compatibility.",
    prompt_template:
      "Audit API contracts.\nEndpoints/specs: {contracts}\nRecent changes: {changes}\nReturn incompatibilities, validation gaps, versioning risks, and patch recommendations.",
    variables: ["contracts", "changes"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "API design",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-security-reviewer",
    name: "Security code reviewer",
    description: "Finds injection, auth, secrets, and supply-chain risks with severity-ranked fixes.",
    prompt_template:
      "Review code for security vulnerabilities.\nStack/context: {context}\nCode or diff:\n{code}\n\nReturn:\n1) Findings by severity (critical/high/medium/low)\n2) Attack scenario per finding\n3) Minimal fix with file references\n4) Regression tests to add\n5) Residual risk and follow-up scans",
    variables: ["code", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Security",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-debug-tracer",
    name: "Debug & root-cause tracer",
    description: "Triages errors, logs, and stack traces into likely causes and verification steps.",
    prompt_template:
      "Debug this issue and propose root cause.\nSymptom: {symptom}\nLogs/traces: {logs}\nCode context: {context}\n\nReturn:\n1) Top hypotheses ranked by likelihood\n2) Evidence for/against each hypothesis\n3) Minimal reproduction steps\n4) Targeted instrumentation or breakpoints\n5) Fix approach and regression guardrails",
    variables: ["symptom", "logs", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Debugging",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-doc-generator",
    name: "Code documentation writer",
    description: "Turns modules and APIs into README sections, docstrings, and usage examples.",
    prompt_template:
      "Write developer documentation from this code.\nAudience: {audience}\nModule/API context: {context}\n\nReturn:\n1) Overview and when to use\n2) Setup/prerequisites\n3) API or function reference with parameters and return types\n4) Usage examples\n5) Edge cases, limits, and troubleshooting notes",
    variables: ["context", "audience"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Documentation",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-dependency-upgrade",
    name: "Dependency upgrade planner",
    description: "Plans safe library upgrades with breaking-change analysis and rollout steps.",
    prompt_template:
      "Plan a dependency upgrade.\nPackage: {package}\nCurrent version: {current_version}\nTarget version: {target_version}\nRepo context: {context}\n\nReturn:\n1) Breaking changes and migration notes\n2) Files/modules likely affected\n3) Upgrade sequence and test matrix\n4) Rollback plan\n5) Post-upgrade validation checklist",
    variables: ["package", "current_version", "target_version", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Dependencies",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-db-migration",
    name: "Database migration reviewer",
    description: "Reviews schema migrations for safety, locking, backfill, and rollback risks.",
    prompt_template:
      "Review this database migration.\nDatabase/engine: {database}\nMigration script: {migration}\nProduction context: {context}\n\nReturn:\n1) Safety assessment (locking, downtime, data loss risk)\n2) Backfill and batching recommendations\n3) Index/constraint ordering issues\n4) Rollback strategy\n5) Pre/post migration verification queries",
    variables: ["database", "migration", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Database",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-performance-audit",
    name: "Performance profiler",
    description: "Spots hot paths, N+1 queries, memory leaks, and latency bottlenecks with fixes.",
    prompt_template:
      "Audit performance of this code path.\nSymptom/metrics: {metrics}\nCode context: {context}\nConstraints: {constraints}\n\nReturn:\n1) Bottleneck hypotheses with evidence\n2) Complexity and resource analysis\n3) Quick wins vs structural fixes\n4) Instrumentation/benchmark plan\n5) Expected impact and trade-offs",
    variables: ["metrics", "context", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Performance",
      citation_mode: "required",
    },
  },
  {
    category: "codebase",
    template_id: "sample-codebase-architecture-sketch",
    name: "Architecture sketcher",
    description: "Maps modules, data flows, and boundaries from existing code into a clear design view.",
    prompt_template:
      "Sketch architecture from this codebase context.\nSystem scope: {scope}\nCode/modules: {context}\nConstraints: {constraints}\n\nReturn:\n1) Component diagram narrative\n2) Data/control flows and integration points\n3) Boundaries, ownership, and coupling hotspots\n4) Risks and simplification options\n5) Suggested next refactor or ADR topics",
    variables: ["scope", "context", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "codebase_copilot",
      domain_focus: "Architecture",
      citation_mode: "required",
    },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-release-readiness",
    name: "Release readiness commander",
    description: "Builds release checklist, go/no-go gates, and rollback preparation.",
    prompt_template:
      "Prepare a release-readiness report.\nRelease scope: {scope}\nBuild/test signals: {signals}\nReturn gate checklist, blockers, risk rating, launch plan, and rollback criteria.",
    variables: ["scope", "signals"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Release readiness" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-incident-postmortem",
    name: "Incident postmortem copilot",
    description: "Creates blameless postmortems with root cause analysis and prevention actions.",
    prompt_template:
      "Draft a blameless incident postmortem.\nTimeline: {timeline}\nImpact: {impact}\nSystem context: {system}\nReturn root causes, contributing factors, corrective/preventive actions, and ownership matrix.",
    variables: ["timeline", "impact", "system"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Postmortems" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-sprint-planner",
    name: "Sprint planning assistant",
    description: "Converts backlog into realistic sprint plans with dependency balancing.",
    prompt_template:
      "Create a sprint plan.\nBacklog items: {backlog}\nTeam capacity: {capacity}\nDependencies: {dependencies}\nReturn sprint scope, sequencing, risk hotspots, and carryover guardrails.",
    variables: ["backlog", "capacity", "dependencies"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Sprint planning" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-tech-spec-writer",
    name: "Technical spec writer",
    description: "Drafts design docs with goals, interfaces, data model, and rollout plan.",
    prompt_template:
      "Write a technical design spec.\nFeature/problem: {feature}\nRequirements: {requirements}\nSystem context: {context}\n\nReturn:\n1) Goals and non-goals\n2) Proposed solution and alternatives considered\n3) API/data model changes\n4) Security, performance, and operability notes\n5) Rollout, monitoring, and rollback plan",
    variables: ["feature", "requirements", "context"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Tech specs" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-story-writer",
    name: "User story writer",
    description: "Turns requirements into INVEST stories with acceptance criteria and test focus.",
    prompt_template:
      "Write user stories from this requirement.\nEpic/feature: {feature}\nStakeholder context: {context}\nConstraints: {constraints}\n\nReturn:\n1) Story list with persona and value statement\n2) Acceptance criteria (Given/When/Then)\n3) Edge cases and out-of-scope items\n4) Dependencies and sizing hints\n5) Test scenarios to cover",
    variables: ["feature", "context", "constraints"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "User stories" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-retrospective",
    name: "Sprint retrospective facilitator",
    description: "Structures retro notes into themes, actions, and measurable improvements.",
    prompt_template:
      "Facilitate a sprint retrospective.\nSprint summary: {sprint_summary}\nWhat went well/poorly: {notes}\nMetrics: {metrics}\n\nReturn:\n1) Key themes (start/stop/continue)\n2) Root causes behind recurring issues\n3) Prioritized action items with owners\n4) Process experiments for next sprint\n5) Success metrics to track",
    variables: ["sprint_summary", "notes", "metrics"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Retrospectives" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-oncall-runbook",
    name: "On-call runbook builder",
    description: "Creates actionable runbooks with triage steps, escalation, and recovery commands.",
    prompt_template:
      "Build an on-call runbook.\nService: {service}\nCommon alerts: {alerts}\nArchitecture context: {context}\n\nReturn:\n1) Alert triage decision tree\n2) Diagnostic commands and dashboards\n3) Mitigation and rollback steps\n4) Escalation paths and SLAs\n5) Post-incident data to capture",
    variables: ["service", "alerts", "context"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Runbooks" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-cicd-reviewer",
    name: "CI/CD pipeline reviewer",
    description: "Audits build pipelines for speed, reliability, security gates, and deploy safety.",
    prompt_template:
      "Review this CI/CD pipeline.\nPipeline config: {pipeline}\nRelease model: {release_model}\nPain points: {pain_points}\n\nReturn:\n1) Stage-by-stage assessment\n2) Flaky/slow step hotspots\n3) Missing quality or security gates\n4) Caching, parallelism, and artifact improvements\n5) Safer promotion and rollback recommendations",
    variables: ["pipeline", "release_model", "pain_points"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "CI/CD" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-tech-debt",
    name: "Technical debt prioritizer",
    description: "Scores debt items by risk, cost, and payoff to build a pragmatic payoff roadmap.",
    prompt_template:
      "Prioritize technical debt.\nDebt backlog: {debt_items}\nProduct priorities: {priorities}\nTeam capacity: {capacity}\n\nReturn:\n1) Scored debt items (impact, effort, risk)\n2) Quick wins vs strategic investments\n3) Dependencies and sequencing\n4) Expected outcomes per quarter\n5) Metrics to prove debt reduction",
    variables: ["debt_items", "priorities", "capacity"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Tech debt" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-capacity-planner",
    name: "Capacity & velocity planner",
    description: "Forecasts delivery capacity using velocity, leave, and dependency buffers.",
    prompt_template:
      "Plan engineering capacity.\nTeam roster: {team}\nHistorical velocity: {velocity}\nUpcoming commitments: {commitments}\n\nReturn:\n1) Available capacity by sprint/week\n2) Confidence range (best/base/worst)\n3) Dependency and interrupt buffers\n4) Commitment vs capacity gap analysis\n5) Hiring, scope, or timeline recommendations",
    variables: ["team", "velocity", "commitments"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Capacity planning" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-change-advisory",
    name: "Change advisory assistant",
    description: "Prepares deployment comms, blast-radius analysis, and CAB-ready change records.",
    prompt_template:
      "Prepare a change advisory record.\nChange description: {change}\nAffected systems: {systems}\nMaintenance window: {window}\n\nReturn:\n1) Change summary and business justification\n2) Blast radius and dependency map\n3) Implementation and validation steps\n4) Rollback and communication plan\n5) Risk rating and approver checklist",
    variables: ["change", "systems", "window"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Change management" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-rfc-reviewer",
    name: "RFC & ADR reviewer",
    description: "Reviews design proposals for clarity, tradeoffs, risks, and decision readiness.",
    prompt_template:
      "Review this RFC/ADR.\nProposal: {proposal}\nAlternatives: {alternatives}\nConstraints: {constraints}\n\nReturn:\n1) Problem/solution clarity assessment\n2) Missing tradeoffs or failure modes\n3) Operational and migration risks\n4) Open questions for authors\n5) Recommend approve, revise, or defer with rationale",
    variables: ["proposal", "alternatives", "constraints"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "RFC review" },
  },
  {
    category: "sdlc",
    template_id: "sample-sdlc-observability",
    name: "Observability reviewer",
    description: "Audits metrics, logs, traces, and alerts for coverage gaps and noisy signals.",
    prompt_template:
      "Review observability for this service.\nService: {service}\nCurrent signals: {signals}\nSLOs: {slos}\n\nReturn:\n1) Golden signals coverage (latency, traffic, errors, saturation)\n2) Missing metrics/logs/traces\n3) Alert quality review (actionable vs noisy)\n4) Dashboard gaps for on-call\n5) Prioritized instrumentation backlog",
    variables: ["service", "signals", "slos"],
    config: { preferred_model: "auto", domain_pack: "sdlc_automation", domain_focus: "Observability" },
  },
  {
    category: "academics",
    template_id: "sample-academics-naac-nba-prep",
    name: "NAAC/NBA documentation assistant",
    description: "Structures accreditation evidence, metrics mapping, and narrative readiness.",
    prompt_template:
      "Prepare accreditation documentation support.\nInstitution data: {institution}\nCriteria/framework: {criteria}\nReturn evidence matrix, metric mapping, gaps, action plan, and review timeline.",
    variables: ["institution", "criteria"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-project-mentor",
    name: "Capstone project mentor",
    description: "Guides student capstone execution with milestones, risks, and evaluation checkpoints.",
    prompt_template:
      "Mentor a capstone project.\nProblem statement: {problem}\nTeam profile: {team}\nTimeline: {timeline}\nReturn milestone plan, deliverables, quality checks, and viva-prep questions.",
    variables: ["problem", "team", "timeline"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-literature-synthesizer",
    name: "Literature review synthesizer",
    description:
      "Synthesizes papers into themes, contradictions, evidence gaps, and annotated bibliography for thesis or review chapters.",
    prompt_template:
      "You are an academic literature review specialist.\n\nTopic: {topic}\nSources/notes: {sources}\nScope: {scope}\n\nReturn:\n1) Thematic synthesis (3–6 themes with supporting citations)\n2) Contradictions and debates in the field\n3) Methodological patterns and quality signals\n4) Evidence gaps and future research directions\n5) Annotated bibliography table (author, year, method, key finding, relevance)\n6) Suggested outline for a literature review chapter\n\nCite sources; separate established findings from open questions.",
    variables: ["topic", "sources", "scope"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-thesis-planner",
    name: "Thesis & dissertation planner",
    description:
      "Structures thesis roadmap: chapters, milestones, advisor checkpoints, and risk buffers for UG/PG research.",
    prompt_template:
      "You are a thesis/dissertation planning advisor.\n\nResearch topic: {topic}\nProgram level: {level}\nTimeline: {timeline}\n\nReturn:\n1) Research question refinement and scope boundaries\n2) Chapter-wise structure with deliverables per chapter\n3) Milestone calendar (literature, methods, data collection, analysis, writing, revision)\n4) Advisor/committee checkpoint agenda\n5) Risk register (scope creep, data access, ethics delays) with mitigations\n6) Weekly work plan for the next 4–6 weeks",
    variables: ["topic", "level", "timeline"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-grant-proposal",
    name: "Grant & fellowship proposal writer",
    description:
      "Drafts grant sections: problem statement, aims, methods, budget narrative, impact, and evaluation plan.",
    prompt_template:
      "You are an academic grant writing specialist.\n\nFunding call: {call}\nResearch idea: {idea}\nInstitution context: {institution}\n\nReturn:\n1) Problem statement and significance (with citations)\n2) Specific aims / objectives (measurable)\n3) Background and preliminary work summary\n4) Methods and work plan (Gantt-style phases)\n5) Expected outcomes, impact, and dissemination\n6) Budget justification narrative (categories, not amounts unless provided)\n7) Evaluation metrics and risk mitigation\n8) Reviewer objection prep (weaknesses + responses)",
    variables: ["call", "idea", "institution"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-ethics-irb",
    name: "Research ethics & IRB helper",
    description:
      "Drafts ethics/IRB application sections: risks, consent, data handling, vulnerable populations, and compliance checklist.",
    prompt_template:
      "You support academic research ethics applications (not legal advice).\n\nStudy design: {study}\nParticipants: {participants}\nData handling: {data}\n\nReturn:\n1) Study summary in plain language\n2) Risk assessment (physical, psychological, privacy, coercion)\n3) Informed consent elements and waiver considerations\n4) Vulnerable population safeguards if applicable\n5) Data collection, storage, retention, and anonymization plan\n6) Recruitment and compensation ethics\n7) IRB/ethics committee checklist with missing items flagged\n8) Suggested revisions to reduce review cycles",
    variables: ["study", "participants", "data"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-citation-auditor",
    name: "Citation & reference auditor",
    description:
      "Audits citations for style consistency, missing references, orphan claims, and bibliography formatting.",
    prompt_template:
      "You are an academic citation and reference auditor.\n\nDraft text: {draft}\nCitation style: {style}\nBibliography: {bibliography}\n\nReturn:\n1) In-text citation issues (missing, inconsistent, over-cited claims)\n2) Reference list issues (duplicates, incomplete fields, style mismatches)\n3) Claims lacking citation support\n4) Orphan references not cited in text\n5) DOI/URL and formatting corrections checklist\n6) Priority fix list (high/medium/low)",
    variables: ["draft", "style", "bibliography"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-conference-poster",
    name: "Conference abstract & poster planner",
    description:
      "Crafts conference abstracts, poster section layout, talking points, and Q&A prep for academic presentations.",
    prompt_template:
      "You are an academic conference presentation coach.\n\nResearch summary: {research}\nConference/track: {conference}\nFormat: {format}\n\nReturn:\n1) Abstract (title, background, methods, results, conclusion) within typical word limits\n2) Poster section layout (columns, figures, key bullets)\n3) 60-second elevator pitch script\n4) Anticipated audience questions with concise answers\n5) Visual/asset checklist (charts, diagrams, QR codes)\n6) Networking follow-up email template",
    variables: ["research", "conference", "format"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "pptx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-peer-review-response",
    name: "Peer review response writer",
    description:
      "Drafts point-by-point rebuttals to reviewer comments with revision plan and manuscript change log.",
    prompt_template:
      "You help authors respond to peer review (not legal advice).\n\nReviewer comments: {comments}\nManuscript context: {manuscript}\n\nReturn:\n1) Point-by-point response letter (quote reviewer → response → manuscript change)\n2) Tone calibration (respectful, evidence-based)\n3) Changes accepted vs declined with rationale\n4) Additional analyses/experiments suggested if needed\n5) Revised abstract or cover letter paragraph if major changes\n6) Resubmission checklist",
    variables: ["comments", "manuscript"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-lesson-planner",
    name: "Lesson & activity designer",
    description:
      "Plans single lessons with learning objectives, activities, formative checks, differentiation, and timeboxed flow.",
    prompt_template:
      "You are an instructional designer for higher education.\n\nCourse/module: {course}\nLesson topic: {topic}\nDuration: {duration}\n\nReturn:\n1) Learning objectives (measurable, Bloom-aligned)\n2) Lesson flow with minute-by-minute plan\n3) Active learning activities (discussion, case, lab, poll)\n4) Formative assessment checkpoints\n5) Differentiation for mixed-ability cohorts\n6) Materials and prep checklist\n7) Homework / flipped pre-work if applicable",
    variables: ["course", "topic", "duration"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html", "pptx"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-assignment-designer",
    name: "Assignment & rubric designer",
    description:
      "Designs assignments with authentic tasks, scaffolding, anti-plagiarism guidance, and detailed rubrics.",
    prompt_template:
      "You design rigorous academic assignments.\n\nCourse outcomes: {outcomes}\nAssignment brief: {brief}\nConstraints: {constraints}\n\nReturn:\n1) Assignment prompt (clear task, deliverables, format)\n2) Scaffolding milestones for students\n3) Rubric with criteria, levels, and point weights\n4) Academic integrity guidance (allowed collaboration, citation expectations)\n5) Sample excellent vs weak submission traits\n6) Grading time estimate and moderation notes",
    variables: ["outcomes", "brief", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-study-coach",
    name: "Study & exam prep coach",
    description:
      "Builds personalized study plans, spaced repetition schedules, practice questions, and exam-day strategy.",
    prompt_template:
      "You are a student success coach for exam preparation.\n\nSubjects/topics: {subjects}\nExam date: {exam_date}\nCurrent level: {level}\n\nReturn:\n1) Diagnostic self-check questions per topic\n2) Prioritized study plan (weak → strong areas)\n3) Spaced repetition schedule until exam day\n4) Active recall and practice question sets\n5) Resource recommendations (textbook sections, videos, past papers)\n6) Exam-day strategy and time management\n7) Stress and burnout prevention tips",
    variables: ["subjects", "exam_date", "level"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-defense-coach",
    name: "Thesis defense & viva coach",
    description:
      "Prepares defense presentations, committee questions, weak-spot drills, and opening/closing scripts.",
    prompt_template:
      "You coach students for thesis/dissertation defense.\n\nThesis summary: {thesis}\nCommittee context: {committee}\nFormat: {format}\n\nReturn:\n1) Defense presentation outline (10–15 slides structure)\n2) Opening and closing scripts\n3) Likely committee questions by theme (methods, contribution, limitations, future work)\n4) Weak-spot drill with model concise answers\n5) Demo/live results talking points\n6) Dress rehearsal checklist and timing plan",
    variables: ["thesis", "committee", "format"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "pptx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-obe-attainment",
    name: "OBE attainment & CO-PO analyst",
    description:
      "Analyzes outcome attainment data, CO-PO mapping gaps, and improvement actions for accreditation cycles.",
    prompt_template:
      "You are an outcome-based education (OBE) analyst.\n\nProgram outcomes: {outcomes}\nAssessment data: {data}\nThresholds: {thresholds}\n\nReturn:\n1) CO attainment summary with direct/indirect measures\n2) CO-PO mapping heatmap interpretation\n3) Courses/modules below threshold with root causes\n4) Action plan (curriculum, pedagogy, assessment changes)\n5) Evidence pack checklist for accreditation reviewers\n6) Dashboard metrics to track next term",
    variables: ["outcomes", "data", "thresholds"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-placement-coordinator",
    name: "Internship & placement coordinator",
    description:
      "Plans placement drives, employer outreach, student readiness, interview prep, and offer tracking.",
    prompt_template:
      "You are a higher-ed placement and internship coordinator.\n\nProgram: {program}\nCohort profile: {cohort}\nPlacement season: {season}\n\nReturn:\n1) Employer target list by role fit and tier\n2) Outreach email templates and follow-up cadence\n3) Student readiness checklist (resume, portfolio, mock interviews)\n4) Drive timeline (tests, GD, technical, HR rounds)\n5) Skill-gap workshops based on cohort profile\n6) Offer tracking metrics and risk flags (low conversion, late joiners)",
    variables: ["program", "cohort", "season"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "html", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-rubric-designer",
    name: "Rubric & marking scheme designer",
    description:
      "Designs assessment rubrics with criteria, levels, and moderation notes.",
    prompt_template:
      "Design assessment rubric.\nAssignment: {assignment}\nLearning outcomes: {outcomes}\nScale: {scale}\nReturn criteria table, level descriptors, weighting, and moderation guidance.",
    variables: ["assignment", "outcomes", "scale"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-lms-course-builder",
    name: "LMS course shell builder",
    description:
      "Structures LMS modules, weekly flow, assets, and engagement checkpoints.",
    prompt_template:
      "Build LMS course shell.\nCourse: {course}\nWeeks: {weeks}\nPlatform: {platform}\nReturn module map, weekly activities, uploads, and discussion prompts.",
    variables: ["course", "weeks", "platform"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-flipped-classroom",
    name: "Flipped classroom planner",
    description:
      "Pre-class, in-class, and post-class activities for flipped pedagogy.",
    prompt_template:
      "Plan flipped classroom.\nTopic: {topic}\nDuration: {duration}\nLevel: {level}\nReturn pre-work, in-class active tasks, and consolidation.",
    variables: ["topic", "duration", "level"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-lab-practical-planner",
    name: "Lab & practical session planner",
    description:
      "Lab objectives, safety, equipment, procedure, and assessment rubric.",
    prompt_template:
      "Plan lab session.\nLab: {lab}\nEquipment: {equipment}\nOutcomes: {outcomes}\nReturn procedure, safety, demo script, and rubric.",
    variables: ["lab", "equipment", "outcomes"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-quiz-generator",
    name: "Formative quiz generator",
    description:
      "Question banks by Bloom level with distractors and answer keys.",
    prompt_template:
      "Generate formative quiz.\nTopic: {topic}\nBloom level: {bloom_level}\nCount: {count}\nReturn questions, options, keys, and rationales.",
    variables: ["topic", "bloom_level", "count"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-grading-feedback",
    name: "Grading feedback writer",
    description:
      "Personalized assignment feedback aligned to rubric and growth goals.",
    prompt_template:
      "Write grading feedback.\nSubmission summary: {submission}\nRubric: {rubric}\nTone: {tone}\nReturn strengths, gaps, actionable next steps, and grade justification.",
    variables: ["submission", "rubric", "tone"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-active-learning",
    name: "Active learning designer",
    description:
      "Think-pair-share, case studies, polls, and collaborative activities.",
    prompt_template:
      "Design active learning.\nSession: {session}\nClass size: {size}\nObjectives: {objectives}\nReturn activities, timing, materials, and facilitation notes.",
    variables: ["session", "size", "objectives"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-course-outline",
    name: "Course outline & credit planner",
    description:
      "Syllabus-level outline with topics, credits, workload, and references.",
    prompt_template:
      "Draft course outline.\nCourse: {course}\nProgram outcomes: {outcomes}\nTarget audience: {audience}\nCredits: {credits}\nL:T:P ratio: {ltp}\nReturn weekly topics, readings, workload estimate, and policies stub.",
    variables: ["course", "outcomes", "audience", "credits", "ltp"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-invigilation-planner",
    name: "Exam invigilation planner",
    description:
      "Seating, invigilator roster, logistics, and contingency for exams.",
    prompt_template:
      "Plan exam invigilation.\nExam: {exam}\nRooms: {rooms}\nCandidates: {candidates}\nReturn seating, roster, timeline, and incident protocol.",
    variables: ["exam", "rooms", "candidates"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-faculty-observation",
    name: "Classroom observation coach",
    description:
      "Peer observation forms, debrief questions, and improvement plan.",
    prompt_template:
      "Coach classroom observation.\nContext: {observation}\nFramework: {framework}\nGoals: {goals}\nReturn observation form, evidence prompts, and debrief plan.",
    variables: ["observation", "framework", "goals"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Teaching",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-systematic-review",
    name: "Systematic review protocol",
    description:
      "PRISMA-style review protocol, search strategy, and screening workflow.",
    prompt_template:
      "Plan systematic review.\nQuestion: {question}\nDatabases: {databases}\nInclusion: {inclusion}\nReturn protocol, search strings, screening, and quality tools.",
    variables: ["question", "databases", "inclusion"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-research-methodology",
    name: "Research methodology advisor",
    description:
      "Study design, sampling, instruments, validity, and analysis plan.",
    prompt_template:
      "Advise research methodology.\nQuestion: {question}\nField: {field}\nConstraints: {constraints}\nReturn design options, tradeoffs, and analysis plan.",
    variables: ["question", "field", "constraints"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-journal-matcher",
    name: "Journal & venue matcher",
    description:
      "Matches manuscripts to journals/conferences by scope, impact, and fit.",
    prompt_template:
      "Match publication venues.\nManuscript: {manuscript}\nField: {field}\nPreferences: {preferences}\nReturn ranked venues, fit rationale, and submission checklist.",
    variables: ["manuscript", "field", "preferences"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-abstract-writer",
    name: "Abstract & summary writer",
    description:
      "Conference and journal abstracts within word limits and structure.",
    prompt_template:
      "Write academic abstract.\nPaper content: {paper}\nVenue: {venue}\nWord limit: {limit}\nReturn abstract variants and keywords.",
    variables: ["paper", "venue", "limit"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-research-data-plan",
    name: "Research data management plan",
    description:
      "DMP for storage, ethics, metadata, sharing, and retention.",
    prompt_template:
      "Draft research data plan.\nProject: {project}\nData types: {data_types}\nFunder: {funder}\nReturn storage, access, ethics, and retention plan.",
    variables: ["project", "data_types", "funder"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-hypothesis-framer",
    name: "Hypothesis & RQ framer",
    description:
      "Refines research questions, hypotheses, and operational definitions.",
    prompt_template:
      "Frame research questions.\nTopic: {topic}\nGap: {gap}\nPopulation: {population}\nReturn RQs, hypotheses, variables, and definitions.",
    variables: ["topic", "gap", "population"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-replication-plan",
    name: "Replication study planner",
    description:
      "Replication protocol, power, materials, and preregistration outline.",
    prompt_template:
      "Plan replication study.\nTarget study: {study}\nOriginal findings: {original}\nResources: {resources}\nReturn protocol, power notes, and preregistration stub.",
    variables: ["study", "original", "resources"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-research-collaboration",
    name: "Research collaboration planner",
    description:
      "Co-authorship MOU, roles, timelines, and IP/data sharing terms.",
    prompt_template:
      "Plan research collaboration.\nProject: {project}\nPartners: {partners}\nDeliverables: {deliverables}\nReturn roles, timeline, authorship, and data agreement outline.",
    variables: ["project", "partners", "deliverables"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-bibliography-formatter",
    name: "Bibliography formatter",
    description:
      "Formats references in APA/IEEE/Chicago and flags incomplete citations.",
    prompt_template:
      "Format bibliography.\nReferences: {references}\nStyle: {style}\nSources: {sources}\nReturn formatted list and missing-field flags.",
    variables: ["references", "style", "sources"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-research-timeline",
    name: "Research project timeline",
    description:
      "Gantt-style milestones for proposal through publication.",
    prompt_template:
      "Build research timeline.\nProject: {project}\nDeadline: {deadline}\nTeam: {team}\nReturn phases, milestones, risks, and buffer.",
    variables: ["project", "deadline", "team"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Research",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-academic-advisor",
    name: "Academic advising session planner",
    description:
      "Advising agendas, degree audit prompts, and intervention plans.",
    prompt_template:
      "Plan advising session.\nStudent context: {student}\nProgram: {program}\nConcerns: {concerns}\nReturn agenda, questions, resources, and follow-up.",
    variables: ["student", "program", "concerns"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-capstone-coach",
    name: "Capstone milestone coach",
    description:
      "Capstone checkpoints, deliverables, and committee coordination.",
    prompt_template:
      "Coach capstone progress.\nProject: {project}\nMilestones: {milestones}\nCommittee: {committee}\nReturn schedule, deliverable rubrics, and risk flags.",
    variables: ["project", "milestones", "committee"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-study-skills-workshop",
    name: "Study skills workshop designer",
    description:
      "Workshops on note-taking, time management, and exam strategies.",
    prompt_template:
      "Design study skills workshop.\nAudience: {audience}\nTopics: {topics}\nDuration: {duration}\nReturn agenda, exercises, and handouts.",
    variables: ["audience", "topics", "duration"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-scholarship-finder",
    name: "Scholarship & funding finder",
    description:
      "Student scholarship search plan with eligibility and deadlines.",
    prompt_template:
      "Find scholarships.\nStudent profile: {profile}\nField: {field}\nRegion: {region}\nReturn opportunities, eligibility, deadlines, and application tips.",
    variables: ["profile", "field", "region"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "html", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-peer-tutoring",
    name: "Peer tutoring program designer",
    description:
      "Peer tutor recruitment, training, matching, and quality loop.",
    prompt_template:
      "Design peer tutoring program.\nSubjects: {subjects}\nCohort: {cohort}\nCapacity: {capacity}\nReturn recruitment, training, matching, and metrics.",
    variables: ["subjects", "cohort", "capacity"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-career-portfolio",
    name: "Career portfolio coach",
    description:
      "Academic CV, portfolio, LinkedIn, and role targeting for graduates.",
    prompt_template:
      "Coach career portfolio.\nProfile: {profile}\nTarget roles: {roles}\nExperience: {experience}\nReturn CV outline, portfolio pieces, and gap plan.",
    variables: ["profile", "roles", "experience"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-wellness-referral",
    name: "Student wellness guide",
    description:
      "Support pathways, referral scripts, and classroom wellness practices.",
    prompt_template:
      "Guide student wellness support.\nSituation: {situation}\nCampus resources: {resources}\nYour role: {role}\nReturn referral steps, scripts, and boundaries.",
    variables: ["situation", "resources", "role"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-academic-integrity",
    name: "Academic integrity educator",
    description:
      "Integrity modules, plagiarism prevention, and case discussion guides.",
    prompt_template:
      "Plan academic integrity education.\nCourse: {course}\nPolicy: {policy}\nPast incidents: {incidents}\nReturn lesson plan, examples, and assessment design tips.",
    variables: ["course", "policy", "incidents"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-presentation-coach",
    name: "Student presentation coach",
    description:
      "Slide structure, delivery, Q&A prep, and timing for student talks.",
    prompt_template:
      "Coach student presentation.\nTopic: {topic}\nAudience: {audience}\nDuration: {duration}\nReturn outline, slide plan, delivery tips, and Q&A prep.",
    variables: ["topic", "audience", "duration"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Student success",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-aqar-writer",
    name: "AQAR report writer",
    description:
      "Annual Quality Assurance Report sections with evidence pointers.",
    prompt_template:
      "Draft AQAR content.\nInstitution: {institution}\nYear: {year}\nMetrics: {metrics}\nReturn section drafts, evidence map, and gaps.",
    variables: ["institution", "year", "metrics"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-iqac-planner",
    name: "IQAC action planner",
    description:
      "IQAC meeting agenda, action items, and quality initiative roadmap.",
    prompt_template:
      "Plan IQAC cycle.\nInstitution: {institution}\nCycle: {cycle}\nPriorities: {priorities}\nReturn agenda, action register, and KPIs.",
    variables: ["institution", "cycle", "priorities"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-nba-sar",
    name: "NBA SAR section drafter",
    description:
      "NBA Self Assessment Report section drafts with criterion mapping.",
    prompt_template:
      "Draft NBA SAR section.\nProgram: {program}\nCriterion: {criterion}\nEvidence: {evidence}\nReturn narrative, tables, and gap actions.",
    variables: ["program", "criterion", "evidence"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-criteria-evidence",
    name: "Accreditation evidence mapper",
    description:
      "Maps criteria to documents, owners, and collection timeline.",
    prompt_template:
      "Map accreditation evidence.\nFramework: {framework}\nCriteria: {criteria}\nCurrent inventory: {inventory}\nReturn evidence matrix, owners, and timeline.",
    variables: ["framework", "criteria", "inventory"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-self-study-report",
    name: "Self-study report architect",
    description:
      "Institutional self-study structure, chapters, and writing plan.",
    prompt_template:
      "Architect self-study report.\nAccreditation: {accreditation}\nScope: {scope}\nStakeholders: {stakeholders}\nReturn chapter outline, writing plan, and data needs.",
    variables: ["accreditation", "scope", "stakeholders"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "pptx", "research"],
    },
  },
  {
    category: "academics",
    template_id: "sample-academics-outcome-framework",
    name: "Program outcome framework designer",
    description:
      "PLOs, CLOs, graduate attributes, and mapping starter templates.",
    prompt_template:
      "Design outcome framework.\nProgram: {program}\nStakeholders: {stakeholders}\nBenchmarks: {benchmarks}\nReturn PLO/CLO set, mapping template, and validation plan.",
    variables: ["program", "stakeholders", "benchmarks"],
    config: {
      preferred_model: "auto",
      domain_pack: "academics",
      domain_focus: "Accreditation",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-policy-drafter",
    name: "Policy drafter",
    description: "Drafts internal policies with scope, controls, exceptions, and governance hooks.",
    prompt_template:
      "Draft an internal policy (not legal advice).\nPolicy objective: {objective}\nOrganization context: {org}\nRegulatory context: {regulatory}\nReturn policy sections, control statements, exceptions, and review cycle.",
    variables: ["objective", "org", "regulatory"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-obligation-mapper",
    name: "Regulatory obligation mapper",
    description: "Maps clauses to operational obligations and accountable owners.",
    prompt_template:
      "Map obligations from regulations (not legal advice).\nRegulatory text: {regulation}\nBusiness process context: {processes}\nReturn obligation matrix, owner mapping, evidence expectations, and deadline tracker.",
    variables: ["regulation", "processes"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-compliance-training-plan",
    name: "Compliance training planner",
    description: "Builds role-based compliance training tracks with assessment criteria.",
    prompt_template:
      "Create a compliance training plan.\nAudience roles: {roles}\nFrameworks: {frameworks}\nCurrent maturity: {maturity}\nReturn module map, delivery cadence, assessment metrics, and remediation loop.",
    variables: ["roles", "frameworks", "maturity"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-control-testing",
    name: "Control testing coordinator",
    description: "Plans control testing cycles, sample strategy, and exception management.",
    prompt_template:
      "Prepare control testing plan.\nControl inventory: {controls}\nAudit scope: {scope}\nReturn test procedures, sampling approach, evidence checklist, exception workflow, and reporting format.",
    variables: ["controls", "scope"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-nda-reviewer",
    name: "NDA & confidentiality reviewer",
    description:
      "Reviews NDAs and mutual confidentiality terms: scope, duration, carve-outs, residuals, and negotiation fallbacks.",
    prompt_template:
      "Review an NDA or confidentiality agreement (not legal advice).\nAgreement text: {agreement}\nParty role: {party_role}\nBusiness context: {context}\n\nReturn:\n1) Term summary (definition of confidential info, purpose, term, geography)\n2) Risk-rated clause review (marking, return/destruction, residuals, non-solicit, injunctive relief)\n3) Missing protections and over-broad language\n4) Fallback negotiation language per issue\n5) Sign / negotiate / escalate recommendation\n6) Comparison notes vs market-standard NDAs",
    variables: ["agreement", "party_role", "context"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-saas-msa-review",
    name: "SaaS & MSA terms reviewer",
    description:
      "Reviews SaaS/MSA terms: liability caps, indemnity, SLAs, data processing, termination, and auto-renewal traps.",
    prompt_template:
      "Review SaaS or master services agreement terms (not legal advice).\nContract excerpt: {contract}\nOur role: {role}\nCommercial context: {commercial}\n\nReturn:\n1) Executive risk summary\n2) Clause table: liability, indemnity, warranty, IP, data/privacy, security, SLA, termination, assignment, governing law\n3) Customer-favorable vs vendor-favorable flags\n4) Fallback language and negotiation priorities\n5) Deal-breaker vs tradeable items\n6) Security and DPA addendum checklist",
    variables: ["contract", "role", "commercial"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-sla-credits",
    name: "SLA & service credits analyst",
    description:
      "Analyzes SLA definitions, measurement, exclusions, credits, and operational enforceability.",
    prompt_template:
      "Analyze SLA and service credit provisions (not legal advice).\nSLA text: {sla}\nService context: {service}\nHistorical performance: {performance}\n\nReturn:\n1) SLA metric definitions and measurement method\n2) Exclusions and force majeure gaps\n3) Credit / remedy structure and caps\n4) Operational monitoring requirements\n5) Negotiation levers (tighter definitions, reporting, step-in rights)\n6) Sample SLA dashboard metrics",
    variables: ["sla", "service", "performance"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "html"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-gdpr-dsar",
    name: "GDPR/CCPA data subject request handler",
    description:
      "Triages privacy rights requests (access, deletion, portability), identity verification, and response timelines.",
    prompt_template:
      "Handle a data subject rights request workflow (not legal advice).\nRequest type: {request_type}\nJurisdiction: {jurisdiction}\nRequest details: {details}\n\nReturn:\n1) Applicable rights and legal basis check\n2) Identity verification steps\n3) Systems/data stores to search\n4) Response timeline and extension rules\n5) Redaction and exception analysis (legal hold, exemptions)\n6) Customer-facing response template\n7) Internal task list with owners",
    variables: ["request_type", "jurisdiction", "details"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-breach-response",
    name: "Data breach notification planner",
    description:
      "Plans breach triage, containment, regulator/customer notification timelines, and forensic evidence preservation.",
    prompt_template:
      "Plan a data breach response (not legal advice).\nIncident summary: {incident}\nJurisdictions: {jurisdictions}\nData involved: {data}\n\nReturn:\n1) Immediate containment checklist (first 24–72 hours)\n2) Severity assessment and classification\n3) Notification obligations by jurisdiction (regulators, individuals, partners)\n4) Timeline tracker with statutory deadlines\n5) Forensic evidence preservation steps\n6) Draft internal war-room roles and comms templates\n7) Post-incident remediation and audit trail",
    variables: ["incident", "jurisdictions", "data"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-cookie-consent",
    name: "Cookie & consent program designer",
    description:
      "Designs cookie banners, consent records, preference centers, and policy alignment for web/mobile tracking.",
    prompt_template:
      "Design a cookie and consent compliance program (not legal advice).\nProperties: {properties}\nTracking stack: {tracking}\nTarget markets: {markets}\n\nReturn:\n1) Cookie/tag inventory categories (strictly necessary, analytics, marketing)\n2) Consent model by market (opt-in vs opt-out)\n3) Banner and preference-center UX requirements\n4) Consent record fields and retention\n5) Policy updates needed (privacy, cookie policy)\n6) Vendor/tag manager implementation checklist\n7) Testing and audit plan",
    variables: ["properties", "tracking", "markets"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "html", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-sox-controls",
    name: "SOX & financial controls mapper",
    description:
      "Maps financial reporting controls to SOX requirements, walkthroughs, and deficiency remediation.",
    prompt_template:
      "Map SOX / financial reporting controls (not legal advice).\nEntity context: {entity}\nProcesses: {processes}\nFramework: {framework}\n\nReturn:\n1) Process-to-control matrix (preventive/detective, manual/automated)\n2) Key controls and risk assertions covered\n3) Walkthrough interview questions\n4) Design vs operating effectiveness test plan\n5) Deficiency classification guidance (deficiency, significant deficiency, material weakness)\n6) Remediation roadmap with owners",
    variables: ["entity", "processes", "framework"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-anti-bribery",
    name: "Anti-bribery & sanctions screener",
    description:
      "Screens third parties for FCPA/UK Bribery Act risks, gifts, PEPs, and sanctions exposure with red-flag playbook.",
    prompt_template:
      "Screen anti-bribery and sanctions risk (not legal advice).\nThird party: {third_party}\nCountry/sector: {context}\nTransaction: {transaction}\n\nReturn:\n1) Risk tier (low/medium/high) with rationale\n2) Red flags checklist (government touchpoints, agents, unusual commissions)\n3) Enhanced due diligence steps if needed\n4) Contract clauses (anti-corruption, audit rights, termination)\n5) Sanctions and PEP screening workflow\n6) Approval path and documentation requirements",
    variables: ["third_party", "context", "transaction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-employment-compliance",
    name: "Employment & labor compliance checker",
    description:
      "Reviews hiring, contractor classification, policies, and workplace compliance against jurisdiction rules.",
    prompt_template:
      "Review employment and labor compliance topics (not legal advice).\nJurisdiction: {jurisdiction}\nWorkforce scenario: {scenario}\nPolicies in scope: {policies}\n\nReturn:\n1) Applicable employment law themes (classification, wages, leave, termination, remote work)\n2) Policy gap analysis\n3) Hiring and offer-letter checklist\n4) Contractor vs employee risk factors\n5) Required notices and recordkeeping\n6) Remediation priorities and HR/legal handoff",
    variables: ["jurisdiction", "scenario", "policies"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-esg-disclosure",
    name: "ESG disclosure & reporting assistant",
    description:
      "Structures ESG metrics, framework mapping (CSRD/GRI/ISSB), and disclosure narrative with evidence hooks.",
    prompt_template:
      "Support ESG disclosure planning (not legal advice).\nCompany profile: {company}\nFrameworks: {frameworks}\nMaterial topics: {topics}\n\nReturn:\n1) Framework mapping matrix (metric, definition, data owner)\n2) Materiality-linked narrative sections\n3) Data quality and assurance readiness gaps\n4) Timeline for annual/sustainability report\n5) Stakeholder Q&A prep\n6) Greenwashing risk checks on claims",
    variables: ["company", "frameworks", "topics"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-records-retention",
    name: "Records retention & legal hold planner",
    description:
      "Builds retention schedules, legal hold triggers, custodian notices, and defensible disposition workflows.",
    prompt_template:
      "Design records retention and legal hold program (not legal advice).\nRecord types: {records}\nJurisdictions: {jurisdictions}\nSystems: {systems}\n\nReturn:\n1) Retention schedule table (record type, retention period, legal basis, disposition method)\n2) Legal hold trigger events and scope definition\n3) Custodian identification and hold notice template\n4) IT preservation steps (backups, logs, chat)\n5) Release and disposition approval workflow\n6) Audit evidence for defensible deletion",
    variables: ["records", "jurisdictions", "systems"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-ip-oss-compliance",
    name: "IP assignment & open-source license reviewer",
    description:
      "Reviews IP assignment clauses, OSS usage, license compatibility, and contribution policies for product teams.",
    prompt_template:
      "Review IP and open-source compliance (not legal advice).\nContext: {context}\nOSS inventory: {oss}\nContracts/IP terms: {ip_terms}\n\nReturn:\n1) IP ownership and assignment gap analysis\n2) OSS license classification (permissive, copyleft, proprietary)\n3) Compatibility and distribution risk flags\n4) Employee/contractor invention assignment checklist\n5) Contribution policy and CLA recommendations\n6) Remediation steps for high-risk dependencies",
    variables: ["context", "oss", "ip_terms"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-incident-triage",
    name: "Compliance incident intake & triage",
    description:
      "Triages whistleblower, ethics, and compliance incidents: severity, investigation plan, and regulatory touchpoints.",
    prompt_template:
      "Triage a compliance incident intake (not legal advice).\nReport summary: {report}\nAffected areas: {areas}\nJurisdiction: {jurisdiction}\n\nReturn:\n1) Incident classification and severity\n2) Immediate containment and privilege considerations\n3) Investigation plan (interviews, documents, systems)\n4) Regulatory/law-enforcement notification assessment\n5) Stakeholder comms guidance (internal only until cleared)\n6) Remediation and policy update triggers\n7) Case tracking template with owners",
    variables: ["report", "areas", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-litigation-hold",
    name: "Litigation hold & eDiscovery planner",
    description:
      "Plans litigation holds, preservation scope, custodians, collection protocols, and review workflows.",
    prompt_template:
      "Plan litigation hold and eDiscovery (not legal advice).\nMatter: {matter}\nCustodians: {custodians}\nData sources: {sources}\n\nReturn:\n1) Hold trigger assessment and scope memo outline\n2) Custodian list and interview questions\n3) Data source map (email, chat, files, mobile, backups)\n4) Collection methodology and chain-of-custody checklist\n5) Review workflow (keywords, privilege, responsiveness)\n6) Cost/time estimates and vendor RFP criteria\n7) Release criteria when matter closes",
    variables: ["matter", "custodians", "sources"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-dpa-baa-reviewer",
    name: "DPA & BAA reviewer",
    description:
      "Reviews data processing agreements and HIPAA business associate agreements: subprocessors, SCCs, security exhibits, breach terms, and audit rights.",
    prompt_template:
      "Review DPA/BAA terms (not legal advice).\nAgreement: {agreement}\nOur role: {role}\nData types: {data_types}\n\nReturn:\n1) Processing purpose, roles (controller/processor), and data categories\n2) Subprocessor flow, cross-border transfers, and SCC/BAA exhibit gaps\n3) Security measures, breach notification, audit/assistance, deletion/return\n4) Liability, indemnity, and insurance gaps vs market practice\n5) Fallback negotiation language per high-risk clause\n6) Sign / negotiate / escalate recommendation",
    variables: ["agreement", "role", "data_types"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-ccpa-cpra-mapper",
    name: "CCPA/CPRA compliance mapper",
    description:
      "Maps California privacy obligations: notice at collection, opt-out, sensitive PI, DSAR workflows, and service-provider contracts.",
    prompt_template:
      "Map CCPA/CPRA obligations (not legal advice).\nBusiness: {business}\nData practices: {data_practices}\nConsumer touchpoints: {consumers}\n\nReturn:\n1) Applicability assessment (business thresholds, exemptions)\n2) Notice requirements (privacy policy, collection notices, opt-out links)\n3) Consumer rights workflow (access, delete, correct, limit, opt-out of sale/share)\n4) Sensitive personal information controls\n5) Service provider / contractor contract requirements\n6) Operational checklist and evidence map",
    variables: ["business", "data_practices", "consumers"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-cross-border-transfer",
    name: "Cross-border transfer assessor",
    description:
      "Assesses international data transfers: adequacy, SCCs, TIAs, UK IDTA, and supplementary measures.",
    prompt_template:
      "Assess cross-border data transfers (not legal advice).\nData flows: {flows}\nJurisdictions: {jurisdictions}\nData categories: {data_categories}\n\nReturn:\n1) Transfer map (exporter, importer, mechanism)\n2) Mechanism selection (adequacy, SCCs, BCRs, derogations)\n3) Transfer impact assessment outline and supplementary measures\n4) Contractual clauses and policy updates required\n5) Monitoring and re-assessment triggers",
    variables: ["flows", "jurisdictions", "data_categories"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-ropa-data-map",
    name: "ROPA & data mapping architect",
    description:
      "Builds records of processing activities, data inventories, lawful basis, retention, and systems map for GDPR/privacy programs.",
    prompt_template:
      "Build ROPA and data map (not legal advice).\nOrganization: {org}\nSystems: {systems}\nProcessing activities: {processing}\n\nReturn:\n1) Processing activity register (purpose, lawful basis, categories, recipients)\n2) Systems-to-data-element matrix\n3) Retention schedule and deletion triggers\n4) DPIA trigger list and high-risk flags\n5) Owner assignment and maintenance cadence",
    variables: ["org", "systems", "processing"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-hipaa-security-gap",
    name: "HIPAA Security Rule gap analyst",
    description:
      "Gap analysis against HIPAA Security Rule: administrative, physical, technical safeguards, and BAAs.",
    prompt_template:
      "Analyze HIPAA Security Rule gaps (not legal advice).\nCovered entity/BAA context: {entity}\nSystems/PHI scope: {systems}\nCurrent controls: {current_controls}\n\nReturn:\n1) Scope determination (covered entity, BA, PHI/ePHI inventory)\n2) Safeguard gap matrix (administrative, physical, technical)\n3) Risk analysis and remediation priorities\n4) Policy/SOP updates and workforce training hooks\n5) BAA and vendor management gaps",
    variables: ["entity", "systems", "current_controls"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-pci-dss-scoper",
    name: "PCI-DSS scope & SAQ advisor",
    description:
      "Determines PCI scope, cardholder data flows, segmentation, and SAQ/ROC path with control priorities.",
    prompt_template:
      "Scope PCI-DSS compliance (not legal advice).\nEnvironment: {environment}\nPayment flows: {payment_flows}\nSystems: {systems}\n\nReturn:\n1) CHD/SAD flow diagram and scope boundaries\n2) Segmentation assessment and scope reduction options\n3) Applicable SAQ or ROC path with rationale\n4) Priority control gaps (network, access, logging, vuln mgmt)\n5) QSA/ASV engagement checklist and timeline",
    variables: ["environment", "payment_flows", "systems"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-coppa-children-privacy",
    name: "COPPA & children's privacy advisor",
    description:
      "COPPA compliance for child-directed services: parental consent, data minimization, and third-party disclosures.",
    prompt_template:
      "Assess COPPA compliance (not legal advice).\nProduct: {product}\nAudience: {audience}\nData collected: {data_collected}\n\nReturn:\n1) Child-directed / actual knowledge applicability\n2) Required notices and parental consent mechanisms\n3) Data minimization, retention, and security obligations\n4) Third-party SDK/ad network risks\n5) Operational checklist and policy updates",
    variables: ["product", "audience", "data_collected"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Privacy & data",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-sow-scope-reviewer",
    name: "SOW scope & deliverables reviewer",
    description:
      "Reviews statements of work for scope creep, acceptance criteria, dependencies, change control, and IP ownership.",
    prompt_template:
      "Review SOW scope (not legal advice).\nSOW: {sow}\nMSA context: {msa_context}\nCommercial context: {commercial}\n\nReturn:\n1) Deliverables and acceptance criteria clarity\n2) Dependencies, assumptions, and out-of-scope gaps\n3) Change order triggers and pricing mechanics\n4) IP, license grant, and work-product ownership\n5) Milestone/payment alignment and penalty exposure\n6) Negotiation priorities and fallback language",
    variables: ["sow", "msa_context", "commercial"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-indemnity-liability",
    name: "Indemnity & liability cap analyst",
    description:
      "Deep analysis of indemnification, limitation of liability, consequential damages carve-outs, and insurance alignment.",
    prompt_template:
      "Analyze indemnity and liability (not legal advice).\nContract: {contract}\nOur role: {role}\nRisk profile: {risk_profile}\n\nReturn:\n1) Indemnity scope (IP, data breach, bodily injury, third-party claims)\n2) Cap structure, super-caps, uncapped carve-outs\n3) Consequential/indirect damages mutual waivers and exceptions\n4) Insurance minimums vs indemnity obligations\n5) Market comparison and negotiation levers\n6) Deal-breaker vs tradeable items",
    variables: ["contract", "role", "risk_profile"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-software-license-review",
    name: "Enterprise software license reviewer",
    description:
      "Reviews EULA/enterprise license: deployment rights, audit, true-up, maintenance, escrow, and termination.",
    prompt_template:
      "Review software license (not legal advice).\nLicense terms: {license}\nDeployment model: {deployment}\nVendor: {vendor}\n\nReturn:\n1) Grant scope (users, cores, geography, affiliates, SaaS vs on-prem)\n2) Audit/true-up and compliance risk\n3) Support, updates, escrow, and source code access\n4) Restrictions (competitive use, benchmarking, reverse engineering)\n5) Termination, data export, and survival clauses\n6) Negotiation fallbacks",
    variables: ["license", "deployment", "vendor"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-subcontract-flowdown",
    name: "Subcontract flow-down reviewer",
    description:
      "Reviews subcontractor terms for prime contract flow-down, liability pass-through, IP, security, and compliance.",
    prompt_template:
      "Review subcontract flow-down (not legal advice).\nPrime contract: {prime_contract}\nSubcontract: {subcontract}\nWork scope: {work_scope}\n\nReturn:\n1) Mandatory flow-down clause checklist (FAR/Government or commercial)\n2) Liability and indemnity pass-through gaps\n3) IP ownership and license chain\n4) Security, privacy, and insurance alignment\n5) Termination for convenience/default consistency\n6) Redline priorities",
    variables: ["prime_contract", "subcontract", "work_scope"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-amendment-change-order",
    name: "Contract amendment drafter",
    description:
      "Drafts amendments and change orders: scope delta, pricing, timeline, and integration with base agreement.",
    prompt_template:
      "Draft contract amendment/change order (not legal advice).\nBase agreement: {base_agreement}\nRequested changes: {changes}\nCommercial terms: {commercial}\n\nReturn:\n1) Amendment structure and recital of base agreement\n2) Scope/deliverable changes with acceptance criteria\n3) Pricing, payment schedule, and tax treatment\n4) Timeline and dependency updates\n5) Conflict resolution with original terms\n6) Signature block and effective date mechanics",
    variables: ["base_agreement", "changes", "commercial"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Contracts",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-soc2-readiness",
    name: "SOC 2 readiness assessor",
    description:
      "SOC 2 Type I/II readiness: trust service criteria mapping, control gaps, evidence plan, and auditor prep.",
    prompt_template:
      "Assess SOC 2 readiness (not legal advice).\nOrganization: {org}\nTSC scope: {tsc_scope}\nCurrent state: {current_state}\n\nReturn:\n1) In-scope systems and trust service criteria selection\n2) Control gap matrix by TSC category\n3) Evidence collection plan and owner map\n4) Policy/procedure gaps and remediation timeline\n5) Type I vs Type II observation period planning\n6) Auditor selection RFP criteria",
    variables: ["org", "tsc_scope", "current_state"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-iso27001-gap",
    name: "ISO 27001 ISMS gap analyst",
    description:
      "ISO 27001 gap assessment: Annex A controls, ISMS documentation, risk treatment, and certification roadmap.",
    prompt_template:
      "Assess ISO 27001 gaps (not legal advice).\nOrganization: {org}\nISMS scope: {scope}\nCurrent controls: {controls}\n\nReturn:\n1) Scope statement and asset inventory gaps\n2) Annex A control applicability and gap matrix\n3) Risk assessment methodology and treatment plan\n4) Mandatory ISMS documentation checklist\n5) Internal audit and management review cadence\n6) Stage 1/Stage 2 certification roadmap",
    variables: ["org", "scope", "controls"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-nist-csf-assessment",
    name: "NIST CSF maturity assessor",
    description:
      "NIST Cybersecurity Framework profile: Identify/Protect/Detect/Respond/Recover maturity and target profile.",
    prompt_template:
      "Assess NIST CSF maturity (not legal advice).\nOrganization: {org}\nCurrent profile: {current_profile}\nTarget profile: {target}\n\nReturn:\n1) Current-state maturity by function and category\n2) Gap analysis vs target profile\n3) Prioritized initiative roadmap with quick wins\n4) Metrics and governance hooks\n5) Mapping to other frameworks (SOC2, ISO) where relevant",
    variables: ["org", "current_profile", "target"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-tprm-assessment",
    name: "Third-party risk (TPRM) assessor",
    description:
      "Deep vendor risk assessment: inherent risk tiering, control questionnaires, continuous monitoring, and exit planning.",
    prompt_template:
      "Assess third-party risk (not legal advice).\nVendor: {vendor}\nService: {service}\nData access: {data_access}\n\nReturn:\n1) Inherent risk tier and assessment depth\n2) Security/privacy/resilience questionnaire focus areas\n3) Contractual control requirements (DPA, SLA, audit, subprocessors)\n4) Ongoing monitoring triggers and reassessment cadence\n5) Concentration risk and exit/contingency plan",
    variables: ["vendor", "service", "data_access"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-subpoena-response",
    name: "Subpoena & legal process responder",
    description:
      "Workflow for subpoenas, civil investigative demands, and law enforcement requests: preservation, privilege, production.",
    prompt_template:
      "Plan subpoena/legal process response (not legal advice).\nRequest: {request}\nMatter context: {matter}\nData sources: {data_sources}\n\nReturn:\n1) Request analysis (scope, jurisdiction, deadlines)\n2) Preservation and litigation hold triggers\n3) Privilege/work-product review workflow\n4) Production plan, redaction, and clawback process\n5) Customer/employee notification assessment\n6) Escalation to outside counsel criteria",
    variables: ["request", "matter", "data_sources"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-regulatory-exam-prep",
    name: "Regulatory examination prep",
    description:
      "Exam readiness for financial/regulated entities: document requests, interview prep, and issue remediation.",
    prompt_template:
      "Prepare for regulatory examination (not legal advice).\nRegulator: {regulator}\nEntity: {entity}\nPrior findings: {prior_findings}\n\nReturn:\n1) Examination scope and likely request list\n2) Document room / evidence inventory\n3) SME interview prep and talking points\n4) Open issue remediation status and narrative\n5) Day-of logistics and escalation matrix\n6) Post-exam response timeline",
    variables: ["regulator", "entity", "prior_findings"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Audit & controls",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-aml-kyc-review",
    name: "AML/KYC program reviewer",
    description:
      "Anti-money laundering program review: CDD/EDD, SAR workflows, sanctions screening, and independent testing.",
    prompt_template:
      "Review AML/KYC program (not legal advice).\nInstitution: {institution}\nJurisdiction: {jurisdiction}\nCurrent program: {program}\n\nReturn:\n1) Regulatory applicability (BSA, EU AMLD, local rules)\n2) CDD/EDD policy and risk-based tiering gaps\n3) Transaction monitoring and SAR escalation workflow\n4) Sanctions/PEP screening and false positive management\n5) Training, independent testing, and board reporting\n6) Remediation priorities",
    variables: ["institution", "jurisdiction", "program"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-sanctions-export",
    name: "Sanctions & export control screener",
    description:
      "OFAC/sanctions screening workflows, export classification (EAR/ITAR), and denied party list governance.",
    prompt_template:
      "Design sanctions/export controls (not legal advice).\nBusiness: {business}\nTransactions: {transactions}\nJurisdictions: {jurisdictions}\n\nReturn:\n1) Applicable regimes (OFAC, EU, UK, export controls)\n2) Screening touchpoints (onboarding, payments, shipments)\n3) List management and escalation for hits\n4) License determination workflow for controlled items/data\n5) Recordkeeping and audit trail requirements",
    variables: ["business", "transactions", "jurisdictions"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-sec-disclosure",
    name: "SEC disclosure checklist",
    description:
      "Public company disclosure support: 10-K/10-Q item checklist, materiality, and MD&A risk factor drafting framework.",
    prompt_template:
      "Prepare SEC disclosure checklist (not legal advice).\nCompany: {company}\nFiling type: {filing}\nRecent events: {events}\n\nReturn:\n1) Applicable form items and disclosure triggers\n2) Materiality assessment framework for events\n3) Risk factor and MD&A update prompts\n4) Controls around earnings releases and Reg FD\n5) Counsel/CFO sign-off workflow and timeline",
    variables: ["company", "filing", "events"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-environmental-compliance",
    name: "Environmental compliance mapper",
    description:
      "Maps environmental permits, emissions/waste obligations, reporting, and incident notification requirements.",
    prompt_template:
      "Map environmental compliance (not legal advice).\nOperations: {operations}\nJurisdiction: {jurisdiction}\nActivities: {activities}\n\nReturn:\n1) Permit and registration inventory\n2) Emissions, waste, and water discharge obligations\n3) Reporting calendars and agency contacts\n4) Incident notification thresholds and procedures\n5) Audit/evidence checklist and training needs",
    variables: ["operations", "jurisdiction", "activities"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-workplace-investigation",
    name: "Workplace investigation protocol",
    description:
      "Internal investigation playbooks: harassment, discrimination, retaliation, evidence, and remediation.",
    prompt_template:
      "Design workplace investigation (not legal advice).\nAllegation type: {allegation}\nJurisdiction: {jurisdiction}\nParties involved: {parties}\n\nReturn:\n1) Intake triage and immediate interim measures\n2) Investigator selection and conflict checks\n3) Interview plan, evidence preservation, and documentation\n4) Credibility analysis framework (not conclusions of fact)\n5) Remediation options and anti-retaliation safeguards\n6) Report outline and executive briefing",
    variables: ["allegation", "jurisdiction", "parties"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-worker-classification",
    name: "Worker classification assessor",
    description:
      "Contractor vs employee classification analysis using jurisdictional tests and misclassification risk mitigation.",
    prompt_template:
      "Assess worker classification (not legal advice).\nRoles: {roles}\nJurisdiction: {jurisdiction}\nWorking relationship facts: {facts}\n\nReturn:\n1) Applicable tests (IRS, ABC test, UK IR35, etc.)\n2) Factor analysis per role with risk rating\n3) Contract and operational changes to reduce risk\n4) Payroll/benefits/tax exposure flags\n5) Escalate to counsel criteria",
    variables: ["roles", "jurisdiction", "facts"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-ada-accommodation",
    name: "ADA accommodation workflow",
    description:
      "Reasonable accommodation interactive process: documentation, undue hardship analysis, and policy hooks.",
    prompt_template:
      "Design ADA accommodation workflow (not legal advice).\nAccommodation request: {request}\nRole: {role}\nWorkplace context: {workplace}\n\nReturn:\n1) Interactive process steps and timelines\n2) Medical inquiry boundaries and documentation\n3) Accommodation options matrix and feasibility\n4) Undue hardship analysis framework\n5) Communication templates and confidentiality safeguards",
    variables: ["request", "role", "workplace"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-i9-compliance",
    name: "I-9 compliance auditor",
    description:
      "Form I-9 audit preparation: error patterns, reverification, E-Verify integration, and remediation.",
    prompt_template:
      "Audit I-9 compliance (not legal advice).\nWorkforce: {workforce}\nSample records: {records}\nCurrent process: {process}\n\nReturn:\n1) Common error patterns and correction procedures\n2) Reverification and document expiration tracking\n3) E-Verify usage and timing requirements\n4) Remote/hybrid verification considerations\n5) Self-audit sampling plan and remediation log",
    variables: ["workforce", "records", "process"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Regulatory",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-ai-governance",
    name: "AI governance & EU AI Act readiness",
    description:
      "AI system inventory, risk classification, human oversight, documentation, and EU AI Act / NIST AI RMF alignment.",
    prompt_template:
      "Assess AI governance (not legal advice).\nAI systems: {systems}\nUse cases: {use_cases}\nJurisdiction: {jurisdiction}\n\nReturn:\n1) AI system inventory and risk tiering\n2) EU AI Act classification triggers (if applicable)\n3) Required documentation (technical files, FRIA, logging)\n4) Human oversight, transparency, and bias testing hooks\n5) Vendor AI contract clauses and procurement gates\n6) Governance roles and review cadence",
    variables: ["systems", "use_cases", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-trademark-clearance",
    name: "Trademark clearance analyst",
    description:
      "Trademark clearance search framework: classes, conflict analysis, and filing strategy outline (not legal advice).",
    prompt_template:
      "Plan trademark clearance (not legal advice).\nMark: {mark}\nGoods/services: {goods_services}\nMarkets: {markets}\n\nReturn:\n1) Search strategy (USPTO, WIPO, common law, domain/social)\n2) Conflict analysis framework and risk tiers\n3) Nice class recommendations\n4) Alternative mark suggestions if high risk\n5) Filing timeline and use-in-commerce considerations\n6) Escalate to trademark counsel checklist",
    variables: ["mark", "goods_services", "markets"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-trade-secret-program",
    name: "Trade secret protection program",
    description:
      "Trade secret identification, access controls, NDAs, departing employee protocols, and litigation readiness.",
    prompt_template:
      "Design trade secret program (not legal advice).\nCompany: {company}\nCritical assets: {assets}\nWorkforce: {workforce}\n\nReturn:\n1) Trade secret inventory and classification\n2) Physical/logical access controls and need-to-know\n3) Employee/contractor agreement clauses and training\n4) Exit interview and forensic preservation steps\n5) Incident response for misappropriation\n6) Proof of reasonable measures checklist",
    variables: ["company", "assets", "workforce"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-patent-landscape",
    name: "Patent landscape analyst",
    description:
      "Prior art and competitive patent landscape summary framework for R&D and freedom-to-operate discussions.",
    prompt_template:
      "Summarize patent landscape (not legal advice).\nTechnology: {technology}\nCompetitors: {competitors}\nJurisdiction: {jurisdiction}\n\nReturn:\n1) Search strategy and classification codes\n2) Key patent families and assignee map\n3) White space and crowded areas summary\n4) FTO discussion prompts for counsel\n5) Defensive publication and filing strategy questions",
    variables: ["technology", "competitors", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      web_search_default: true,
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-dmca-takedown",
    name: "DMCA takedown workflow",
    description:
      "DMCA notice-and-takedown and counter-notice workflows, repeat infringer policy, and safe harbor documentation.",
    prompt_template:
      "Design DMCA workflow (not legal advice).\nPlatform: {platform}\nInfringement scenario: {infringement}\nJurisdiction: {jurisdiction}\n\nReturn:\n1) Notice intake and validation checklist (512(c)/(f))\n2) Takedown, notification, and counter-notice timelines\n3) Repeat infringer policy and termination criteria\n4) Agent designation and public contact requirements\n5) False notice/counter-notice risk safeguards",
    variables: ["platform", "infringement", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-whistleblower-program",
    name: "Whistleblower & ethics hotline designer",
    description:
      "Hotline design, non-retaliation, investigation routing, board reporting, and SOX/ EU whistleblower directive alignment.",
    prompt_template:
      "Design whistleblower program (not legal advice).\nOrganization: {org}\nJurisdiction: {jurisdiction}\nWorkforce: {workforce}\n\nReturn:\n1) Channel design (hotline, web, mobile) and anonymity options\n2) Intake triage and investigation routing\n3) Non-retaliation policy and monitoring\n4) Board/audit committee reporting cadence\n5) Regulatory alignment (SOX 301, EU Directive) checklist",
    variables: ["org", "jurisdiction", "workforce"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
  {
    category: "legal_compliance",
    template_id: "sample-legal-board-governance",
    name: "Board governance architect",
    description:
      "Board charters, committee structures, D&O oversight, conflicts, and governance calendar for startups and public cos.",
    prompt_template:
      "Design board governance (not legal advice).\nCompany: {company}\nStage: {stage}\nJurisdiction: {jurisdiction}\n\nReturn:\n1) Board composition and committee charter outlines\n2) Meeting cadence, materials, and minutes standards\n3) Conflicts of interest and related-party transaction process\n4) D&O insurance and indemnification considerations\n5) Governance calendar and annual compliance tasks",
    variables: ["company", "stage", "jurisdiction"],
    config: {
      preferred_model: "auto",
      domain_pack: "legal",
      domain_focus: "Governance & policy",
      citation_mode: "required",
      export_formats: ["pdf", "docx", "research"],
    },
  },
]

/** Gallery samples with super thinking, deep read, citations, and exports filled in. */
export const SAMPLE_AGENT_TEMPLATES: SampleAgentTemplate[] = RAW_SAMPLE_AGENT_TEMPLATES.map(
  (sample) => ({
    ...sample,
    config: enrichSampleAgentConfig(
      sample.category,
      sample.template_id,
      (sample.config ?? {}) as Record<string, unknown>
    ),
  })
)
