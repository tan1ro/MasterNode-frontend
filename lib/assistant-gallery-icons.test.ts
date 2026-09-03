import { describe, expect, it } from "vitest"
import { Briefcase, GraduationCap, Lock, Megaphone, Microscope, Plug, Scale } from "lucide-react"
import { assistantIconBg, iconForAssistant } from "@/lib/assistant-gallery-icons"

describe("assistant-gallery-icons", () => {
  it("uses lane icons for revenue templates", () => {
    expect(iconForAssistant("sample-marketing-ad-copy", "Marketing")).toEqual(Megaphone)
    expect(iconForAssistant("sample-sales-discovery-facilitator", "Sales")).toEqual(Briefcase)
    expect(iconForAssistant("sample-presales-integration-architect", "Presales")).toEqual(Plug)
    expect(assistantIconBg("sample-sales-negotiation-coach", "Sales")).toContain("emerald")
    expect(assistantIconBg("sample-marketing-ad-copy", "Marketing")).toContain("violet")
  })

  it("uses dedicated icons for legal templates", () => {
    expect(iconForAssistant("sample-legal-nda-reviewer", "Contracts")).toEqual(Lock)
    expect(iconForAssistant("sample-legal-unknown", "Legal")).toEqual(Scale)
    expect(assistantIconBg("sample-legal-nda-reviewer", "Contracts")).toContain("sky")
  })

  it("uses dedicated icons for academics templates", () => {
    expect(iconForAssistant("sample-academics-research-architect", "Research")).toEqual(Microscope)
    expect(iconForAssistant("sample-academics-unknown", "Academics")).toEqual(GraduationCap)
    expect(assistantIconBg("sample-academics-research-architect", "Research")).toContain("amber")
  })
})
