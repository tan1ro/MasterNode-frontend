import { describe, expect, it } from "vitest"
import {
  validateEmail,
  validateOrganizationName,
  validatePasswordConfirm,
  validateSignInForm,
  validateSignUpAccountStep,
  validateSignUpBeforeSubmit,
  validateSignUpPassword,
  validateUsername,
} from "./auth-validation"

describe("validateEmail", () => {
  it("rejects empty and invalid", () => {
    expect(validateEmail("")).toBeTruthy()
    expect(validateEmail("not-an-email")).toBeTruthy()
    expect(validateEmail("a@b")).toBeTruthy()
  })

  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBeUndefined()
  })
})

describe("validateSignUpPassword", () => {
  it("requires letter and number", () => {
    expect(validateSignUpPassword("abcdefgh")).toBeTruthy()
    expect(validateSignUpPassword("12345678")).toBeTruthy()
    expect(validateSignUpPassword("pass1234")).toBeUndefined()
  })
})

describe("validateUsername", () => {
  it("enforces pattern", () => {
    expect(validateUsername("ab")).toBeTruthy()
    expect(validateUsername("valid_user1")).toBeUndefined()
  })
})

describe("validateSignInForm", () => {
  it("returns both errors when empty", () => {
    const err = validateSignInForm("", "")
    expect(err.email).toBeTruthy()
    expect(err.password).toBeTruthy()
  })
})

describe("validateSignUpAccountStep", () => {
  it("validates step 0 fields", () => {
    const err = validateSignUpAccountStep(0, {
      username: "",
      email: "bad",
      password: "",
      confirmPassword: "",
    })
    expect(err.username).toBeTruthy()
    expect(err.email).toBeTruthy()
  })

  it("validates step 1 passwords", () => {
    const err = validateSignUpAccountStep(1, {
      username: "user1",
      email: "u@example.com",
      password: "short",
      confirmPassword: "nope",
    })
    expect(err.password).toBeTruthy()
    expect(err.confirmPassword).toBeTruthy()
  })
})

describe("validatePasswordConfirm", () => {
  it("requires match", () => {
    expect(validatePasswordConfirm("pass1234", "pass1234")).toBeUndefined()
    expect(validatePasswordConfirm("pass1234", "other")).toBeTruthy()
  })
})

describe("validateOrganizationName", () => {
  it("requires minimum length", () => {
    expect(validateOrganizationName("A")).toBeTruthy()
    expect(validateOrganizationName("Acme Labs")).toBeUndefined()
  })
})

describe("validateSignUpBeforeSubmit org modes", () => {
  it("requires selected org when joining", () => {
    const err = validateSignUpBeforeSubmit({
      accountType: "creator",
      username: "valid_user",
      email: "u@example.com",
      password: "pass1234",
      confirmPassword: "pass1234",
      orgMode: "join",
      orgName: "",
      selectedOrgId: null,
    })
    expect(err.joinOrg).toBeTruthy()
  })

  it("requires org name when creating", () => {
    const err = validateSignUpBeforeSubmit({
      accountType: "creator",
      username: "valid_user",
      email: "u@example.com",
      password: "pass1234",
      confirmPassword: "pass1234",
      orgMode: "create",
      orgName: "",
      selectedOrgId: null,
    })
    expect(err.orgName).toBeTruthy()
  })
})
