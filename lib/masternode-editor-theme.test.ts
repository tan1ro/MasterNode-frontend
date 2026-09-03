import { describe, expect, it } from "vitest"
import {
  MASTERNODE_EDITOR_DARK,
  MASTERNODE_SHIKI_THEME_DARK,
  MASTERNODE_SHIKI_THEME_LIGHT,
  SHIKI_THEME_DARK,
  SHIKI_THEME_LIGHT,
  codeBlockCssVars,
  masternodeEditorTokens,
  codeViewerColorScheme,
} from "@/lib/masternode-editor-theme"

describe("MasterNode editor theme", () => {
  it("exposes named Shiki themes", () => {
    expect(MASTERNODE_SHIKI_THEME_DARK.name).toBe(SHIKI_THEME_DARK)
    expect(MASTERNODE_SHIKI_THEME_LIGHT.name).toBe(SHIKI_THEME_LIGHT)
    expect(MASTERNODE_SHIKI_THEME_DARK.displayName).toBe("MasterNode Dark Code")
  })

  it("elevates the editor above the MasterNode canvas without using a generic gray IDE", () => {
    expect(MASTERNODE_EDITOR_DARK.appBackground).toBe("#020509")
    expect(MASTERNODE_EDITOR_DARK.editorBackground).toBe("#0B0D12")
    expect(MASTERNODE_EDITOR_DARK.editorHeader).toBe("#11141A")
    expect(MASTERNODE_EDITOR_DARK.border).toBe("#1B202A")
    expect(MASTERNODE_EDITOR_DARK.editorForeground).toBe("#E6E8ED")
    expect(MASTERNODE_EDITOR_DARK.editorBackground).not.toBe("#1E1E1E")
    expect(MASTERNODE_EDITOR_DARK.editorBackground).not.toBe("#202020")
  })

  it("maps chrome tokens onto CSS variables", () => {
    const vars = codeBlockCssVars("dark")
    expect(vars["--code-block-bg"]).toBe("#0B0D12")
    expect(vars["--code-block-header-bg"]).toBe("#11141A")
    expect(vars["--code-block-title"]).toBe("#E6E8ED")
    expect(vars["--code-block-line-number"]).toBe("#4A5360")
    expect(masternodeEditorTokens("light").tag).toBe("#C2410C")
  })

  it("keeps the code viewer dark on the MasterNode canvas", () => {
    expect(codeViewerColorScheme({ documentHasDarkClass: true, resolvedTheme: "light" })).toBe("dark")
    expect(codeViewerColorScheme({ documentHasDarkClass: false, resolvedTheme: undefined })).toBe("dark")
    expect(codeViewerColorScheme({ documentHasDarkClass: false, resolvedTheme: "light" })).toBe("light")
  })

  it("defines distinct syntax token colors", () => {
    const t = MASTERNODE_EDITOR_DARK
    const unique = new Set([
      t.tag,
      t.string,
      t.keyword,
      t.function,
      t.selector,
      t.comment,
      t.punctuation,
    ])
    expect(unique.size).toBe(7)
  })
})
