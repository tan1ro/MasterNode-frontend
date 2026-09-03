/** Helpers for chat fenced-code language labels and Shiki language resolution. */

export function languageIdFromClassName(className?: string | null): string {
  const match = /language-([a-z0-9_+#-]+)/i.exec(className || "")
  return normalizeLanguageId(match?.[1] || "")
}

/** Map aliases so presets and labels stay consistent. */
export function normalizeLanguageId(id: string): string {
  const key = (id || "").toLowerCase().trim()
  if (!key) return ""
  if (key === "c++" || key === "cxx" || key === "cc" || key === "hpp" || key === "hh") return "cpp"
  if (key === "h") return "c"
  if (key === "py") return "python"
  if (key === "rs") return "rust"
  if (key === "js" || key === "mjs" || key === "cjs") return "javascript"
  if (key === "ts") return "typescript"
  if (key === "jsx") return "jsx"
  if (key === "tsx") return "tsx"
  if (key === "cs" || key === "csharp") return "csharp"
  if (key === "sh" || key === "zsh" || key === "shell" || key === "bash") return "bash"
  if (key === "yml") return "yaml"
  if (key === "plaintext" || key === "txt" || key === "code") return "text"
  if (key === "ascii") return "diagram"
  return key
}

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  jsx: "JSX",
  typescript: "TypeScript",
  tsx: "TSX",
  python: "Python",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  scss: "SCSS",
  html: "HTML",
  xml: "XML",
  json: "JSON",
  yaml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  bash: "Shell",
  sql: "SQL",
  diff: "Diff",
  text: "Text",
  diagram: "Diagram",
  output: "Output",
  php: "PHP",
  kotlin: "Kotlin",
  swift: "Swift",
  scala: "Scala",
}

export function languageLabelFromId(id: string): string {
  const key = normalizeLanguageId(id)
  if (!key || key === "text") return "Code"
  return LANGUAGE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

export function languageLabelFromClassName(className?: string | null): string {
  return languageLabelFromId(languageIdFromClassName(className))
}

const GENERIC_LANG = new Set(["", "text"])
const NO_HIGHLIGHT_LANG = new Set(["diagram", "output"])

/** ASCII / recursion-tree style blocks that must stay monospace-aligned. */
export function looksLikeAsciiDiagram(code: string): boolean {
  const lines = (code || "").split("\n")
  if (lines.length < 3) return false
  const re = /[│|/\\└├┌┐┘┴┬┼─━┃↓↑→←═╔╗╚╝▼▲►◄]/
  let hits = 0
  for (const line of lines) {
    if (
      re.test(line) ||
      /^\s*[|/\\]{1,3}\s/.test(line) ||
      /\bPivot\s*=/.test(line) ||
      /Combine\s*(back)?/i.test(line) ||
      /↓/.test(line)
    ) {
      hits += 1
    }
  }
  return hits >= 2
}

/** Heuristic: fenced body looks like real source (should be colored). */
export function looksLikeSourceCode(code: string): boolean {
  const q = (code || "").trim()
  if (q.length < 6 || looksLikeAsciiDiagram(q)) return false
  if (/#include\b|\bprintf\s*\(|\bmalloc\s*\(/.test(q)) return true
  if (/[{;}]/.test(q) && /\b(void|int|return|if|for|while|class|def|function|const|let|var|public|private|fn|func)\b/.test(q))
    return true
  if (/^\s*(package|import|using)\s+/m.test(q)) return true
  if (/=>\s*\{|console\.(log|error)\b/.test(q)) return true
  return false
}

export function shouldHighlightChatCode(languageId: string, code: string): boolean {
  if (looksLikeAsciiDiagram(code)) return false
  const id = normalizeLanguageId(languageId)
  if (NO_HIGHLIGHT_LANG.has(id)) return false
  if (id && !GENERIC_LANG.has(id)) return true
  if (looksLikeSourceCode(code)) return true
  // Multiline fenced blocks from the assistant should still get token colors.
  return (code || "").split("\n").length >= 2
}

/**
 * Auto-detect language from source when the fence has no useful language tag.
 * Prefer an explicit className language when present.
 */
export function detectCodeLanguage(code: string, className?: string | null): string {
  const fromClass = languageIdFromClassName(className)
  if (fromClass === "diagram") return "diagram"
  if (fromClass === "output") return "output"
  if (fromClass && !GENERIC_LANG.has(fromClass)) return fromClass

  const q = (code || "").trim()
  if (!q) return "text"

  if (looksLikeAsciiDiagram(q)) return "diagram"

  if (/^#{1,6}\s|^\*\*|^\-\s|\[[^\]]+\]\([^)]+\)/m.test(q) && !/[{};]/.test(q.slice(0, 80))) {
    return "markdown"
  }
  if (/^\s*[{[]/.test(q) && /"[^"]+"\s*:/.test(q)) return "json"
  if (/^(SELECT|INSERT|UPDATE|DELETE|WITH|CREATE)\b/im.test(q)) return "sql"
  if (/^(diff --git|--- |\+\+\+ |@@ )/m.test(q)) return "diff"
  if (/^\s*(\.|#)[\w-]+\s*\{|^\s*@media\b/m.test(q)) return "css"

  // C / C++ before HTML — `#include <stdio.h>` must not be treated as markup.
  if (
    /#include\s*[<"]/.test(q) ||
    /\b(stdio|stdlib|string|math)\.h\b/.test(q) ||
    /\b(printf|scanf|malloc|free|sizeof)\s*\(/.test(q)
  ) {
    if (/\b(std::|cout\s*<<|cin\s*>>|template\s*<|namespace\s+\w+|nullptr)\b/.test(q)) return "cpp"
    if (/\bclass\s+\w+/.test(q) && /public\s*:/.test(q)) return "cpp"
    return "c"
  }
  if (/\b(std::|cout\s*<<|cin\s*>>|nullptr)\b/.test(q)) return "cpp"

  if (/<!DOCTYPE|<html[\s>]|<\/?(div|span|p|body|head|script|style)\b/i.test(q)) return "html"

  if (/\bdef\s+\w+\s*\(|\bimport\s+\w+|from\s+\w+\s+import\b|\belif\b|\bNone\b|\bTrue\b|\bFalse\b/.test(q))
    return "python"
  if (/\bfunc\s+\w+|package\s+\w+|fmt\.|:=/.test(q)) return "go"
  if (/\bfn\s+\w+|let\s+mut\b|impl\s+|println!/.test(q)) return "rust"
  if (/\busing\s+System\b|\bConsole\.(Write|WriteLine)\b|\bnamespace\s+\w+\s*\{/.test(q)) return "csharp"
  if (/\bpublic\s+(class|interface|static)\b|\bSystem\.out\b/.test(q)) return "java"
  if (/\binterface\s+\w+|:\s*[A-Z]\w*\s*[=;]|import\s+type\b|\btype\s+\w+\s*=/.test(q))
    return "typescript"
  if (/\bfunction\s+\w+|const\s+\w+\s*=|=>\s*\{|console\.(log|error)\b/.test(q)) return "javascript"
  if (/<\?php|\becho\s+['"]/.test(q)) return "php"
  if (/\bfun\s+\w+/.test(q) && /\bval\s+\w+\s*=/.test(q)) return "kotlin"
  if (/^\s*#!/.test(q) || /\becho\b|\bexport\s+\w+=|^\s*if\s+\[\s/.test(q)) return "bash"
  if (/^\s*(apiVersion|kind):\s/m.test(q)) return "yaml"

  return fromClass || "text"
}

/** Copy text with clipboard API + textarea fallback. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const payload = text ?? ""
  if (!payload) return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload)
      return true
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = payload
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.left = "-9999px"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
