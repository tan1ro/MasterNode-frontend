"use client"

import { HomeScrollSquares } from "@/components/home/home-scroll-squares"
import { HomeGridBackdrop } from "@/components/home/home-grid-backdrop"
import { HomeLandingFooter } from "@/components/home/home-landing-footer"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { cn } from "@/lib/utils"

export function HomePageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "home-landing relative isolate min-h-screen overflow-x-clip bg-background font-sans text-foreground",
        HOME_FONT_CLASS,
        className
      )}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="relative flex-1">
          <HomeGridBackdrop scoped />
          <HomeScrollSquares />
          <div className="relative z-10">{children}</div>
        </div>
        <HomeLandingFooter />
      </div>
    </div>
  )
}
