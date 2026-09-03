import { describe, expect, it } from "vitest"
import { FILE_TYPE_DISPLAY_ORDER, fileTypeStyleForExt } from "@/constants/rag"
import { iconForRagFileExt, ragFileIconTileClass } from "@/lib/rag-file-icons"

describe("file type colors", () => {
  it("assigns a unique badge color per primary format", () => {
    const badges = FILE_TYPE_DISPLAY_ORDER.map((ext) => fileTypeStyleForExt(ext).badge)
    expect(new Set(badges).size).toBe(FILE_TYPE_DISPLAY_ORDER.length)
  })

  it("uses matching labels", () => {
    expect(fileTypeStyleForExt("pdf").label).toBe("PDF")
    expect(fileTypeStyleForExt("docx").label).toBe("DOCX")
    expect(fileTypeStyleForExt("html").label).toBe("HTML")
  })
})

describe("rag-file-icons", () => {
  it("maps common extensions to distinct icons", () => {
    expect(iconForRagFileExt("pdf")).not.toEqual(iconForRagFileExt("pptx"))
  })

  it("uses per-type tile colors from file type styles", () => {
    expect(ragFileIconTileClass("pdf")).toContain("#DC2626")
    expect(ragFileIconTileClass("pptx")).toContain("#EA580C")
    expect(ragFileIconTileClass("html")).toContain("#0284C7")
    expect(ragFileIconTileClass("docx")).toContain("#4338CA")
    expect(ragFileIconTileClass("xlsx")).toContain("#16A34A")
    expect(ragFileIconTileClass("csv")).toContain("#0D9488")
    expect(ragFileIconTileClass("json")).toContain("#D97706")
    expect(ragFileIconTileClass("md")).toContain("#7C3AED")
    expect(ragFileIconTileClass("txt")).toContain("#0891B2")
    expect(ragFileIconTileClass("png")).toContain("#C026D3")
    expect(ragFileIconTileClass("jpg")).toContain("#DB2777")
  })
})
