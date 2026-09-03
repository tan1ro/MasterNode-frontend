import { describe, expect, it } from "vitest"
import { mergeEncodedTemplateIds } from "@/lib/pipeline-run-context"

describe("mergeEncodedTemplateIds", () => {
  it("prefers chat context templates over settings defaults per stage", () => {
    const merged = mergeEncodedTemplateIds(
      { parallel: "chat-template" },
      { parallel: "settings-template", master: "master-template" }
    )
    expect(merged).toEqual({
      parallel: "chat-template",
      master: "master-template",
    })
  })

  it("returns undefined when both sides are empty", () => {
    expect(mergeEncodedTemplateIds(undefined, {})).toBeUndefined()
  })
})
