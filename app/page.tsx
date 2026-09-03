"use client"

import { useEffect } from "react"
import {
  HomePageShell,
  HomeHero,
  HomeFeatures,
  HomePipeline,
  HomePipelineModeSection,
  HomeDesktopAppSection,
  HomeLandingPricing,
  HomeStats,
  HomeUseCaseNetwork,
} from "@/components/home"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"

export default function Home() {
  const { isSignedIn, accountType } = useAppAuth()
  const ctaHref = isSignedIn
    ? ROLE_HOME[parseRole(accountType) ?? "creator"]
    : ROUTES.signUp

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash !== "#pricing") return
    const el = document.getElementById("pricing")
    if (!el) return
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [])

  return (
    <HomePageShell>
      <HomeHero ctaHref={ctaHref} isSignedIn={isSignedIn} />
      <HomeFeatures />
      <HomePipelineModeSection ctaHref={ctaHref} />
      <HomeDesktopAppSection />
      <HomePipeline />
      <HomeUseCaseNetwork />
      <HomeStats />
      <HomeLandingPricing ctaHref={ctaHref} allowCheckout={isSignedIn} />
    </HomePageShell>
  )
}
