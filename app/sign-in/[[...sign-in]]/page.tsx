"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { ClearStaleServerSession } from "@/components/auth/clear-stale-server-session"
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons"
import { BRANDING } from "@/constants/branding"
import { PI_MARK } from "@/constants/branding-assets"
import { ROUTES } from "@/lib/routes"
import { isSuperUser, refreshAuthCookies, signIn } from "@/lib/app-auth"
import {
  hasFieldErrors,
  normalizeEmail,
  validateEmail,
  validateSignInForm,
  validateSignInPassword,
  type SignInFieldErrors,
} from "@/lib/auth-validation"
import { syncAuthProfileFromApi } from "@/lib/sync-auth-profile"
import { resolvePostAuthDestination } from "@/lib/post-auth-redirect"
import { redirectIfServerError } from "@/lib/redirect-server-error"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { cn } from "@/lib/utils"

function SignInPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const oauthError = searchParams.get("oauth_error")

  const clearField = (key: keyof SignInFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      delete next.general
      return next
    })
  }

  const runSignIn = async () => {
    const errors = validateSignInForm(email, password)
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      const user = await signIn(normalizeEmail(email), password)
      await syncAuthProfileFromApi()
      const role = parseRole(user.accountType) ?? "creator"
      const defaultHome = isSuperUser(user) ? ROLE_HOME.business : ROLE_HOME[role]
      const destination = await resolvePostAuthDestination(
        user.id,
        defaultHome,
        searchParams.get("redirect_url")
      )
      refreshAuthCookies()
      router.replace(destination)
    } catch (err) {
      if (redirectIfServerError(router, err, pathname)) return
      setFieldErrors({
        general: err instanceof Error ? err.message : "Unable to sign in.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell navLink={{ href: ROUTES.signUp, label: "Create account", variant: "outline" }}>
      <ClearStaleServerSession />
      <RedirectIfSignedIn />

      <div className="auth-page-content mx-auto flex w-full items-center justify-center">
        <div className="auth-form-card w-full max-w-[440px] space-y-5 text-center sm:space-y-7">
          <div className="flex flex-col items-center space-y-4 sm:space-y-5">
            <Image
              src={PI_MARK.src}
              alt=""
              width={PI_MARK.width}
              height={PI_MARK.height}
              unoptimized
              priority
              aria-hidden
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
                Welcome back
              </h1>
              <p className="text-sm leading-relaxed text-[#8B92A9] sm:text-base">
                Sign in to your {BRANDING.productName} account.
              </p>
            </div>
          </div>

          <form
            className="space-y-4 text-left sm:space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void runSignIn()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="auth-field-label">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearField("email")
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
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={fieldErrors.email} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password" className="auth-field-label">
                  Password
                </Label>
                <Link href={ROUTES.forgotPassword} className="auth-link text-xs sm:text-sm">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearField("password")
                  }}
                  onBlur={() => {
                    const msg = validateSignInPassword(password)
                    if (msg) setFieldErrors((prev) => ({ ...prev, password: msg }))
                  }}
                  placeholder="Enter your password"
                  className={cn(
                    "auth-field-input pr-12 sm:h-12",
                    inputErrorClass(Boolean(fieldErrors.password))
                  )}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError id="password-error" message={fieldErrors.password} />
            </div>

            <FieldError
              message={fieldErrors.general || oauthError || undefined}
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
            />

            <Button
              type="submit"
              className="auth-submit w-full sm:h-12"
              disabled={submitting}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {submitting ? "Signing in…" : "Sign in"}
            </Button>

            <OAuthSignInButtons />

            <p className="pt-1 text-center text-sm text-[#8B92A9]">
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.signUp} className="auth-link">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </AuthPageShell>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignInPageContent />
    </Suspense>
  )
}
