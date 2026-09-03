"use client"

import type { ComponentType } from "react"
import { Fragment } from "react"
import {
  BookOpen,
  Brain,
  CreditCard,
  Database,
  HardDrive,
  KeyRound,
  Laptop,
  MessageSquare,
  Palette,
  Plug,
  Shield,
  Sparkles,
  User,
  Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SettingsSectionDef {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  /** Extra terms matched by the settings search box. */
  keywords: string[]
  /**
   * Underlying panel sections rendered when this nav entry is active. Lets us
   * merge several related sections under one nav item (fewer, less-scrolly
   * groups). Defaults to `[id]` when omitted.
   */
  members?: string[]
  /** Sidebar group heading, Claude-style (General / Agents / Help). */
  group?: string
  /** Hide this nav entry unless the page is running inside MasterNode Desktop. */
  desktopOnly?: boolean
}

/** Logged-out users: appearance + browser data only. */
export const GUEST_SETTINGS_SECTIONS: SettingsSectionDef[] = [
  {
    id: "general",
    label: "General",
    icon: Palette,
    keywords: ["appearance", "theme", "dark", "light", "language", "font"],
  },
  {
    id: "local-data",
    label: "Data controls",
    icon: Database,
    keywords: ["clear", "cache", "storage", "chat", "reset"],
  },
]

/**
 * Signed-in settings, merged into a shorter set of grouped nav entries so the
 * sidebar doesn't require heavy scrolling. Each group renders its `members`
 * (individual panel sections) stacked in the content area.
 */
export const SETTINGS_SECTIONS: SettingsSectionDef[] = [
  {
    id: "account",
    label: "Account",
    icon: User,
    group: "General",
    members: ["account-profile", "account"],
    keywords: [
      "name",
      "avatar",
      "email",
      "profile",
      "social",
      "google",
      "github",
      "last login",
      "plan",
      "creator",
      "business",
      "delete",
      "tier",
      "pricing",
    ],
  },
  {
    id: "security",
    label: "Security & privacy",
    icon: Shield,
    group: "General",
    members: ["security", "privacy-data", "safety-wellbeing"],
    keywords: [
      "password",
      "sessions",
      "2fa",
      "mfa",
      "login history",
      "sign out devices",
      "totp",
      "training",
      "gdpr",
      "export",
      "retention",
      "opt-out",
      "download data",
      "crisis",
      "trusted contact",
      "parental",
      "guardian",
      "minor",
      "self-harm",
      "safety",
      "wellbeing",
    ],
  },
  {
    id: "chat-behavior",
    label: "Chat",
    icon: MessageSquare,
    group: "General",
    members: ["chat-behavior", "chat-management"],
    keywords: [
      "thinking",
      "stream",
      "history",
      "enter",
      "send",
      "auto-name",
      "custom instructions",
      "pipeline",
      "archive",
      "export",
      "pdf",
      "share",
      "restore",
      "unarchive",
    ],
  },
  {
    id: "appearance",
    label: "Appearance & language",
    icon: Palette,
    group: "General",
    members: ["appearance", "language-region"],
    keywords: [
      "theme",
      "font size",
      "markdown",
      "syntax",
      "density",
      "tokens",
      "cost",
      "language",
      "hindi",
      "spanish",
      "timezone",
      "date format",
      "24 hour",
      "region",
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    group: "General",
    keywords: ["usage", "invoice", "plan", "upgrade", "tokens", "cost", "wallet"],
  },
  {
    id: "desktop-app",
    label: "Desktop app",
    icon: Laptop,
    group: "General",
    desktopOnly: true,
    keywords: [
      "update",
      "version",
      "relaunch",
      "installer",
      "electron",
      "mac",
      "windows",
      "linux",
      "download",
    ],
  },
  {
    id: "memory",
    label: "Memory",
    icon: Brain,
    group: "Agents",
    keywords: ["remember", "facts", "personalisation", "rag", "clear memory"],
  },
  {
    id: "llm-defaults",
    label: "Models & RAG",
    icon: Sparkles,
    group: "Agents",
    members: ["llm-defaults", "rag-research", "llm-routing"],
    keywords: [
      "model",
      "temperature",
      "tokens",
      "provider",
      "citation",
      "freshness",
      "knowledge",
      "retrieval",
      "routing",
      "fallback",
      "strategy",
    ],
  },
  {
    id: "pipeline-advanced",
    label: "Pipeline & tasks",
    icon: Workflow,
    group: "Agents",
    members: ["pipeline-advanced", "task-defaults", "custom-agents"],
    keywords: [
      "parallel",
      "execution",
      "human in loop",
      "refresh",
      "interval",
      "poll",
      "tasks",
      "templates",
      "agents",
    ],
  },
  {
    id: "api-access",
    label: "API & webhooks",
    icon: KeyRound,
    group: "Agents",
    members: ["api-access", "webhooks", "notifications"],
    keywords: [
      "masternode key",
      "provider keys",
      "openai",
      "anthropic",
      "url",
      "events",
      "task finished",
      "webhook",
      "sound",
      "complete",
      "browser",
      "notifications",
    ],
  },
  {
    id: "connected-apps",
    label: "Connected apps",
    icon: Plug,
    group: "Agents",
    members: ["connected-apps", "quick-links"],
    keywords: [
      "oauth",
      "canva",
      "google drive",
      "indeed",
      "spotify",
      "notion",
      "integrations",
      "api keys",
      "llm strategy",
      "assistants",
      "docs",
      "workspace links",
    ],
  },
  {
    id: "help-support",
    label: "Help & learn",
    icon: BookOpen,
    group: "Help",
    members: ["help-support", "education"],
    keywords: [
      "docs",
      "feedback",
      "bug",
      "shortcuts",
      "release notes",
      "changelog",
      "courses",
      "tutorial",
      "academy",
      "prompt engineering",
    ],
  },
  {
    id: "local-data",
    label: "Local data",
    icon: HardDrive,
    group: "Help",
    keywords: ["clear", "cache", "storage", "export", "reset"],
  },
]

/** All panel sections rendered by a nav group (defaults to the group id). */
export function settingsGroupMembers(groupId: string): string[] {
  const group = SETTINGS_SECTIONS.find((s) => s.id === groupId)
  return group?.members ?? [groupId]
}

/**
 * Resolve a raw section id (which may be a merged member like `webhooks`) to the
 * nav group that now contains it, so deep-links keep working after merging.
 */
export function resolveSettingsGroupId(sectionId: string | null | undefined): string | null {
  if (!sectionId) return null
  const direct = SETTINGS_SECTIONS.find((s) => s.id === sectionId)
  if (direct) return direct.id
  const owner = SETTINGS_SECTIONS.find((s) => s.members?.includes(sectionId))
  return owner?.id ?? null
}

export function filterGuestSettingsSections(query: string): SettingsSectionDef[] {
  const q = query.trim().toLowerCase()
  if (!q) return GUEST_SETTINGS_SECTIONS
  return GUEST_SETTINGS_SECTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.keywords.some((k) => k.includes(q))
  )
}

export function visibleSettingsSections(isDesktop: boolean): SettingsSectionDef[] {
  return SETTINGS_SECTIONS.filter((s) => !s.desktopOnly || isDesktop)
}

export function filterSettingsSections(
  query: string,
  isDesktop = false
): SettingsSectionDef[] {
  const source = visibleSettingsSections(isDesktop)
  const q = query.trim().toLowerCase()
  if (!q) return source
  return source.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.keywords.some((k) => k.includes(q))
  )
}

export function SettingsSectionNav({
  className,
  activeId,
  onSelect,
  sections = SETTINGS_SECTIONS,
}: {
  className?: string
  activeId: string
  onSelect: (id: string) => void
  sections?: SettingsSectionDef[]
}) {
  return (
    <nav
      className={cn(
        "settings-section-nav flex gap-1",
        "max-lg:-mx-0.5 max-lg:flex-row max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:px-0.5 max-lg:pb-0.5",
        "lg:flex-col lg:gap-0.5",
        className
      )}
      aria-label="Settings sections"
    >
      {sections.map(({ id, label, icon: Icon, group }, index) => {
        const prevGroup = sections[index - 1]?.group
        const showGroup = Boolean(group) && group !== prevGroup
        return (
          <Fragment key={id}>
            {showGroup ? (
              <p className="hidden px-2.5 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80 first:pt-1 lg:block">
                {group}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-current={activeId === id ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                "max-lg:border max-lg:border-transparent",
                "lg:w-full lg:gap-2.5",
                activeId === id
                  ? "bg-amber/10 font-medium text-amber max-lg:border-amber/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.06]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  activeId === id ? "text-amber" : "opacity-70"
                )}
                aria-hidden
              />
              <span className="whitespace-nowrap lg:truncate">{label}</span>
            </button>
          </Fragment>
        )
      })}
    </nav>
  )
}
