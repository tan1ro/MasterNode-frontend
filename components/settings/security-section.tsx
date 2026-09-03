"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { KeyRound, MonitorSmartphone, Shield, History, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import {
  authService,
  type AuthLoginHistoryRow,
  type AuthSessionRow,
} from "@/services/auth"
import { getErrorMessage } from "@/types/api"
import { ROUTES } from "@/lib/routes"
import { getRefreshToken } from "@/lib/session-token-store"
import { formatUserDateTime, getEffectiveTimeZone } from "@/lib/datetime-local"

export function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [hasPassword, setHasPassword] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [sessions, setSessions] = useState<AuthSessionRow[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [revokingJti, setRevokingJti] = useState<string | null>(null)
  const [revokingOthers, setRevokingOthers] = useState(false)

  const [loginHistory, setLoginHistory] = useState<AuthLoginHistoryRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpLoading, setTotpLoading] = useState(true)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState("")
  const [totpBusy, setTotpBusy] = useState(false)
  const [totpMessage, setTotpMessage] = useState<string | null>(null)
  const [totpError, setTotpError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    try {
      const res = await authService.listSessions(getRefreshToken())
      setSessions(res.sessions || [])
    } catch (err) {
      setSessionsError(getErrorMessage(err, "Could not load active sessions"))
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await authService.loginHistory(25)
      setLoginHistory(res.events || [])
    } catch (err) {
      setHistoryError(getErrorMessage(err, "Could not load login history"))
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const loadTotpStatus = useCallback(async () => {
    setTotpLoading(true)
    try {
      const status = await authService.totpStatus()
      setTotpEnabled(Boolean(status.enabled))
    } catch {
      setTotpEnabled(false)
    } finally {
      setTotpLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const profile = await authService.me()
        if (!cancelled) {
          setHasPassword(profile.has_password !== false)
          setTotpEnabled(Boolean(profile.totp_enabled))
        }
      } catch {
        if (!cancelled) setHasPassword(true)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    void loadSessions()
    void loadHistory()
    void loadTotpStatus()
    return () => {
      cancelled = true
    }
  }, [loadHistory, loadSessions, loadTotpStatus])

  const clearFeedback = () => {
    setError(null)
    setMessage(null)
  }

  const handlePasswordChange = async () => {
    clearFeedback()

    const current = currentPassword.trim()
    const next = newPassword.trim()
    const confirm = confirmPassword.trim()

    if (!current) {
      setError("Enter your current password.")
      return
    }
    if (next.length < 6) {
      setError("New password must be at least 6 characters.")
      return
    }
    if (next !== confirm) {
      setError("New passwords do not match.")
      return
    }
    if (current === next) {
      setError("New password must differ from your current password.")
      return
    }

    setSaving(true)
    try {
      await authService.changePassword(current, next)
      setMessage("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to change password"))
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeSession = async (jti: string) => {
    setRevokingJti(jti)
    setSessionsError(null)
    try {
      await authService.revokeSession(jti)
      await loadSessions()
    } catch (err) {
      setSessionsError(getErrorMessage(err, "Could not revoke session"))
    } finally {
      setRevokingJti(null)
    }
  }

  const handleRevokeOthers = async () => {
    setRevokingOthers(true)
    setSessionsError(null)
    try {
      await authService.revokeOtherSessions(getRefreshToken())
      await loadSessions()
    } catch (err) {
      setSessionsError(getErrorMessage(err, "Could not sign out other devices"))
    } finally {
      setRevokingOthers(false)
    }
  }

  const handleTotpSetup = async () => {
    setTotpBusy(true)
    setTotpError(null)
    setTotpMessage(null)
    try {
      const res = await authService.totpSetup()
      setTotpSecret(res.secret)
      setTotpUri(res.otpauth_uri)
      setTotpMessage("Scan the URI in your authenticator app, or enter the secret manually.")
    } catch (err) {
      setTotpError(getErrorMessage(err, "Could not start two-factor setup"))
    } finally {
      setTotpBusy(false)
    }
  }

  const handleTotpEnable = async () => {
    setTotpBusy(true)
    setTotpError(null)
    setTotpMessage(null)
    try {
      await authService.totpEnable(totpCode.trim())
      setTotpEnabled(true)
      setTotpSecret(null)
      setTotpUri(null)
      setTotpCode("")
      setTotpMessage("Two-factor authentication is now enabled.")
    } catch (err) {
      setTotpError(getErrorMessage(err, "Could not enable two-factor authentication"))
    } finally {
      setTotpBusy(false)
    }
  }

  const handleTotpDisable = async () => {
    setTotpBusy(true)
    setTotpError(null)
    setTotpMessage(null)
    try {
      await authService.totpDisable(totpCode.trim())
      setTotpEnabled(false)
      setTotpSecret(null)
      setTotpUri(null)
      setTotpCode("")
      setTotpMessage("Two-factor authentication has been disabled.")
    } catch (err) {
      setTotpError(getErrorMessage(err, "Could not disable two-factor authentication"))
    } finally {
      setTotpBusy(false)
    }
  }

  const canSubmit =
    !saving &&
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    confirmPassword.trim().length > 0

  const formatTs = (raw?: string) =>
    raw
      ? formatUserDateTime(raw, { timeZone: getEffectiveTimeZone() })
      : "Unknown time"

  return (
    <Card variant="minimal" interactive={false} id="security" accent="destructive" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-400" />
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Password, sessions, two-factor authentication, and login history.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={KeyRound}
          title="Change password"
          description="Update your account password without signing out."
        >
          {profileLoading ? (
            <p className="text-sm text-muted-foreground">Loading account security…</p>
          ) : !hasPassword ? (
            <Callout type="info">
              This account uses social sign-in only and does not have a password yet.{" "}
              <Link href={ROUTES.forgotPassword} className="font-medium underline underline-offset-2">
                Use Forgot password
              </Link>{" "}
              to set one, then return here to change it later.
            </Callout>
          ) : (
            <form
              className="grid max-w-md gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                void handlePasswordChange()
              }}
            >
              <div>
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => {
                    clearFeedback()
                    setCurrentPassword(e.target.value)
                  }}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    clearFeedback()
                    setNewPassword(e.target.value)
                  }}
                  className="mt-1.5"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    clearFeedback()
                    setConfirmPassword(e.target.value)
                  }}
                  className="mt-1.5"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={!canSubmit} className="w-fit">
                {saving ? "Updating…" : "Update password"}
              </Button>
              {message ? (
                <p className="text-xs text-emerald-500" role="status">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="text-xs text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          )}
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={MonitorSmartphone}
          title="Active sessions"
          description="Devices where you are currently signed in."
        >
          {sessionsLoading ? (
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          ) : sessionsError ? (
            <p className="text-xs text-red-400" role="alert">
              {sessionsError}
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.jti}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {session.device_label || "Unknown device"}
                      {session.current ? (
                        <span className="ml-2 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                          This device
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ip ? `IP ${session.ip} · ` : ""}
                      Last active {formatTs(session.updated_at || session.created_at)}
                    </p>
                  </div>
                  {!session.current ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={revokingJti === session.jti}
                      onClick={() => void handleRevokeSession(session.jti)}
                    >
                      {revokingJti === session.jti ? "Revoking…" : "Revoke"}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {sessions.length > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={revokingOthers}
              onClick={() => void handleRevokeOthers()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {revokingOthers ? "Signing out…" : "Sign out all other devices"}
            </Button>
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Shield}
          title="Two-factor authentication"
          description="Add a TOTP authenticator app as a second sign-in step."
        >
          {totpLoading ? (
            <p className="text-sm text-muted-foreground">Loading two-factor status…</p>
          ) : totpEnabled ? (
            <div className="space-y-3 max-w-md">
              <Callout type="success">Two-factor authentication is enabled for password sign-in.</Callout>
              <div>
                <Label htmlFor="totpDisableCode">Authenticator code</Label>
                <Input
                  id="totpDisableCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="6-digit code"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={totpBusy || totpCode.trim().length < 6}
                onClick={() => void handleTotpDisable()}
              >
                {totpBusy ? "Disabling…" : "Disable two-factor"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-w-md">
              <Callout type="info">
                Use Google Authenticator, 1Password, Authy, or any TOTP app. Required only for email/password
                sign-in.
              </Callout>
              {!totpSecret ? (
                <Button type="button" disabled={totpBusy} onClick={() => void handleTotpSetup()}>
                  {totpBusy ? "Starting…" : "Set up authenticator"}
                </Button>
              ) : (
                <>
                  <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs space-y-2">
                    <p>
                      <span className="text-muted-foreground">Secret:</span>{" "}
                      <code className="break-all">{totpSecret}</code>
                    </p>
                    {totpUri ? (
                      <p>
                        <span className="text-muted-foreground">Setup URI:</span>{" "}
                        <code className="break-all">{totpUri}</code>
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="totpEnableCode">Verification code</Label>
                    <Input
                      id="totpEnableCode"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="6-digit code"
                      className="mt-1.5"
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={totpBusy || totpCode.trim().length < 6}
                    onClick={() => void handleTotpEnable()}
                  >
                    {totpBusy ? "Enabling…" : "Enable two-factor"}
                  </Button>
                </>
              )}
            </div>
          )}
          {totpMessage ? (
            <p className="text-xs text-emerald-500 mt-2" role="status">
              {totpMessage}
            </p>
          ) : null}
          {totpError ? (
            <p className="text-xs text-red-400 mt-2" role="alert">
              {totpError}
            </p>
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={History}
          title="Login history"
          description="Recent sign-in events for spotting unauthorised access."
        >
          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading login history…</p>
          ) : historyError ? (
            <p className="text-xs text-red-400" role="alert">
              {historyError}
            </p>
          ) : loginHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No login events recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {loginHistory.map((event, index) => (
                <li
                  key={event.id || `${event.ts}-${index}`}
                  className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">
                    {formatTs(event.ts)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {(event.method || "password").replace(/_/g, " ")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.device_label || "Unknown device"}
                    {event.ip ? ` · IP ${event.ip}` : ""}
                    {event.outcome && event.outcome !== "ok" ? ` · ${event.outcome}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
