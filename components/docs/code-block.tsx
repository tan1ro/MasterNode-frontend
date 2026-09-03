"use client"

import { Copy } from "lucide-react"

type CodeLanguage = "python" | "javascript" | "curl"

interface CodeBlockProps {
  code?: string
  id: string
  examples?: Record<string, string>
  activeTab: CodeLanguage
  setActiveTab: (lang: CodeLanguage) => void
  copiedCode: string | null
  onCopy: (text: string, id: string) => void
}

export function CodeBlock({
  code,
  id,
  examples,
  activeTab,
  setActiveTab,
  copiedCode,
  onCopy,
}: CodeBlockProps) {
  const codeToShow = examples
    ? examples[activeTab] ||
      examples["python"] ||
      examples["javascript"] ||
      Object.values(examples)[0]
    : code || ""

  const hasMultipleExamples = examples && Object.keys(examples).length > 1

  return (
    <div className="group relative">
      {hasMultipleExamples && (
        <div className="mb-2 flex gap-1 border-b border-white/10">
          {Object.keys(examples).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang as CodeLanguage)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === lang
                  ? "border-b-2 border-amber text-amber"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {lang === "python"
                ? "Python"
                : lang === "javascript"
                  ? "JavaScript"
                  : "cURL"}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-sm backdrop-blur-sm">
        <pre className="whitespace-pre-wrap text-white/90">{codeToShow}</pre>
      </div>
      <button
        onClick={() => onCopy(codeToShow, id)}
        className="absolute right-2 top-2 rounded bg-white/5 p-2 text-white/60 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
        title="Copy to clipboard"
      >
        <Copy className="h-4 w-4" />
      </button>
      {copiedCode === id && (
        <div className="absolute right-2 top-2 rounded bg-amber px-2 py-1 text-xs font-medium text-black">
          Copied!
        </div>
      )}
    </div>
  )
}

export type { CodeLanguage, CodeBlockProps }
