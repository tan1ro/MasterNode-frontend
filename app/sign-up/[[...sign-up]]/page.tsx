"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, UserPlus } from "lucide-react"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { ROUTES } from "@/lib/routes"
import { signUp, updateLocalUserOrganization, type AppAccountType, type AppPlan } from "@/lib/app-auth"
import {
  hasFieldErrors,
  normalizeEmail,
  validateSignUpAccountStep,
  validateSignUpBeforeSubmit,
  SIGNUP_EMAIL_EXISTS_MESSAGE,
  type OrganizationSetupMode,
  type SignUpFieldErrors,
} from "@/lib/auth-validation"
import { useEmailAvailability } from "@/hooks/use-email-availability"
import { OtpInput } from "@/components/auth/otp-input"
import { syncAuthProfileFromApi } from "@/lib/sync-auth-profile"
import { resolvePostAuthDestination } from "@/lib/post-auth-redirect"
import { redirectIfServerError } from "@/lib/redirect-server-error"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ClearStaleServerSession } from "@/components/auth/clear-stale-server-session"
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"
import { OrganizationSetupStep } from "@/components/auth/organization-setup-step"
import { SignUpThreePanel } from "@/components/auth/sign-up-three-panel"
import { AuthOrDivider, OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons"
import { ComingSoonBadge } from "@/components/settings/settings-pref-controls"
import { organizationsService, type OrganizationSummary } from "@/services/organizations"
import { safeRedirectPath } from "@/lib/safe-redirect"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignUpPageContent />
    </Suspense>
  )
}

function SignUpPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [accountFieldStep, setAccountFieldStep] = useState(0)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountType, setAccountType] = useState<AppAccountType | null>(null)
  const [selectedPlan] = useState<AppPlan>("free")
  const [orgName, setOrgName] = useState("My Organization")
  const [orgLogoDataUrl, setOrgLogoDataUrl] = useState("")
  const [orgLogoFileName, setOrgLogoFileName] = useState("")
  const [orgMode, setOrgMode] = useState<OrganizationSetupMode>("create")
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationSummary | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({})
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | undefined>(undefined)
  const [otpInfo, setOtpInfo] = useState<string | undefined>(undefined)
  const [devOtpCode, setDevOtpCode] = useState<string | undefined>(undefined)
  const [resendCooldown, setResendCooldown] = useState(0)
  const emailAvailability = useEmailAvailability(email)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  const isBusinessAccount = accountType === "business"
  const isCreatorAccount = accountType === "creator"
  const isOrgStep = step === 3 && isBusinessAccount
  const isPasswordStep = step === 2 && accountFieldStep === 1
  const isCreateAccountStep = isOrgStep || (isCreatorAccount && isPasswordStep)
  const emailFieldError =
    fieldErrors.email ||
    (emailAvailability.isTaken ? emailAvailability.errorMessage : undefined)

  const clearField = (key: keyof SignUpFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      delete next.general
      return next
    })
  }

  const nextFromRoleStep = () => {
    setFieldErrors({})
    if (!accountType) {
      setFieldErrors({ accountType: "Please select Creator to continue." })
      return
    }
    setStep(2)
  }

  const nextFromAccountStep = () => {
    const stepErrors = validateSignUpAccountStep(accountFieldStep as 0 | 1, {
      username,
      email,
      password,
      confirmPassword,
    })
    if (accountFieldStep === 0 && emailAvailability.isTaken) {
      stepErrors.email = SIGNUP_EMAIL_EXISTS_MESSAGE
    }
    if (hasFieldErrors(stepErrors)) {
      setFieldErrors(stepErrors)
      return
    }
    setFieldErrors({})
    if (accountFieldStep === 0) {
      setAccountFieldStep(1)
      return
    }
    setAccountFieldStep(0)
    if (isBusinessAccount) {
      setStep(3)
    }
  }

  const sendOtp = async (mode: "send" | "resend") => {
    setOtpError(undefined)
    setOtpInfo(undefined)
    setOtpSending(true)
    try {
      const res = await fetch(mode === "resend" ? "/api/auth/resend-otp" : "/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizeEmail(email) }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        cooldown?: number
        retryAfter?: number
        devCode?: string
      }
      if (!res.ok) {
        setDevOtpCode(undefined)
        setOtpError(data.error || "Could not send the code. Please try again.")
        if (typeof data.retryAfter === "number") setResendCooldown(data.retryAfter)
        return false
      }
      setResendCooldown(typeof data.cooldown === "number" ? data.cooldown : 60)
      setDevOtpCode(typeof data.devCode === "string" ? data.devCode : undefined)
      setOtpInfo(
        mode === "resend"
          ? data.devCode
            ? `Dev mode: your code is ${data.devCode}`
            : "A new code is on its way to your inbox."
          : data.devCode
            ? `Dev mode: your code is ${data.devCode}`
            : `We sent a 6-digit code to ${normalizeEmail(email)}.`
      )
      return true
    } catch {
      setOtpError("Network error. Please check your connection and try again.")
      return false
    } finally {
      setOtpSending(false)
    }
  }

  const handleEmailStepContinue = async () => {
    const stepErrors = validateSignUpAccountStep(0, { username, email, password, confirmPassword })
    if (emailAvailability.isTaken) {
      stepErrors.email = SIGNUP_EMAIL_EXISTS_MESSAGE
    }
    if (hasFieldErrors(stepErrors)) {
      setFieldErrors(stepErrors)
      return
    }
    setFieldErrors({})
    if (otpVerified) {
      setAccountFieldStep(1)
      return
    }
    // OTP step already shown — don't fire another send (avoids rate limits while testing).
    if (showOtpStep) {
      return
    }
    setOtpCode("")
    const sent = await sendOtp("send")
    if (sent) setShowOtpStep(true)
  }

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = (codeOverride ?? otpCode).replace(/\D/g, "")
    if (code.length !== 6) {
      setOtpError("Enter the 6-digit code from your email.")
      return
    }
    setOtpError(undefined)
    setOtpVerifying(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizeEmail(email), otp: code }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setOtpError(data.error || "Invalid code. Please try again.")
        setOtpCode("")
        return
      }
      setOtpVerified(true)
      setOtpInfo(undefined)
      setShowOtpStep(false)
      setAccountFieldStep(1)
    } catch {
      setOtpError("Network error. Please check your connection and try again.")
    } finally {
      setOtpVerifying(false)
    }
  }

  const completeSignUp = async (organizationNameOverride?: string, clearLogo?: boolean) => {
    if (!otpVerified) {
      setStep(2)
      setAccountFieldStep(0)
      setShowOtpStep(false)
      setFieldErrors({ email: "Please verify your email before creating your account." })
      return
    }
    const skipOrganization = Boolean(organizationNameOverride !== undefined && clearLogo)
    const finalOrganizationName =
      orgMode === "join" && selectedOrganization
        ? selectedOrganization.name
        : (organizationNameOverride ?? orgName).trim() || `${username.trim() || "My"} Organization`

    const errors = validateSignUpBeforeSubmit({
      accountType,
      username,
      email,
      password,
      confirmPassword,
      orgMode,
      orgName: finalOrganizationName,
      selectedOrgId: selectedOrganization?.org_id,
      skipOrganization,
    })
    if (emailAvailability.isTaken) {
      errors.email = SIGNUP_EMAIL_EXISTS_MESSAGE
    }
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors)
      if (errors.username || errors.email) {
        setStep(2)
        setAccountFieldStep(0)
      } else if (errors.password || errors.confirmPassword) {
        setStep(2)
        setAccountFieldStep(1)
      } else if (errors.accountType) {
        setStep(1)
      } else if (errors.joinOrg || errors.orgName) {
        setStep(3)
      }
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      const created = await signUp({
        username: username.trim(),
        email: normalizeEmail(email),
        password,
        accountType: accountType || "creator",
        plan: selectedPlan,
        organizationName: finalOrganizationName,
        organizationLogoDataUrl:
          skipOrganization || orgMode === "join"
            ? undefined
            : orgLogoDataUrl || undefined,
      })

      if (!skipOrganization) {
        if (orgMode === "join" && selectedOrganization) {
          const joined = await organizationsService.join(selectedOrganization.org_id)
          updateLocalUserOrganization({
            name: joined.name,
            logoDataUrl: undefined,
          })
        } else {
          const created = await organizationsService.create({
            name: finalOrganizationName,
            logo_data_url: orgLogoDataUrl || undefined,
          })
          updateLocalUserOrganization({
            name: created.name,
            logoDataUrl: orgLogoDataUrl || undefined,
          })
        }
      }

      await syncAuthProfileFromApi()
      const destination = await resolvePostAuthDestination(
        created.id,
        safeRedirectPath(searchParams.get("redirect_url"), ROUTES.chat),
        searchParams.get("redirect_url")
      )
      router.push(destination)
    } catch (err) {
      if (redirectIfServerError(router, err, pathname)) return
      const message = err instanceof Error ? err.message : "Unable to sign up."
      const normalized = message.toLowerCase()

      if (normalized.includes("email already exists")) {
        setStep(2)
        setAccountFieldStep(0)
        setFieldErrors({ email: message })
        return
      }
      setFieldErrors({ general: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell navLink={{ href: ROUTES.signIn, label: "Sign in", variant: "outline" }}>
      <ClearStaleServerSession />
      <RedirectIfSignedIn />
      <div className="auth-page-content w-full">
        {step === 1 ? (
          <form
            className="flex w-full flex-col space-y-4 sm:space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              nextFromRoleStep()
            }}
          >
            <div className="flex h-full w-full flex-col">
              <div className="py-1.5 text-center sm:py-4">
                <p className="text-sm font-medium text-[#F0F2F8] sm:text-lg">I am a</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                <div
                  aria-disabled="true"
                  className="auth-role-card auth-role-card--business auth-role-card--disabled flex h-full flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xl font-semibold text-[#F0F2F8] sm:text-3xl">Business</p>
                    <ComingSoonBadge />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#8B92A9] sm:mt-4 sm:text-lg lg:max-w-md xl:max-w-lg">
                    Full product lifecycle: engineering, product management, marketing, analytics, and team ops.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("creator")
                    clearField("accountType")
                  }}
                  className={cn(
                    "auth-role-card auth-role-card--creator flex h-full flex-col justify-between",
                    accountType === "creator" && "auth-role-card--selected"
                  )}
                >
                  <p className="text-xl font-semibold text-[#F0F2F8] sm:text-3xl">Creator</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8B92A9] sm:mt-4 sm:text-lg lg:max-w-md xl:max-w-lg">
                    Domain services for research, marketing, codebase, academics, legal, and content workflows.
                  </p>
                </button>
              </div>
              <FieldError message={fieldErrors.accountType} className="text-center" />
              <div className="pt-2 sm:pt-4">
                <Button type="submit" className="auth-submit w-full sm:h-12">
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form
            className="auth-page-content flex w-full flex-col space-y-4 sm:space-y-5"
            noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (step === 2) {
                  if (showOtpStep) {
                    void handleVerifyOtp()
                    return
                  }
                  if (accountFieldStep === 0) {
                    void handleEmailStepContinue()
                    return
                  }
                  if (isCreatorAccount) {
                    void completeSignUp(undefined, true)
                    return
                  }
                  nextFromAccountStep()
                  return
                }
                if (isOrgStep) {
                  void completeSignUp()
                }
              }}
            >
              {step === 2 || step === 3 ? (
                <div className="grid w-full grid-cols-1 items-center justify-items-center gap-5 lg:grid-cols-2 lg:gap-10 xl:gap-12">
                  <div className="w-full max-w-xl">
                    <SignUpThreePanel />
                  </div>
                  <div
                    className={cn(
                      "auth-form-card w-full space-y-5 sm:space-y-7",
                      isOrgStep ? "max-w-[560px]" : "max-w-[440px]"
                    )}
                  >
                    {step === 2 && accountFieldStep === 0 && !showOtpStep ? (
                      <div className="space-y-4">
                        <OAuthSignInButtons
                          redirectUrl={searchParams.get("redirect_url")}
                          showDivider={false}
                          showComingSoonHint={false}
                        />
                        <AuthOrDivider />
                        <div className="space-y-2">
                          <Label htmlFor="username" className="auth-field-label">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value)
                              clearField("username")
                            }}
                            placeholder="Enter your username"
                            className={cn("auth-field-input sm:h-12", inputErrorClass(Boolean(fieldErrors.username)))}
                            aria-invalid={Boolean(fieldErrors.username)}
                            aria-describedby={fieldErrors.username ? "username-error" : undefined}
                          />
                          <FieldError id="username-error" message={fieldErrors.username} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="auth-field-label">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              clearField("email")
                              if (otpVerified || showOtpStep) {
                                setOtpVerified(false)
                                setShowOtpStep(false)
                                setOtpCode("")
                                setOtpError(undefined)
                                setOtpInfo(undefined)
                                setDevOtpCode(undefined)
                              }
                            }}
                            placeholder="Enter your email"
                            autoComplete="email"
                            inputMode="email"
                            className={cn("auth-field-input sm:h-12", inputErrorClass(Boolean(emailFieldError)))}
                            aria-invalid={Boolean(emailFieldError)}
                            aria-describedby={emailFieldError ? "email-error" : undefined}
                          />
                          {emailAvailability.isChecking && !emailFieldError ? (
                            <p className="text-xs text-muted-foreground">Checking email…</p>
                          ) : null}
                          <FieldError id="email-error" message={emailFieldError} />
                          {emailAvailability.isTaken ? (
                            <p className="text-sm">
                              <Link href={ROUTES.signIn} className="auth-link underline underline-offset-2">
                                Sign in
                              </Link>{" "}
                              to use this email, or choose a different address.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    {step === 2 && showOtpStep ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-base font-medium text-[#F0F2F8]">Verify your email</p>
                          <p className="text-sm text-[#8B92A9]">
                            Enter the 6-digit code we sent to{" "}
                            <span className="text-[#F0F2F8]">{normalizeEmail(email)}</span>.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <OtpInput
                            value={otpCode}
                            onChange={(next) => {
                              setOtpCode(next)
                              if (otpError) setOtpError(undefined)
                            }}
                            onComplete={(code) => {
                              if (!otpVerifying) void handleVerifyOtp(code)
                            }}
                            disabled={otpVerifying}
                            hasError={Boolean(otpError)}
                            autoFocus
                          />
                          <FieldError id="otp-error" message={otpError} />
                          {otpVerifying ? (
                            <p className="text-xs text-[#8B92A9]">Verifying your code…</p>
                          ) : otpInfo && !otpError ? (
                            <p className="text-xs text-[#8B92A9]">{otpInfo}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8B92A9]">Didn&apos;t get it?</span>
                          <button
                            type="button"
                            onClick={() => void sendOtp("resend")}
                            disabled={otpSending || otpVerifying || resendCooldown > 0}
                            className="auth-link underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : otpSending
                                ? "Sending…"
                                : "Resend code"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {step === 2 && accountFieldStep === 1 ? (
                      <div className="space-y-4">
                        {otpVerified ? (
                          <p className="flex items-center gap-1.5 text-sm text-emerald-400">
                            <Check className="h-4 w-4" />
                            Email verified
                          </p>
                        ) : null}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="auth-field-label">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value)
                                clearField("password")
                              }}
                              placeholder="Create your password"
                              autoComplete="new-password"
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
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError id="password-error" message={fieldErrors.password} />
                          <p className="text-xs text-muted-foreground">
                            At least 8 characters with one letter and one number.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="auth-field-label">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                clearField("confirmPassword")
                              }}
                              placeholder="Confirm your password"
                              autoComplete="new-password"
                              className={cn(
                                "auth-field-input pr-12 sm:h-12",
                                inputErrorClass(Boolean(fieldErrors.confirmPassword))
                              )}
                              aria-invalid={Boolean(fieldErrors.confirmPassword)}
                              aria-describedby={
                                fieldErrors.confirmPassword ? "confirm-password-error" : undefined
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError id="confirm-password-error" message={fieldErrors.confirmPassword} />
                        </div>
                      </div>
                    ) : null}
                    {step === 2 ? (
                      <p className="pt-1 text-sm text-[#8B92A9]">
                        {showOtpStep ? 2 : accountFieldStep === 0 ? 1 : 3} / 3
                      </p>
                    ) : null}
                    {isOrgStep ? (
                      <OrganizationSetupStep
                        mode={orgMode}
                        onModeChange={(mode) => {
                          setOrgMode(mode)
                          clearField("orgName")
                          clearField("joinOrg")
                          if (mode === "create") setSelectedOrganization(null)
                        }}
                        orgName={orgName}
                        onOrgNameChange={(value) => {
                          setOrgName(value)
                          clearField("orgName")
                        }}
                        orgNameError={fieldErrors.orgName}
                        selectedOrganization={selectedOrganization}
                        onSelectOrganization={(org) => {
                          setSelectedOrganization(org)
                          clearField("joinOrg")
                        }}
                        joinOrgError={fieldErrors.joinOrg}
                        logoDataUrl={orgLogoDataUrl}
                        logoFileName={orgLogoFileName}
                        onLogoChange={(dataUrl, file) => {
                          setOrgLogoDataUrl(dataUrl)
                          setOrgLogoFileName(file.name)
                          clearField("orgLogo")
                        }}
                        onLogoClear={() => {
                          setOrgLogoDataUrl("")
                          setOrgLogoFileName("")
                          clearField("orgLogo")
                        }}
                        onLogoValidationError={(message) => {
                          setOrgLogoDataUrl("")
                          setOrgLogoFileName("")
                          setFieldErrors((prev) => ({ ...prev, orgLogo: message }))
                        }}
                        logoError={fieldErrors.orgLogo}
                        generalError={fieldErrors.general}
                        disabled={submitting}
                      />
                    ) : null}

                    {step > 1 ? (
                      <div
                        className={cn(
                          "flex flex-col gap-2 pt-2 sm:flex-row sm:items-center",
                          isOrgStep ? "sm:justify-between" : "sm:justify-stretch"
                        )}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (step === 2 && showOtpStep) {
                              setFieldErrors({})
                              setOtpError(undefined)
                              setShowOtpStep(false)
                              return
                            }
                            if (step === 2 && accountFieldStep > 0) {
                              setFieldErrors({})
                              setAccountFieldStep((s) => Math.max(0, s - 1))
                              return
                            }
                            if (isOrgStep) {
                              setFieldErrors({})
                              setStep(2)
                              setAccountFieldStep(1)
                              return
                            }
                            setStep((s) => Math.max(1, s - 1))
                          }}
                          className={cn("auth-outline-btn w-full sm:h-12", !isOrgStep && "sm:flex-1")}
                          disabled={submitting}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>

                        {isOrgStep ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full sm:w-auto sm:px-6"
                            disabled={submitting}
                            onClick={() => {
                              void completeSignUp(`${username.trim() || "My"} Organization`, true)
                            }}
                          >
                            Skip for now
                          </Button>
                        ) : null}

                        <Button
                          type="submit"
                          className={cn("auth-submit w-full sm:h-12", !isOrgStep && "sm:flex-1")}
                          disabled={
                            submitting ||
                            otpSending ||
                            otpVerifying ||
                            (step === 2 &&
                              accountFieldStep === 0 &&
                              !showOtpStep &&
                              (emailAvailability.isTaken || emailAvailability.isChecking))
                          }
                        >
                          {showOtpStep ? (
                            <>
                              {otpVerifying ? "Verifying..." : "Verify email"}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          ) : step === 2 && accountFieldStep === 0 ? (
                            <>
                              {otpSending ? "Sending code..." : "Continue"}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          ) : isCreateAccountStep ? (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              {submitting ? "Creating account..." : "Create account"}
                            </>
                          ) : (
                            <>
                              Continue
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {fieldErrors.general && step > 1 ? (
                <FieldError message={fieldErrors.general} className="mx-auto max-w-[480px]" />
              ) : null}
            </form>
        )}
      </div>
    </AuthPageShell>
  )
}
