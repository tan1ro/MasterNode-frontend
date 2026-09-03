import { describe, expect, it } from "vitest"
import { inferPlanOptionVisualKind } from "@/components/chat/pipeline-plan-option-visual"

describe("inferPlanOptionVisualKind", () => {
  it("maps common frontend frameworks from id or label", () => {
    expect(inferPlanOptionVisualKind("react", "React.js")).toBe("react")
    expect(inferPlanOptionVisualKind("vue", "Vue.js")).toBe("vue")
    expect(inferPlanOptionVisualKind("svelte", "Svelte")).toBe("svelte")
    expect(
      inferPlanOptionVisualKind("vanilla", "Vanilla HTML/CSS/JS (no framework)")
    ).toBe("vanilla")
  })

  it("falls back to letter for short plan option ids", () => {
    expect(inferPlanOptionVisualKind("a", "Standard depth (12–15 slides)")).toBe("letter")
    expect(inferPlanOptionVisualKind("b", "Extended deck (20–25 slides)")).toBe("letter")
  })
})
