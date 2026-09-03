import { ROUTES } from "@/lib/routes"

/** Deep-link into the in-app settings panel (workspace shell). */
export function settingsPanelHref(section?: string): string {
  const params = new URLSearchParams({ settings: "1" })
  if (section?.trim()) params.set("section", section.trim())
  return `${ROUTES.chat}?${params.toString()}`
}

export function parseSettingsPanelParams(searchParams: URLSearchParams | null): {
  open: boolean
  section: string | null
} {
  if (!searchParams) return { open: false, section: null }
  const raw = searchParams.get("settings")
  const open = raw === "1" || raw === "open" || raw === "true"
  const section = searchParams.get("section")?.trim() || null
  return { open, section }
}
