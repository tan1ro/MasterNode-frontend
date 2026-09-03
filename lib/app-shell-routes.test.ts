import { describe, expect, it } from "vitest"
import {
  isAppShellRoute,
  isAuthRoute,
  isChatConversationRoute,
  isErrorRoute,
  isHomeLandingRoute,
  isPublicSiteRoute,
  shouldHideGlobalChrome,
  shouldShowHubTopNav,
} from "./app-shell-routes"
import { ROUTES } from "./routes"

describe("hub chrome visibility", () => {
  it("hides global chrome on all hub app shell routes", () => {
    expect(shouldHideGlobalChrome(ROUTES.chat, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(`${ROUTES.chat}/abc`, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.dashboard, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.tasks, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.team, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.product, "business", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.superuserUsers, "business", true)).toBe(true)
  })

  it("never shows hub top nav (sidebar owns navigation)", () => {
    expect(shouldShowHubTopNav(ROUTES.dashboard, "business", false)).toBe(false)
    expect(shouldShowHubTopNav(ROUTES.team, "business", false)).toBe(false)
    expect(shouldShowHubTopNav(ROUTES.chat, "business", false)).toBe(false)
    expect(shouldShowHubTopNav(ROUTES.chat, "creator", false)).toBe(false)
  })

  it("treats signed-in app routes as app shell for every role", () => {
    expect(isAppShellRoute(ROUTES.dashboard, "business", false)).toBe(true)
    expect(isAppShellRoute(ROUTES.analytics, "business", false)).toBe(true)
    expect(isAppShellRoute(ROUTES.apiKeys, "business", false)).toBe(true)
    expect(isAppShellRoute(ROUTES.superuserMonitor, "business", true)).toBe(true)
    expect(isAppShellRoute(ROUTES.dashboard, "creator", false)).toBe(true)
    expect(isAppShellRoute(ROUTES.chat, "creator", false)).toBe(true)
  })

  it("treats chat dashboard as non-conversation", () => {
    expect(isChatConversationRoute(ROUTES.dashboard)).toBe(false)
    expect(isChatConversationRoute(ROUTES.chat)).toBe(true)
  })

  it("treats home as a landing route", () => {
    expect(isHomeLandingRoute(ROUTES.home)).toBe(true)
    expect(isHomeLandingRoute("/home-swiss")).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.home, "creator", false)).toBe(true)
  })

  it("hides global chrome on auth routes", () => {
    expect(isAuthRoute(ROUTES.signIn)).toBe(true)
    expect(isAuthRoute(ROUTES.signUp)).toBe(true)
    expect(isAuthRoute(ROUTES.forgotPassword)).toBe(true)
    expect(isAuthRoute(ROUTES.resetPassword)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.signIn, "creator", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.forgotPassword, "creator", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.resetPassword, "creator", false)).toBe(true)
    expect(isAuthRoute("/auth/oauth/google")).toBe(true)
    expect(isAuthRoute("/auth/oauth/complete")).toBe(true)
    expect(shouldHideGlobalChrome("/auth/oauth/google", "creator", false)).toBe(true)
  })

  it("hides global chrome on onboarding", () => {
    expect(shouldHideGlobalChrome(ROUTES.onboarding, "creator", false)).toBe(true)
  })

  it("treats home and marketing pages as public site routes", () => {
    expect(isPublicSiteRoute(ROUTES.home)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.docs)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.apiDocs)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.about)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.solutions)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.solution("customer-support"))).toBe(true)
    expect(isPublicSiteRoute(ROUTES.legal)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.privacy)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.helpFaq)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.download)).toBe(true)
    expect(isPublicSiteRoute(ROUTES.chatShare("share_abc"))).toBe(true)
  })

  it("excludes app, hub, auth, and chat routes from the public site nav", () => {
    expect(isPublicSiteRoute(ROUTES.chat)).toBe(false)
    expect(isPublicSiteRoute(ROUTES.dashboard)).toBe(false)
    expect(isPublicSiteRoute(ROUTES.tasks)).toBe(false)
    expect(isPublicSiteRoute(ROUTES.signIn)).toBe(false)
    expect(isPublicSiteRoute(ROUTES.onboarding)).toBe(false)
    expect(isPublicSiteRoute(null)).toBe(false)
  })

  it("hides global chrome on creator app shell routes", () => {
    expect(shouldHideGlobalChrome(ROUTES.billing, "creator", false)).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.tasks, "creator", false)).toBe(true)
  })

  it("hides global chrome on HTTP error routes", () => {
    expect(isErrorRoute(ROUTES.errorsIndex)).toBe(true)
    expect(isErrorRoute("/errors/404")).toBe(true)
    expect(isErrorRoute("/errors/500")).toBe(true)
    expect(shouldHideGlobalChrome(ROUTES.errorsIndex, "creator", false)).toBe(true)
    expect(shouldHideGlobalChrome("/errors/500", "creator", false)).toBe(true)
  })
})
