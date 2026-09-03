export const CHAT_INTRO_RESTART_SESSION_KEY = "mn_restart_chat_intro_v1"
export const CHAT_INTRO_RESTART_EVENT = "masternode-chat-intro-restart"

/** Lets the tour command the composer "+" menu open/closed while a step is active. */
export const CHAT_TOUR_MENU_EVENT = "masternode-chat-tour-menu"

const PENDING_PREFIX = "mn_pending_chat_intro_v1"
const COMPLETED_PREFIX = "mn_chat_intro_completed_v1"

export interface ChatIntroProfileSnapshot {
  chat_intro_completed?: boolean
}

export type ChatTourPlacement = "center" | "right" | "top" | "bottom"

export type ChatTourStep = {
  id: string
  title: string
  description: string
  target?: string
  placement: ChatTourPlacement
  /** Open the chat sidebar while this step is active (required for drawer targets on mobile). */
  needsSidebar?: boolean
  /** Force the composer "+" menu open while this step is active. */
  openComposerMenu?: boolean
  /** Preferred spotlight selector once the menu is open (falls back to target). */
  spotlightTarget?: string
}

/** Tailwind `lg` breakpoint — mobile drawer vs desktop sidebar. */
export const CHAT_TOUR_DESKTOP_MQ = "(min-width: 1024px)"

/** Sidebar drawer transition (~300ms) + panel delay — remeasure through this window. */
export const CHAT_TOUR_SIDEBAR_SETTLE_MS = [0, 80, 180, 340, 450, 550, 650] as const

export function getChatTourSteps(displayName?: string | null): ChatTourStep[] {
  const name = displayName?.trim()
  const welcomeTitle = name ? `Welcome, ${name}` : "Welcome to chat"

  return [
    {
      id: "welcome",
      title: welcomeTitle,
      description:
        "A quick tour of your workspace — where you compose prompts, start threads, and find your tools.",
      placement: "center",
    },
    {
      id: "sidebar",
      title: "Sidebar",
      description:
        "Recent chats, navigation, workspace links, and your account all live here.",
      target: '[data-chat-tour="sidebar"]',
      placement: "right",
      needsSidebar: true,
    },
    {
      id: "new-chat",
      title: "New chat",
      description: "Start a fresh conversation whenever you want a clean context.",
      target: '[data-chat-tour="new-chat"]',
      placement: "right",
      needsSidebar: true,
    },
    {
      id: "search",
      title: "Search chats",
      description: "Find any past thread by title or message without scrolling.",
      target: '[data-chat-tour="search-chats"]',
      placement: "right",
      needsSidebar: true,
    },
    {
      id: "workspace",
      title: "Workspace",
      description: "Tasks, assistants, memory, and integrations — your hub beyond chat.",
      target: '[data-chat-tour="workspace-nav"]',
      placement: "right",
      needsSidebar: true,
    },
    {
      id: "composer",
      title: "Composer",
      description:
        "Type your prompt here. Use + for files, assistants, or pipeline mode. Voice is on the right.",
      target: '[data-chat-tour="composer"]',
      placement: "top",
    },
    {
      id: "pipeline-mode",
      title: "Pipeline mode",
      description:
        "Toggle Pipeline mode to split a task into parallel agents that run together and merge into one result. Turn it off anytime from the chip above the composer.",
      target: '[data-chat-tour="composer-menu"]',
      spotlightTarget: '[data-chat-tour="pipeline-toggle"]',
      openComposerMenu: true,
      placement: "top",
    },
    {
      id: "prompts",
      title: "Quick prompts",
      description: "Tap a chip to seed your first message — edit it before you send.",
      target: '[data-chat-tour="quick-prompts"]',
      placement: "top",
    },
    {
      id: "finish",
      title: "You're all set",
      description:
        "Replay this tour anytime from Settings → Help & support → Chat walkthrough.",
      placement: "center",
    },
  ]
}

export function resolveChatTourSteps(displayName?: string | null): ChatTourStep[] {
  if (typeof document === "undefined") {
    return getChatTourSteps(displayName)
  }

  return getChatTourSteps(displayName).filter((step) => {
    if (!step.target) return true
    return document.querySelector(step.target) instanceof HTMLElement
  })
}

function pendingKey(tenantId: string): string {
  return `${PENDING_PREFIX}:${tenantId.trim()}`
}

function completedKey(tenantId: string): string {
  return `${COMPLETED_PREFIX}:${tenantId.trim()}`
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage?.getItem === "function"
  } catch {
    return false
  }
}

export function markPendingChatIntro(tenantId: string): void {
  if (!canUseStorage() || !tenantId.trim()) return
  if (isChatIntroCompleted(tenantId)) return
  try {
    localStorage.setItem(pendingKey(tenantId), "1")
  } catch {
    // ignore
  }
}

export function isChatIntroCompleted(tenantId: string, profileCompleted?: boolean): boolean {
  if (profileCompleted) return true
  if (!canUseStorage() || !tenantId.trim()) return false
  try {
    return Boolean(localStorage.getItem(completedKey(tenantId)))
  } catch {
    return false
  }
}

export function isChatIntroPending(tenantId: string, profileCompleted?: boolean): boolean {
  if (isChatIntroCompleted(tenantId, profileCompleted)) return false
  if (!canUseStorage() || !tenantId.trim()) return false
  try {
    return localStorage.getItem(pendingKey(tenantId)) === "1"
  } catch {
    return false
  }
}

export function clearPendingChatIntro(tenantId: string): void {
  if (!canUseStorage() || !tenantId.trim()) return
  try {
    localStorage.removeItem(pendingKey(tenantId))
  } catch {
    // ignore
  }
}

function writeLocalChatIntroCompleted(tenantId: string, completedAt?: string): void {
  if (!canUseStorage() || !tenantId.trim()) return
  try {
    localStorage.setItem(completedKey(tenantId), completedAt ?? new Date().toISOString())
    clearPendingChatIntro(tenantId)
  } catch {
    // ignore
  }
}

export function hydrateChatIntroFromProfile(
  tenantId: string,
  profileCompleted?: boolean
): void {
  if (!tenantId.trim()) return
  if (profileCompleted) {
    if (!isChatIntroCompleted(tenantId)) {
      writeLocalChatIntroCompleted(tenantId)
    }
    return
  }
  if (isChatIntroCompleted(tenantId)) {
    const completedAt =
      (canUseStorage() && localStorage.getItem(completedKey(tenantId))) ||
      new Date().toISOString()
    if (typeof window !== "undefined") {
      void import("@/services/auth")
        .then(({ authService }) => authService.saveChatIntro({ completed_at: completedAt }))
        .catch(() => {
          // Local completion still prevents repeat tours in this browser.
        })
    }
  }
}

export function markChatIntroCompleted(tenantId: string): void {
  const completedAt = new Date().toISOString()
  writeLocalChatIntroCompleted(tenantId, completedAt)
  if (typeof window === "undefined" || !tenantId.trim()) return
  void import("@/services/auth")
    .then(({ authService }) => authService.saveChatIntro({ completed_at: completedAt }))
    .catch(() => {
      // Local completion still prevents repeat tours in this browser.
    })
}

export function resetChatIntroTourState(tenantId: string): void {
  if (!canUseStorage() || !tenantId.trim()) return
  localStorage.removeItem(completedKey(tenantId))
  clearPendingChatIntro(tenantId)
  try {
    sessionStorage.removeItem(CHAT_INTRO_RESTART_SESSION_KEY)
  } catch {
    // ignore
  }
}

export function requestChatIntroRestart(tenantId: string): void {
  const id = tenantId.trim()
  if (!id) return
  resetChatIntroTourState(id)
  markPendingChatIntro(id)
  try {
    sessionStorage.setItem(CHAT_INTRO_RESTART_SESSION_KEY, id)
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHAT_INTRO_RESTART_EVENT, { detail: { tenantId: id } }))
  }
}

export function consumeChatIntroRestartRequest(tenantId: string): boolean {
  if (!tenantId.trim()) return false
  try {
    const queued = sessionStorage.getItem(CHAT_INTRO_RESTART_SESSION_KEY)
    if (queued !== tenantId.trim()) return false
    sessionStorage.removeItem(CHAT_INTRO_RESTART_SESSION_KEY)
    return true
  } catch {
    return false
  }
}
