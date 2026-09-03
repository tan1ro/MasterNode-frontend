import { describe, expect, it } from "vitest"
import {
  buildPlanMarkdownFromEditorFields,
  parsePipelinePlanMarkdown,
  parsedPlanToEditorFields,
  planTodoCounts,
  syncPlanTodosToStageProgress,
} from "./pipeline-plan-parse"

const SAMPLE = `---
name: Auto deliverable routing
overview: Fix pipeline misrouting by adding a deliverable-intent router and document fast-path.
todos:
  - id: intent-router
    content: Add deliverable_intent.py and fix portfolio false positives
    status: completed
  - id: frontend-ui
    content: Inline PipelineDocumentViewer in chat
    status: in_progress
  - id: tests
    content: Add backend/frontend tests
    status: pending
---

# Auto deliverable format routing
`

describe("pipeline-plan-parse", () => {
  it("parses frontmatter title, overview, and todos", () => {
    const view = parsePipelinePlanMarkdown(SAMPLE, { taskId: "api-c2c79873ab12" })
    expect(view.title).toBe("Auto deliverable routing")
    expect(view.overview).toContain("deliverable-intent router")
    expect(view.filename).toContain(".plan.md")
    expect(view.todos).toHaveLength(3)
    const counts = planTodoCounts(view.todos)
    expect(counts.completed).toBe(1)
    expect(counts.remaining).toBe(2)
  })

  it("parses Outline section bullets", () => {
    const md = `---
name: Y Combinator — research plan
overview: Brief on YC
todos:
  - id: draft
    content: Draft markdown
    status: in_progress
---

# Y Combinator — research plan

## Objective
Author a structured document about Y Combinator.

## Outline
- What Y Combinator is
- How the funding model works
- How to apply

## Selected Modules
- Master
`
    const view = parsePipelinePlanMarkdown(md)
    expect(view.outline).toEqual([
      "What Y Combinator is",
      "How the funding model works",
      "How to apply",
    ])
  })

  it("falls back to section bullets when no frontmatter", () => {
    const md = `# UX Case Study

## Goal
Help build a portfolio case study template.

## Structure
- Overview and context
- Problem statement
- Solution highlights
`
    const view = parsePipelinePlanMarkdown(md)
    expect(view.title).toBe("UX Case Study")
    expect(view.todos.length).toBeGreaterThanOrEqual(2)
  })

  it("ticks plan todos one-by-one from stage progress", () => {
    const todos = parsePipelinePlanMarkdown(SAMPLE).todos
    const atStart = syncPlanTodosToStageProgress(todos, 0, { isActive: true })
    expect(atStart.map((t) => t.status)).toEqual([
      "in_progress",
      "pending",
      "pending",
    ])

    const afterOne = syncPlanTodosToStageProgress(todos, 1, { isActive: true })
    expect(afterOne.map((t) => t.status)).toEqual([
      "completed",
      "in_progress",
      "pending",
    ])

    const allDone = syncPlanTodosToStageProgress(todos, 3, { allDone: true })
    expect(allDone.every((t) => t.status === "completed")).toBe(true)
  })

  it("parses fenced yaml dumps without showing raw backticks in overview", () => {
    const fenced = [
      "```yaml",
      "name: RV University — website content plan",
      "overview: A structured outline for authoring content for the RV University website, covering core pages and key information.",
      "---",
      "",
      "## Objective",
      "Define the content structure and messaging.",
      "```",
    ].join("\n")
    const view = parsePipelinePlanMarkdown(fenced, { intentKind: "code" })
    expect(view.title).toBe("RV University — website content plan")
    expect(view.overview).toContain("structured outline")
    expect(view.overview).not.toContain("```")
    expect(view.overview).not.toMatch(/^ya?ml\b/i)
    expect(view.objective).toContain("content structure")
  })

  it("parses smashed one-line yaml fence into title and overview", () => {
    const smashed =
      "```yaml name: RV University — website content plan overview: A structured outline for authoring content for the RV University website, covering core pages and key information. ---"
    const view = parsePipelinePlanMarkdown(smashed)
    expect(view.title).toBe("RV University — website content plan")
    expect(view.overview).toContain("structured outline")
    expect(view.overview).not.toContain("```")
  })

  it("round-trips editor fields without requiring the user to write markdown", () => {
    const source = `---
name: RV University — website content plan
overview: A structured outline for authoring content for the RV University website.
todos:
  - id: homepage
    content: Draft homepage content
    status: pending
---

# RV University — website content plan

## Objective
Define the content structure and messaging.

## Required Inputs
- Branding guidelines
- Mission statement

## Expected Deliverables
- Homepage content
- About page content
`
    const parsed = parsePipelinePlanMarkdown(source)
    const fields = parsedPlanToEditorFields(parsed)
    fields.objective = "Clarify messaging for students and parents."
    fields.requiredInputs = ["Branding guidelines", "Campus photos"]
    const rebuilt = buildPlanMarkdownFromEditorFields(fields)
    expect(rebuilt.trimStart().startsWith("---")).toBe(true)
    expect(rebuilt).not.toContain("```")
    const again = parsePipelinePlanMarkdown(rebuilt)
    expect(again.title).toBe("RV University — website content plan")
    expect(again.objective).toContain("students and parents")
    expect(again.requiredInputs).toEqual(["Branding guidelines", "Campus photos"])
    expect(again.deliverables).toContain("Homepage content")
    expect(again.todos[0]?.content).toContain("Draft homepage content")
  })
})
