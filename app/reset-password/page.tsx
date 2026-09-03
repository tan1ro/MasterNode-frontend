"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel"
import { ClearStaleServerSession } from "@/components/auth/clear-stale-server-session"
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"
import { ROUTES } from "@/lib/routes"
import {
  hasFieldErrors,
  validatePasswordConfirm,
  validateSignUpPassword,
} from "@/lib/auth-validation"
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/password-reset"
import { cn } from "@/lib/utils"

type ResetPasswordFieldErrors = {
  password?: string
  confirmPassword?: string
  general?: string
}

function ResetPasswordPageContent() {
  const searchParams = useSearchParams()
  const token = (searchParams.get("token") || "").trim()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const runSubmit = async () => {
    const errors: ResetPasswordFieldErrors = {
      password: validateSignUpPassword(password),
      confirmPassword: validatePasswordConfirm(password, confirmPassword),
    }
    if (!token) {
      errors.general = "This reset link is missing a token. Request a new one from forgot password."
    }
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string }
      if (!res.ok) {
        throw new Error(
          data.error || data.detail || "Could not reset password. The link may have expired."
        )
      }
      setDone(true)
    } catch (err) {
      setFieldErrors({
        general: err instanceof Error ? err.message : "Unable to reset password.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell navLink={{ href: ROUTES.signIn, label: "Back to sign in", variant: "outline" }}>
      <ClearStaleServerSession />
      <RedirectIfSignedIn />

      <div className="auth-page-content mx-auto grid w-full grid-cols-1 items-center justify-items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-14">
        <ForgotPasswordPanel />

        <div className="auth-form-card w-full max-w-[440px] space-y-5 sm:space-y-7">
          <div className="space-y-1.5 text-center sm:space-y-2 lg:text-left">
            <p className="text-sm font-medium text-[#B0F900] lg:hidden">Reset password</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
              Choose a new password
            </h1>
            <p className="text-sm leading-relaxed text-[#8B92A9] sm:text-base">
              Enter a new password below. Reset links are valid for {PASSWORD_RESET_TTL_MINUTES}{" "}
              minutes.
            </p>
          </div>

          {!token ? (
            <div className="space-y-6">
              <div className="auth-forgot-success" role="alert">
                This reset link is invalid or incomplete. Request a new link from the forgot
                password page.
              </div>
              <Link
                href={ROUTES.forgotPassword}
                className="auth-submit inline-flex w-full items-center justify-center gap-2"
              >
                Request a new link
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : done ? (
            <div className="space-y-6">
              <div className="auth-forgot-success" role="status">
                Your password has been updated. You can sign in with your new password.
              </div>
              <Link
                href={ROUTES.signIn}
                className="auth-submit inline-flex w-full items-center justify-center gap-2"
              >
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <form
              className="space-y-5"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                void runSubmit()
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="reset-password" className="auth-field-label">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors((prev) => {
                        const next = { ...prev }
                        delete next.password
                        delete next.general
                        return next
                      })
                    }}
                    onBlur={() => {
                      const msg = validateSignUpPassword(password)
                      if (msg) setFieldErrors((prev) => ({ ...prev, password: msg }))
                    }}
                    placeholder="At least 8 characters"
                    className={cn(
                      "auth-field-input pr-12 sm:h-12",
                      inputErrorClass(Boolean(fieldErrors.password))
                    )}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B92A9] hover:text-[#F0F2F8]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
                <FieldError id="reset-password-error" message={fieldErrors.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm" className="auth-field-label">
                  Confirm password
                </Label>
                <Input
                  id="reset-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next.confirmPassword
                      delete next.general
                      return next
                    })
                  }}
                  onBlur={() => {
                    const msg = validatePasswordConfirm(password, confirmPassword)
                    if (msg) setFieldErrors((prev) => ({ ...prev, confirmPassword: msg }))
                  }}
                  placeholder="Re-enter your password"
                  className={cn(
                    "auth-field-input sm:h-12",
                    inputErrorClass(Boolean(fieldErrors.confirmPassword))
                  )}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword ? "reset-confirm-error" : undefined
                  }
                />
                <FieldError id="reset-confirm-error" message={fieldErrors.confirmPassword} />
              </div>

              <FieldError
                message={fieldErrors.general}
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
              />

              <Button type="submit" className="auth-submit w-full sm:h-12" disabled={submitting}>
                <KeyRound className="mr-2 h-4 w-4" aria-hidden />
                {submitting ? "Updating…" : "Update password"}
              </Button>

              <p className="pt-1 text-center text-sm text-[#8B92A9]">
                Link expired?{" "}
                <Link href={ROUTES.forgotPassword} className="auth-link">
                  Request a new one
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthPageShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
