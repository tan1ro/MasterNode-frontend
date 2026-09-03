import { ROUTES } from "@/lib/routes"

export interface HelpTutorialCard {
  id: string
  title: string
  description: string
  href: string
  duration?: string
  steps: string[]
}

export const HELP_TUTORIALS: HelpTutorialCard[] = [
  {
    id: "quickstart",
    title: "Quickstart",
    description: "Create an API key, send a prompt, and read the response in under five minutes.",
    href: "/help/tutorials#quickstart",
    duration: "5 min",
    steps: [
      "Sign in and open API Keys to create a key (or use chat without an API key for browser sessions).",
      "Open Chat and describe an outcome — or go to Tasks → New for a full parallel run.",
      "Watch streaming replies in chat, or the live DAG on /tasks/execute for pipeline mode.",
      "Optional: call the REST API with the X-API-Key header — see Documentation for request shapes.",
    ],
  },
  {
    id: "web-app",
    title: "Web app tour",
    description: "Navigate chat, tasks, assistants, and memory from the workspace shell.",
    href: "/help/tutorials#web-app",
    duration: "8 min",
    steps: [
      "Chat — streaming replies, attachments, web search, pipeline toggle, and assistants.",
      "Tasks — create runs, review plan questions, and follow WebSocket progress.",
      "Assistants — save templates and fill intake forms before send.",
      "Memory — upload documents for RAG; browse working memory and knowledge.",
      "Integrations & Settings — connect n8n/Canva/Docs/Notion and configure models.",
    ],
  },
  {
    id: "code-examples",
    title: "Code examples",
    description: "Python, JavaScript, and cURL samples for tasks, RAG, and WebSockets.",
    href: `${ROUTES.docs}#code-examples`,
    duration: "10 min",
    steps: [
      "Open Documentation → Code examples for Python, JavaScript, and cURL snippets.",
      "Authenticate with X-API-Key on REST calls and WebSocket connections.",
      "Create a task, poll status or subscribe to events, then read the aggregated result.",
      "Upload files to the knowledge base, then run a task that retrieves chunks.",
    ],
  },
  {
    id: "parallel-orchestration",
    title: "Parallel orchestration",
    description: "Understand decompose → parallel agents → aggregate → supervise.",
    href: `${ROUTES.platform}#agent-factory`,
    duration: "12 min",
    steps: [
      "Master Agent scopes the request and decides how to decompose work.",
      "Decomposer splits into independent subtasks for concurrent agents.",
      "Parallel agents run with your configured providers and RAG context.",
      "Aggregator merges outputs; Supervisor validates before the final deliverable.",
      "See Platform → Agent Factory for the visual pipeline.",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common errors, auth issues, and rate limits.",
    href: `${ROUTES.docs}#troubleshooting`,
    duration: "6 min",
    steps: [
      "401 / auth errors — confirm your session or X-API-Key is active in API Keys.",
      "429 rate limits — wait and retry, or upgrade plan / reduce parallelism.",
      "Empty RAG answers — re-upload files on Memory and wait for embedding to finish.",
      "Pipeline stalls — check the live DAG for a blocked human-in-the-loop step.",
      "Still stuck — see the FAQ, HTTP status reference, or Contact support.",
    ],
  },
]
