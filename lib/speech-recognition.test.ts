import { describe, expect, it } from "vitest"
import {
  requestMicrophonePermission,
  speechRecognitionErrorMessage,
} from "./speech-recognition"

describe("speechRecognitionErrorMessage", () => {
  it("returns user-facing copy for permission errors", () => {
    expect(speechRecognitionErrorMessage("not-allowed")).toMatch(/Microphone access/)
  })

  it("ignores no-speech and aborted", () => {
    expect(speechRecognitionErrorMessage("no-speech")).toBeNull()
    expect(speechRecognitionErrorMessage("aborted")).toBeNull()
  })
})

describe("requestMicrophonePermission", () => {
  it("returns unsupported when getUserMedia is missing", async () => {
    const original = navigator.mediaDevices
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    })
    const result = await requestMicrophonePermission()
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: original,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.state).toBe("unsupported")
    }
  })
})
