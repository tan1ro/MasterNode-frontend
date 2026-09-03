/**
 * Client-side auth form validation (aligned with backend AuthLoginBody / AuthRegisterBody).
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/

export const AUTH_LIMITS = {
  emailMax: 320,
  passwordMinSignIn: 6,
  passwordMinSignUp: 8,
  passwordMax: 256,
  usernameMin: 3,
  usernameMax: 20,
  orgNameMin: 2,
  orgNameMax: 120,
  orgLogoMaxBytes: 10 * 1024 * 1024,
} as const

export type SignInFieldErrors = {
  email?: string
  password?: string
  general?: string
}

export type OrganizationSetupMode = "create" | "join"

export type SignUpFieldErrors = {
  accountType?: string
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  orgName?: string
  orgLogo?: string
  joinOrg?: string
  general?: string
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export const SIGNUP_EMAIL_EXISTS_MESSAGE =
  "An account with this email already exists. Sign in instead."

export function validateEmail(raw: string): string | undefined {
  const email = raw.trim()
  if (!email) return "Email is required."
  if (email.length > AUTH_LIMITS.emailMax) {
    return `Email must be ${AUTH_LIMITS.emailMax} characters or fewer.`
  }
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address."
  return undefined
}

export function validateSignInPassword(raw: string): string | undefined {
  if (!raw) return "Password is required."
  if (raw.length < AUTH_LIMITS.passwordMinSignIn) {
    return `Password must be at least ${AUTH_LIMITS.passwordMinSignIn} characters.`
  }
  if (raw.length > AUTH_LIMITS.passwordMax) {
    return `Password must be ${AUTH_LIMITS.passwordMax} characters or fewer.`
  }
  return undefined
}

export function validateSignUpPassword(raw: string): string | undefined {
  if (!raw) return "Password is required."
  if (raw.length < AUTH_LIMITS.passwordMinSignUp) {
    return `Password must be at least ${AUTH_LIMITS.passwordMinSignUp} characters.`
  }
  if (raw.length > AUTH_LIMITS.passwordMax) {
    return `Password must be ${AUTH_LIMITS.passwordMax} characters or fewer.`
  }
  if (!/[A-Za-z]/.test(raw)) return "Password must include at least one letter."
  if (!/\d/.test(raw)) return "Password must include at least one number."
  return undefined
}

export function validateUsername(raw: string): string | undefined {
  const username = raw.trim()
  if (!username) return "Username is required."
  if (!USERNAME_PATTERN.test(username)) {
    return `Username must be ${AUTH_LIMITS.usernameMin}–${AUTH_LIMITS.usernameMax} characters (letters, numbers, underscore only).`
  }
  return undefined
}

export function validatePasswordConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password."
  if (password !== confirm) return "Passwords do not match."
  return undefined
}

export function validateOrganizationName(raw: string): string | undefined {
  const name = raw.trim()
  if (!name) return "Organization name is required."
  if (name.length < AUTH_LIMITS.orgNameMin) {
    return `Organization name must be at least ${AUTH_LIMITS.orgNameMin} characters.`
  }
  if (name.length > AUTH_LIMITS.orgNameMax) {
    return `Organization name must be ${AUTH_LIMITS.orgNameMax} characters or fewer.`
  }
  return undefined
}

export function validateOrganizationLogoFile(file: File | undefined): string | undefined {
  if (!file) return undefined
  if (!file.type.startsWith("image/")) return "Logo must be an image file (PNG, JPG, GIF, or WebP)."
  if (file.size > AUTH_LIMITS.orgLogoMaxBytes) return "Logo must be less than 10 MB."
  return undefined
}

export function validateSignInForm(email: string, password: string): SignInFieldErrors {
  const errors: SignInFieldErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validateSignInPassword(password)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  return errors
}

export function hasFieldErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}

export function validateSignUpAccountStep(
  step: 0 | 1,
  values: { username: string; email: string; password: string; confirmPassword: string }
): SignUpFieldErrors {
  if (step === 0) {
    return {
      username: validateUsername(values.username),
      email: validateEmail(values.email),
    }
  }
  return {
    password: validateSignUpPassword(values.password),
    confirmPassword: validatePasswordConfirm(values.password, values.confirmPassword),
  }
}

export function validateSignUpBeforeSubmit(values: {
  accountType: string | null
  username: string
  email: string
  password: string
  confirmPassword: string
  orgMode: OrganizationSetupMode
  orgName: string
  selectedOrgId?: string | null
  skipOrganization?: boolean
}): SignUpFieldErrors {
  const errors: SignUpFieldErrors = {
    accountType: values.accountType ? undefined : "Please select Creator to continue.",
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    password: validateSignUpPassword(values.password),
    confirmPassword: validatePasswordConfirm(values.password, values.confirmPassword),
  }
  if (values.skipOrganization) {
    return errors
  }
  if (values.orgMode === "join") {
    if (!values.selectedOrgId?.trim()) {
      errors.joinOrg = "Select an organization from the search results."
    }
  } else {
    errors.orgName = validateOrganizationName(values.orgName)
  }
  return errors
}
