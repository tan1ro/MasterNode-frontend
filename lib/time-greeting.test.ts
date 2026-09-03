import { describe, expect, it } from "vitest"
import {
  buildChatLandingGreeting,
  buildTimeGreeting,
  buildTimeGreetingParts,
  greetingFirstName,
  getDayPart,
  resolveGreetingUsername,
} from "./time-greeting"

describe("getDayPart", () => {
  it("returns morning between 5 and 11", () => {
    expect(getDayPart(5)).toBe("morning")
    expect(getDayPart(11)).toBe("morning")
  })

  it("returns afternoon between 12 and 16", () => {
    expect(getDayPart(12)).toBe("afternoon")
    expect(getDayPart(16)).toBe("afternoon")
  })

  it("returns evening otherwise", () => {
    expect(getDayPart(17)).toBe("evening")
    expect(getDayPart(4)).toBe("evening")
  })
})

describe("buildTimeGreetingParts", () => {
  it("splits prefix and name", () => {
    const at9am = new Date(2026, 5, 4, 9, 0, 0)
    expect(buildTimeGreetingParts("Alex", at9am)).toEqual({
      prefix: "Good morning",
      name: "Alex",
    })
  })

  it("returns null name when empty", () => {
    const at2pm = new Date(2026, 5, 4, 14, 0, 0)
    expect(buildTimeGreetingParts("", at2pm)).toEqual({
      prefix: "Good afternoon",
      name: null,
    })
  })
})

describe("buildTimeGreeting", () => {
  it("includes username when provided", () => {
    const at9am = new Date(2026, 5, 4, 9, 0, 0)
    expect(buildTimeGreeting("Alex", at9am)).toBe("Good morning, Alex")
  })

  it("omits name when username is empty", () => {
    const at2pm = new Date(2026, 5, 4, 14, 0, 0)
    expect(buildTimeGreeting("", at2pm)).toBe("Good afternoon")
  })

  it("uses evening in the evening", () => {
    const at8pm = new Date(2026, 5, 4, 20, 0, 0)
    expect(buildTimeGreeting("Sam", at8pm)).toBe("Good evening, Sam")
  })
})

describe("buildChatLandingGreeting", () => {
  it("uses a short day-part with name", () => {
    const at8pm = new Date(2026, 5, 4, 20, 0, 0)
    expect(buildChatLandingGreeting("Sam", at8pm)).toEqual({
      part: "Evening",
      name: "Sam",
    })
  })

  it("returns part only when name is missing", () => {
    const at9am = new Date(2026, 5, 4, 9, 0, 0)
    expect(buildChatLandingGreeting("", at9am)).toEqual({
      part: "Morning",
      name: null,
    })
  })
})

describe("resolveGreetingUsername", () => {
  it("prefers username over email local part", () => {
    expect(resolveGreetingUsername("taniro", "taniro@example.com")).toBe("taniro")
  })

  it("falls back to email local part", () => {
    expect(resolveGreetingUsername(null, "alex@example.com")).toBe("alex")
  })
})

describe("greetingFirstName", () => {
  it("uses the first token of a display name", () => {
    expect(greetingFirstName("Nandeesh Kantli", "n@example.com")).toBe("Nandeesh")
  })

  it("splits email-style usernames", () => {
    expect(greetingFirstName("taniro.dev", null)).toBe("taniro")
  })
})
