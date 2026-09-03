"use client"

import { useEffect, useRef, useState } from "react"
import { normalizeEmail, SIGNUP_EMAIL_EXISTS_MESSAGE, validateEmail } from "@/lib/auth-validation"
import { authService } from "@/services/auth"

export type EmailAvailabilityStatus = "idle" | "checking" | "available" | "taken" | "degraded"

const DEBOUNCE_MS = 450

export function useEmailAvailability(email: string) {
  const [status, setStatus] = useState<EmailAvailabilityStatus>("idle")
  const lastCheckedRef = useRef("")

  useEffect(() => {
    const formatError = validateEmail(email)
    if (formatError) {
      setStatus("idle")
      lastCheckedRef.current = ""
      return
    }

    const normalized = normalizeEmail(email)
    if (normalized !== lastCheckedRef.current) {
      setStatus("idle")
    }

    let cancelled = false
    const controller = new AbortController()

    const timer = window.setTimeout(() => {
      if (normalized === lastCheckedRef.current) return
      setStatus("checking")
      void authService
        .checkEmail(normalized, { signal: controller.signal })
        .then((res) => {
          if (cancelled) return
          lastCheckedRef.current = normalized
          if (res.degraded) {
            setStatus("degraded")
            return
          }
          setStatus(res.exists ? "taken" : "available")
        })
        .catch(() => {
          if (cancelled || controller.signal.aborted) return
          lastCheckedRef.current = normalized
          setStatus("degraded")
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [email])

  const errorMessage = status === "taken" ? SIGNUP_EMAIL_EXISTS_MESSAGE : undefined

  return {
    status,
    isTaken: status === "taken",
    isChecking: status === "checking",
    isDegraded: status === "degraded",
    errorMessage,
  }
}
