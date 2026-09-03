import { describe, expect, it } from "vitest"
import {
  extractWebPageArtifactFromMarkdown,
  stripWebPageFencesFromMarkdown,
} from "@/lib/html-writeup"

describe("extractWebPageArtifactFromMarkdown", () => {
  it("extracts a full HTML document fence and strips it from chat prose", () => {
    const content = `Here is a simple portfolio.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Portfolio</title>
  <style>body{font-family:sans-serif}</style>
</head>
<body>
  <h1>Hello</h1>
  <script>console.log(1)</script>
</body>
</html>
\`\`\`

You can customize the colors next.`

    const artifact = extractWebPageArtifactFromMarkdown(content)
    expect(artifact).not.toBeNull()
    expect(artifact?.title).toBe("My Portfolio")
    expect(artifact?.filename).toBe("my_portfolio.html")
    expect(artifact?.html).toContain("<!DOCTYPE html>")

    const stripped = stripWebPageFencesFromMarkdown(content, artifact!.fenceBodies)
    expect(stripped).toContain("Here is a simple portfolio.")
    expect(stripped).toContain("customize the colors")
    expect(stripped).not.toContain("<!DOCTYPE html>")
  })

  it("merges separate html/css/js fences into one document", () => {
    const content = `\`\`\`html
<div class="hero"><h1>Site</h1></div>
\`\`\`

\`\`\`css
.hero { padding: 2rem; }
\`\`\`

\`\`\`javascript
document.querySelector('.hero')
\`\`\``

    const artifact = extractWebPageArtifactFromMarkdown(content)
    expect(artifact).not.toBeNull()
    expect(artifact?.html).toContain("<style>")
    expect(artifact?.html).toContain(".hero { padding: 2rem; }")
    expect(artifact?.html).toContain("<script>")
    expect(artifact?.html).toContain("document.querySelector")
  })
})
