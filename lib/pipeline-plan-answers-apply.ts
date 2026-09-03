import type { PipelinePlanQuestion } from "@/lib/pipeline-plan"
import { encodePlanAnswer } from "@/lib/pipeline-plan-questions"

function choiceLabel(
  question: PipelinePlanQuestion,
  chosen: string
): string {
  if (chosen.startsWith("other:")) {
    return chosen.slice(6).trim() || "Other (custom)"
  }
  if (chosen === "other") return "Other (custom)"
  const opt = question.options.find((o) => o.id === chosen)
  return opt?.label || chosen
}

function answersLabelBlob(
  questions: PipelinePlanQuestion[],
  encoded: Record<string, string>
): string {
  return questions
    .map((q) => {
      const chosen = encoded[q.id]
      if (!chosen) return ""
      return `${q.prompt} ${choiceLabel(q, chosen)}`
    })
    .join(" ")
    .toLowerCase()
}

function projectSlugFromMarkdown(markdown: string): string {
  const match = markdown.match(/^name:\s*(.+)$/im)
  const title = (match?.[1] || "project").trim()
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project"
  )
}

function replaceMarkdownSection(
  markdown: string,
  heading: string,
  bodyLines: string[]
): string {
  const block = `## ${heading}\n${bodyLines.join("\n").trimEnd()}\n`
  const re = new RegExp(
    `(##\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n)([\\s\\S]*?)(?=\\n##\\s|\\n#\\s|$)`,
    "i"
  )
  if (re.test(markdown)) return markdown.replace(re, block)
  return `${markdown.trimEnd()}\n\n${block}`
}

function codeDeliverablesForBlob(blob: string, slug: string): string[] | null {
  if (blob.includes("react") && (blob.includes("tailwind") || blob.includes("next"))) {
    return [
      `\`${slug}/package.json\`: React + Tailwind dependencies`,
      `\`${slug}/src/App.tsx\`: App shell and routing`,
      `\`${slug}/src/components/\`: Page/section components`,
      `\`${slug}/src/index.css\`: Tailwind entry styles`,
      `\`${slug}/README.md\`: Setup and run instructions`,
    ]
  }
  if (blob.includes("react")) {
    return [
      `\`${slug}/package.json\`: React project dependencies`,
      `\`${slug}/src/App.jsx\`: Main application component`,
      `\`${slug}/src/components/\`: UI components`,
      `\`${slug}/README.md\`: Setup and run instructions`,
    ]
  }
  if (blob.includes("vue")) {
    return [
      `\`${slug}/package.json\`: Vue project dependencies`,
      `\`${slug}/src/App.vue\`: Root application view`,
      `\`${slug}/src/components/\`: Page components`,
      `\`${slug}/README.md\`: Setup and run instructions`,
    ]
  }
  if (blob.includes("next")) {
    return [
      `\`${slug}/package.json\`: Next.js dependencies`,
      `\`${slug}/app/page.tsx\`: Home page`,
      `\`${slug}/app/layout.tsx\`: Root layout`,
      `\`${slug}/README.md\`: Setup and run instructions`,
    ]
  }
  if (/\b(html|css|vanilla|static)\b/.test(blob)) {
    return [
      `\`${slug}/index.html\`: Main page markup`,
      `\`${slug}/styles.css\`: Site styles`,
      `\`${slug}/script.js\`: Interactive behavior`,
      `\`${slug}/README.md\`: Setup notes`,
    ]
  }
  return null
}

function outlineForBlob(blob: string): string[] | null {
  if (
    blob.includes("multi-page") ||
    blob.includes("admissions") ||
    blob.includes("programs") ||
    blob.includes("faculty")
  ) {
    return [
      "Homepage with university positioning",
      "Admissions overview and next steps",
      "Academic programs catalog",
      "Faculty / campus life highlights",
      "Contact and visit information",
    ]
  }
  if (blob.includes("landing") || blob.includes("single-page") || blob.includes("one-page")) {
    return [
      "Hero and value proposition",
      "Key programs snapshot",
      "Campus / student life highlights",
      "Admissions CTA and contact",
    ]
  }
  return null
}

function rewritePlanBodyForAnswers(
  markdown: string,
  questions: PipelinePlanQuestion[],
  encoded: Record<string, string>
): string {
  const blob = answersLabelBlob(questions, encoded)
  if (!blob) return markdown
  let text = markdown
  const slug = projectSlugFromMarkdown(text)
  const deliverables = codeDeliverablesForBlob(blob, slug)
  if (deliverables) {
    text = replaceMarkdownSection(
      text,
      "Expected Deliverables",
      deliverables.map((line) => `- ${line}`)
    )
    text = text
      .replace(
        /(content:\s*)Scaffold project layout and dependencies/i,
        "$1Scaffold React/Tailwind (or chosen stack) project layout"
      )
      .replace(
        /(content:\s*)Design responsive layout and UI components/i,
        "$1Design responsive React + Tailwind layout and UI components"
      )
      .replace(
        /(content:\s*)Develop HTML\/CSS\/JS frontend code/i,
        "$1Develop React components and Tailwind styles"
      )
  }
  const outline = outlineForBlob(blob)
  if (outline) {
    text = replaceMarkdownSection(
      text,
      "Outline",
      outline.map((line) => `- ${line}`)
    )
  }
  if (blob.includes("react") || blob.includes("tailwind")) {
    text = replaceMarkdownSection(text, "Required Inputs", [
      "- User request (provided)",
      "- Clarified stack preference (from your answers)",
      "- Branding guidelines / university messaging",
      "- Key academic program details",
    ])
  }
  return text
}

function improveOutlineForChoice(markdown: string, emphasis: string): string {
  if (!emphasis || !/##\s*Outline\b/i.test(markdown)) return markdown
  const pin = `- **User priority:** ${emphasis}`
  if (/user priority:/i.test(markdown)) {
    return markdown.replace(
      /(##\s*Outline\s*\n)(?:- \*\*User priority:\*\*[^\n]*\n)?/i,
      `$1${pin}\n`
    )
  }
  return markdown.replace(/(##\s*Outline\s*\n)/i, `$1${pin}\n`)
}

/**
 * Mirror backend apply_question_answers_to_plan — fold MCQ answers into the
 * plan markdown so the Proposed Plan updates as the user answers.
 */
export function applyAnswersToPlanMarkdown(
  planMarkdown: string,
  questions: PipelinePlanQuestion[],
  answers: Record<string, string>,
  customAnswers: Record<string, string> = {}
): string {
  const base = (planMarkdown || "").trim()
  if (!questions.length) return base

  const encoded: Record<string, string> = {}
  for (const q of questions) {
    const raw = answers[q.id]
    if (!raw) continue
    encoded[q.id] = encodePlanAnswer(raw, customAnswers[q.id])
  }
  if (Object.keys(encoded).length === 0) {
    return base
      .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n##\s*Clarifications to resolve\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n##\s*Master review\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  const choiceLines: string[] = []
  const updateLines: string[] = []
  let primaryEmphasis = ""
  for (const q of questions) {
    const chosen = encoded[q.id]
    if (!chosen) continue
    const label = choiceLabel(q, chosen)
    choiceLines.push(`- **${q.prompt}** → ${label}`)
    updateLines.push(`- Resolved “${q.prompt}”: **${label}**`)
    if (!primaryEmphasis) primaryEmphasis = label
  }

  let cleaned = base
    .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
    .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
    .replace(/\n##\s*Clarifications to resolve\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
    .replace(/\n##\s*Master review\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (primaryEmphasis) {
    cleaned = cleaned.replace(
      /(##\s*Objective\s*\n)([^\n#]+)/i,
      (_, heading: string, body: string) => {
        const stripped = body.replace(/[.\s]*Priority:.*$/i, "").replace(/[.\s]+$/, "").trim()
        return `${heading}${stripped}. Priority: ${primaryEmphasis}`
      }
    )
    cleaned = improveOutlineForChoice(cleaned, primaryEmphasis)
  }

  cleaned = rewritePlanBodyForAnswers(cleaned, questions, encoded)

  if (updateLines.length) {
    cleaned = `${cleaned.trim()}\n\n## Clarification updates\n${updateLines.join("\n")}\n`
  }

  if (!choiceLines.length) return cleaned
  return `${cleaned.trim()}\n\n## Your choices\n${choiceLines.join("\n")}\n`
}
