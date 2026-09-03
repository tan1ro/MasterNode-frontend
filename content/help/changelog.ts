export type ChangelogChangeType = "added" | "changed" | "fixed" | "improved"

export interface ChangelogSection {
  type: ChangelogChangeType
  items: string[]
}

export interface ChangelogVersion {
  version: string
  date: string
  dateDisplay: string
  sections: ChangelogSection[]
}

export const CHANGELOG_META = {
  title: "Changelog",
  description:
    "Version-by-version technical changelog for MasterNode — added, changed, fixed, and improved items per release.",
  lastUpdated: "2026-08-14",
  lastUpdatedDisplay: "Updated: August 14, 2026",
}

/** Newest first — compact semver-grouped entries for developers and power users. */
export const CHANGELOG_VERSIONS: ChangelogVersion[] = [
  {
    version: "0.9.2",
    date: "2026-08-14",
    dateDisplay: "August 14, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Structured pipeline plan fields and plan API aliases (answer / approve / reject)",
          "Topic-aware presentation fallback decks grounded in the approved Outline",
          "Groq and OpenRouter provider logos; DISABLE_OPENROUTER env flag",
        ],
      },
      {
        type: "changed",
        items: [
          "Presentations after plan approval use the plan-aware PPTX fast path",
          "Plan card Approve & Run / Cancel with live answer→markdown updates",
        ],
      },
      {
        type: "fixed",
        items: [
          "Pipeline SyntaxError (f-string backslash) that failed every plan run",
          "Off-topic PPTX titles and Frontend/Backend/DevOps fallback content",
          "False LLM auth errors on Gemini quota messages; metrics 404 during plan review",
        ],
      },
    ],
  },
  {
    version: "0.9.1",
    date: "2026-07-09",
    dateDisplay: "July 9, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Public `/pricing` page with plan cards and searchable feature comparison matrix",
          "Dedicated `/changelog` route separate from narrative release notes",
        ],
      },
      {
        type: "fixed",
        items: [
          "Chat attachment downloads with unicode filenames (Content-Disposition latin-1 encoding)",
          "New chat navigation while a conversation is still streaming",
        ],
      },
      {
        type: "improved",
        items: [
          "Memory (RAG) retrieval when Use Memory is enabled in chat run context",
          "Plan-based upload limits synced across frontend and backend",
        ],
      },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-07-04",
    dateDisplay: "July 4, 2026",
    sections: [
      {
        type: "added",
        items: [
          "OAuth sign-in (Google and other configured providers)",
          "Public `/release-notes` marketing page",
        ],
      },
      {
        type: "changed",
        items: [
          "Marketing pages respect system and in-app light/dark theme",
          "Legacy `/status` and `/help/release-notes` redirect to `/release-notes`",
        ],
      },
      {
        type: "improved",
        items: [
          "Pipeline stage mockups styled for light and dark themes",
          "Home and public site nav theme toggle",
        ],
      },
    ],
  },
  {
    version: "0.8.2",
    date: "2026-06-10",
    dateDisplay: "June 10, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Account menu Help flyout with keyboard shortcuts reference",
          "In-app bug report form (2,000-character limit, support audit log)",
          "Interactive pipeline plan questions before full parallel runs",
        ],
      },
      {
        type: "improved",
        items: [
          "Sidebar account menu aligned with ChatGPT/Claude-style personalization flows",
        ],
      },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-06-09",
    dateDisplay: "June 9, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Deliverable intent router (document, presentation, code, spreadsheet, image)",
          "Document and presentation fast-paths with DOCX/PDF export",
          "Pipeline planning cards in chat before DAG execution",
          "Integrations hub: n8n, Canva, Google Docs, Notion",
          "chat_user_context.py for follow-up-aware routing",
        ],
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-06-08",
    dateDisplay: "June 8, 2026",
    sections: [
      {
        type: "added",
        items: ["PIE-QA Engine microservice (static analysis, E2B sandbox, Playwright)"],
      },
      {
        type: "changed",
        items: [
          "Chat workspace layout refresh with citation-aware web search sources",
          "Pipeline continue banner to resume interrupted runs from chat",
        ],
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-06-04",
    dateDisplay: "June 4, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Stripe billing (checkout, invoices, customer portal)",
          "Business products module with SDLC workstream pages",
          "Docker Compose full-stack local development",
          "Frontend CI workflow (lint + typecheck on PRs)",
        ],
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-06-01",
    dateDisplay: "June 1, 2026",
    sections: [
      {
        type: "added",
        items: [
          "Multi-tenant session JWT auth with email/password",
          "API wallet prepaid metering",
          "Plan entitlements (Free, Pro, Enterprise)",
          "Seeded agent templates for pipeline stages",
        ],
      },
    ],
  },
]

export const CHANGELOG_TYPE_LABELS: Record<ChangelogChangeType, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  improved: "Improved",
}
