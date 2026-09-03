import { describe, expect, it } from "vitest"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ChatSourcesPanelProvider } from "./chat-sources-panel"
import { MessageWebSearchActivity } from "./message-web-search-activity"

describe("MessageWebSearchActivity", () => {
  it("renders expandable search results with links", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <MessageWebSearchActivity
          defaultOpen
          activity={{
            status: "done",
            query: "Nandeesh Kantli",
            queries: ["Nandeesh Kantli", "TensorKode"],
            resultCount: 2,
            sources: [
              {
                title: "Nandeesh Kantli - LinkedIn",
                url: "https://in.linkedin.com/in/example",
              },
              {
                title: "Nandeesh Kantli Profile",
                url: "https://www.zoominfo.com/p/example",
              },
            ],
          }}
        />
      </ChatSourcesPanelProvider>
    )

    expect(html).toContain("Searched the web")
    expect(html).toContain("Nandeesh Kantli TensorKode")
    expect(html).toContain("2 results")
    expect(html).toContain("in.linkedin.com")
    expect(html).toContain("zoominfo.com")
    expect(html).toContain("Open all sources")
    expect(html).toContain("Done")
  })
})
