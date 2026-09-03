const GEO_CACHE_KEY = "masternode_client_geo_v1"
const GEO_CACHE_MAX_AGE_MS = 30 * 60 * 1000

export interface ClientGeolocation {
  latitude: number
  longitude: number
  accuracyM?: number
  cachedAt: number
}

function readGeoCache(): ClientGeolocation | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClientGeolocation
    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number" ||
      typeof parsed.cachedAt !== "number"
    ) {
      return null
    }
    if (Date.now() - parsed.cachedAt > GEO_CACHE_MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeGeoCache(geo: ClientGeolocation) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getCachedClientGeolocation(): ClientGeolocation | null {
  return readGeoCache()
}

/** True when the message should use device GPS (browser will prompt if needed). */
export function messageNeedsDeviceLocation(message: string): boolean {
  const text = (message || "").trim().toLowerCase()
  if (!text) return false
  return (
    /\bwhere am i\b/.test(text) ||
    /\bwhat(?:'s| is) my location\b/.test(text) ||
    /\bmy current location\b/.test(text) ||
    /\bwhere am i located\b/.test(text) ||
    /\blocate me\b/.test(text) ||
    /\bfind me on (?:the )?map\b/.test(text)
  )
}

/** True when cached device coords help (weather/time here, local food) without forcing a prompt. */
export function messageMayUseCachedLocation(message: string): boolean {
  const text = (message || "").trim().toLowerCase()
  if (!text) return false
  if (messageNeedsDeviceLocation(text)) return true
  // Named city (“weather in Paris”) does not need device coords — server geocodes the place.
  const hasNamedPlace =
    /\b(?:weather|forecast|temperature|rain)\s+(?:in|at|for)\s+\S+/i.test(text) ||
    /^[a-z][\w\s\-'.]{1,70}\s+(?:weather|forecast|temperature|rain)\b/i.test(text)
  if (hasNamedPlace) return false
  return (
    /\bweather\b/.test(text) ||
    /\bforecast\b/.test(text) ||
    /\bweather here\b/.test(text) ||
    /\blocal weather\b/.test(text) ||
    /\bweather (?:for me|at my location)\b/.test(text) ||
    /\bwhat(?:'s|s| is) the weather\b/.test(text) ||
    /\bhow(?:'s|s| is) the weather\b/.test(text) ||
    /\bnear me\b/.test(text) ||
    /\bnearby\b/.test(text) ||
    /\b(restaurant|restaurants|food place|eatery|cafe|chinese food|best .+ in)\b/.test(text)
  )
}

export async function getClientGeolocation(options?: {
  prompt?: boolean
}): Promise<ClientGeolocation | null> {
  const cached = readGeoCache()
  if (cached && !options?.prompt) return cached

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return cached
  }

  if (!options?.prompt && !cached) return null

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo: ClientGeolocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyM: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined,
          cachedAt: Date.now(),
        }
        writeGeoCache(geo)
        resolve(geo)
      },
      () => resolve(cached),
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: GEO_CACHE_MAX_AGE_MS,
      }
    )
  })
}
