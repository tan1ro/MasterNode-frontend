import type { WebSearchSource } from "@/types/api"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"

/** Search-engine provider ids — not useful as publisher labels in the UI. */
const SEARCH_PROVIDER_IDS = new Set([
  "ddgs",
  "duckduckgo",
  "tavily",
  "wikipedia",
  "none",
  "google",
  "bing",
])

/** Known host → readable publisher names. */
const SITE_LABEL_OVERRIDES: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  quora: "Quora",
  medium: "Medium",
  reddit: "Reddit",
  stackoverflow: "Stack Overflow",
  wikipedia: "Wikipedia",
  youtube: "YouTube",
  twitter: "X",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  timesofindia: "The Times of India",
  careers360: "Careers360",
  indianexpress: "The Indian Express",
  shiksha: "Shiksha",
  collegepravesh: "College Pravesh",
  indiatoday: "India Today",
  thehindu: "The Hindu",
  economictimes: "The Economic Times",
  ndtv: "NDTV",
  inc42: "Inc42",
  yourstory: "YourStory",
  espncricinfo: "ESPNcricinfo",
  cricbuzz: "Cricbuzz",
  iplt20: "IPL",
}

function hostBaseLabel(host: string): string {
  const parts = host.split(".").filter(Boolean)
  if (parts.length === 0) return host
  if (parts[0] === "www" && parts.length > 1) {
    parts.shift()
  }
  if (parts[0] === "en" && parts[1] === "wikipedia") {
    return SITE_LABEL_OVERRIDES.wikipedia
  }
  const base = parts[0] || host
  const override = SITE_LABEL_OVERRIDES[base.toLowerCase()]
  if (override) return override
  return base.charAt(0).toUpperCase() + base.slice(1)
}

export function siteLabelFromUrl(url: string): string {
  const host = hostnameFromUrl(url)
  if (!host) return "Source"
  return hostBaseLabel(host)
}

export function displayHostname(url: string): string {
  return hostnameFromUrl(url)
}

export function siteLabelFromSource(source: WebSearchSource): string {
  const url = source.url?.trim()
  if (url) return siteLabelFromUrl(url)

  const raw = source.source?.trim()
  if (raw && !SEARCH_PROVIDER_IDS.has(raw.toLowerCase())) {
    if (!raw.includes(".") && raw.length <= 40) {
      return raw.charAt(0).toUpperCase() + raw.slice(1)
    }
    if (raw.includes(".")) return siteLabelFromUrl(`https://${raw}`)
  }
  return "Source"
}

export interface GroupedWebSearchSource {
  label: string
  sources: WebSearchSource[]
}

export function groupSourcesBySite(sources: WebSearchSource[]): GroupedWebSearchSource[] {
  const map = new Map<string, WebSearchSource[]>()
  for (const source of sources) {
    const label = siteLabelFromSource(source)
    const bucket = map.get(label) || []
    bucket.push(source)
    map.set(label, bucket)
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, sources: items }))
}

export function citationPillLabel(group: GroupedWebSearchSource): string {
  const extra = group.sources.length - 1
  return extra > 0 ? `${group.label} +${extra}` : group.label
}
