import { apiClient } from "@/lib/api-client"
import type { CookieConsentRecord } from "@/constants/legal"

export interface CookieConsentPayload {
  consent_version: string
  consent_source: string
  analytics_consent: boolean
  preference_consent: boolean
  marketing_consent: boolean
}

export const consentService = {
  save(data: CookieConsentPayload): Promise<{ status: string; consent: CookieConsentRecord }> {
    return apiClient.post("/v1/consent", data).then((res) => res.data)
  },

  get(): Promise<{ consent: CookieConsentRecord | null }> {
    return apiClient.get("/v1/consent").then((res) => res.data)
  },
}
