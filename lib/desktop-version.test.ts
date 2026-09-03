import { DESKTOP_APP_VERSION } from "@/lib/desktop-app"
import {
  buildDesktopLatestManifest,
  compareDesktopVersions,
  desktopArtifactKeyFromRuntime,
  desktopVersionFromUserAgent,
  formatDesktopVersionLabel,
  isNewerDesktopVersion,
} from "./desktop-version"

describe("desktop-version", () => {
  it("compares semver newest-first", () => {
    expect(compareDesktopVersions("1.2.0", "1.1.9")).toBe(1)
    expect(compareDesktopVersions("1.0.0", "1.0.0")).toBe(0)
    expect(isNewerDesktopVersion("1.0.1", "1.0.0")).toBe(true)
    expect(isNewerDesktopVersion("1.0.0", "1.0.1")).toBe(false)
  })

  it("reads the running desktop version from the user agent", () => {
    expect(desktopVersionFromUserAgent("Mozilla/5.0 MasterNodeDesktop/1.0.0")).toBe("1.0.0")
    expect(desktopVersionFromUserAgent("Mozilla/5.0")).toBe(null)
  })

  it("picks the matching installer for the current machine", () => {
    expect(desktopArtifactKeyFromRuntime("MacIntel", "Macintosh")).toBe("mac-x64")
    expect(desktopArtifactKeyFromRuntime("MacIntel", "Macintosh; ARM64")).toBe("mac-arm64")
    expect(desktopArtifactKeyFromRuntime("Win32", "Windows NT 10.0; Win64; x64")).toBe("win-x64")
  })

  it("publishes a latest manifest for every desktop installer", () => {
    const manifest = buildDesktopLatestManifest()
    expect(manifest.version).toBe(DESKTOP_APP_VERSION)
    expect(manifest.artifacts["mac-arm64"].href).toContain(".dmg")
    expect(manifest.artifacts["win-x64"].href).toContain(".exe")
    expect(formatDesktopVersionLabel(manifest.version)).toBe(`v${DESKTOP_APP_VERSION}`)
  })
})
