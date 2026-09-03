"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"

export default function AnalyticsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(ROUTES.dashboard)
  }, [router])

  return (
    <div className="container mx-auto p-6 text-sm text-muted-foreground">
      Redirecting to dashboard…
    </div>
  )
}
