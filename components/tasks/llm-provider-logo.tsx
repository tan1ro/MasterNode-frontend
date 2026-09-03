"use client"

import Image from "next/image"
import { Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Real brand logo image files (served from /public/provider-logos).
 * `contain` keeps the mark intact; `bg` gives light marks a readable backdrop.
 */
const PROVIDER_IMAGES: Record<string, { src: string; bg?: string }> = {
  OPENAI: { src: "/provider-logos/openai.jpg" },
  ANTHROPIC: { src: "/provider-logos/anthropic.png" },
  GEMINI: { src: "/provider-logos/gemini.webp", bg: "#ffffff" },
  MISTRAL: { src: "/provider-logos/mistral.webp", bg: "#ffffff" },
  GROQ: { src: "/provider-logos/groq.png" },
  OPENROUTER: { src: "/provider-logos/openrouter.png" },
}

/**
 * Normalized provider label -> canonical logo key.
 * Metrics may surface providers under a few aliases (e.g. GOOGLE == GEMINI).
 */
const PROVIDER_ALIASES: Record<string, string> = {
  GOOGLE: "GEMINI",
  GEMINI: "GEMINI",
  CLAUDE: "ANTHROPIC",
  ANTHROPIC: "ANTHROPIC",
  OPENAI: "OPENAI",
  GPT: "OPENAI",
  CHATGPT: "OPENAI",
  MISTRAL: "MISTRAL",
  MISTRALAI: "MISTRAL",
  GROQ: "GROQ",
  DEEPSEEK: "DEEPSEEK",
  COHERE: "COHERE",
  OPENROUTER: "OPENROUTER",
  XAI: "GROK",
  GROK: "GROK",
}

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  OPENAI: "OpenAI",
  GEMINI: "Gemini",
  ANTHROPIC: "Claude",
  MISTRAL: "Mistral",
  GROQ: "Groq",
  DEEPSEEK: "DeepSeek",
  COHERE: "Cohere",
  OPENROUTER: "OpenRouter",
  GROK: "Grok",
  DEFAULT: "Auto-route",
}

export function resolveProviderLogoKey(provider: string): string {
  const key = String(provider || "").trim().toUpperCase()
  if (!key || key === "DEFAULT") return "DEFAULT"
  return PROVIDER_ALIASES[key] ?? key
}

/** Human-friendly display name for a normalized provider label. */
export function formatProviderDisplayName(provider: string): string {
  const key = resolveProviderLogoKey(provider)
  return (
    PROVIDER_DISPLAY_NAMES[key] ??
    provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase()
  )
}

function MonogramGlyph({ letter }: { letter: string }) {
  return (
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
      fontWeight="700"
      fill="currentColor"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {letter}
    </text>
  )
}

interface BrandTile {
  /** Background of the rounded tile. */
  bg: string
  /** Foreground/glyph color. */
  fg: string
  /** Whether the tile needs a subtle border (light tiles on light bg). */
  bordered?: boolean
  glyph: React.ReactNode
}

function buildTile(key: string): BrandTile {
  switch (key) {
    case "OPENAI":
      return {
        bg: "#10A37F",
        fg: "#ffffff",
        glyph: (
          <g fill="currentColor">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                cx="12"
                cy="6.4"
                rx="2.05"
                ry="4.7"
                transform={`rotate(${a} 12 12)`}
              />
            ))}
          </g>
        ),
      }
    case "GEMINI":
      return {
        bg: "#ffffff",
        fg: "#4285F4",
        bordered: true,
        glyph: (
          <path
            d="M12 1.5c.35 5 2.15 8.65 9.5 10.5-7.35 1.85-9.15 5.5-9.5 10.5-.35-5-2.15-8.65-9.5-10.5C9.85 10.15 11.65 6.5 12 1.5Z"
            fill="url(#gemini-grad)"
          />
        ),
      }
    case "ANTHROPIC":
      return {
        bg: "#D97757",
        fg: "#ffffff",
        glyph: (
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <line
                key={a}
                x1="12"
                y1="4"
                x2="12"
                y2="20"
                transform={`rotate(${a} 12 12)`}
              />
            ))}
          </g>
        ),
      }
    case "MISTRAL":
      return {
        bg: "transparent",
        fg: "#ffffff",
        glyph: (
          <g>
            <rect x="2" y="3" width="20" height="3.6" fill="#FFD800" />
            <rect x="2" y="7.6" width="20" height="3.6" fill="#FFAF00" />
            <rect x="2" y="12.2" width="20" height="3.6" fill="#FF8205" />
            <rect x="2" y="16.8" width="20" height="3.6" fill="#FA500F" />
          </g>
        ),
      }
    case "GROQ":
      return { bg: "#F55036", fg: "#ffffff", glyph: <MonogramGlyph letter="G" /> }
    case "DEEPSEEK":
      return { bg: "#4D6BFE", fg: "#ffffff", glyph: <MonogramGlyph letter="D" /> }
    case "COHERE":
      return { bg: "#39594D", fg: "#ffffff", glyph: <MonogramGlyph letter="C" /> }
    case "OPENROUTER":
      return { bg: "#6467F2", fg: "#ffffff", glyph: <MonogramGlyph letter="O" /> }
    case "GROK":
      return { bg: "#111111", fg: "#ffffff", glyph: <MonogramGlyph letter="✕" /> }
    default:
      return {
        bg: "transparent",
        fg: "currentColor",
        bordered: true,
        glyph: null,
      }
  }
}

export function LlmProviderLogo({
  provider,
  className,
  title,
}: {
  provider: string
  className?: string
  title?: string
}) {
  const key = resolveProviderLogoKey(provider)
  const label = title ?? formatProviderDisplayName(provider)

  const image = PROVIDER_IMAGES[key]
  if (image) {
    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-md border border-border/60",
          className
        )}
        style={image.bg ? { backgroundColor: image.bg } : undefined}
        role="img"
        aria-label={label}
        title={label}
      >
        <Image
          src={image.src}
          alt={label}
          fill
          sizes="32px"
          className="object-contain p-0.5"
        />
      </span>
    )
  }

  const tile = buildTile(key)

  if (key === "DEFAULT") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground",
          className
        )}
        role="img"
        aria-label={label}
        title={label}
      >
        <Cpu className="h-[58%] w-[58%]" aria-hidden />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-md",
        tile.bordered && "border border-border/60",
        className
      )}
      style={{ backgroundColor: tile.bg, color: tile.fg }}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
        {key === "GEMINI" ? (
          <defs>
            <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="45%" stopColor="#9B72CB" />
              <stop offset="100%" stopColor="#D96570" />
            </linearGradient>
          </defs>
        ) : null}
        {tile.glyph}
      </svg>
    </span>
  )
}
