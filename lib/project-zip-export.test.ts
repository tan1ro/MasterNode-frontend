import { describe, expect, it } from "vitest"
import {
  sanitizeProjectRelativePath,
  slugifyZipBasename,
  uniqueProjectFiles,
} from "@/lib/project-zip-export"
import { collectProjectExportFiles } from "@/lib/project-files-from-artifact"

describe("project ZIP export", () => {
  it("sanitizes names and rejects traversal", () => {
    expect(slugifyZipBasename("Pokémon Explorer")).toBe("pokemon-explorer")
    expect(slugifyZipBasename("Landing Page")).toBe("landing-page")
    expect(sanitizeProjectRelativePath("src/App.jsx")).toBe("src/App.jsx")
    expect(sanitizeProjectRelativePath("../../etc/passwd")).toBeNull()
    expect(sanitizeProjectRelativePath("/etc/passwd")).toBeNull()
    expect(sanitizeProjectRelativePath("C:\\Windows\\bad.txt")).toBeNull()
  })

  it("keeps nested folders and drops duplicate paths", () => {
    const files = uniqueProjectFiles([
      { path: "src/App.jsx", content: "a" },
      { path: "src/components/Card.jsx", content: "b" },
      { path: "src/App.jsx", content: "aaaa" },
    ])
    expect(files.map((f) => f.path)).toEqual(["src/App.jsx", "src/components/Card.jsx"])
    expect(files[0]?.content).toBe("aaaa")
  })

  it("collects HTML plus fenced project files", () => {
    const files = collectProjectExportFiles({
      html: "<!DOCTYPE html><html><body>Hi</body></html>",
      htmlFilename: "index.html",
      markdown: "```jsx src/App.jsx\nexport default function App() { return null }\n```\n```json package.json\n{\"name\":\"demo\"}\n```",
    })
    expect(files.some((f) => f.path === "index.html")).toBe(true)
    expect(files.some((f) => f.path === "src/App.jsx")).toBe(true)
    expect(files.some((f) => f.path === "package.json")).toBe(true)
  })

  it("collapses the same HTML page collected under two filenames", () => {
    const page = `<!DOCTYPE html>
<html lang="en">
<head><title>Pokédex Explorer</title></head>
<body><h1>POKÉDEX</h1></body>
</html>`
    const files = collectProjectExportFiles({
      html: page,
      htmlFilename: "pok_dex_explorer.html",
      markdown: "```html\n" + page + "\n```",
    })
    expect(files).toHaveLength(1)
    expect(files[0]?.path).toBe("pok_dex_explorer.html")
  })

  it("keeps a titled HTML file over a generic index.html duplicate from task result", () => {
    const page = "<!DOCTYPE html><html><head><title>Site</title></head><body><p>Hello world page</p></body></html>"
    const files = collectProjectExportFiles({
      html: page,
      htmlFilename: "my_portfolio.html",
      codeFiles: [{ name: "index.html", content: page, language: "html" }],
    })
    expect(files.map((f) => f.path)).toEqual(["my_portfolio.html"])
  })
})
