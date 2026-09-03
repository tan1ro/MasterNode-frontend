import { describe, expect, it } from "vitest"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ChatSourcesPanelProvider } from "./chat-sources-panel"
import { ChatMarkdownWithCitations } from "./chat-markdown-with-citations"

describe("ChatMarkdownWithCitations", () => {
  it("renders inline favicon source links instead of numbered citations", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <ChatMarkdownWithCitations
          content={`- Current position: 1st on the IPL 2026 points table with 16 points 1.
- Squad highlights: Captain Rajat Patidar and Virat Kohli 3.
- Home venue: M. Chinnaswamy Stadium, Bangalore 3.`}
          sources={[
            {
              title: "IPL standings",
              url: "https://www.espncricinfo.com/standings",
              source: "espncricinfo.com",
            },
            {
              title: "Unused",
              url: "https://example.com/unused",
              source: "example.com",
            },
            {
              title: "RCB squad",
              url: "https://www.iplt20.com/teams/rcb",
              source: "iplt20.com",
            },
          ]}
        />
      </ChatSourcesPanelProvider>
    )

    expect(html).toContain("/api/favicon")
    expect(html).toContain("espncricinfo.com")
    expect(html).toContain("iplt20.com")
    expect(html).not.toContain("16 points 1.")
    expect(html).not.toContain("Bangalore 3.")
  })

  it("renders citation pills with favicons after numbered list sections", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <ChatMarkdownWithCitations
          content={`### Best Medical Colleges
1. National Institute of Mental Health and Neurosciences (NIMHANS)
2. St. John's Medical College

### Best Law Colleges
1. National Law School of India University (NLSIU)`}
          sources={[
            {
              title: "Top Medical Colleges",
              url: "https://www.careers360.com/medical-colleges",
              source: "Careers360",
            },
            {
              title: "Top Law Colleges",
              url: "https://www.careers360.com/law-colleges",
              source: "Careers360",
            },
          ]}
        />
      </ChatSourcesPanelProvider>
    )

    expect(html).toContain("Careers360")
    expect(html).toContain("Best Medical Colleges")
    expect(html).toContain("Best Law Colleges")
    expect(html).toContain("/api/favicon")
    expect((html.match(/Careers360/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })

  it("renders profile-style web search replies with left-aligned source pills", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <ChatMarkdownWithCitations
          content={`- **Nandeesh Kantli** is a Full Stack Developer and AI/ML enthusiast.
  - GitHub: tan1ro — github.com/tan1ro (publisher: GitHub)
  - Social/portfolio: Linktree — linktr.ee/NandeeshKantli (publisher: Linktree)`}
          sources={[
            {
              title: "tan1ro (Nandeesh)",
              url: "https://github.com/tan1ro",
              source: "github.com",
            },
            {
              title: "Nandeesh Kantli | Linktree",
              url: "https://linktr.ee/NandeeshKantli",
              source: "linktr.ee",
            },
          ]}
        />
      </ChatSourcesPanelProvider>
    )

    expect(html).not.toContain("(publisher:")
    expect(html).toContain("GitHub")
    expect(html).toContain("Linktree")
    expect(html).toContain("github.com/tan1ro")
    expect(html).not.toContain("inline-flex max-w-full flex-wrap items-baseline")
  })

  it("renders standalone youtube links as rich embed cards", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <ChatMarkdownWithCitations
          content="[Someone You Loved (Official Video)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
          sources={[
            {
              title: "Someone You Loved",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              source: "youtube.com",
            },
          ]}
        />
      </ChatSourcesPanelProvider>
    )

    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(html).toContain("Someone You Loved (Official Video)")
  })
})
