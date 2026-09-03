export interface ReleaseNoteBulletGroup {
  heading?: string
  items: string[]
}

export interface ReleaseNoteArticle {
  id: string
  /** Product semver this note ships with (shown in the left version nav). */
  version: string
  date: string
  dateDisplay: string
  title: string
  tag?: "Added" | "Changed" | "Fixed" | "Improved"
  paragraphs: string[]
  bullets?: ReleaseNoteBulletGroup[]
  footnote?: string
}

export interface ReleaseNoteVersionNavItem {
  version: string
  date: string
  dateDisplay: string
  /** Anchor for the version block on the page. */
  href: string
  /** First article title under this version (sidebar subtitle). */
  summary: string
  articleIds: string[]
}

export const RELEASE_NOTES_META = {
  title: "Release notes",
  description:
    "What’s new on MasterNode.ai — product updates written for customers and teams, not just engineers.",
  lastUpdated: "2026-08-14",
  lastUpdatedDisplay: "Updated: August 14, 2026",
}

export function releaseNoteVersionAnchor(version: string): string {
  return `v${version.replace(/\./g, "-")}`
}

/**
 * Public / marketing release notes (newest first).
 * Keep language benefit-first. Put file names, env vars, and API details in `/changelog`.
 */
export const RELEASE_NOTES_ARTICLES: ReleaseNoteArticle[] = [
  {
    id: "pipeline-plan-integrity-presentations",
    version: "0.9.2",
    date: "2026-08-14",
    dateDisplay: "August 14, 2026",
    tag: "Improved",
    title: "Smarter pipeline plans — and slides that match what you asked for",
    paragraphs: [
      "Pipeline mode is for bigger asks: research, docs, decks, and multi-step work. In this release, the plan you review is the plan that actually runs — so you spend less time fixing wrong-direction output.",
      "When something is unclear, MasterNode asks focused clarifying questions. When your prompt is already specific, it skips the quiz and shows the plan ready for Approve & Run or Cancel. As you answer, the outline updates live so you can see scope change before agents start.",
      "Presentation deliverables now follow that approved outline and subject. The finished deck should match what you requested — title, sections, and emphasis — instead of drifting into an unrelated template.",
      "Smaller polish: model provider logos (including Groq and OpenRouter) show up more clearly in usage views, and the current app version appears in Settings → Help & support and in the site footer.",
    ],
    bullets: [
      {
        heading: "How to try it",
        items: [
          "Open Chat, switch the composer to Pipeline, and describe the deliverable you want",
          "Review the plan card — answer any questions, then Approve & Run or Cancel",
          "For slides, pick Presentation as the format and confirm the outline before running",
          "Check Settings → Help & support to see the current version",
        ],
      },
      {
        heading: "What improved",
        items: [
          "Plan review stays connected through Approve & Run",
          "Presentations follow your subject and approved outline",
          "Clearer provider branding in usage UI",
          "Version label in Settings and the marketing footer",
        ],
      },
    ],
  },
  {
    id: "light-theme-oauth-release-notes",
    version: "0.9.0",
    date: "2026-07-04",
    dateDisplay: "July 4, 2026",
    tag: "Improved",
    title: "Light mode, faster sign-in, and this release notes page",
    paragraphs: [
      "The public site should feel like the product: home, pricing, docs, solutions, blog, and about now follow your light or dark preference instead of forcing dark mode.",
      "Getting into a workspace is faster too. Sign in or sign up with Google (and other connected providers) alongside email and password — useful for teams that already live in Google Workspace.",
      "Product news lives here on Release notes. The old Status page redirects here, so customers and prospects always land on what’s shipping — not an empty ops page.",
    ],
    bullets: [
      {
        heading: "On the website",
        items: [
          "Theme toggle in the public site nav",
          "Marketing pages and pipeline mockups styled for light and dark",
          "Release notes as the home for customer-facing product updates",
        ],
      },
      {
        heading: "In the product",
        items: [
          "OAuth sign-in next to email/password",
          "Workspace sessions stay aligned after OAuth",
        ],
      },
    ],
  },
  {
    id: "account-menu-help",
    version: "0.8.2",
    date: "2026-06-10",
    dateDisplay: "June 10, 2026",
    tag: "Added",
    title: "A clearer account menu, shortcuts, and in-app bug reports",
    paragraphs: [
      "The sidebar account menu is reorganized for everyday use: open personalization and profile without leaving chat, jump to plans without losing your thread, and find Help in one place.",
      "Keyboard shortcuts are available from Help or with ⌘ / (Mac) / Ctrl + / (Windows). The reference is grouped into general navigation and in-chat actions, with Mac and Windows key labels.",
      "When something feels wrong, Report a bug opens a short in-app form. You don’t need to draft an email — your page and conversation context are included when available.",
    ],
    bullets: [
      {
        heading: "Handy shortcuts",
        items: [
          "Quick search — ⌘ K / Ctrl + K",
          "Incognito chat — ⇧ ⌘ I / Ctrl + Shift + I",
          "Toggle sidebar — ⌘ . / Ctrl + .",
          "Settings — ⇧ ⌘ , / Ctrl + Shift + ,",
          "Send message — Return / Enter",
          "Upload file — ⌘ U / Ctrl + U",
        ],
      },
    ],
    footnote: "Signed-in and guest users can both open Help and send feedback.",
  },
  {
    id: "pipeline-plan-questions",
    version: "0.8.2",
    date: "2026-06-10",
    dateDisplay: "June 10, 2026",
    tag: "Added",
    title: "Ask once, then run the right pipeline",
    paragraphs: [
      "Ambiguous prompts used to burn a full parallel run before anyone noticed the scope was wrong. Pipeline mode can now ask a few clarifying questions about format, depth, and audience first.",
      "You choose from clear option cards. Those answers feed the plan so agents start with an agreed direction — fewer wasted runs and fewer “that’s not what I meant” moments.",
    ],
    bullets: [
      {
        heading: "Good fits",
        items: [
          "You know the topic but not the output format yet",
          "You want a short brief vs a deep report",
          "You’re choosing between text, document, or slides",
        ],
      },
    ],
    footnote: "Turn on Pipeline in the chat composer to try plan review.",
  },
  {
    id: "deliverable-intent-router",
    version: "0.8.0",
    date: "2026-06-09",
    dateDisplay: "June 9, 2026",
    tag: "Added",
    title: "Ask for a report — get a report, not a code dump",
    paragraphs: [
      "MasterNode figures out what you want back — a document, slides, code, a spreadsheet, or an image — before it chooses how to work.",
      "Writing tasks such as case studies, syllabi, and research briefs come back as readable prose you can scan in chat. Build and coding requests still use the full agent pipeline.",
      "The same routing applies when you continue a thread, so follow-ups stay on the path you started — document stays document, slides stay slides.",
    ],
    bullets: [
      {
        heading: "How asks map to results",
        items: [
          "“Make a slide deck…” → presentation in chat",
          "“Write a case study…” → document you can read and export",
          "“Build a React app…” → full coding pipeline",
          "“Download as PDF…” → document plus file export",
        ],
      },
    ],
  },
  {
    id: "document-presentation-fastpath",
    version: "0.8.0",
    date: "2026-06-09",
    dateDisplay: "June 9, 2026",
    tag: "Added",
    title: "Documents and presentations, right in the chat",
    paragraphs: [
      "Not every ask needs a long multi-agent run. For focused write-ups and decks, MasterNode can deliver in the thread: polished markdown, optional Word or PDF download, and themed PowerPoint cards you can preview and save.",
      "That means less waiting when a single deliverable is enough — and you still have Pipeline when the job is larger or needs parallel agents.",
    ],
    bullets: [
      {
        heading: "What you can download",
        items: [
          "Markdown documents in the conversation",
          "Optional DOCX and PDF export",
          "Themed slide decks as downloadable files",
        ],
      },
    ],
  },
  {
    id: "pipeline-planning-cards",
    version: "0.8.0",
    date: "2026-06-09",
    dateDisplay: "June 9, 2026",
    tag: "Added",
    title: "See the plan before agents start",
    paragraphs: [
      "Pipeline mode shows a structured plan card before agents run: what will be covered, what deliverable you’ll get, and how the work will be split.",
      "Confirm to start, or stay in normal chat if you’re still exploring. You’re in control of direction and spend before the swarm begins.",
    ],
    bullets: [
      {
        items: [
          "Scope and deliverable type at a glance",
          "Confirm to start the run, or dismiss to keep chatting",
        ],
      },
    ],
  },
  {
    id: "integrations-hub",
    version: "0.7.0",
    date: "2026-06-09",
    dateDisplay: "June 9, 2026",
    tag: "Added",
    title: "Connect n8n, Canva, Google Docs, and Notion",
    paragraphs: [
      "From Settings → Integrations, connect the tools your team already uses. Each workspace keeps its own secure credentials — nothing is shared across tenants.",
      "Use chat and tasks to trigger n8n automations, push design work into Canva, edit in Google Docs, or update Notion pages as MasterNode produces output.",
    ],
    bullets: [
      {
        heading: "Supported today",
        items: [
          "n8n — automate from chat and tasks",
          "Canva — design from connected accounts",
          "Google Docs — edit documents with OAuth",
          "Notion — update pages with your API token",
        ],
      },
    ],
  },
  {
    id: "qa-engine",
    version: "0.6.0",
    date: "2026-06-08",
    dateDisplay: "June 8, 2026",
    tag: "Added",
    title: "Built-in quality checks for generated code",
    paragraphs: [
      "When agents produce code, MasterNode can validate it with static checks and optional sandboxed runs — so you catch issues before you try the project locally.",
      "Teams get clearer scores and issue lists instead of guessing whether generated work is safe to open.",
    ],
    bullets: [
      {
        items: [
          "Static analysis on generated bundles",
          "Optional sandbox runs when enabled for your workspace",
          "Structured scores and issue lists you can act on",
        ],
      },
    ],
    footnote: "Sandbox execution is available when your workspace has it enabled.",
  },
  {
    id: "chat-workspace-redesign",
    version: "0.5.0",
    date: "2026-06-06",
    dateDisplay: "June 6, 2026",
    tag: "Changed",
    title: "A cleaner chat workspace — with sources you can trust",
    paragraphs: [
      "Chat got a layout refresh: easier message threads, a tidier sidebar for recents, and Help grouped where you expect it.",
      "When answers use the web, sources appear in a panel with citations you can open. If a pipeline run is interrupted, you can resume from chat without digging through Tasks.",
    ],
    bullets: [
      {
        items: [
          "Redesigned threads and sidebar recents",
          "Sources panel with clickable citations",
          "Continue an interrupted pipeline from chat",
        ],
      },
    ],
  },
  {
    id: "stripe-billing",
    version: "0.4.0",
    date: "2026-06-04",
    dateDisplay: "June 4, 2026",
    tag: "Added",
    title: "Self-serve billing and product workspaces",
    paragraphs: [
      "Upgrade, manage invoices, and open the customer portal without emailing support. Business workspaces also get product and SDLC views for organizing delivery work across phases.",
      "Local tryouts and cloud workspaces stay aligned so your team evaluates MasterNode the same way you’ll run it day to day.",
    ],
    bullets: [
      {
        items: [
          "Checkout, invoices, and billing portal",
          "Product and SDLC views for business accounts",
        ],
      },
    ],
  },
  {
    id: "multi-tenant-auth",
    version: "0.3.0",
    date: "2026-06-01",
    dateDisplay: "June 1, 2026",
    tag: "Added",
    title: "Workspaces, plans, and usage that scale with your team",
    paragraphs: [
      "Sign in with a normal account, invite your organization, and keep each workspace isolated. Free, Pro, and Enterprise plans unlock the features each team needs.",
      "API keys and prepaid usage metering make model spend visible — without sharing one fragile key across the company.",
    ],
    bullets: [
      {
        items: [
          "Email/password workspace sign-in",
          "Tenant isolation for organizations",
          "Plan entitlements and usage metering",
        ],
      },
    ],
  },
]

/** Unique versions for the left nav (newest first). */
export const RELEASE_NOTE_VERSIONS: ReleaseNoteVersionNavItem[] = (() => {
  const map = new Map<string, ReleaseNoteVersionNavItem>()
  for (const article of RELEASE_NOTES_ARTICLES) {
    const existing = map.get(article.version)
    if (existing) {
      existing.articleIds.push(article.id)
      continue
    }
    map.set(article.version, {
      version: article.version,
      date: article.date,
      dateDisplay: article.dateDisplay,
      href: `#${releaseNoteVersionAnchor(article.version)}`,
      summary: article.title,
      articleIds: [article.id],
    })
  }
  return Array.from(map.values())
})()
