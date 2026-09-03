import { describe, expect, it } from "vitest"
import {
  galleryLeafCandidates,
  galleryNetworkLeaves,
} from "@/constants/assistant-gallery-network"
import { resolveGalleryCategory } from "@/constants/gallery-visibility"

describe("assistant-gallery-network", () => {
  it("general leaves match gallery domain badges", () => {
    expect(galleryNetworkLeaves("general").map((l) => l.label)).toEqual([
      "Research",
      "Summaries",
      "Writing",
      "Meetings",
    ])
  })

  it("codebase leaves stay curated while coming soon", () => {
    expect(galleryNetworkLeaves("codebase").map((l) => l.label)).toEqual([
      "Code review",
      "Copilot",
      "Security",
      "API design",
    ])
  })

  it("sales_marketing leaves include GTM and positioning themes", () => {
    expect(galleryNetworkLeaves("sales_marketing").map((l) => l.label)).toEqual([
      "Marketing",
      "Sales",
      "GTM",
      "Positioning",
    ])
  })

  it("academics leaves match gallery specialties", () => {
    expect(galleryNetworkLeaves("academics").map((l) => l.label)).toEqual([
      "Teaching",
      "Research",
      "Accreditation",
      "Lesson plans",
    ])
  })

  it("legal leaves cover contracts and governance", () => {
    expect(galleryNetworkLeaves("legal").map((l) => l.label)).toEqual([
      "Contracts",
      "Governance",
    ])
    expect(galleryLeafCandidates("legal")).toContain("Governance")
  })

  it("compliance leaves cover privacy, regulatory, and audit", () => {
    expect(galleryNetworkLeaves("compliance").map((l) => l.label)).toEqual([
      "Privacy & data",
      "Regulatory",
      "Audit & controls",
    ])
  })

  it("sdlc leaves stay curated while coming soon", () => {
    expect(galleryNetworkLeaves("sdlc").map((l) => l.label)).toEqual([
      "Sprint planning",
      "Release readiness",
      "Postmortems",
      "Tech specs",
    ])
  })

  it("splits legal_compliance by domain focus", () => {
    expect(resolveGalleryCategory("legal_compliance", "Contracts")).toBe("legal")
    expect(resolveGalleryCategory("legal_compliance", "Governance & policy")).toBe("legal")
    expect(resolveGalleryCategory("legal_compliance", "Privacy & data")).toBe("compliance")
    expect(resolveGalleryCategory("legal_compliance", "Regulatory")).toBe("compliance")
    expect(resolveGalleryCategory("legal_compliance", "Audit & controls")).toBe("compliance")
  })
})
