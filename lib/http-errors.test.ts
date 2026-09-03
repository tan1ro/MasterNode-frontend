import { describe, expect, it } from "vitest"
import {
  HTTP_ERROR_CODES,
  MASTERNODE_API_HTTP_STATUSES,
  getHttpErrorEntry,
  isHttpErrorCode,
  isMasterNodeApiHttpStatus,
} from "./http-errors"

describe("http-errors", () => {
  it("lists unique documented codes", () => {
    const set = new Set(HTTP_ERROR_CODES)
    expect(set.size).toBe(HTTP_ERROR_CODES.length)
  })

  it("isHttpErrorCode accepts catalog members only", () => {
    expect(isHttpErrorCode(404)).toBe(true)
    expect(isHttpErrorCode(418)).toBe(false)
    expect(isHttpErrorCode(NaN)).toBe(false)
  })

  it("getHttpErrorEntry returns merged shape for known codes", () => {
    const e = getHttpErrorEntry(503)
    expect(e).toMatchObject({
      code: 503,
      name: "Service Unavailable",
      client: false,
    })
    expect(e?.description.length).toBeGreaterThan(10)
  })

  it("getHttpErrorEntry returns undefined for unknown codes", () => {
    expect(getHttpErrorEntry(999)).toBeUndefined()
  })

  it("documents HTTP 402 for API wallet / quota responses", () => {
    expect(isHttpErrorCode(402)).toBe(true)
    expect(getHttpErrorEntry(402)).toMatchObject({
      code: 402,
      name: "Payment Required",
      client: true,
    })
  })

  it("MASTERNODE_API_HTTP_STATUSES is a subset of documented codes", () => {
    for (const code of MASTERNODE_API_HTTP_STATUSES) {
      expect(isHttpErrorCode(code)).toBe(true)
      expect(isMasterNodeApiHttpStatus(code)).toBe(true)
    }
  })

  it("every catalog entry is reachable via getHttpErrorEntry", () => {
    for (const code of HTTP_ERROR_CODES) {
      const row = getHttpErrorEntry(code)
      expect(row?.code).toBe(code)
      expect(row?.name).toBeTruthy()
    }
  })
})
