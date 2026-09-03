import { describe, expect, it } from "vitest"
import { extractCodeFromResult } from "./task-result-parser"

describe("task-result-parser tutorial markdown extraction", () => {
  it("extracts named files and overview fields from coding/research markdown", () => {
    const input = `
To create a "real-time" calculator, we will use HTML, CSS and JavaScript.

### 1. The HTML (\`index.html\`)
\`\`\`html
<html><body>hello</body></html>
\`\`\`

### 2. The CSS (\`style.css\`)
\`\`\`css
body { background: #121212; }
\`\`\`

### 3. The JavaScript (\`script.js\`)
\`\`\`javascript
function calculate(){ return 1+1 }
\`\`\`

### Why this works:
1. Layout is grid based.
2. Errors are handled.
3. Dark theme looks modern.

### How to run this:
1. Create a folder
2. Save files
3. Open index.html
`
    const extracted = extractCodeFromResult(input)
    expect(extracted.files.map((f) => f.name)).toEqual(
      expect.arrayContaining(["index.html", "style.css", "script.js"])
    )
    expect(extracted.features?.length || 0).toBeGreaterThan(0)
    expect(extracted.howToRun).toContain("1. Create a folder")
  })
})
