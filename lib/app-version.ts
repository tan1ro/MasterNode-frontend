import { CHANGELOG_VERSIONS } from "@/content/help/changelog"

/** Current product semver — always the newest entry in the in-app changelog. */
export const APP_VERSION = CHANGELOG_VERSIONS[0]?.version ?? "0.0.0"

export const APP_VERSION_LABEL = `v${APP_VERSION}`

export function formatAppVersion(prefix: "Version" | "v" | "none" = "Version"): string {
  if (prefix === "none") return APP_VERSION
  if (prefix === "v") return APP_VERSION_LABEL
  return `Version ${APP_VERSION}`
}
