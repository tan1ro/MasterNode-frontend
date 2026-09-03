import { describe, expect, it } from "vitest"
import {
  RELEASE_NOTES_ARTICLES,
  RELEASE_NOTE_VERSIONS,
  RELEASE_NOTES_META,
  releaseNoteVersionAnchor,
} from "@/content/help/release-notes"

describe("RELEASE_NOTES_ARTICLES", () => {
  it("has dated narrative entries with versions, newest first", () => {
    expect(RELEASE_NOTES_META.description).toMatch(/MasterNode|product|updates/i)
    expect(RELEASE_NOTES_ARTICLES.length).toBeGreaterThanOrEqual(8)
    expect(RELEASE_NOTE_VERSIONS.length).toBeGreaterThanOrEqual(5)

    const first = RELEASE_NOTES_ARTICLES[0]
    expect(first.paragraphs.length).toBeGreaterThanOrEqual(3)
    expect(first.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(first.title.length).toBeGreaterThan(10)
    expect(first.dateDisplay).toBeTruthy()

    const dates = RELEASE_NOTES_ARTICLES.map((a) => a.date)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)

    for (const article of RELEASE_NOTES_ARTICLES) {
      expect(article.version).toMatch(/^\d+\.\d+\.\d+$/)
    }

    expect(RELEASE_NOTE_VERSIONS[0].version).toBe(RELEASE_NOTES_ARTICLES[0].version)
    expect(RELEASE_NOTE_VERSIONS[0].href).toBe(
      `#${releaseNoteVersionAnchor(RELEASE_NOTES_ARTICLES[0].version)}`
    )
  })
})
