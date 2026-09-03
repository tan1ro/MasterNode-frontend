import { describe, expect, it } from "vitest"
import {
  extractHtmlWriteupFromTaskResult,
  isHtmlWriteupFragment,
  resolveHtmlWriteupForMessage,
  wrapHtmlWriteupDocument,
} from "./html-writeup"

const SAMPLE = `<style>.doc{max-width:680px;padding:1rem}</style><div class="doc"><h1>PIE Write-up</h1><p>Parallel Intelligence Engine research project write-up with architecture and results sections for preview testing.</p></div>`

describe("html-writeup", () => {
  it("detects styled html fragments", () => {
    expect(isHtmlWriteupFragment(SAMPLE)).toBe(true)
    expect(isHtmlWriteupFragment("# Not html")).toBe(false)
  })

  it("wraps fragment in a full html document", () => {
    const doc = wrapHtmlWriteupDocument(SAMPLE)
    expect(doc).toContain("<!DOCTYPE html>")
    expect(doc).toContain("<h1>PIE Write-up</h1>")
  })

  it("extracts html write-up from task result metadata", () => {
    const fields = extractHtmlWriteupFromTaskResult({
      html_writeup: SAMPLE,
      html_writeup_title: "PIE Write-up",
    })
    expect(fields?.title).toBe("PIE Write-up")
    expect(fields?.html).toContain("PIE Write-up")
  })

  it("resolves html write-up from message metadata", () => {
    const fields = resolveHtmlWriteupForMessage({
      html_writeup: SAMPLE,
      html_writeup_title: "Research Write-up",
    })
    expect(fields?.title).toBe("Research Write-up")
  })
})
