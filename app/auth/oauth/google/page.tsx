"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { ROUTES } from "@/lib/routes"
import { safeRedirectPath } from "@/lib/safe-redirect"

function GoogleSignInRedirect() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = safeRedirectPath(searchParams.get("redirect_url"), ROUTES.chat)
    const callback = new URL("/api/auth/oauth/callback", window.location.origin)
    callback.searchParams.set("redirect_url", redirect)
    void signIn("google", { callbackUrl: callback.toString() })
  }, [searchParams])

  return <div className="min-h-screen bg-background" aria-busy="true" aria-label="Continuing with Google" />
}

export default function DesktopGoogleSignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <GoogleSignInRedirect />
    </Suspense>
  )
}
