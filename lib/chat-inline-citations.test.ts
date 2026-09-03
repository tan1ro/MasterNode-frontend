import { describe, expect, it } from "vitest"
import {
  assignCitationGroupsToSections,
  isSingleParagraphBody,
  splitMarkdownIntoSections,
} from "./chat-inline-citations"
import type { WebSearchSource } from "@/types/api"

const careersSources: WebSearchSource[] = [
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
]

const expressSource: WebSearchSource[] = [
  {
    title: "NIRF Rankings",
    url: "https://indianexpress.com/nirf-rankings",
    source: "The Indian Express",
  },
]

describe("chat-inline-citations", () => {
  it("splits markdown into heading sections", () => {
    const sections = splitMarkdownIntoSections(
      "Intro line\n\n### Best Medical Colleges\n- RVCE\n\n### Best Law Colleges\n- NLSIU"
    )
    expect(sections).toHaveLength(3)
    expect(sections[1].headingLine).toBe("### Best Medical Colleges")
    expect(sections[1].body).toContain("RVCE")
  })

  it("assigns matching site groups to sections", () => {
    const sections = splitMarkdownIntoSections(
      "### Best Medical Colleges\nCareers360 lists top institutes.\n\n### NIRF overview\nIndian Express coverage."
    )
    const assigned = assignCitationGroupsToSections(sections, [
      ...careersSources,
      ...expressSource,
    ])
    const labels = assigned.flatMap((entry) => entry.groups.map((group) => group.label))
    expect(labels).toContain("Careers360")
    expect(labels.some((label) => label.includes("Indian Express"))).toBe(true)
  })

  it("detects single paragraph bodies", () => {
    expect(isSingleParagraphBody("One short paragraph.")).toBe(true)
    expect(isSingleParagraphBody("- bullet one\n- bullet two")).toBe(false)
  })

  it("promotes bold headings into markdown sections", () => {
    const sections = splitMarkdownIntoSections("**Best Medical Colleges**\n1. RVCE")
    expect(sections).toHaveLength(1)
    expect(sections[0].headingLine).toBe("### Best Medical Colleges")
  })

  it("assigns one citation group per section", () => {
    const sections = splitMarkdownIntoSections(
      "### Best Medical Colleges\n1. RVCE\n\n### Best Law Colleges\n1. NLSIU"
    )
    const assigned = assignCitationGroupsToSections(sections, [
      { title: "Medical", url: "https://www.careers360.com/medical", source: "Careers360" },
      { title: "Law", url: "https://law.careers360.com/law", source: "Careers360" },
      { title: "NIRF", url: "https://indianexpress.com/nirf", source: "The Indian Express" },
    ])
    const withPills = assigned.filter((entry) => entry.groups.length > 0)
    expect(withPills.length).toBeGreaterThanOrEqual(1)
    expect(withPills.every((entry) => entry.groups.length >= 1)).toBe(true)
  })
})
