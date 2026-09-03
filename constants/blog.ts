import {
  BookOpen,
  Brain,
  Cpu,
  FileText,
  Key,
  Layers,
  Rocket,
  Search,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react"

export type BlogCategory = "Product" | "Engineering" | "Company" | "Guides"

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Product",
  "Engineering",
  "Company",
  "Guides",
]

export type BlogAccent = "emerald" | "amber" | "violet" | "sky"

export type BlogIconKey =
  | "cpu"
  | "search"
  | "brain"
  | "layers"
  | "key"
  | "rocket"
  | "book"
  | "file"
  | "workflow"
  | "zap"
  | "users"

/**
 * Icon lookup keyed by a plain string. Post data stores only the string key so
 * the fully-serializable post objects can cross the server → client boundary
 * (lucide icon *components* cannot be passed as props to Client Components).
 */
export const BLOG_ICONS: Record<BlogIconKey, LucideIcon> = {
  cpu: Cpu,
  search: Search,
  brain: Brain,
  layers: Layers,
  key: Key,
  rocket: Rocket,
  book: BookOpen,
  file: FileText,
  workflow: Workflow,
  zap: Zap,
  users: Users,
}

export interface BlogSection {
  heading?: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: BlogCategory
  /** Human display date, e.g. "Jun 30, 2026". */
  date: string
  /** ISO date for sorting + <time dateTime>. */
  isoDate: string
  readingMinutes: number
  author: { name: string; role: string }
  accent: BlogAccent
  icon: BlogIconKey
  featured?: boolean
  content: BlogSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "pipeline-plans-that-match-your-ask",
    title: "Pipeline plans that match your ask — before agents start",
    excerpt:
      "Review a structured plan, answer only the questions that matter, then Approve & Run. Presentations and documents stay on the subject you requested.",
    category: "Product",
    date: "Aug 14, 2026",
    isoDate: "2026-08-14",
    readingMinutes: 5,
    author: { name: "The MasterNode Team", role: "Product" },
    accent: "violet",
    icon: "workflow",
    featured: true,
    content: [
      {
        paragraphs: [
          "Big asks used to feel like a leap of faith: you typed a prompt, agents started, and only at the end did you learn the run had drifted. Pipeline mode now puts a clear plan in front of you first — so scope, format, and emphasis are agreed before tokens are spent.",
          "When your prompt is already specific, MasterNode skips the quiz and shows a ready plan. When something is ambiguous, you get focused clarifying questions — not a generic questionnaire — and the outline updates as you answer.",
        ],
      },
      {
        heading: "Approve & Run, or Cancel",
        paragraphs: [
          "The plan card is the checkpoint. Approve & Run starts the swarm with that outline. Cancel keeps you in chat if you’re still exploring. Either way, you’re in control of direction and cost.",
        ],
        bullets: [
          "Live outline as you answer clarifying questions",
          "Choose Text, Document, or Presentation as the deliverable format",
          "See what will be covered before agents fan out",
        ],
      },
      {
        heading: "Deliverables that stay on topic",
        paragraphs: [
          "Presentations and documents follow the approved plan and subject. The finished deck or write-up should match what you asked for — sections, emphasis, and title — instead of drifting into an unrelated template.",
          "That reliability matters when you’re shipping work to a teammate or a customer, not just chatting for ideas.",
        ],
      },
      {
        heading: "Try it",
        paragraphs: [
          "Open Chat, switch the composer to Pipeline, and describe the deliverable you want. Review the plan, adjust if needed, then Approve & Run. For a fuller list of what’s new, visit Release notes.",
        ],
      },
    ],
  },
  {
    slug: "introducing-parallel-intelligence",
    title: "Introducing Parallel Intelligence",
    excerpt:
      "Why we decompose a single goal into a swarm of specialized agents — and how validated merging keeps the output coherent.",
    category: "Product",
    date: "Jun 30, 2026",
    isoDate: "2026-06-30",
    readingMinutes: 6,
    author: { name: "The MasterNode Team", role: "Product" },
    accent: "emerald",
    icon: "cpu",
    featured: true,
    content: [
      {
        paragraphs: [
          "Most LLM products still run like a single worker at a desk: one prompt, one pass, one answer. That works until the task gets big — a research brief, a multi-file refactor, a report that needs numbers, prose, and citations. Then a single pass becomes a bottleneck, and quality drops as the model juggles everything at once.",
          "MasterNode takes a different path. We call it Parallel Intelligence (PI): decompose a goal into focused subtasks, run specialized agents on them concurrently, then merge and validate the results into one coherent output.",
        ],
      },
      {
        heading: "Decompose, then parallelize",
        paragraphs: [
          "Every request starts with a planning step that breaks the goal into subtasks with clear inputs and outputs. Independent subtasks fan out to run at the same time instead of waiting in a line.",
          "The payoff is both speed and quality: each agent works on a narrow problem with a tighter prompt, so it stays focused and is easier to validate.",
        ],
        bullets: [
          "Plan: turn a goal into a dependency-aware task graph.",
          "Execute: run independent branches concurrently across your model providers.",
          "Merge: combine partial results and reconcile conflicts before returning.",
        ],
      },
      {
        heading: "Merging is where trust is won",
        paragraphs: [
          "Parallelism is easy to start and hard to finish. The hard part is putting the pieces back together without contradictions. MasterNode validates each partial result and reconciles overlaps so the final answer reads like one voice, not a stapled-together committee.",
          "You watch the whole thing happen — task and agent status stream over WebSockets, so there's no black box between the prompt and the result.",
        ],
      },
      {
        heading: "Why 'PI'",
        paragraphs: [
          "The name is a nod to π — endless, non-repeating, always exploring. Parallel Intelligence is the same idea applied to agents: many lines of work advancing together, with room to keep going.",
        ],
      },
    ],
  },
  {
    slug: "web-search-gating",
    title: "Grounding answers with strict web-search gating",
    excerpt:
      "How intent classification decides when to search, when to transform, and when to stay silent — without hallucinating links.",
    category: "Engineering",
    date: "Jun 24, 2026",
    isoDate: "2026-06-24",
    readingMinutes: 7,
    author: { name: "The MasterNode Team", role: "Engineering" },
    accent: "amber",
    icon: "search",
    featured: true,
    content: [
      {
        paragraphs: [
          "A search tool the model reaches for on every message is worse than no tool at all. It slows responses, burns budget, and — worst of all — invites the model to invent citations. The fix isn't a better search API. It's a better decision about whether to search in the first place.",
        ],
      },
      {
        heading: "Intent before retrieval",
        paragraphs: [
          "Before any tool runs, a classifier labels the request. Transform tasks — 'summarize this', 'convert to a document', 'rewrite this email' — never trigger a search. Real-time and factual-lookup queries — 'who won', 'latest', 'current price' — always do. Ambiguous cases fall back to context.",
        ],
        bullets: [
          "Transform → never search; go straight to generation.",
          "Real-time / factual-lookup → always search.",
          "Informational → answer from the model unless a fact is missing.",
          "Ambiguous → search only when required entity knowledge is absent.",
        ],
      },
      {
        heading: "Query rewriting and ranking",
        paragraphs: [
          "When we do search, one query is rarely enough. We expand the request into several variants — entity plus location, quoted phrases, domain-specific forms — run them in parallel, dedupe URLs, and rank by exact match and source authority.",
        ],
      },
      {
        heading: "Confidence gating",
        paragraphs: [
          "Results get a confidence score. If multiple strong sources agree, we answer with citations. If the evidence is sparse or contradictory, we say so plainly instead of guessing. No fabricated links, no 'temporary' download URLs — if we can't verify it, we tell you.",
        ],
      },
    ],
  },
  {
    slug: "selective-memory",
    title: "Selective memory: keywords over transcripts",
    excerpt:
      "Compressed, entity-first memory means the model gets only what's relevant — never a full conversation log.",
    category: "Engineering",
    date: "Jun 12, 2026",
    isoDate: "2026-06-12",
    readingMinutes: 5,
    author: { name: "The MasterNode Team", role: "Engineering" },
    accent: "violet",
    icon: "brain",
    content: [
      {
        paragraphs: [
          "The naive way to give an assistant memory is to stuff the whole transcript back into the context window. It's expensive, it's noisy, and it gets worse with every turn. We went the other direction: remember less, but remember the right things.",
        ],
      },
      {
        heading: "Keyword memory",
        paragraphs: [
          "Instead of storing conversations verbatim, MasterNode extracts compact, structured facts — entities, preferences, and durable details — and injects only what's relevant to the current turn.",
        ],
        bullets: [
          "Entity-first: facts are keyed to the things they describe.",
          "Preferences persist globally so 'always use metric units' survives across chats.",
          "Retrieval pulls a minimal, relevant slice — not the whole log.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "Compressed memory keeps prompts small, cheap, and focused. The model stops drowning in old context and starts using the handful of facts that actually change the answer.",
        ],
      },
    ],
  },
  {
    slug: "grounding-and-citations",
    title: "Grounding rules: search results beat memory",
    excerpt:
      "When live sources and internal knowledge disagree, we have a clear rule — and we surface the conflict instead of hiding it.",
    category: "Engineering",
    date: "May 28, 2026",
    isoDate: "2026-05-28",
    readingMinutes: 4,
    author: { name: "The MasterNode Team", role: "Engineering" },
    accent: "sky",
    icon: "layers",
    content: [
      {
        paragraphs: [
          "Grounding isn't just about having sources — it's about a consistent policy for what wins when sources disagree. Without one, models quietly blend stale training data with fresh search results and produce confident nonsense.",
        ],
      },
      {
        heading: "The rules",
        bullets: [
          "Verified web results override internal memory, always.",
          "Conflicting sources are reported as a conflict — not silently merged.",
          "Facts from unrelated sources are never stitched into one claim.",
          "If nothing verifies, the answer says the information is unverified.",
        ],
      },
      {
        heading: "Citations you can check",
        paragraphs: [
          "Answers link back to the sources they used, with the site's own icon, so you can verify a claim in one click instead of trusting a footnote number.",
        ],
      },
    ],
  },
  {
    slug: "bring-your-own-models",
    title: "Bring your own model providers",
    excerpt:
      "Route across OpenAI, Gemini, Claude, Groq, DeepSeek, and Cohere with your own keys — no lock-in, full control of cost.",
    category: "Product",
    date: "May 15, 2026",
    isoDate: "2026-05-15",
    readingMinutes: 4,
    author: { name: "The MasterNode Team", role: "Product" },
    accent: "emerald",
    icon: "key",
    content: [
      {
        paragraphs: [
          "Model lock-in is a liability. Prices change, new models ship weekly, and no single provider is best at everything. MasterNode is provider-agnostic by design: you bring your own keys and route work to the model that fits the task.",
        ],
      },
      {
        heading: "Supported providers",
        bullets: [
          "OpenAI, Google (Gemini), and Anthropic (Claude)",
          "Groq and DeepSeek for fast, cost-efficient runs",
          "Cohere for retrieval and embeddings",
        ],
      },
      {
        heading: "You control the spend",
        paragraphs: [
          "Because agents run in parallel, you can send heavy reasoning to a frontier model and fan lightweight subtasks to cheaper, faster ones. Keys live in Settings; usage is metered per tenant.",
        ],
      },
    ],
  },
  {
    slug: "building-in-the-open",
    title: "Building MasterNode in the open",
    excerpt:
      "What's live today, what's in development, and how we think about shipping an agent platform honestly.",
    category: "Company",
    date: "Apr 30, 2026",
    isoDate: "2026-04-30",
    readingMinutes: 3,
    author: { name: "The MasterNode Team", role: "Company" },
    accent: "amber",
    icon: "rocket",
    content: [
      {
        paragraphs: [
          "We'd rather tell you what's real than oversell a demo. Parallel orchestration, RAG over your documents, multi-provider routing, and real-time status are live today. MasterBuilder — a natural-language agent factory — and deeper governance controls are in active development.",
        ],
      },
      {
        heading: "How we ship",
        paragraphs: [
          "Small, honest releases beat big, vague promises. We list what you can use today — no shifting definitions. If something isn't ready, it doesn't claim to be.",
        ],
      },
    ],
  },
  {
    slug: "first-parallel-workflow",
    title: "Your first parallel workflow in five minutes",
    excerpt:
      "Sign up, add a model key, send one prompt — and watch MasterNode plan, fan out agents, and merge the result.",
    category: "Guides",
    date: "Jul 8, 2026",
    isoDate: "2026-07-08",
    readingMinutes: 5,
    author: { name: "The MasterNode Team", role: "Guides" },
    accent: "emerald",
    icon: "book",
    featured: true,
    content: [
      {
        paragraphs: [
          "Parallel orchestration sounds complex until you run it once. This walkthrough gets you from a blank account to a finished multi-agent answer in about five minutes — no custom agents or API keys beyond your model provider.",
        ],
      },
      {
        heading: "1. Create an account and add a key",
        paragraphs: [
          "Sign up at masternode.ai and open Settings → Model providers. Paste an API key for at least one supported provider (OpenAI, Google, Anthropic, Groq, DeepSeek, or Cohere). MasterNode never resells inference — you pay the provider directly and keep full control of spend.",
        ],
      },
      {
        heading: "2. Pick a prompt that benefits from parallelism",
        paragraphs: [
          "Single-sentence questions work, but you'll feel the difference with tasks that naturally split: a competitive brief, a release note from several source files, or a research summary with citations. Paste the goal into chat and send.",
        ],
        bullets: [
          "Planning runs first — you'll see a task graph before agents execute.",
          "Independent branches run at the same time instead of waiting in a queue.",
          "The merged answer streams back as sections complete.",
        ],
      },
      {
        heading: "3. Read the live status panel",
        paragraphs: [
          "Each subtask shows as running, complete, or blocked on a dependency. If something needs web grounding, search runs only when the intent classifier says it's required — not on every message.",
        ],
      },
      {
        heading: "4. Iterate",
        paragraphs: [
          "Follow up in the same thread. Keyword memory keeps durable facts (your preferred units, product names, tone) without stuffing the full transcript back into context. Attach PDFs or spreadsheets when you need answers grounded in your own documents.",
        ],
      },
    ],
  },
  {
    slug: "rag-upload-guide",
    title: "Upload documents for RAG: formats, limits, and tips",
    excerpt:
      "Which file types work, how the 12 MB limit applies, and how to get cleaner answers from your own sources.",
    category: "Guides",
    date: "Jul 2, 2026",
    isoDate: "2026-07-02",
    readingMinutes: 4,
    author: { name: "The MasterNode Team", role: "Guides" },
    accent: "sky",
    icon: "file",
    content: [
      {
        paragraphs: [
          "Retrieval-augmented generation (RAG) lets agents cite your contracts, specs, and reports instead of guessing. Uploads are per-tenant and scoped to the conversation or workspace rules you've enabled.",
        ],
      },
      {
        heading: "Supported formats",
        bullets: [
          "Documents: PDF, DOCX, PPTX, XLSX, TXT, MD, HTML",
          "Data: CSV, JSON",
          "Images: PNG, JPG (for vision-capable models)",
        ],
      },
      {
        heading: "Size and quality",
        paragraphs: [
          "Each file can be up to 12 MB. Split very large exports into logical chunks — quarterly reports, per-product folders — so retrieval returns the right slice instead of a noisy mega-document.",
          "Structured headings, tables, and consistent filenames improve chunk boundaries. A one-page tone guide beats a 200-page dump when you only need voice and terminology.",
        ],
      },
      {
        heading: "When RAG runs",
        paragraphs: [
          "Attach files in chat or enable memory files for a thread. The planner decides which subtasks need document retrieval versus open-ended generation. Live web results still override stale file content when facts conflict — we surface the disagreement instead of blending silently.",
        ],
      },
    ],
  },
  {
    slug: "model-routing-for-cost",
    title: "Routing models for cost, speed, and quality",
    excerpt:
      "Send heavy reasoning to frontier models and fan lightweight subtasks to faster providers — without changing your prompt.",
    category: "Guides",
    date: "Jun 18, 2026",
    isoDate: "2026-06-18",
    readingMinutes: 5,
    author: { name: "The MasterNode Team", role: "Guides" },
    accent: "violet",
    icon: "key",
    content: [
      {
        paragraphs: [
          "One model for everything is simple and expensive. Parallel workflows are the opposite: different subtasks have different needs. MasterNode lets you bring keys for multiple providers and route work accordingly.",
        ],
      },
      {
        heading: "Match the model to the subtask",
        bullets: [
          "Planning and final merge: use your strongest reasoning model.",
          "Bulk extraction, formatting, and transforms: Groq or DeepSeek for throughput.",
          "Embeddings and retrieval: Cohere or your provider's embedding endpoint.",
          "Vision over slides or screenshots: a multimodal model on the branches that need it.",
        ],
      },
      {
        heading: "Parallelism changes the math",
        paragraphs: [
          "Four cheap parallel calls can finish before one huge frontier call and still cost less. Watch usage per tenant in Settings and adjust routes after you see which stages dominate latency and token count.",
        ],
      },
      {
        heading: "No lock-in",
        paragraphs: [
          "Swap providers when pricing or quality shifts. Your prompts, agents, and memory stay put — only the inference backend changes.",
        ],
      },
    ],
  },
  {
    slug: "real-time-agent-status",
    title: "Real-time agent status: what each stage means",
    excerpt:
      "Plan, execute, merge, and validate — how to read the live task graph while agents work in parallel.",
    category: "Product",
    date: "Jul 5, 2026",
    isoDate: "2026-07-05",
    readingMinutes: 4,
    author: { name: "The MasterNode Team", role: "Product" },
    accent: "amber",
    icon: "zap",
    featured: true,
    content: [
      {
        paragraphs: [
          "Black-box assistants hide everything between send and reply. MasterNode streams task and agent status over WebSockets so you can see planning, execution, and merge as they happen.",
        ],
      },
      {
        heading: "Stages you'll see",
        bullets: [
          "Plan — the goal is decomposed into a dependency-aware graph.",
          "Execute — independent branches run concurrently; blocked tasks wait on upstream output.",
          "Merge — partial results are combined and conflicts are flagged.",
          "Validate — grounding and citation checks run before the answer is final.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "When a branch stalls, you know which subtask to rephrase or split. When search runs, you see it as a gated tool call — not mystery latency. Transparency is part of trust: you should never wonder what the system did with your prompt.",
        ],
      },
    ],
  },
  {
    slug: "from-chat-to-pipeline",
    title: "From single chat to multi-agent pipeline",
    excerpt:
      "When a one-shot reply isn't enough — escalating to assistants, templates, and repeatable workflows.",
    category: "Product",
    date: "Jun 8, 2026",
    isoDate: "2026-06-08",
    readingMinutes: 5,
    author: { name: "The MasterNode Team", role: "Product" },
    accent: "emerald",
    icon: "workflow",
    content: [
      {
        paragraphs: [
          "Chat is the front door. Pipelines are how teams turn a winning prompt into something repeatable — same stages, same quality bar, every time.",
        ],
      },
      {
        heading: "Start in chat",
        paragraphs: [
          "Prototype the goal in a thread. Tune memory keywords, attachments, and model routes until the merged output matches what you need. The task graph you see live is the blueprint.",
        ],
      },
      {
        heading: "Attach an assistant",
        paragraphs: [
          "Sample templates in the gallery encode role, variables, and output structure — ABM campaign plans, release bundles, support macros. Attach one to a chat when you want a specialist guiding that run without rebuilding the prompt from scratch.",
        ],
      },
      {
        heading: "Scale to a pipeline",
        paragraphs: [
          "When the same decomposition appears every week, save it as a pipeline: defined inputs, agent roles, merge rules, and deliverables (Markdown, CSV, slide outlines). Execute from the workspace or trigger via API — the status stream works the same way.",
        ],
      },
    ],
  },
  {
    slug: "streaming-task-updates",
    title: "How we stream task status over WebSockets",
    excerpt:
      "Why we chose push updates over polling, how events are scoped per tenant, and what clients should expect.",
    category: "Engineering",
    date: "Jun 20, 2026",
    isoDate: "2026-06-20",
    readingMinutes: 6,
    author: { name: "The MasterNode Team", role: "Engineering" },
    accent: "violet",
    icon: "cpu",
    content: [
      {
        paragraphs: [
          "Parallel runs emit dozens of state changes per second. Polling the REST API would lag, load the server, and still miss micro-states. We stream structured events over a single WebSocket per active session instead.",
        ],
      },
      {
        heading: "Event model",
        bullets: [
          "Task graph snapshots when planning finishes or the graph changes.",
          "Per-agent status: queued, running, waiting, complete, failed.",
          "Partial output chunks for long merges so the UI can render incrementally.",
          "Terminal events with merge metadata and citation attachments.",
        ],
      },
      {
        heading: "Isolation and recovery",
        paragraphs: [
          "Channels are scoped to tenant and conversation. Reconnecting clients receive a fresh graph snapshot plus any in-flight branch state so the panel catches up without replaying the entire run log.",
        ],
      },
      {
        heading: "Client expectations",
        paragraphs: [
          "Treat the socket as best-effort ordering within a branch; merge ordering is explicit in the payload. UI layers should debounce rapid agent ticks but never coalesce terminal failure states — users need to see errors immediately.",
        ],
      },
    ],
  },
  {
    slug: "why-bring-your-own-keys",
    title: "Why we built MasterNode for teams with their own keys",
    excerpt:
      "Provider choice, predictable billing, and governance — the product bet behind bring-your-own-model.",
    category: "Company",
    date: "May 5, 2026",
    isoDate: "2026-05-05",
    readingMinutes: 4,
    author: { name: "The MasterNode Team", role: "Company" },
    accent: "sky",
    icon: "users",
    content: [
      {
        paragraphs: [
          "Many AI products wrap one reseller contract and mark up tokens. That is fine for individuals; teams with compliance needs, existing provider deals, or multi-cloud standards deserve a different default.",
        ],
      },
      {
        heading: "Your keys, your contracts",
        paragraphs: [
          "MasterNode orchestrates — it does not sit in the middle of inference billing. Finance sees the same invoices they already get from OpenAI, Google, or Anthropic. Security teams store secrets in their own vault patterns; we never train on your data.",
        ],
      },
      {
        heading: "Governance follows",
        bullets: [
          "Per-tenant entitlements for pipelines, uploads, and integrations.",
          "Audit-friendly activity for support and bug reports.",
          "Deeper policy and compliance controls ship when ready — we don't advertise them as live first.",
        ],
      },
      {
        heading: "The trade-off we're honest about",
        paragraphs: [
          "You manage keys and provider outages. We focus on making that worthwhile: parallel speed, grounded answers, and visibility into every agent branch. If you want a fully bundled model, we're not the right fit — and we'd rather say that up front.",
        ],
      },
    ],
  },
  {
    slug: "workspace-shortcuts",
    title: "Keyboard shortcuts and workspace habits",
    excerpt:
      "⌘K search, sidebar toggles, file uploads, and the help menu — a quick reference for daily use.",
    category: "Guides",
    date: "May 20, 2026",
    isoDate: "2026-05-20",
    readingMinutes: 3,
    author: { name: "The MasterNode Team", role: "Guides" },
    accent: "amber",
    icon: "book",
    content: [
      {
        paragraphs: [
          "Power users live in the keyboard. MasterNode mirrors the shortcuts you know from other assistants where it helps, and adds a few for pipelines and uploads.",
        ],
      },
      {
        heading: "General",
        bullets: [
          "Quick chat or search — ⌘ K / Ctrl + K",
          "Toggle sidebar — ⌘ . / Ctrl + .",
          "Settings — ⇧ ⌘ , / Ctrl + Shift + ,",
          "Keyboard shortcuts panel — ⌘ / / Ctrl + /",
        ],
      },
      {
        heading: "In chat",
        bullets: [
          "Send message — Return / Enter",
          "Upload file — ⌘ U / Ctrl + U",
          "Incognito chat — ⇧ ⌘ I / Ctrl + Shift + I",
        ],
      },
      {
        heading: "Habits that compound",
        paragraphs: [
          "Pin memory keywords for recurring projects, attach assistants from the gallery instead of rewriting system prompts, and open the live task graph when debugging slow runs — you'll spot blocked branches faster than re-reading a final answer.",
        ],
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.isoDate.localeCompare(a.isoDate))
}

export function getFeaturedPosts(): BlogPost[] {
  const featured = getAllPosts().filter((post) => post.featured)
  return featured.length > 0 ? featured : getAllPosts().slice(0, 2)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug)
  const others = getAllPosts().filter((post) => post.slug !== slug)
  if (!current) {
    return others.slice(0, limit)
  }
  const sameCategory = others.filter((post) => post.category === current.category)
  const rest = others.filter((post) => post.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}
