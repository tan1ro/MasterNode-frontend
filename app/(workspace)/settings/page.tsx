import { redirect } from "next/navigation"
import { settingsPanelHref } from "@/lib/settings-panel-routes"

/** Standalone settings page removed — opens in-app settings panel on workspace routes. */
export default function SettingsPage({
  searchParams,
}: {
  searchParams?: { section?: string }
}) {
  redirect(settingsPanelHref(searchParams?.section))
}
