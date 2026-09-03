"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel"
import { ClearStaleServerSession } from "@/components/auth/clear-stale-server-session"
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"
import { ROUTES } from "@/lib/routes"
import { normalizeEmail, validateEmail } from "@/lib/auth-validation"
import { cn } from "@/lib/utils"

type ForgotPasswordFieldErrors = {
  email?: string
  general?: string
}

function ForgotPasswordPageContent() {
  const [email, setEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const runSubmit = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      setFieldErrors({ email: emailError })
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmail(email) }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string }
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Unable to send reset instructions.")
      }
      setSubmitted(true)
    } catch (err) {
      setFieldErrors({
        general: err instanceof Error ? err.message : "Unable to send reset instructions.",
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
            <p className="text-sm font-medium text-[#B0F900] lg:hidden">Forgot password</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
              Reset password
            </h1>
            <p className="text-sm leading-relaxed text-[#8B92A9] sm:text-base">
              We&apos;ll email you a link to set a new password. The link expires in 10 minutes.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="auth-forgot-success" role="status">
                If an account exists for <strong className="text-[#F0F2F8]">{email.trim()}</strong>,
                you&apos;ll receive a reset link shortly. The link is valid for 10 minutes — check
                your inbox and spam folder.
              </div>
              <Link
                href={ROUTES.signIn}
                className="auth-submit inline-flex w-full items-center justify-center gap-2"
              >
                Return to sign in
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
                <Label htmlFor="forgot-email" className="auth-field-label">
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next.email
                      delete next.general
                      return next
                    })
                  }}
                  onBlur={() => {
                    const msg = validateEmail(email)
                    if (msg) setFieldErrors((prev) => ({ ...prev, email: msg }))
                  }}
                  placeholder="you@company.com"
                  className={cn(
                    "auth-field-input sm:h-12",
                    inputErrorClass(Boolean(fieldErrors.email))
                  )}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "forgot-email-error" : undefined}
                />
                <FieldError id="forgot-email-error" message={fieldErrors.email} />
              </div>

              <FieldError
                message={fieldErrors.general}
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
              />

              <Button
                type="submit"
                className="auth-submit w-full sm:h-12"
                disabled={submitting}
              >
                <Mail className="mr-2 h-4 w-4" aria-hidden />
                {submitting ? "Sending…" : "Send reset link"}
              </Button>

              <p className="pt-1 text-center text-sm text-[#8B92A9]">
                Remember your password?{" "}
                <Link href={ROUTES.signIn} className="auth-link">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthPageShell>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ForgotPasswordPageContent />
    </Suspense>
  )
}
