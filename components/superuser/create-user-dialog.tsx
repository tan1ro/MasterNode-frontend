"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Copy, Loader2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  plansForAccountType,
  type AppAccountType,
  type AppPlan,
} from "@/lib/app-auth"
import { authService } from "@/services/auth"
import { cn } from "@/lib/utils"

type Credentials = { email: string; password: string }

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function generateClientPassword(): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*"
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

export function CreateUserDialog({ open, onClose, onCreated }: CreateUserDialogProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [accountType, setAccountType] = useState<AppAccountType>("creator")
  const [plan, setPlan] = useState<AppPlan>("free")
  const [password, setPassword] = useState("")
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copied, setCopied] = useState(false)

  const plans = useMemo(() => plansForAccountType(accountType), [accountType])

  useEffect(() => {
    if (!open) return
    setEmail("")
    setUsername("")
    setAccountType("creator")
    setPlan("free")
    setPassword(generateClientPassword())
    setAutoGenerate(true)
    setSubmitting(false)
    setError("")
    setCredentials(null)
    setCopied(false)
  }, [open])

  useEffect(() => {
    if (!plans.includes(plan)) {
      setPlan(plans[0] ?? "free")
    }
  }, [plans, plan])

  if (!open) return null

  const copyCredentials = async () => {
    if (!credentials) return
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}\nSign in: ${typeof window !== "undefined" ? `${window.location.origin}/sign-in` : "/sign-in"}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Could not copy to clipboard.")
    }
  }

  const submit = async () => {
    const safeEmail = email.trim().toLowerCase()
    if (!safeEmail || !safeEmail.includes("@")) {
      setError("Enter a valid email address.")
      return
    }
    if (!autoGenerate && password.trim().length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const result = await authService.adminCreateUser({
        email: safeEmail,
        username: username.trim() || undefined,
        account_type: accountType,
        plan,
        ...(autoGenerate
          ? { generate_password: true }
          : { password: password.trim(), generate_password: false }),
      })
      setCredentials(result.credentials)
      onCreated()
    } catch (e) {
      const detail =
        e &&
        typeof e === "object" &&
        "response" in e &&
        e.response &&
        typeof e.response === "object" &&
        "data" in e.response &&
        e.response.data &&
        typeof e.response.data === "object" &&
        "detail" in e.response.data
          ? String((e.response.data as { detail?: unknown }).detail || "")
          : ""
      setError(detail || (e instanceof Error ? e.message : "Could not create user."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border/70 bg-background p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="create-user-title" className="text-lg font-semibold text-foreground">
              {credentials ? "User created" : "Create user"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {credentials
                ? "Copy these credentials now — the password is shown only once."
                : "Create an account with a password and assign role / plan."}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {credentials ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm">
              <p className="font-medium text-foreground">Sign-in credentials</p>
              <dl className="mt-3 space-y-2 font-mono text-xs sm:text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 text-muted-foreground">Email</dt>
                  <dd className="break-all text-foreground">{credentials.email}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 text-muted-foreground">Password</dt>
                  <dd className="break-all text-foreground">{credentials.password}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Done
              </Button>
              <Button type="button" onClick={() => void copyCredentials()}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy credentials
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="create-user-email">Email</Label>
              <Input
                id="create-user-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-user-username">Username (optional)</Label>
              <Input
                id="create-user-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Defaults from email"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-user-role">Role</Label>
                <select
                  id="create-user-role"
                  className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AppAccountType)}
                >
                  <option value="creator">Creator</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-user-plan">Plan</Label>
                <select
                  id="create-user-plan"
                  className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as AppPlan)}
                >
                  {plans.map((p) => (
                    <option key={p} value={p}>
                      {p === "pro_plus" ? "Premium" : p === "premium" ? "Infinity" : p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="create-user-password">Password</Label>
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => {
                      const next = e.target.checked
                      setAutoGenerate(next)
                      if (next) setPassword(generateClientPassword())
                    }}
                    className="rounded border-border"
                  />
                  Auto-generate
                </label>
              </div>
              <Input
                id="create-user-password"
                type="text"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setAutoGenerate(false)
                  setPassword(e.target.value)
                }}
                disabled={autoGenerate}
                className={cn(autoGenerate && "opacity-80")}
              />
              <p className="text-xs text-muted-foreground">
                {autoGenerate
                  ? "A secure password will be generated and shown once after create."
                  : "Minimum 6 characters. Share this password with the user securely."}
              </p>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Create user
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
