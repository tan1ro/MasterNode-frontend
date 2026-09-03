import { describe, expect, it } from "vitest"
import {
  classifyPipelineOutput,
  extractPipelineArtifacts,
  isLlmUnavailableText,
  isTemplateDocumentFileMap,
  looksLikeCodeFileMap,
  normalizeTaskResultForViewer,
} from "./pipeline-output"

describe("pipeline-output", () => {
  it("detects code file maps", () => {
    expect(
      looksLikeCodeFileMap({ "src/main.py": "print('hi')" })
    ).toBe(true)
  })

  it("classifies prose course plans as non-code", () => {
    const kind = classifyPipelineOutput({
      final_result: "Bloom taxonomy course plan\n\n## Unit 1\n...",
      summary: "done",
    })
    expect(kind).not.toBe("code")
  })

  it("normalizes task payload without forcing code UI", () => {
    const normalized = normalizeTaskResultForViewer({
      final_result: {
        final_result: "Q: What is SAM?\nA: Serviceable addressable market.",
        summary: "ok",
      },
    })
    expect(normalized).toMatchObject({ output_kind: "qna" })
    expect((normalized as Record<string, unknown>)._is_code).toBeUndefined()
  })

  it("classifies single artifact mime-only document outputs", () => {
    const kind = classifyPipelineOutput({
      artifact: {
        filename: "course_plan",
        mime_type: "application/pdf",
        base64: "AA==",
      },
    })
    expect(kind).toBe("document")
  })

  it("preserves presentation artifacts through normalization", () => {
    const normalized = normalizeTaskResultForViewer({
      validation: {
        approved_result: {
          output_kind: "presentation",
          summary: "## Slide deck\n\n1. **Intro**",
          presentation_title: "Cloud Intro",
          slides_created: 8,
          slide_outline: [{ title: "Intro", bullets: ["What is cloud"] }],
          artifact: {
            filename: "cloud-intro.pptx",
            mime_type:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            base64: "UEsDBA==",
          },
          final_result: {
            artifacts: [
              {
                filename: "cloud-intro.pptx",
                mime_type:
                  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                base64: "UEsDBA==",
              },
            ],
            summary: "## Slide deck\n\n1. **Intro**",
          },
        },
      },
    }) as Record<string, unknown>
    expect(normalized).toMatchObject({ output_kind: "presentation", presentation_title: "Cloud Intro" })
    const artifacts = extractPipelineArtifacts(normalized)
    expect(artifacts.some((a) => a.filename.endsWith(".pptx"))).toBe(true)
    expect(normalized.summary).toContain("Slide deck")
  })

  it("extracts artifacts from root, nested, and dedupes", () => {
    const artifacts = extractPipelineArtifacts({
      artifact: {
        filename: "plan.pdf",
        mime_type: "application/pdf",
        base64: "AA==",
      },
      final_result: {
        artifacts: [
          {
            filename: "deck.pptx",
            mime_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            base64: "BB==",
          },
          {
            filename: "plan.pdf",
            mime_type: "application/pdf",
            base64: "AA==",
          },
        ],
      },
    })
    expect(artifacts.map((a) => a.filename)).toEqual(["plan.pdf", "deck.pptx"])
  })

  it("detects LLM outage placeholder prose", () => {
    expect(
      isLlmUnavailableText(
        "[LLM unavailable — every configured provider failed for this request. Check API keys.]"
      )
    ).toBe(true)
  })

  it("recovers markdown files from partial_results as document output", () => {
    const normalized = normalizeTaskResultForViewer({
      final_result: {
        final_result:
          "[LLM unavailable — every configured provider failed for this request. Check API keys.]",
        summary: "Merged 3 agent section(s) without aggregator LLM",
      },
      partial_results: {
        research_founder_traits: {
          result: {
            files: {
              "BEST_PRACTICES_FOUNDER.md": "# Founder guide\n\n## Vision",
            },
          },
          confidence: 0.98,
        },
      },
    })
    expect(normalized).toMatchObject({ output_kind: "document" })
    const fr = (normalized as Record<string, unknown>).final_result as Record<string, string>
    expect(fr["BEST_PRACTICES_FOUNDER.md"]).toContain("# Founder guide")
  })

  it("omits partial_results from normalized viewer payload", () => {
    const normalized = normalizeTaskResultForViewer({
      final_result: { summary: "done" },
      partial_results: {
        research_slide: { result: "hello" },
      },
    }) as Record<string, unknown>
    expect(normalized.partial_results).toBeUndefined()
  })

  it("filters supervisor repair partial_results from chat-facing output", () => {
    const normalized = normalizeTaskResultForViewer({
      final_result: {
        final_result: {
          "presentation.pptx": "UEsDBBQAAAAI",
          "repair_1_5803d4ab": "Transformed the final_result structure into a valid map",
        },
      },
      partial_results: {
        repair_1_5803d4ab: {
          result: "Transformed the final_result structure into a valid map",
        },
        repair_3_da119c28: {
          result: "List of popular developer tools compiled with key features",
        },
        research_slide: {
          result: {
            files: {
              "DECK.md": "# Full stack deck\n\n## Testing strategies",
            },
          },
        },
      },
    })
    const fr = (normalized as Record<string, unknown>).final_result as Record<string, string>
    expect(fr["repair_1_5803d4ab"]).toBeUndefined()
    expect(fr["DECK.md"] || Object.values(fr).some((v) => v.includes("Testing strategies"))).toBeTruthy()
    expect(JSON.stringify(normalized)).not.toContain("repair_3_da119c28")
  })

  it("recovers code files from partial_results when final_result is empty", () => {
    const normalized = normalizeTaskResultForViewer({
      task: "Create a portfolio webpage",
      final_result: { output_kind: "document", summary: "done" },
      partial_results: {
        agent_a: {
          result: {
            files: [{ path: "index.html", content: "<!DOCTYPE html><html></html>" }],
          },
        },
      },
    })
    expect(normalized).toMatchObject({ output_kind: "code", _is_code: true })
    const fr = (normalized as Record<string, unknown>).final_result as Record<string, string>
    expect(fr["index.html"]).toContain("<!DOCTYPE html>")
  })

  it("treats template json maps as documents not code", () => {
    const files = { "ux_case_study_format.json": '{"sections": []}' }
    expect(isTemplateDocumentFileMap(files)).toBe(true)
    expect(looksLikeCodeFileMap(files)).toBe(false)
    const kind = classifyPipelineOutput({
      output_kind: "document",
      final_result: files,
    })
    expect(kind).toBe("document")
  })

  it("classifies json research payloads with inline summary as document not code", () => {
    const kind = classifyPipelineOutput({
      final_result: {
        summary:
          "Tata Consultancy Services (TCS) is a global IT services and consulting company headquartered in Mumbai, India.",
        "research.json": '{"company": "TCS", "headquarters": "Mumbai"}',
      },
    })
    expect(kind).toBe("qna")
  })

  it("trusts backend document output_kind over json file map", () => {
    const kind = classifyPipelineOutput({
      output_kind: "document",
      document_markdown: "# UX Case Study\n\n## Problem\n...",
      final_result: "# UX Case Study\n\n## Problem\n...",
    })
    expect(kind).toBe("document")
  })
})
