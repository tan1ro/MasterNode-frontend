import { beforeEach, describe, expect, it } from "vitest"
import {
  clearPipelineNotifyOptIn,
  dismissPipelineNotifyPrompt,
  isPipelineNotifyOptedIn,
  optInPipelineNotify,
  readPipelineNotifyOptIns,
  shouldShowPipelineNotifyPrompt,
} from "./pipeline-notify-registry"

describe("pipeline-notify-registry", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("opts in and stops showing the prompt", () => {
    optInPipelineNotify("task_1", "chat_1")
    expect(isPipelineNotifyOptedIn("task_1")).toBe(true)
    expect(shouldShowPipelineNotifyPrompt("task_1")).toBe(false)
    expect(readPipelineNotifyOptIns()).toHaveLength(1)
  })

  it("dismisses without opting in", () => {
    dismissPipelineNotifyPrompt("task_2")
    expect(isPipelineNotifyOptedIn("task_2")).toBe(false)
    expect(shouldShowPipelineNotifyPrompt("task_2")).toBe(false)
  })

  it("clears opt-in after notification", () => {
    optInPipelineNotify("task_3", "chat_3")
    clearPipelineNotifyOptIn("task_3")
    expect(readPipelineNotifyOptIns()).toHaveLength(0)
  })
})
