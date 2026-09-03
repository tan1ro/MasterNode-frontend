import { getClientTimezone } from "@/lib/chat-client-timezone"
import {
  getCachedClientGeolocation,
  getClientGeolocation,
  messageMayUseCachedLocation,
  messageNeedsDeviceLocation,
} from "@/lib/chat-client-location"

export interface ChatClientContextFields {
  client_timezone?: string
  client_latitude?: number
  client_longitude?: number
  client_location_accuracy_m?: number
}

/** Browser timezone + optional GPS for chat stream requests. */
export async function buildChatClientContext(message: string): Promise<ChatClientContextFields> {
  const client_timezone = getClientTimezone() || undefined
  const needsPrompt = messageNeedsDeviceLocation(message)
  const mayUseCached = messageMayUseCachedLocation(message)

  if (!needsPrompt && !mayUseCached) {
    return { client_timezone }
  }

  const geo = needsPrompt
    ? await getClientGeolocation({ prompt: true })
    : getCachedClientGeolocation()

  if (!geo) {
    return { client_timezone }
  }

  return {
    client_timezone,
    client_latitude: geo.latitude,
    client_longitude: geo.longitude,
    client_location_accuracy_m: geo.accuracyM,
  }
}
