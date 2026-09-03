import React from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import {
  ChatRichLinkCard,
  ChatYouTubeArtifactCard,
  extractStandaloneMarkdownLink,
  isYouTubeUrl,
} from "./chat-rich-link-card"

describe("chat-rich-link-card", () => {
  it("detects supported youtube urls", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true)
    expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true)
    expect(isYouTubeUrl("https://example.com/watch?v=dQw4w9WgXcQ")).toBe(false)
  })

  it("extracts a standalone markdown link from paragraph children", () => {
    const match = extractStandaloneMarkdownLink(
      <a href="https://youtu.be/dQw4w9WgXcQ">Someone You Loved (Official Video)</a>
    )
    expect(match).toEqual({
      href: "https://youtu.be/dQw4w9WgXcQ",
      label: "Someone You Loved (Official Video)",
    })
  })

  it("renders a sandboxed youtube embed card", () => {
    const html = renderToStaticMarkup(
      <ChatRichLinkCard
        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        label="Someone You Loved (Official Video)"
      />
    )
    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(html).toContain('sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"')
    expect(html).toContain("Someone You Loved (Official Video)")
  })

  it("renders youtube artifact metadata as an embed card", () => {
    const html = renderToStaticMarkup(
      <ChatYouTubeArtifactCard
        artifact={{
          video_id: "JGwWNGJdvx8",
          url: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
          title: "Ed Sheeran - Shape Of You [Official Lyric Video]",
          channel: "Ed Sheeran",
        }}
      />
    )
    expect(html).toContain("youtube-nocookie.com/embed/JGwWNGJdvx8")
    expect(html).toContain("Ed Sheeran - Shape Of You")
  })
})
