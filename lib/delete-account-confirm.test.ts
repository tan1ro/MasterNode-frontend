import { describe, expect, it } from "vitest"
import {
  DELETE_ACCOUNT_CONFIRM_WORD,
  emailsMatchForDelete,
  isDeleteAccountUnlocked,
} from "@/lib/delete-account-confirm"

describe("delete account confirmation", () => {
  it("matches email case-insensitively after trim", () => {
    expect(emailsMatchForDelete("Ada@Example.com", "  ada@example.com  ")).toBe(true)
    expect(emailsMatchForDelete("ada@example.com", "other@example.com")).toBe(false)
    expect(emailsMatchForDelete("  ", "ada@example.com")).toBe(false)
  })

  it("stays locked until email and DELETE both match", () => {
    expect(
      isDeleteAccountUnlocked({
        accountEmail: "ada@example.com",
        typedEmail: "ada@example.com",
        typedConfirm: "",
      })
    ).toBe(false)
    expect(
      isDeleteAccountUnlocked({
        accountEmail: "ada@example.com",
        typedEmail: "",
        typedConfirm: DELETE_ACCOUNT_CONFIRM_WORD,
      })
    ).toBe(false)
    expect(
      isDeleteAccountUnlocked({
        accountEmail: "ada@example.com",
        typedEmail: "ada@example.com",
        typedConfirm: "delete",
      })
    ).toBe(false)
    expect(
      isDeleteAccountUnlocked({
        accountEmail: "ada@example.com",
        typedEmail: "ada@example.com",
        typedConfirm: DELETE_ACCOUNT_CONFIRM_WORD,
      })
    ).toBe(true)
  })
})
