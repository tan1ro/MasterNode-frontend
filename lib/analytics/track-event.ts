import { parseCookieConsent, COOKIE_CONSENT_KEY } from "@/constants/legal"
import { analyticsEventsService, type ProductEventName } from "@/services/analytics-events"
import {
  createEventId,
  detectClientContext,
  getAnalyticsSessionId,
  isDoNotTrackEnabled,
} from "@/lib/analytics/client-context"

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false
  if (isDoNotTrackEnabled()) return false
  try {
    const consent = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
    return Boolean(consent?.analytics)
  } catch {
    return false
  }
}

export async function trackProductEvent(
  eventName: ProductEventName,
  properties: Record<string, unknown> = {},
  options?: { conversationId?: string | null }
): Promise<void> {
  if (typeof window === "undefined") return
  if (!hasAnalyticsConsent()) return

  const ctx = detectClientContext()
  await analyticsEventsService.track({
    event_id: createEventId(),
    event_name: eventName,
    session_id: getAnalyticsSessionId(),
    conversation_id: options?.conversationId || undefined,
    ...ctx,
    properties,
  })
}
