import type { Metadata } from "next"
import type { CardAccent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import {
  Ban,
  LockKeyhole,
  SearchX,
  ServerCrash,
  Unplug,
  Wrench,
} from "lucide-react"
import {
  HTTP_ERROR_CATALOG,
  type HttpErrorCode,
} from "@/lib/http-errors"

export type { HttpErrorCode }

type HttpErrorPageDefinition = {
  shortTitle: string
  secLabel: string
  heading: string
  headingAccent: string
  headingRest: string
  description: string
  accent: CardAccent
  cardClassName: string
  icon: LucideIcon
  showReload: boolean
}

const HTTP_ERROR_PAGE_COPY: Partial<Record<HttpErrorCode, HttpErrorPageDefinition>> = {
  400: {
    shortTitle: "Bad request",
    secLabel: "CLIENT — 400",
    heading: "Bad ",
    headingAccent: "request",
    headingRest: "",
    description:
      "The request could not be understood — often a malformed URL, invalid body, or missing field. Double-check what you submitted and try again.",
    accent: "violet",
    cardClassName: "glass-strong glow-violet",
    icon: Ban,
    showReload: false,
  },
  401: {
    shortTitle: "Unauthorized",
    secLabel: "ACCESS — 401",
    heading: "Authentication ",
    headingAccent: "required",
    headingRest: "",
    description:
      "You need to be authenticated to open this resource. If you were already signed in, your session may have expired.",
    accent: "amber",
    cardClassName: "glass-strong glow-amber",
    icon: LockKeyhole,
    showReload: false,
  },
  404: {
    shortTitle: "Not found",
    secLabel: "ROUTING — 404",
    heading: "Page ",
    headingAccent: "not found",
    headingRest: "",
    description: "The page you requested does not exist. Choose a destination below.",
    accent: "cyan",
    cardClassName: "glass-strong glow-cyan",
    icon: SearchX,
    showReload: false,
  },
  500: {
    shortTitle: "Server error",
    secLabel: "SERVER — 500",
    heading: "Internal ",
    headingAccent: "server error",
    headingRest: "",
    description:
      "Something went wrong on our side while loading this page. Our team has been notified and is working on it. You can retry in a few minutes or head back to your workspace.",
    accent: "destructive",
    cardClassName: "glass-strong",
    icon: ServerCrash,
    showReload: true,
  },
  501: {
    shortTitle: "Not implemented",
    secLabel: "SERVER — 501",
    heading: "Not ",
    headingAccent: "implemented",
    headingRest: "",
    description:
      "This server does not support the operation that was requested. The capability may be planned, disabled in this environment, or not yet shipped.",
    accent: "cyan",
    cardClassName: "glass-strong glow-cyan",
    icon: Wrench,
    showReload: false,
  },
  502: {
    shortTitle: "Bad gateway",
    secLabel: "GATEWAY — 502",
    heading: "Bad ",
    headingAccent: "gateway",
    headingRest: "",
    description:
      "An upstream service returned an invalid or incomplete response. This is often temporary — try again in a moment.",
    accent: "sky",
    cardClassName: "glass-strong",
    icon: Unplug,
    showReload: true,
  },
}

function defaultAccent(code: HttpErrorCode): CardAccent {
  const { client } = HTTP_ERROR_CATALOG[code]
  if (code === 402) return "amber"
  if (code === 403) return "violet"
  if (code === 429) return "amber"
  if (client) return "violet"
  if (code === 503 || code === 504) return "sky"
  return "destructive"
}

function defaultPageDefinition(code: HttpErrorCode): HttpErrorPageDefinition {
  const entry = HTTP_ERROR_CATALOG[code]
  const accent = defaultAccent(code)
  const glowClass =
    accent === "cyan"
      ? "glass-strong glow-cyan"
      : accent === "sky"
        ? "glass-strong"
        : accent === "violet"
          ? "glass-strong glow-violet"
          : accent === "amber"
            ? "glass-strong glow-amber"
            : "glass-strong"

  return {
    shortTitle: entry.name,
    secLabel: `${entry.client ? "CLIENT" : "SERVER"} — ${code}`,
    heading: "",
    headingAccent: entry.name,
    headingRest: "",
    description: entry.description,
    accent,
    cardClassName: glowClass,
    icon: entry.client ? Ban : ServerCrash,
    showReload: !entry.client,
  }
}

export function getHttpErrorPageDefinition(code: HttpErrorCode): HttpErrorPageDefinition {
  return HTTP_ERROR_PAGE_COPY[code] ?? defaultPageDefinition(code)
}

export function httpStatusPageMetadata(code: HttpErrorCode): Metadata {
  const { shortTitle, description } = getHttpErrorPageDefinition(code)
  if (code === 404) {
    return { title: "Page not found — MasterNode.ai", description }
  }
  return {
    title: `${code} — ${shortTitle} — MasterNode.ai`,
    description,
  }
}
