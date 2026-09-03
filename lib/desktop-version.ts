import {
  DESKTOP_APP_VERSION,
  desktopArtifactHref,
  desktopArtifactName,
  type DesktopArchId,
  type DesktopPackageFormat,
  type DesktopPlatformId,
} from "@/lib/desktop-app"
import { DESKTOP_UA_TOKEN } from "@/lib/desktop-runtime"

export type DesktopArtifactKey =
  | "mac-arm64"
  | "mac-x64"
  | "win-arm64"
  | "win-x64"
  | "linux-arm64"
  | "linux-x64"

export type DesktopLatestArtifact = {
  key: DesktopArtifactKey
  filename: string
  href: string
  format: DesktopPackageFormat
}

export type DesktopLatestManifest = {
  name: "MasterNode Desktop"
  version: string
  artifacts: Record<DesktopArtifactKey, DesktopLatestArtifact>
}

export type DesktopUpdateStatus =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "ready"
  | "error"

export type DesktopUpdateState = {
  currentVersion: string
  latestVersion: string | null
  status: DesktopUpdateStatus
  progress: number
  error?: string | null
  packaged?: boolean
}

const ARTIFACTS: ReadonlyArray<{
  key: DesktopArtifactKey
  platform: DesktopPlatformId
  arch: DesktopArchId
  format: DesktopPackageFormat
}> = [
  { key: "mac-arm64", platform: "macos", arch: "arm64", format: "dmg" },
  { key: "mac-x64", platform: "macos", arch: "x64", format: "dmg" },
  { key: "win-x64", platform: "windows", arch: "x64", format: "exe" },
  { key: "win-arm64", platform: "windows", arch: "arm64", format: "exe" },
  { key: "linux-x64", platform: "linux", arch: "x64", format: "zip" },
  { key: "linux-arm64", platform: "linux", arch: "arm64", format: "zip" },
]

export function parseSemver(version: string): [number, number, number] {
  const [major, minor, patch] = String(version)
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part.replace(/[^\d].*$/, ""), 10) || 0)
  return [major || 0, minor || 0, patch || 0]
}

/** Newest-first: 1 if a > b, -1 if a < b, 0 if equal. */
export function compareDesktopVersions(a: string, b: string): number {
  const left = parseSemver(a)
  const right = parseSemver(b)
  for (let i = 0; i < 3; i += 1) {
    if (left[i] > right[i]) return 1
    if (left[i] < right[i]) return -1
  }
  return 0
}

export function isNewerDesktopVersion(latest: string, current: string): boolean {
  return compareDesktopVersions(latest, current) > 0
}

export function desktopVersionFromUserAgent(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): string | null {
  const match = userAgent.match(new RegExp(`${DESKTOP_UA_TOKEN}/(\\d+\\.\\d+\\.\\d+)`))
  return match?.[1] ?? null
}

export function desktopArtifactKeyFromRuntime(
  platform = typeof navigator === "undefined" ? "" : navigator.platform,
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): DesktopArtifactKey {
  const ua = `${platform} ${userAgent}`
  const arch: DesktopArchId = /aarch64|arm64/i.test(ua) ? "arm64" : "x64"
  if (/Win/i.test(ua)) return arch === "arm64" ? "win-arm64" : "win-x64"
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
    return arch === "arm64" ? "linux-arm64" : "linux-x64"
  }
  return arch === "arm64" ? "mac-arm64" : "mac-x64"
}

export function buildDesktopLatestManifest(
  version = DESKTOP_APP_VERSION
): DesktopLatestManifest {
  const artifacts = {} as Record<DesktopArtifactKey, DesktopLatestArtifact>
  for (const item of ARTIFACTS) {
    artifacts[item.key] = {
      key: item.key,
      format: item.format,
      filename: desktopArtifactName(item.platform, item.arch, item.format, version),
      href: desktopArtifactHref(item.platform, item.arch, item.format),
    }
  }
  return {
    name: "MasterNode Desktop",
    version,
    artifacts,
  }
}

export function formatDesktopVersionLabel(version: string | null | undefined): string {
  const value = String(version || "").trim().replace(/^v/i, "")
  return value ? `v${value}` : "v0.0.0"
}
