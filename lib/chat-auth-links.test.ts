import { describe, expect, it } from "vitest"
import { chatSignInHref, chatSignUpHref } from "@/lib/chat-auth-links"

describe("chat-auth-links", () => {
  it("builds sign-in and sign-up hrefs with redirect back to chat", () => {
    expect(chatSignInHref("/chat")).toBe("/sign-in?redirect_url=%2Fchat")
    expect(chatSignUpHref("/chat/conv_1")).toBe("/sign-up?redirect_url=%2Fchat%2Fconv_1")
  })

  it("falls back to draft chat when pathname is missing", () => {
    expect(chatSignInHref(null)).toBe("/sign-in?redirect_url=%2Fchat")
  })
})
