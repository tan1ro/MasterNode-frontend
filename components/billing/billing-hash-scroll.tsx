"use client"

import { useEffect } from "react"

/** Scroll to `#usage` or `#invoices` when opening billing from settings links. */
export function BillingHashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    const id = hash
    const scroll = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    const t = window.setTimeout(scroll, 0)
    return () => window.clearTimeout(t)
  }, [])

  return null
}
