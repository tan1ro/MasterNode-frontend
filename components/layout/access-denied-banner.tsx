"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"

export function AccessDeniedBanner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const denied = searchParams.get("denied")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [denied, pathname])

  if (!denied || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    const next = new URLSearchParams(searchParams.toString())
    next.delete("denied")
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="shrink-0 px-4 pt-2">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 pt-4">
          <Callout type="warning" title="Access denied">
            <p className="text-sm mb-3">
              Your account role cannot open <code className="text-xs bg-muted px-1 rounded">{denied}</code>.
              Contact an admin or switch workspace if you need this page.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={dismiss}>
              Dismiss
            </Button>
          </Callout>
        </div>
      </div>
    </div>
  )
}
