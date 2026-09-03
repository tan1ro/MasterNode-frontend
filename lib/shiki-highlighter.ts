/** Shiki syntax highlighting — fence language passed through; no custom grammars. */

import { bundledLanguages, type BundledLanguage } from "shiki"
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import { languageLabelFromId } from "@/lib/chat-code-language"
import {
  MASTERNODE_EDITOR_DARK,
  MASTERNODE_EDITOR_LIGHT,
  MASTERNODE_SHIKI_THEME_DARK,
  MASTERNODE_SHIKI_THEME_LIGHT,
  SHIKI_THEME_DARK,
  SHIKI_THEME_LIGHT,
} from "@/lib/masternode-editor-theme"

export { SHIKI_THEME_DARK, SHIKI_THEME_LIGHT }

export type ShikiColorScheme = "light" | "dark"

export function shikiThemeForColorScheme(
  scheme: ShikiColorScheme
): typeof SHIKI_THEME_DARK | typeof SHIKI_THEME_LIGHT {
  return scheme === "dark" ? SHIKI_THEME_DARK : SHIKI_THEME_LIGHT
}

const BUNDLED_LANG_SET = new Set(Object.keys(bundledLanguages))

/** Read the language id from a react-markdown `language-*` class (``` fence tag). */
export function languageFromFence(className?: string | null): string | null {
  const match = /language-([a-z0-9_+#.-]+)/i.exec(className || "")
  const id = match?.[1]?.trim().toLowerCase()
  return id || null
}

export function badgeLabelForCodeBlock(fenceLanguage: string | null, filename?: string): string {
  if (filename?.trim()) return filename.trim()
  if (!fenceLanguage) return "Code"
  return languageLabelFromId(fenceLanguage)
}

export function isShikiBundledLanguage(lang: string): boolean {
  return BUNDLED_LANG_SET.has(lang.toLowerCase())
}

export function bundledLanguageCount(): number {
  return BUNDLED_LANG_SET.size
}

let highlighterPromise: Promise<HighlighterCore> | null = null
const loadedLangs = new Set<string>()

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [MASTERNODE_SHIKI_THEME_DARK, MASTERNODE_SHIKI_THEME_LIGHT],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

async function ensureBundledLanguage(
  highlighter: HighlighterCore,
  lang: string
): Promise<string | null> {
  const id = lang.toLowerCase().trim()
  if (!id || !BUNDLED_LANG_SET.has(id)) return null
  if (!loadedLangs.has(id)) {
    await highlighter.loadLanguage(bundledLanguages[id as BundledLanguage]())
    loadedLangs.add(id)
  }
  return id
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Plain fallback using the same MasterNode theme chrome as highlighted blocks. */
function highlightAsPlainText(code: string, theme: string): string {
  const tokens = theme === SHIKI_THEME_LIGHT ? MASTERNODE_EDITOR_LIGHT : MASTERNODE_EDITOR_DARK
  const lines = code
    .split("\n")
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join("\n")
  return `<pre class="shiki ${theme}" style="background-color:${tokens.editorBackground};color:${tokens.editorForeground}"><code>${lines}</code></pre>`
}

/**
 * Highlight with Shiki. Uses the fence language as-is when Shiki supports it.
 * Falls back to Shiki plain `text` when the fence tag is missing or unknown.
 */
export async function highlightCodeWithShiki(
  code: string,
  fenceLanguage: string | null,
  colorScheme: ShikiColorScheme = "dark"
): Promise<string> {
  const theme = shikiThemeForColorScheme(colorScheme)
  const highlighter = await getHighlighter()
  const lang = fenceLanguage?.trim().toLowerCase() || null

  if (lang) {
    const bundled = await ensureBundledLanguage(highlighter, lang)
    if (bundled) {
      try {
        return highlighter.codeToHtml(code, { lang: bundled, theme })
      } catch {
        /* fall through to plain text */
      }
    }
  }

  return highlightAsPlainText(code, theme)
}
