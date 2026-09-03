import { describe, expect, it } from "vitest"
import {
  BACKEND_UNAVAILABLE_QUERY,
  createBackendUnavailableError,
  looksLikeMasterNodeHealth,
  responseLooksLikeWrongServer,
  shouldMonitorBackend,
} from "@/lib/backend-unavailable"
import { ROUTES } from "@/lib/routes"
import { isBackendUnavailable } from "@/types/api"

describe("backend-unavailable", () => {
  it("creates a connection-style API error", () => {
    const err = createBackendUnavailableError()
    expect(err.isBackendUnavailable).toBe(true)
    expect(err.isConnectionError).toBe(true)
    expect(err.isServerError).toBe(true)
    expect(err.httpStatus).toBe(503)
    expect(isBackendUnavailable(err)).toBe(true)
  })

  it("detects HTML responses from the wrong server", () => {
    expect(
      responseLooksLikeWrongServer({
        "content-type": "text/html; charset=utf-8",
      }),
    ).toBe(true)
    expect(
      responseLooksLikeWrongServer({
        server: "WSGIServer/0.2",
      }),
    ).toBe(true)
    expect(
      responseLooksLikeWrongServer({
        "content-type": "application/json",
      }),
    ).toBe(false)
  })

  it("recognizes MasterNode FastAPI health JSON", () => {
    expect(looksLikeMasterNodeHealth({ service: "masternode-rag", status: "ok" })).toBe(true)
    expect(looksLikeMasterNodeHealth({ status: "ok" })).toBe(false)
    expect(looksLikeMasterNodeHealth({ service: "naksha" })).toBe(false)
  })

  it("exports the backend-unavailable query flag", () => {
    expect(BACKEND_UNAVAILABLE_QUERY).toBe("backend-unavailable")
  })

  it("does not force a health redirect on public marketing pages", () => {
    expect(shouldMonitorBackend(ROUTES.home)).toBe(false)
    expect(shouldMonitorBackend(ROUTES.download)).toBe(false)
    expect(shouldMonitorBackend(ROUTES.helpDownloadApps)).toBe(false)
    expect(shouldMonitorBackend(ROUTES.docs)).toBe(false)
    expect(shouldMonitorBackend("/errors/500")).toBe(false)
    expect(shouldMonitorBackend(ROUTES.signIn)).toBe(false)
    expect(shouldMonitorBackend(ROUTES.chat)).toBe(true)
    expect(shouldMonitorBackend(ROUTES.dashboard)).toBe(true)
  })
})
