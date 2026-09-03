import { describe, expect, it } from "vitest"
import { isCodePipelinePlan, parseDeliverableFileTree } from "./pipeline-plan-code"
import { buildPlanMarkdownFromFields, normalizePlanMarkdown } from "./pipeline-plan-normalize"
import { parsePipelinePlanMarkdown } from "./pipeline-plan-parse"

const MALFORMED_JSON = JSON.stringify({
  plan_markdown: "---",
  name: "Portfolio Website Planning",
  overview:
    "This plan outlines the development of a portfolio website with HTML, CSS, and JavaScript.",
  "## Objective":
    "Develop a visually appealing, responsive portfolio website with clean HTML, modular CSS, and functional JavaScript.",
  "## Required Inputs":
    "- Visual design mockups\n- List of sections\n- Content for each section",
  modules: ["Planner", "Designer", "Developer", "Validator"],
  "## Expected Deliverables": [
    "`index.html`: Main entry point",
    "`style.css`: Modular CSS",
    "`script.js`: Functional JavaScript",
    "`assets/images/`: Folder with optimized images",
    "`README.md`: Documentation",
  ],
  todos: [
    { task: "Analyze requirements", status: "completed" },
    { task: "Finalize wireframes", status: "in_progress" },
    { task: "Implement core pages", status: "pending" },
  ],
})

/** Invalid JSON with orphan `---` token (common LLM mistake). */
const INVALID_LLM_JSON = `{ "plan_markdown": "---", "name": "Portfolio Website Planning", "overview": "This plan outlines the development of a portfolio website with HTML, CSS, and JavaScript, ensuring responsiveness, semantic structure, and modularity.", "todos": [ { "task": "Analyze requirements", "status": "completed" }, { "task": "Finalize the visual design mockups (wireframes) for the portfolio sections", "status": "in_progress" }, { "task": "Select and configure development tools (e.g., bundler, linter, preprocessor)", "status": "pending" } ], "## Objective": "Develop a visually appealing, responsive portfolio website with clean HTML, modular CSS, and functional JavaScript.", "## Required Inputs": "- Visual design mockups (wireframes) for the portfolio layout\\n- List of sections to include (e.g., About, Projects, Skills, Contact)", "## Selected Modules": [ "Planner", "Designer", "Developer", "Validator" ], "## Expected Deliverables": "- index.html: Main entry point\\n- style.css: Modular CSS\\n- script.js: Functional JavaScript", "---", "modules": ["Planner", "Designer", "Developer", "Validator"] }`

describe("pipeline-plan-normalize", () => {
  it("rebuilds markdown from malformed JSON plan blobs", () => {
    const normalized = normalizePlanMarkdown(MALFORMED_JSON, {
      modulesFromPayload: ["Master", "Planner"],
    })
    expect(normalized).toContain("## Objective")
    expect(normalized).toContain("Portfolio Website Planning")
    expect(normalized).toContain("index.html")
    expect(normalized).toContain("Analyze requirements")
  })

  it("repairs invalid LLM JSON with orphan --- tokens", () => {
    expect(() => JSON.parse(INVALID_LLM_JSON)).toThrow()
    const normalized = normalizePlanMarkdown(INVALID_LLM_JSON)
    expect(normalized).not.toMatch(/^\s*\{/)
    expect(normalized).toContain("Portfolio Website Planning")
    expect(normalized).toContain("Finalize the visual design mockups")
    expect(normalized).toContain("index.html")
  })

  it("builds canonical markdown from extracted fields", () => {
    const md = buildPlanMarkdownFromFields({
      name: "API Service",
      overview: "Build a REST API",
      objective: "Implement endpoints",
      deliverables: ["`main.py`", "`README.md`"],
      todos: [{ task: "Scaffold", status: "in_progress" }],
    })
    expect(md).toContain("name: API Service")
    expect(md).toContain("Scaffold")
  })
})

describe("pipeline-plan-code", () => {
  it("detects code plans from deliverables", () => {
    const parsed = parsePipelinePlanMarkdown(
      buildPlanMarkdownFromFields({
        name: "Portfolio site",
        deliverables: ["`index.html`", "`style.css`", "`script.js`"],
      }),
      { intentKind: "code" }
    )
    expect(isCodePipelinePlan("code", parsed)).toBe(true)
  })

  it("parses file tree from backtick deliverable lines", () => {
    const tree = parseDeliverableFileTree([
      "`index.html`: Main entry point",
      "`style.css`: Styles",
      "`assets/images/`: Image folder",
      "`script.js`: Interactivity",
    ])
    expect(tree.map((n) => n.path)).toEqual(
      expect.arrayContaining(["index.html", "style.css", "script.js"])
    )
  })

  it("parses todos that use task instead of content", () => {
    const view = parsePipelinePlanMarkdown(INVALID_LLM_JSON, { intentKind: "code" })
    expect(view.todos.some((t) => t.content.includes("Analyze requirements"))).toBe(true)
    expect(view.todos.some((t) => t.content.includes("Finalize the visual design mockups"))).toBe(true)
    expect(view.title).toBe("Portfolio Website Planning")
    expect(view.overview).not.toMatch(/^\s*\{/)
    expect(isCodePipelinePlan("code", view)).toBe(true)
  })
})
