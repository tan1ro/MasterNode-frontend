import { describe, expect, it } from "vitest"
import { clampSidePanelWidth } from "@/hooks/use-resizable-side-panel"

describe("clampSidePanelWidth", () => {
  it("caps the HTML viewer at half the viewport", () => {
    expect(
      clampSidePanelWidth(2000, {
        minWidth: 320,
        minCompanionWidth: 360,
        viewportWidth: 1440,
        maxViewportRatio: 0.5,
      })
    ).toBe(720)
  })

  it("still leaves room for the chat column on smaller screens", () => {
    expect(
      clampSidePanelWidth(900, {
        minWidth: 320,
        minCompanionWidth: 360,
        viewportWidth: 1024,
        maxViewportRatio: 0.5,
      })
    ).toBe(512)
  })

  it("does not shrink below minWidth", () => {
    expect(
      clampSidePanelWidth(100, {
        minWidth: 320,
        minCompanionWidth: 360,
        viewportWidth: 800,
        maxViewportRatio: 0.5,
      })
    ).toBe(320)
  })
})
