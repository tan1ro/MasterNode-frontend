import { describe, expect, it } from "vitest"
import {
  convertTabSeparatedTables,
  flattenProfileLinkBullets,
  linkifyBareDomains,
  linkifyBareHttpUrls,
  normalizeChatMarkdown,
  normalizeExternalHref,
  plainTextFromChatContent,
  stripPublisherParentheticals,
} from "./chat-markdown"

describe("normalizeChatMarkdown", () => {
  it("converts tab-separated rows into a GFM table", () => {
    const input = "Feature\tTech Mahindra\tTCS\nMoat\tTelecom\tScale"
    const out = normalizeChatMarkdown(input)
    expect(out).toContain("| Feature | Tech Mahindra | TCS |")
    expect(out).toContain("| --- | --- | --- |")
    expect(out).toContain("| Moat | Telecom | Scale |")
  })

  it("repairs collapsed pipe tables onto separate rows", () => {
    const input =
      "### COMPETITOR ANALYSIS\n" +
      "| Brand | Leads | LED | Price | Key Weakness | |---|---|---|---|---| " +
      "| Pentel Twist-Erase E5 | ✅ 3 | ❌ | 6-8 | No LED | " +
      "| Uni Jetstream | ✅ 3 | ❌ | 8-10 | No light |"
    const out = normalizeChatMarkdown(input)
    expect(out).toContain("| Brand | Leads | LED | Price | Key Weakness |")
    expect(out).toContain("| --- | --- | --- | --- | --- |")
    expect(out).toContain("| Pentel Twist-Erase E5 | ✅ 3 | ❌ | 6-8 | No LED |")
    expect(out).toContain("| Uni Jetstream | ✅ 3 | ❌ | 8-10 | No light |")
    expect(out).toMatch(/Key Weakness \|\n\| ---/)
  })

  it("inserts a blank line before a GFM table after a heading", () => {
    const input = "### Matrix\n| A | B |\n| --- | --- |\n| 1 | 2 |"
    const out = normalizeChatMarkdown(input)
    expect(out).toContain("### Matrix\n\n| A | B |")
  })

  it("unescapes literal newlines", () => {
    const input = "Line one\\nLine two\\nLine three"
    expect(normalizeChatMarkdown(input)).toBe("Line one\nLine two\nLine three")
  })

  it("cleans web-search profile replies for chat display", () => {
    const input = `- **Nandeesh Kantli** is a Full Stack Developer and AI/ML enthusiast.
  - GitHub: tan1ro (Nandeesh) — github.com/tan1ro (publisher: GitHub)
  - Social/portfolio: Linktree — linktr.ee/NandeeshKantli (publisher: Linktree)`

    const out = normalizeChatMarkdown(input)
    expect(out).toContain("**Nandeesh Kantli** is a Full Stack Developer")
    expect(out).not.toContain("(publisher:")
    expect(out).toContain("- **GitHub:** tan1ro (Nandeesh)")
    expect(out).toContain("[github.com/tan1ro](https://github.com/tan1ro)")
    expect(out).toContain("- **Social/portfolio:** Linktree")
    expect(out).toContain("[linktr.ee/NandeeshKantli](https://linktr.ee/NandeeshKantli)")
  })

  it("formats comparison answers with headings and readable bullets", () => {
    const input = `- **Agent Land**: A **domain-specialized** platform that uses **Memory/RAG**.
- **MasterNode**: A **workspace-focused** system built on Agent Land.

**Key differences**:
- **Scope**: Agent Land is broader, MasterNode is workspace-focused.
- **Style**: MasterNode emphasizes **clarity** and **brevity**.`

    const out = normalizeChatMarkdown(input)
    expect(out).toContain("### Key differences")
    expect(out).toMatch(/Key differences\n\n- \*\*Scope\*\*/)
    expect(out).toContain(
      "- **Agent Land** A domain-specialized platform that uses Memory/RAG."
    )
    expect(out).not.toContain("**Memory/RAG**")
  })

  it("joins soft-wrapped URLs inside markdown links", () => {
    const input =
      "See [LinkedIn](https://www.linkedin.com/pulse/understanding-recursion-\npython-quicksort-example)"
    const out = normalizeChatMarkdown(input)
    expect(out).toContain(
      "[LinkedIn](https://www.linkedin.com/pulse/understanding-recursion-python-quicksort-example)"
    )
    expect(out).not.toMatch(/recursion-\npython/)
  })
})

describe("stripPublisherParentheticals", () => {
  it("removes publisher metadata parentheticals", () => {
    expect(stripPublisherParentheticals("foo (publisher: GitHub) bar")).toBe("foo bar")
  })
})

describe("linkifyBareDomains", () => {
  it("wraps bare domains after em dashes in markdown links", () => {
    expect(linkifyBareDomains("GitHub — github.com/tan1ro")).toBe(
      "GitHub — [github.com/tan1ro](https://github.com/tan1ro)"
    )
  })
})

describe("linkifyBareHttpUrls", () => {
  it("wraps leftover http URLs that are not already markdown links", () => {
    expect(linkifyBareHttpUrls("See https://example.com/docs for details.")).toBe(
      "See [https://example.com/docs](https://example.com/docs) for details."
    )
  })

  it("does not rewrite URLs already inside markdown links", () => {
    const src = "Read [the docs](https://example.com/docs) please"
    expect(linkifyBareHttpUrls(src)).toBe(src)
  })
})

describe("normalizeExternalHref", () => {
  it("prefixes https for bare domains", () => {
    expect(normalizeExternalHref("github.com/tan1ro")).toBe("https://github.com/tan1ro")
    expect(normalizeExternalHref("www.example.com")).toBe("https://www.example.com")
  })

  it("keeps absolute http(s) URLs", () => {
    expect(normalizeExternalHref("https://example.com/a")).toBe("https://example.com/a")
  })

  it("drops javascript URLs", () => {
    expect(normalizeExternalHref("javascript:alert(1)")).toBeUndefined()
  })
})

describe("flattenProfileLinkBullets", () => {
  it("promotes nested labeled link bullets to top level", () => {
    const input = `- Bio line here
  - GitHub: profile — github.com/user
  - Site: Example — example.com`
    const out = flattenProfileLinkBullets(input)
    expect(out).toContain("Bio line here\n\n- **GitHub:** profile")
    expect(out).toContain("- **Site:** Example")
  })
})

describe("convertTabSeparatedTables", () => {
  it("leaves non-tab lines unchanged", () => {
    expect(convertTabSeparatedTables("Hello world")).toBe("Hello world")
  })
})

describe("plainTextFromChatContent", () => {
  it("strips bold and italic for search previews", () => {
    expect(
      plainTextFromChatContent(
        "I'm a specialized assistant inside **MasterNode** workspaces. My strength"
      )
    ).toBe("I'm a specialized assistant inside MasterNode workspaces. My strength")

    expect(
      plainTextFromChatContent(
        "I can absolutely help you create a timetable! To build one that fits *your* life"
      )
    ).toBe(
      "I can absolutely help you create a timetable! To build one that fits your life"
    )
  })

  it("strips headings, links, and collapses whitespace", () => {
    expect(
      plainTextFromChatContent(
        "Here's a structured summary of the **ArtsKonnect May 2026** issue,\n\nfocus on [details](https://example.com)"
      )
    ).toBe(
      "Here's a structured summary of the ArtsKonnect May 2026 issue, focus on details"
    )
  })
})
