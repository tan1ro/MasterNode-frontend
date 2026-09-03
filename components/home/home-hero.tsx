"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play } from "lucide-react"
import { PI_LOGO_HERO } from "@/constants/branding-assets"
import { HomeHeroLivePrompt } from "@/components/home/home-hero-live-prompt"
import { HomeHeroTrustStrip } from "@/components/home/home-hero-trust-strip"

const HERO_HEADLINE_LINES = ["One Prompt.", "Every Domain.", "In Parallel."] as const
const HERO_TAGLINE = "Your prompt. Every leading AI model. One place."

export function HomeHero({
  ctaHref,
  isSignedIn,
}: {
  ctaHref: string
  isSignedIn: boolean
}) {
  return (
    <section className="home-hero relative overflow-hidden px-5 pb-6 pt-[calc(var(--home-landing-nav-height)+0.25rem)] sm:px-8 sm:pb-20 sm:pt-[calc(var(--home-landing-nav-height)+1.25rem)] lg:px-12 lg:pb-24 lg:pt-[calc(var(--home-landing-nav-height)+1.5rem)] xl:px-16">
      <div className="home-hero-frame relative z-10 mx-auto flex w-full max-w-none flex-col items-center">
        <div className="home-hero-stack w-full">
          <div
            className="home-hero-enter home-hero-mark flex items-center justify-center"
            style={{ animationDelay: "0ms" }}
          >
            <Image
              src={PI_LOGO_HERO.src}
              alt=""
              width={PI_LOGO_HERO.width}
              height={PI_LOGO_HERO.height}
              priority
              aria-hidden
              className="home-hero-logo"
            />
          </div>

          <div className="home-hero-copy text-center">
            <h1 className="home-hero-title home-hero-title-uniform font-bold tracking-tight text-foreground">
              {HERO_HEADLINE_LINES.map((line, index) => (
                <span
                  key={line}
                  className="home-hero-title-line home-hero-reveal-line"
                  style={{ animationDelay: `${140 + index * 110}ms` }}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p
              className="home-hero-tagline home-hero-reveal-tagline mx-auto mt-4 max-w-[20rem] text-[0.9375rem] leading-snug text-muted-foreground sm:mt-8 sm:max-w-xl sm:text-xl sm:leading-relaxed"
              style={{ animationDelay: "480ms" }}
            >
              {HERO_TAGLINE}
            </p>

            {/* Demo prompt: desktop/tablet only — keeps mobile first viewport to brand + copy + CTAs */}
            <div
              className="home-hero-enter mx-auto mt-6 hidden w-full max-w-xl sm:mt-10 sm:block"
              style={{ animationDelay: "560ms" }}
            >
              <HomeHeroLivePrompt />
            </div>

            <div
              className="home-hero-enter mt-7 flex w-full max-w-sm flex-col items-stretch gap-3.5 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
              style={{ animationDelay: "640ms" }}
            >
              <Link
                href={ctaHref}
                className="home-cta-gradient inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-[#0D0D10] transition-opacity hover:opacity-90 sm:px-6 sm:py-3 sm:text-base"
              >
                {isSignedIn ? "Open workspace" : "Get started free"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="#pipeline"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[#2DCFCF]/50 dark:border-white/16 sm:px-6 sm:py-3 sm:text-base"
              >
                <Play className="h-4 w-4 fill-[#2DCFCF] text-[#2DCFCF]" aria-hidden />
                See how it works
              </Link>
            </div>

            <HomeHeroTrustStrip
              className="home-hero-trust-below-actions home-hero-enter mt-7 hidden sm:mt-9 sm:flex"
              style={{ animationDelay: "720ms" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
