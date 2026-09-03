/**
 * Product status and available features — shared by /about and /platform.
 * Update here when shipping features.
 */

export const PRODUCT_STATUS = {
  version: "v0.9.2",
  phase: "Public beta",
  lastUpdated: "August 2026",
  summary:
    "Creator workspace, pipeline plans, chat deliverables, and multi-provider routing are live. We ship in the open and keep improving with every release.",
} as const

export const PRODUCT_CAPABILITIES = [
  {
    title: "Chat workspace",
    description:
      "Streaming replies, file attachments (PDF with OCR), web search with citations, pipeline mode, assistant intake, and guest or signed-in sessions.",
  },
  {
    title: "Parallel agent pipeline",
    description:
      "LangGraph orchestration: Master → Decomposer → parallel agents → Aggregator → Supervisor. Plan cards ask clarifying questions before a full run.",
  },
  {
    title: "Deliverable routing",
    description:
      "Automatically routes requests to code, document, presentation, or image paths so case studies and reports stay prose — not misrouted JSON dumps.",
  },
  {
    title: "Assistants gallery",
    description:
      "Save and attach domain-specific assistant templates. Intake forms collect required inputs before the model runs.",
  },
  {
    title: "RAG & memory",
    description:
      "Upload PDF, DOCX, TXT, and more to a knowledge base. Chunking, embedding, and retrieval via Neon (PostgreSQL + pgvector).",
  },
  {
    title: "Integrations foundation",
    description:
      "Connect n8n webhooks, Canva, Google Docs, and Notion from the integrations hub. MCP server surface for tool expansion.",
  },
  {
    title: "Multi-provider models",
    description:
      "Route across OpenAI, Google Gemini, Anthropic Claude, Groq, DeepSeek, Mistral, and others. Bring your own API keys.",
  },
  {
    title: "Real-time execution",
    description:
      "WebSocket task streams, live pipeline DAG, mission-control panels, and exportable document artifacts in chat.",
  },
  {
    title: "Auth & onboarding",
    description:
      "Email/password and OAuth sign-in, post-sign-up onboarding wizard, chat intro tour, and role-aware workspace entry.",
  },
  {
    title: "Billing",
    description:
      "Free and paid plans with Stripe checkout and Razorpay support. In-chat upgrade board and usage visibility.",
  },
] as const

export const PRODUCT_HOW_IT_WORKS = [
  {
    title: "Start in chat or tasks",
    description:
      "Describe an outcome, attach files, or pick an assistant. Pipeline mode can propose a plan before agents run.",
  },
  {
    title: "Agents run in parallel",
    description:
      "Work is decomposed into subtasks and executed concurrently across your chosen models, grounded in uploaded context.",
  },
  {
    title: "Merged, validated output",
    description:
      "Results are aggregated, supervised, and returned as markdown, exports, or live task artifacts you can watch end to end.",
  },
] as const

/** Available features shown on /about and /platform */
export const PRODUCT_AVAILABLE_FEATURES: {
  area: string
  detail: string
}[] = [
  {
    area: "Creator chat workspace",
    detail:
      "Streaming chat, attachments, web search, pipeline toggle, ghost mode, response versions, and in-chat pricing.",
  },
  {
    area: "Parallel task pipeline",
    detail:
      "Full LangGraph run with plan questions, WebSocket DAG, human-in-the-loop on /tasks/execute, and deliverable routing.",
  },
  {
    area: "Assistants & intake forms",
    detail:
      "Gallery of saved templates, detail dialogs, variable tags, and pre-send intake cards in chat.",
  },
  {
    area: "Knowledge base (RAG)",
    detail:
      "Upload → chunk → embed → retrieve on Neon pgvector. Memory page with working memory and #knowledge section.",
  },
  {
    area: "Web search & session location",
    detail:
      "Intent-gated search with citations, locality-aware queries, and approximate location from IP for local recommendations.",
  },
  {
    area: "Integrations (wave 1)",
    detail: "n8n, Canva OAuth, Google Docs OAuth, Notion token — connect, test, and invoke from the hub.",
  },
  {
    area: "OAuth, onboarding & tour",
    detail:
      "Google OAuth, five-step onboarding, environment provisioning, and restartable chat intro tour from Settings.",
  },
  {
    area: "LLM evaluation suite",
    detail:
      "Offline and live benchmark scripts, case library, and provider comparison docs — thesis-ready proof artifacts.",
  },
  {
    area: "Multi-provider models",
    detail:
      "Route across OpenAI, Google Gemini, Anthropic Claude, Groq, DeepSeek, Mistral, and others. Bring your own API keys.",
  },
  {
    area: "Billing & plans",
    detail:
      "Free and paid plans with Stripe checkout and Razorpay support. In-chat upgrade board and usage visibility.",
  },
]
