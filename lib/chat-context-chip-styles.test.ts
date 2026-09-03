import { describe, expect, it } from "vitest"
import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import {
  assistantContextChipStyle,
  memoryContextChipStyle,
  resolveMemoryChipExt,
} from "@/lib/chat-context-chip-styles"
import type { RagFile } from "@/types/api"

const baseCtx = (): ChatContextSelection => ({
  useMemory: false,
  memorySources: [],
  templateIds: {},
})

const files: RagFile[] = [
  { file_id: "1", filename: "report.pdf", enabled: true },
  { file_id: "2", filename: "notes.md", enabled: true },
]

describe("resolveMemoryChipExt", () => {
  it("returns null when memory is off", () => {
    expect(resolveMemoryChipExt(baseCtx(), files)).toBeNull()
  })

  it("returns ext for a single selected file", () => {
    const ctx: ChatContextSelection = {
      ...baseCtx(),
      useMemory: true,
      memorySources: ["report.pdf"],
    }
    expect(resolveMemoryChipExt(ctx, files)).toBe("pdf")
  })

  it("returns null for multiple selected files", () => {
    const ctx: ChatContextSelection = {
      ...baseCtx(),
      useMemory: true,
      memorySources: ["report.pdf", "notes.md"],
    }
    expect(resolveMemoryChipExt(ctx, files)).toBeNull()
  })
})

describe("memoryContextChipStyle", () => {
  it("uses file-type colors for a known extension", () => {
    const style = memoryContextChipStyle("pdf")
    expect(style.chipClass).toContain("#DC2626")
    expect(style.chipClass).toContain("bg-background/45")
    expect(style.iconClass).toContain("#DC2626")
  })

  it("uses cyan brain styling when ext is null", () => {
    const style = memoryContextChipStyle(null)
    expect(style.chipClass).toContain("border-cyan")
    expect(style.iconClass).toContain("cyan")
  })

  it("uses domain accent borders for research and summarizer assistants", () => {
    const research = assistantContextChipStyle("sample-custom-research", "Research")
    const summarizer = assistantContextChipStyle("sample-custom-summarizer", "Summaries")
    expect(research.chipClass).toContain("border-violet")
    expect(research.iconClass).toContain("text-violet")
    expect(summarizer.chipClass).toContain("border-sky")
    expect(summarizer.iconClass).toContain("text-sky")
  })
})
