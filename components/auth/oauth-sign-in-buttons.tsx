"use client"

import { useEffect, useState, type ComponentType } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getPublicOAuthProviders,
  isPublicOAuthProviderEnabled,
  OAUTH_PROVIDER_LABELS,
  type OAuthProviderId,
} from "@/lib/oauth-config"
import { isAppleDevice } from "@/lib/apple-device"
import { cn } from "@/lib/utils"

/** Shared “or” rule used on sign-in and sign-up. */
export function AuthOrDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative py-1", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-black px-3 text-sm text-[#8B92A9]">or</span>
      </div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M13 1h10v10H13z" />
      <path fill="#7fba00" d="M1 13h10v10H1z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </svg>
  )
}

const PROVIDER_ICONS: Record<OAuthProviderId, ComponentType<{ className?: string }>> = {
  google: GoogleIcon,
  github: Github,
  microsoft: MicrosoftIcon,
  apple: AppleIcon,
}

/** Providers always shown on auth screens (Apple only on Apple devices). */
function getDisplayedOAuthProviders(onAppleDevice: boolean): OAuthProviderId[] {
  const providers: OAuthProviderId[] = ["google", "github", "microsoft"]
  if (onAppleDevice) providers.push("apple")
  return providers
}

type OAuthSignInButtonsProps = {
  className?: string
  redirectUrl?: string | null
  /** Divider above the buttons. Pass `false` to hide it. */
  showDivider?: boolean
  /** Footer hint when no live social providers. */
  showComingSoonHint?: boolean
}

export function OAuthSignInButtons({
  className,
  redirectUrl,
  showDivider = true,
  showComingSoonHint = true,
}: OAuthSignInButtonsProps) {
  const searchParams = useSearchParams()
  const [onAppleDevice, setOnAppleDevice] = useState(false)

  useEffect(() => {
    setOnAppleDevice(isAppleDevice())
  }, [])

  const providers = getDisplayedOAuthProviders(onAppleDevice)
  const liveProviders = new Set(getPublicOAuthProviders({ isAppleDevice: onAppleDevice }))

  const startOAuth = (provider: OAuthProviderId) => {
    const callbackTarget = new URL("/api/auth/oauth/callback", window.location.origin)
    const redirect = redirectUrl ?? searchParams.get("redirect_url")
    if (redirect) callbackTarget.searchParams.set("redirect_url", redirect)
    void signIn(provider, { callbackUrl: callbackTarget.toString() })
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showDivider ? <AuthOrDivider /> : null}

      <div className="flex items-center justify-center gap-3">
        {providers.map((provider) => {
          const Icon = PROVIDER_ICONS[provider]
          const live = liveProviders.has(provider) && isPublicOAuthProviderEnabled(provider)
          const label = OAUTH_PROVIDER_LABELS[provider]
          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              disabled={!live}
              aria-label={live ? `Continue with ${label}` : `${label} sign-in coming soon`}
              aria-disabled={!live}
              title={live ? label : `${label} sign-in coming soon`}
              className={cn(
                "auth-oauth-btn size-11 shrink-0 p-0 sm:size-12",
                live ? "" : "cursor-not-allowed opacity-70"
              )}
              onClick={() => {
                if (!live) return
                startOAuth(provider)
              }}
            >
              <Icon className="size-5" />
            </Button>
          )
        })}
      </div>
      {showComingSoonHint && !liveProviders.size ? (
        <p className="text-center text-xs text-[#8B92A9]">
          Social sign-in is coming soon. Use email for now.
        </p>
      ) : null}
    </div>
  )
}
