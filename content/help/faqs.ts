import { BRANDING } from "@/constants/branding"

export interface HelpFaq {
  q: string
  a: string
}

export const HELP_FAQS: HelpFaq[] = [
  {
    q: "How do I get started?",
    a: "Create an API key in API Keys, then use Chat to run your first task. Configure LLM providers (OpenAI, Gemini, Claude, etc.) in Settings.",
  },
  {
    q: "Which LLM providers are supported?",
    a: "OpenAI, Google (Gemini), Anthropic (Claude), Groq, DeepSeek, and Cohere. Add your API keys in Settings; they are used when running parallel agents.",
  },
  {
    q: "What is RAG?",
    a: "Retrieval-augmented generation: upload files (PDF, TXT, MD, DOCX) on the Memory page. They are chunked, embedded, and stored in a vector DB. Agents use them as context when running tasks.",
  },
  {
    q: "How does parallel execution work?",
    a: "Tasks are split into subtasks by the Decomposer, run by multiple agents in parallel, then merged by the Aggregator and validated by the Supervisor. See Agent Factory for the full pipeline.",
  },
  {
    q: "I get authentication errors. What should I do?",
    a: "Use the X-API-Key header with a valid key from the API Keys page. Ensure the key is active. In the app, sign in and set the key in Settings if required.",
  },
  {
    q: "Where do I see usage and billing?",
    a: "Go to Billing for usage charts, token consumption, and plan details. Invoices are sent to your account email.",
  },
  {
    q: "How do I use the API from code?",
    a: "See Documentation for quick start, request shapes, and Python, JavaScript, and cURL examples. Use the interactive API reference to try endpoints in the browser.",
  },
  {
    q: "Can I get real-time task updates?",
    a: "Yes. Connect via WebSocket and subscribe to task events. Documentation covers the WebSocket URL, auth, and event types.",
  },
  {
    q: "What if my task fails or times out?",
    a: "Check the task detail page for status and errors. See Documentation → Troubleshooting or contact support if the issue persists.",
  },
  {
    q: "Who do I contact for support?",
    a: `Use the Support page or email ${BRANDING.contactEmail}. In-app support chat is available when signed in.`,
  },
  {
    q: "How do I delete my account?",
    a: "Open Settings → Account. Soft delete blocks access immediately and purges data after 30 days. Permanent delete removes workspace data immediately and cannot be undone. You must type your account email and DELETE to confirm. Limited records may be retained longer where required by law.",
  },
]
