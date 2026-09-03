import { describe, expect, it } from "vitest"
import {
  DESKTOP_APP_FILENAME,
  DESKTOP_APP_HREF,
  DESKTOP_APP_VERSION,
  desktopArtifactHref,
  desktopArtifactName,
  desktopButtonsForPlatform,
  desktopCliCommands,
  desktopPlatformById,
  detectDesktopPlatform,
  primaryDesktopDownload,
} from "./desktop-app"

describe("desktop-app", () => {
  it("keeps the source zip as a fallback package", () => {
    expect(DESKTOP_APP_VERSION).toBe("1.0.0")
    expect(DESKTOP_APP_FILENAME).toBe("MasterNode-Desktop-1.0.0.zip")
    expect(DESKTOP_APP_HREF).toBe("/downloads/MasterNode-Desktop-1.0.0.zip")
  })

  it("serves macOS as .dmg and Windows as .exe", () => {
    expect(desktopArtifactName("macos", "arm64", "dmg")).toBe(
      "MasterNode-Desktop-1.0.0-mac-arm64.dmg"
    )
    expect(desktopArtifactHref("windows", "x64", "exe")).toBe(
      "/downloads/MasterNode-Desktop-1.0.0-win-x64.exe"
    )
    expect(desktopButtonsForPlatform("macos").buttons[0].format).toBe("dmg")
    expect(desktopButtonsForPlatform("windows").buttons[0].format).toBe("exe")
    expect(primaryDesktopDownload("macos").label).toContain("Apple Silicon")
    expect(primaryDesktopDownload("windows").label).toContain("x64")
  })

  it("detects Windows, Linux, and defaults to macOS", () => {
    expect(detectDesktopPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows")
    expect(detectDesktopPlatform("Mozilla/5.0 (X11; Linux x86_64)")).toBe("linux")
    expect(detectDesktopPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("macos")
    expect(desktopPlatformById("windows").cta).toBe("Download for Windows (.exe)")
    expect(desktopPlatformById("macos").cta).toBe("Download for macOS (.dmg)")
  })

  it("builds platform CLI install commands from the site origin", () => {
    expect(desktopCliCommands("macos", "https://masternode.in")[0].command).toBe(
      "curl -fsSL https://masternode.in/cli/install.sh | bash"
    )
    expect(desktopCliCommands("windows", "http://localhost:3002")[0].command).toBe(
      "irm http://localhost:3002/cli/install.ps1 | iex"
    )
  })
})
