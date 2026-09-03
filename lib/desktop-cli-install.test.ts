import { describe, expect, it } from "vitest"
import { desktopInstallCmd, desktopInstallPs1, desktopInstallSh } from "./desktop-cli-install"

describe("desktop-cli-install", () => {
  it("embeds the origin and native installer names", () => {
    const sh = desktopInstallSh("http://localhost:3002")
    expect(sh).toContain("ORIGIN=\"http://localhost:3002\"")
    expect(sh).toContain("mac-${CPU}.dmg")
    expect(sh).toContain("linux-${CPU}.zip")

    const ps1 = desktopInstallPs1("https://masternode.in")
    expect(ps1).toContain("MasterNode-Desktop-$Version-win-$Arch.exe")
    expect(ps1).toContain("https://masternode.in")

    const cmd = desktopInstallCmd("https://masternode.in")
    expect(cmd).toContain("win-%ARCH%.exe")
  })
})
