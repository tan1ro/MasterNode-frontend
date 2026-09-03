import { describe, expect, it } from "vitest"
import {
  detectCodeLanguage,
  languageLabelFromId,
  shouldHighlightChatCode,
} from "@/lib/chat-code-language"
import {
  filterMentionCandidates,
  findMentionQuery,
  removeMentionQuery,
} from "@/lib/chat-composer-mentions"

describe("detectCodeLanguage", () => {
  it("prefers explicit language class over heuristics", () => {
    expect(detectCodeLanguage("def foo():\n  pass", "language-javascript")).toBe(
      "javascript"
    )
  })

  it("detects python without a fence language", () => {
    const code = "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr"
    expect(detectCodeLanguage(code)).toBe("python")
    expect(languageLabelFromId("python")).toBe("Python")
  })

  it("labels HTML and CSS as acronyms", () => {
    expect(languageLabelFromId("html")).toBe("HTML")
    expect(languageLabelFromId("css")).toBe("CSS")
  })

  it("detects C and highlights even without a fence tag", () => {
    const code = `#include <stdio.h>
void swap(int *a, int *b) {
  int temp = *a;
  *a = *b;
  *b = temp;
}`
    expect(detectCodeLanguage(code)).toBe("c")
    expect(languageLabelFromId("c")).toBe("C")
    expect(shouldHighlightChatCode("c", code)).toBe(true)
    expect(shouldHighlightChatCode("text", code)).toBe(true)
  })

  it("detects C++ from iostream-style signals", () => {
    const code = `#include <iostream>
using namespace std;
void quickSort(int arr[], int low, int high) {
  cout << high;
}`
    expect(detectCodeLanguage(code)).toBe("cpp")
  })

  it("labels ascii recursion trees as diagrams without highlighting", () => {
    const diagram = [
      "        [10,7,8,9,1,5]",
      "              |",
      "         Pivot = 9",
      "         /       \\",
      "    [7,8,1,5]     [10]",
      "         ↓",
      "    Combine back",
    ].join("\n")
    expect(detectCodeLanguage(diagram)).toBe("diagram")
    expect(languageLabelFromId("diagram")).toBe("Diagram")
    expect(shouldHighlightChatCode("diagram", diagram)).toBe(false)
  })

  it("treats generic fence langs as missing", () => {
    expect(detectCodeLanguage('{"a": 1}', "language-text")).toBe("json")
  })
})

describe("findMentionQuery", () => {
  it("detects @query at caret", () => {
    const value = "hello @py"
    expect(findMentionQuery(value, value.length)).toEqual({
      start: 6,
      end: 9,
      query: "py",
    })
  })

  it("ignores email-like @", () => {
    expect(findMentionQuery("a@b.com", 7)).toBeNull()
  })

  it("removes the active mention span", () => {
    const value = "see @notes please"
    const mention = findMentionQuery(value, 10)
    expect(mention).not.toBeNull()
    expect(removeMentionQuery(value, mention!)).toEqual({
      nextValue: "see  please",
      cursor: 4,
    })
  })
})

describe("filterMentionCandidates", () => {
  it("ranks prefix matches first", () => {
    const items = filterMentionCandidates(
      [
        { kind: "file", id: "1", label: "notes.md" },
        { kind: "file", id: "2", label: "python-guide.md" },
        { kind: "assistant", id: "3", label: "Python Tutor" },
      ],
      "py"
    )
    expect(items[0]?.label).toBe("Python Tutor")
  })
})
