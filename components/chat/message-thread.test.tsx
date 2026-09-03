import { describe, expect, it } from "vitest"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ChatSourcesPanelProvider } from "./chat-sources-panel"
import { MessageThread } from "./message-thread"
import type { ChatMessage } from "@/types/api"

describe("MessageThread", () => {
  it("renders assistant message and audio controls", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m1",
        conversation_id: "c1",
        role: "assistant",
        content: "Assistant reply",
        created_at: "2026-01-01T00:00:00Z",
        tool_events: [
          {
            type: "tool_call_started",
            name: "chat_completion",
          },
        ],
        audio_url: "data:audio/wav;base64,AAA",
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("Assistant reply")
    expect(html).toContain("audio")
  })

  it("renders task link when task exists without result", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m2",
        conversation_id: "c1",
        role: "assistant",
        content: "Task is running.",
        created_at: "2026-01-01T00:00:00Z",
        metadata: { task_id: "task_123" },
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("Open task task_123")
  })

  it("renders streaming text bubble", () => {
    const html = renderToStaticMarkup(<MessageThread messages={[]} streamingText="Thinking..." />)
    expect(html).toContain("Thinking...")
  })

  it("renders live thought panel while streaming web search", () => {
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <MessageThread
          messages={[]}
          isAssistantStreaming
          streamingUserQuery="Tell me about Nandeesh Kantli"
          streamStartedAt={Date.now() - 5000}
          streamingToolEvents={[
            { type: "tool_call_started", name: "web_search", call_id: "w1" },
            {
              type: "tool_call_output",
              name: "web_search",
              call_id: "w1",
              output: "Nandeesh Kantli",
            },
          ]}
          webSearchStatus={{
            queries: ["Nandeesh Kantli", "Nandeesh Kantli RV University"],
          }}
        />
      </ChatSourcesPanelProvider>
    )
    expect(html).toContain("Searching for Nandeesh Kantli")
    expect(html).not.toContain("Thought for")
    expect(html).not.toContain("Explored")
  })

  it("renders response context bar for assistant with agent metadata", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m3",
        conversation_id: "c1",
        role: "assistant",
        content: "Here is the answer.",
        created_at: "2026-01-01T00:00:00Z",
        metadata: {
          response_context: {
            items: [{ kind: "agent", template_id: "coach", label: "Career coach" }],
          },
        },
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("Career Coach")
    expect(html).toContain('aria-label="Used for this reply"')
  })

  it("renders assistant markdown emphasis", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m3",
        conversation_id: "c1",
        role: "assistant",
        content: "Reply **Run** to start now.",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("Run")
    expect(html).toContain('aria-label="Copy"')
    expect(html).toContain(">Copy<")
  })

  it("renders web search sources button and citation pills", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "u5",
        conversation_id: "c1",
        role: "user",
        content: "Tell me about Nandeesh Kantli",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        message_id: "m5",
        conversation_id: "c1",
        role: "assistant",
        content: "Here is what I found.",
        created_at: "2026-01-01T00:00:01Z",
        tool_events: [
          {
            type: "tool_call_started",
            name: "web_search",
            call_id: "tool_1",
            query: "Nandeesh Kantli",
          },
          {
            type: "tool_call_completed",
            name: "web_search",
            call_id: "tool_1",
            status: "ok",
            sources: [
              {
                title: "Profile | LinkedIn",
                url: "https://www.linkedin.com/in/example",
                snippet: "AI engineer profile.",
              },
            ],
          },
        ],
      },
    ]
    const html = renderToStaticMarkup(
      <ChatSourcesPanelProvider>
        <MessageThread
          messages={messages}
          onBranchInNewChat={() => {}}
          onFollowUpPick={() => {}}
        />
      </ChatSourcesPanelProvider>
    )
    expect(html).toContain("Sources")
    expect(html).toContain("LinkedIn")
    expect(html).toContain('aria-label="View sources"')
    expect(html).toContain("Here is what I found.")
    expect(html).not.toContain("Explored")
    expect(html).not.toContain("Searched the web")
    expect(html).toContain("/api/favicon")
    expect(html).toContain("Tell me in detail")
  })

  it("renders edit control for user messages", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "u1",
        conversation_id: "c1",
        role: "user",
        content: "PES cut off 2026 Bangalore",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]
    const html = renderToStaticMarkup(
      <MessageThread messages={messages} onStartEdit={() => {}} />
    )
    expect(html).toContain('aria-label="Edit"')
  })

  it("renders response version pager for assistant messages with alternatives", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "a1",
        conversation_id: "c1",
        role: "assistant",
        content: "Second try",
        created_at: "2026-01-01T00:00:00Z",
        metadata: {
          response_versions: [{ content: "First try" }, { content: "Second try" }],
          active_response_index: 1,
        },
      },
    ]
    const html = renderToStaticMarkup(
      <MessageThread
        messages={messages}
        onSelectResponseVersion={() => {}}
      />
    )
    expect(html).toContain("2/2")
    expect(html).toContain('aria-label="Previous response"')
  })

  it("renders inline edit UI for the active user message", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "u1",
        conversation_id: "c1",
        role: "user",
        content: "Original prompt",
        created_at: "2026-01-01T00:00:00Z",
        attachments: [
          {
            attachment_id: "a1",
            conversation_id: "c1",
            filename: "report.pdf",
            mime_type: "application/pdf",
          },
        ],
      },
    ]
    const html = renderToStaticMarkup(
      <MessageThread
        messages={messages}
        editingMessageId="u1"
        onCancelEdit={() => {}}
        onSaveEdit={() => {}}
      />
    )
    expect(html).toContain("Original prompt")
    expect(html).toContain("report.pdf")
    expect(html).toContain("Cancel")
    expect(html).toContain("Save")
    expect(html).not.toContain('aria-label="Edit"')
  })

  it("renders tab-separated competitive matrix as a table", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m4",
        conversation_id: "c1",
        role: "assistant",
        content: "Matrix\nFeature\tTech Mahindra\tTCS\nMoat\tTelecom\tScale",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("<table")
    expect(html).toContain("Tech Mahindra")
  })

  it("renders markdown in time-artifact captions", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m-time",
        conversation_id: "c1",
        role: "assistant",
        content: "Right now in **Bengaluru** it's **Sunday**.",
        created_at: "2026-01-01T00:00:00Z",
        metadata: {
          time_artifact: {
            location: "Bengaluru, India",
            timezone: "Asia/Kolkata",
            time_24h: "19:35",
            time_12h: "7:35 PM",
            date_label: "Sunday, July 26, 2026",
            utc_offset: "GMT+5:30",
            hour: 19,
            minute: 35,
            second: 0,
          },
        },
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain("<strong")
    expect(html).toContain("Bengaluru")
    expect(html).not.toContain("**Bengaluru**")
  })

  it("renders a centered date divider above the first message of a day", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m1",
        conversation_id: "c1",
        role: "user",
        content: "hello",
        created_at: "2020-01-15T12:00:00Z",
      },
      {
        message_id: "m2",
        conversation_id: "c1",
        role: "assistant",
        content: "hi there",
        created_at: "2020-01-15T12:01:00Z",
      },
    ]
    const html = renderToStaticMarkup(<MessageThread messages={messages} />)
    expect(html).toContain(" at ")
    expect(html.match(/role="separator"/g)?.length).toBe(1)
  })
})
