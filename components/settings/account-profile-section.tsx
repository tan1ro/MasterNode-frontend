"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Mail, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import {
  SettingsSectionCard,
} from "@/components/settings/settings-pref-controls"
import { authService, type AuthProfileResponse } from "@/services/auth"
import { getErrorMessage } from "@/types/api"
import { formatUserDateTime, getEffectiveTimeZone } from "@/lib/datetime-local"
import { isOAuthEnabled } from "@/lib/oauth-config"
import { cn } from "@/lib/utils"

const OAUTH_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    description: "Sign in with your Google account",
    enabled: () => isOAuthEnabled() && process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === "1",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Sign in with your GitHub account",
    enabled: () => isOAuthEnabled() && process.env.NEXT_PUBLIC_OAUTH_GITHUB_ENABLED === "1",
  },
  {
    id: "microsoft",
    label: "Microsoft",
    description: "Sign in with your Microsoft account",
    enabled: () => isOAuthEnabled() && process.env.NEXT_PUBLIC_OAUTH_MICROSOFT_ENABLED === "1",
  },
  {
    id: "apple",
    label: "Apple",
    description: "Shown on Mac, iPhone, and iPad at sign-in",
    enabled: () => isOAuthEnabled() && process.env.NEXT_PUBLIC_OAUTH_APPLE_ENABLED === "1",
  },
] as const

interface AccountProfileSectionProps {
  displayName: string
  avatarDataUrl: string
  onDisplayNameChange: (value: string) => void
  onAvatarChange: (value: string) => void
}

export function AccountProfileSection({
  displayName,
  avatarDataUrl,
  onDisplayNameChange,
  onAvatarChange,
}: AccountProfileSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const me = await authService.me()
        if (!mounted) return
        setProfile(me)
        const serverName = (me.username || "").trim()
        const emailLocal = (me.email || "").split("@")[0]?.trim() || ""
        // Hydrate from account username when display name is empty or still the email local-part.
        if (
          serverName &&
          (!displayName.trim() || displayName.trim() === emailLocal)
        ) {
          onDisplayNameChange(serverName)
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, "Failed to load profile"))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from /auth/me
  }, [])

  const resolvedUsername =
    (profile?.username || "").trim() ||
    displayName.trim() ||
    (profile?.email || "").split("@")[0] ||
    ""

  const handleAvatarPick = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      if (result) onAvatarChange(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card variant="minimal" interactive={false} id="account-profile" accent="violet" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-violet-400" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Display name, avatar, and sign-in details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/40"
            aria-label="Upload profile photo"
          >
            {avatarDataUrl ? (
              <Image src={avatarDataUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                {(resolvedUsername || profile?.email || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarPick(e.target.files?.[0] ?? null)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder={resolvedUsername || "Your name"}
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground">
              Updates your name in the sidebar and account menu on this device.
            </p>
            {avatarDataUrl ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onAvatarChange("")}>
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm space-y-1">
          <p className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Username:</span>
            <span className="font-medium">
              {loading ? "…" : (profile?.username || "").trim() || "—"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{loading ? "…" : profile?.email || "—"}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Email changes require verification — contact support if you need to update your address.
          </p>
        </div>

        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <SettingsSectionCard
          icon={User}
          title="Connected social logins"
          description="Sign in with Google, GitHub, Microsoft, or Apple from the sign-in page."
        >
          {isOAuthEnabled() ? (
            <Callout type="info">
              Social sign-in is enabled. Use the same email on OAuth and password accounts to
              access one workspace. Apple sign-in appears only on Apple devices.
            </Callout>
          ) : (
            <Callout type="info">
              Social login is not configured yet. You can sign in with email and password today.
            </Callout>
          )}
          <ul className="space-y-2">
            {OAUTH_PROVIDERS.map((provider) => {
              const active = provider.enabled()
              const linked = (profile?.oauth_providers || []).some(
                (p) => p.provider === provider.id
              )
              return (
                <li
                  key={provider.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{provider.label}</p>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      linked
                        ? "bg-emerald-500/15 text-emerald-400"
                        : active
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {linked ? "Linked" : active ? "At sign-in" : "Off"}
                  </span>
                </li>
              )
            })}
          </ul>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={User}
          title="Last login"
          description="Quick security indicator from your most recent session."
        >
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : profile?.last_login_at
                ? `Last sign-in ${formatUserDateTime(profile.last_login_at, {
                    timeZone: getEffectiveTimeZone(),
                  })}`
                : "No previous sign-in recorded yet for this account."}
          </p>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
