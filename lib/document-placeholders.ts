import type { AppUser } from "@/lib/app-auth"

export interface DocumentAuthor {
  displayName: string
  company: string
  nameCompany: string
  date: string
}

export function formatDocumentDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function resolveAuthorFromUser(user: AppUser | null | undefined): DocumentAuthor {
  const displayName =
    user?.username?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    user?.id?.slice(0, 12) ||
    "Author"
  const company = user?.organization?.name?.trim() || displayName
  const nameCompany = company === displayName ? displayName : `${displayName} / ${company}`
  return {
    displayName,
    company,
    nameCompany,
    date: formatDocumentDate(),
  }
}

export function applyDocumentPlaceholders(text: string, author: DocumentAuthor): string {
  if (!text) return text
  const replacements: Array<[RegExp, string]> = [
    [/\[Insert Date\]/gi, author.date],
    [/\[Your Name\/Company\]/gi, author.nameCompany],
    [/\[Your Name\]/gi, author.displayName],
    [/\[Your Company\]/gi, author.company],
    [/\[Insert Name\]/gi, author.displayName],
    [/<Your Name \/ Team>/gi, author.displayName],
    [/\[Your Name\/Team\]/gi, author.displayName],
  ]
  let out = text
  for (const [pattern, value] of replacements) {
    out = out.replace(pattern, value)
  }
  return out
}
