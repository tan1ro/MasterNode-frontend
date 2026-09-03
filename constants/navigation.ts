import {
  LayoutDashboard,
  Key,
  Settings,
  DollarSign,
  Book,
  Bot,
  Brain,
  UsersRound,
  ScrollText,
  Activity,
  ShieldCheck,
  FileText,
  ListTodo,
  Crown,
  Rocket,
  BarChart3,
  UserCog,
  Plug,
  ClipboardList,
  Bug,
  MessagesSquare,
  Gauge,
  CreditCard,
  Download,
} from "lucide-react"
import { ROUTES } from "@/lib/routes"
import { normalizeAccountType, type AppAccountType } from "@/lib/account-types"
import {
  canAccessFeature,
  featureForPath,
  type EntitlementContext,
} from "@/constants/entitlements"

export interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const DOCS_NAV_ITEM: NavItem = {
  href: ROUTES.docs,
  label: "Docs",
  icon: Book,
}

/** Default public nav (guest / marketing). Chat is app-only after login. */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { href: ROUTES.download, label: "Desktop", icon: Download },
  DOCS_NAV_ITEM,
]

/** Docs for guests/business; creators skip Docs after sign-in (sidebar has New chat). */
export function getPublicNavItems(
  accountType: AppAccountType | null | undefined
): NavItem[] {
  const normalized = accountType ? normalizeAccountType(String(accountType)) : null
  if (normalized === "creator") return []
  return PUBLIC_NAV_ITEMS
}

export const SETTINGS_NAV_ITEM: NavItem = {
  href: ROUTES.settings,
  label: "Settings",
  icon: Settings,
}

const NAV_DASHBOARD: NavItem = { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard }

/** Hub dashboard entry (business / superuser) — `/dashboard`. */
export const CHAT_DASHBOARD_NAV_ITEM: NavItem = NAV_DASHBOARD

const NAV_PRODUCT: NavItem = { href: ROUTES.product, label: "Product", icon: Rocket }
const NAV_TASKS: NavItem = { href: ROUTES.tasks, label: "Tasks", icon: FileText }
const NAV_CREATOR_MY_TASKS: NavItem = { href: ROUTES.tasks, label: "My Tasks", icon: ListTodo }
const NAV_SUPERUSER_TASKS: NavItem = { href: ROUTES.superuserTasks, label: "Superuser Tasks", icon: Crown }
const NAV_SUPERUSER_USERS: NavItem = { href: ROUTES.superuserUsers, label: "Users", icon: UserCog }
const NAV_SUPERUSER_MONITOR: NavItem = {
  href: ROUTES.superuserMonitor,
  label: "Dashboard Monitor",
  icon: Gauge,
}
const NAV_SUPERUSER_FEEDBACK: NavItem = {
  href: ROUTES.superuserFeedback,
  label: "User feedback",
  icon: MessagesSquare,
}
const NAV_SUPERUSER_ERRORS: NavItem = {
  href: ROUTES.superuserErrors,
  label: "Reported errors",
  icon: Bug,
}
const NAV_SUPERUSER_BILLING: NavItem = {
  href: ROUTES.superuserBilling,
  label: "Billing & usage",
  icon: CreditCard,
}
const NAV_SUPERUSER_MODERATION: NavItem = {
  href: ROUTES.superuserModeration,
  label: "Chat moderation",
  icon: ShieldCheck,
}
const NAV_BILLING: NavItem = { href: ROUTES.billing, label: "Billing", icon: DollarSign }
const NAV_AGENTS: NavItem = {
  href: ROUTES.agents,
  label: "Assistants",
  icon: Bot,
}
const NAV_MEMORY: NavItem = { href: ROUTES.memory, label: "Memory", icon: Brain }
const NAV_INTEGRATIONS: NavItem = {
  href: ROUTES.integrations,
  label: "Integrations",
  icon: Plug,
}
const NAV_ANALYTICS: NavItem = { href: ROUTES.analytics, label: "Analytics", icon: BarChart3 }
const NAV_LOGS: NavItem = { href: ROUTES.logs, label: "Logs", icon: ScrollText }
const NAV_API_KEYS: NavItem = { href: ROUTES.apiKeys, label: "API Keys", icon: Key }
const NAV_TEAM: NavItem = { href: ROUTES.team, label: "Team", icon: UsersRound }
const NAV_TEAM_LOGS: NavItem = { href: ROUTES.teamLogs, label: "Team Logs", icon: Activity }
const NAV_TEAM_MANAGEMENT: NavItem = {
  href: ROUTES.teamManagement,
  label: "Team Management",
  icon: ClipboardList,
}

export interface RoleNavConfig {
  /** Always rendered as primary buttons before any section. */
  primary: NavItem[]
  /** Sidebar "Workspace" section (and legacy topnav dropdown). */
  workspace: NavItem[]
  /** Sidebar "Team" section (hub roles). */
  team: NavItem[]
  /** Sidebar "Account" section. */
  account: NavItem[]
  /** Superuser-only sidebar "Admin" section. */
  admin: NavItem[]
  /** Where to send the user on landing/redirect for this role. */
  home: string
}

export const CREATOR_NAV_CONFIG: RoleNavConfig = {
  primary: [],
  workspace: [NAV_CREATOR_MY_TASKS, NAV_AGENTS, NAV_MEMORY, NAV_INTEGRATIONS],
  team: [],
  account: [NAV_BILLING],
  admin: [],
  home: ROUTES.chat,
}

export const BUSINESS_NAV_CONFIG: RoleNavConfig = {
  primary: [],
  workspace: [
    CHAT_DASHBOARD_NAV_ITEM,
    NAV_PRODUCT,
    NAV_TASKS,
    NAV_AGENTS,
    NAV_MEMORY,
    NAV_INTEGRATIONS,
    NAV_ANALYTICS,
  ],
  team: [NAV_TEAM, NAV_TEAM_MANAGEMENT, NAV_TEAM_LOGS],
  account: [NAV_API_KEYS, NAV_BILLING, NAV_LOGS],
  admin: [],
  home: ROUTES.dashboard,
}

function dedupeByHref(items: NavItem[]): NavItem[] {
  const seen = new Set<string>()
  const out: NavItem[] = []
  for (const item of items) {
    if (seen.has(item.href)) continue
    seen.add(item.href)
    out.push(item)
  }
  return out
}

export const SUPERUSER_NAV_CONFIG: RoleNavConfig = {
  primary: [],
  workspace: dedupeByHref([
    CHAT_DASHBOARD_NAV_ITEM,
    NAV_PRODUCT,
    NAV_TASKS,
    NAV_AGENTS,
    NAV_MEMORY,
    NAV_INTEGRATIONS,
    NAV_ANALYTICS,
  ]),
  team: [NAV_TEAM, NAV_TEAM_MANAGEMENT, NAV_TEAM_LOGS],
  account: dedupeByHref([NAV_API_KEYS, NAV_BILLING, NAV_LOGS, SETTINGS_NAV_ITEM]),
  admin: [
    NAV_SUPERUSER_USERS,
    NAV_SUPERUSER_BILLING,
    NAV_SUPERUSER_MONITOR,
    NAV_SUPERUSER_FEEDBACK,
    NAV_SUPERUSER_ERRORS,
    NAV_SUPERUSER_TASKS,
    NAV_SUPERUSER_MODERATION,
  ],
  home: ROUTES.dashboard,
}

const EMPTY_NAV_CONFIG: RoleNavConfig = {
  primary: [],
  workspace: [],
  team: [],
  account: [],
  admin: [],
  home: ROUTES.home,
}

export function getNavForRole(role: AppAccountType | null | undefined): RoleNavConfig {
  const normalized = role ? normalizeAccountType(String(role)) : null
  if (normalized === "business") return BUSINESS_NAV_CONFIG
  if (normalized === "creator") return CREATOR_NAV_CONFIG
  return EMPTY_NAV_CONFIG
}

function filterNavItems(items: NavItem[], ctx?: EntitlementContext | null): NavItem[] {
  if (!ctx) return items
  return items.filter((item) => {
    const feat = featureForPath(item.href)
    if (!feat) return true
    return canAccessFeature(ctx, feat)
  })
}

function filterNavConfig(cfg: RoleNavConfig, ctx?: EntitlementContext | null): RoleNavConfig {
  if (!ctx) return cfg
  return {
    ...cfg,
    primary: filterNavItems(cfg.primary, ctx),
    workspace: filterNavItems(cfg.workspace, ctx),
    team: filterNavItems(cfg.team, ctx),
    account: filterNavItems(cfg.account, ctx),
    admin: filterNavItems(cfg.admin, ctx),
  }
}

export function getNavForContext(
  role: AppAccountType | null | undefined,
  isSuperUser = false,
  entitlements?: EntitlementContext | null
): RoleNavConfig {
  if (isSuperUser) return filterNavConfig(SUPERUSER_NAV_CONFIG, entitlements)
  return filterNavConfig(getNavForRole(role), entitlements)
}

/** Flat ordered list per role (used for sitemaps, tests, mobile rendering). */
export function getFlatNavForRole(role: AppAccountType | null | undefined): NavItem[] {
  const cfg = getNavForRole(role)
  return dedupeByHref([
    ...getPublicNavItems(role),
    ...cfg.primary,
    ...cfg.workspace,
    ...cfg.team,
    ...cfg.account,
    ...cfg.admin,
  ])
}

/** @deprecated Legacy standalone dashboard path */
export const LEGACY_DASHBOARD_NAV_ITEM = NAV_DASHBOARD
