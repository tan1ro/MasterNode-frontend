"use client"

import { Callout } from "@/components/ui/callout"
import {
  getErrorMessage,
  getHttpStatus,
  getEntitlementFeature,
  isConnectionError,
  isBackendUnavailable,
  isAuthError,
  isEntitlementError,
  isForbidden,
  isServerError,
  isWalletError,
} from "@/types/api"
import Link from "next/link"
import axios from "axios"
import { API_BASE_URL, ROUTES, httpErrorRoute } from "@/lib/routes"
import { settingsPanelHref } from "@/lib/settings-panel-routes"
import { isHttpErrorCode } from "@/lib/http-errors"
import type { FeatureId } from "@/constants/entitlements"
import { upgradePlanForFeature } from "@/constants/entitlements"
import { Button } from "@/components/ui/button"

interface ApiErrorCalloutProps {
  error: unknown
  title?: string
  fallbackMessage?: string
  settingsHref?: string
}

const CONNECTION_TIPS = (
  <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-sm">
    <li>Ensure the backend server is running at {API_BASE_URL}</li>
    <li>Check that the backend service is started and accessible</li>
    <li>Verify your network connection</li>
  </ul>
)

export function ApiErrorCallout({
  error,
  title = "Error",
  fallbackMessage = "Something went wrong",
  settingsHref = settingsPanelHref("api-access"),
}: ApiErrorCalloutProps) {
  if (!error) return null
  const message = getErrorMessage(error, fallbackMessage)
  const connectionError = isConnectionError(error)
  const backendUnavailable = isBackendUnavailable(error)
  const authError = isAuthError(error)
  const walletError = isWalletError(error)
  const forbiddenError = isForbidden(error)
  const entitlementError = isEntitlementError(error)
  const entitlementFeature = getEntitlementFeature(error) as FeatureId | null
  const serverError = isServerError(error)
  const status = getHttpStatus(error) ?? (axios.isAxiosError(error) ? error.response?.status ?? null : null)
  const displayTitle =
    backendUnavailable
      ? "Backend unavailable"
      : serverError && status
      ? `Backend error (${status})`
      : authError && status === 401
        ? "Sign in required (401)"
        : walletError && status === 402
          ? "Insufficient balance (402)"
          : forbiddenError && status === 403
            ? entitlementError
              ? "Upgrade required"
              : "Permission denied (403)"
            : title
  const docHref = status !== null && isHttpErrorCode(status) ? httpErrorRoute(status) : null
  const showGenericHttpIndex = status !== null && !isHttpErrorCode(status)

  if (entitlementError && entitlementFeature) {
    const targetPlan = upgradePlanForFeature(entitlementFeature)
    return (
      <Callout type="warning" title={displayTitle}>
        <p className="text-sm">{message}</p>
        <Button asChild size="sm" className="mt-3 bg-amber text-amber-foreground hover:bg-amber/90">
          <Link href={ROUTES.chatPricing}>View plans — upgrade to {targetPlan}</Link>
        </Button>
      </Callout>
    )
  }

  return (
    <Callout type="error" title={displayTitle}>
      {backendUnavailable ? (
        <p className="text-sm text-muted-foreground mb-2">
          The MasterNode API is not reachable. Start the backend or fix the API port, then this page
          will recover automatically.
        </p>
      ) : null}
      {serverError && status && !backendUnavailable ? (
        <p className="text-sm text-muted-foreground mb-2">
          The API returned HTTP {status} (internal server error). This is a backend problem, not your browser.
        </p>
      ) : null}
      <p className="mb-2">{message}</p>
      {docHref && (
        <p className="text-sm mb-2">
          <Link href={docHref} className="underline">
            What does HTTP {status} mean?
          </Link>
        </p>
      )}
      {showGenericHttpIndex && (
        <p className="text-sm mb-2">
          <Link href={ROUTES.errorsIndex} className="underline">
            Browse documented HTTP status codes
          </Link>
        </p>
      )}
      {connectionError && (
        <div className="mt-2 space-y-1 text-sm">
          <p>To fix this issue:</p>
          {CONNECTION_TIPS}
        </div>
      )}
      {walletError && !connectionError && (
        <p className="mt-2 text-sm">
          Add prepaid credits on{" "}
          <Link href={ROUTES.chatPricing} className="underline">
            Billing
          </Link>{" "}
          or manage keys under{" "}
          <Link href={ROUTES.apiKeys} className="underline">
            API Keys
          </Link>
          .
        </p>
      )}
      {forbiddenError && !connectionError && !walletError && (
        <p className="mt-2 text-sm">
          This action is not allowed on your current plan.{" "}
          <Link href={ROUTES.chatPricing} className="underline">
            Upgrade on Billing
          </Link>{" "}
          or review{" "}
          <Link href={settingsHref} className="underline">
            Settings → API access
          </Link>
          .
        </p>
      )}
      {authError && !connectionError && !walletError && !forbiddenError && (
        <p className="mt-2 text-sm">
          {status === 401 ? (
            <>
              Your session may have expired.{" "}
              <Link href={ROUTES.signIn} className="underline">
                Sign in again
              </Link>{" "}
              or set an API key in{" "}
              <Link href={settingsHref} className="underline">
                Settings
              </Link>
              .
            </>
          ) : (
            <>
              Please set your API key in{" "}
              <Link href={settingsHref} className="underline">
                Settings
              </Link>
              .
            </>
          )}
        </p>
      )}
    </Callout>
  )
}
