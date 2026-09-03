import { describe, expect, it } from "vitest"
import { isSelectionInChatSelectable } from "./use-chat-text-selection"

describe("isSelectionInChatSelectable", () => {
  it("returns true when the selection is inside assistant answer content", () => {
    document.body.innerHTML = `
      <div id="thread">
        <div data-chat-selectable="true">
          <p id="answer">Top colleges in Karnataka</p>
        </div>
      </div>
    `
    const container = document.getElementById("thread")!
    const answer = document.getElementById("answer")!
    const textNode = answer.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 5)

    expect(isSelectionInChatSelectable(container, range)).toBe(true)
  })

  it("returns false for selections outside selectable assistant content", () => {
    document.body.innerHTML = `
      <div id="thread">
        <div class="user-bubble">
          <p id="user">My question</p>
        </div>
      </div>
    `
    const container = document.getElementById("thread")!
    const user = document.getElementById("user")!
    const textNode = user.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 2)

    expect(isSelectionInChatSelectable(container, range)).toBe(false)
  })
})
