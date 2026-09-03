import { createElement, Fragment } from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { renderInlineMarkdown, stripInlineMarkdown } from "./inline-markdown"

describe("inline-markdown", () => {
  it("renders bold segments without showing asterisks", () => {
    const html = renderToStaticMarkup(
      createElement(Fragment, null, renderInlineMarkdown("**Hero Section Content**: Tagline and CTA"))
    )
    expect(html).toContain("<strong")
    expect(html).toContain("Hero Section Content")
    expect(html).not.toContain("**")
    expect(html).toContain("Tagline and CTA")
  })

  it("renders italic and code", () => {
    const html = renderToStaticMarkup(
      createElement(Fragment, null, renderInlineMarkdown("Use *draft* then `npm run build`"))
    )
    expect(html).toContain("<em")
    expect(html).toContain("<code")
    expect(html).toContain("npm run build")
  })

  it("strips markers for plain text", () => {
    expect(stripInlineMarkdown("**About Us**: mission")).toBe("About Us: mission")
  })
})
