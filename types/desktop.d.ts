import type { DesktopUpdateState } from "@/lib/desktop-version"

export type MasterNodeDesktopBridge = {
  isDesktop?: boolean
  getOnboarding?: () => Promise<{
    platformLabel: string
    screen: "welcome" | "signin" | "signup" | "forgot"
  }>
  finishWelcome?: () => Promise<{ ok: boolean }>
  returnToWelcome?: (options?: {
    screen?: "welcome" | "signin" | "signup" | "forgot"
  }) => Promise<{ ok: boolean }>
  continueWithGoogle?: () => Promise<{ ok: boolean }>
  continueWithEmail?: (payload: {
    email: string
    password: string
  }) => Promise<{ ok: boolean; error?: string }>
  forgotPassword?: (payload: { email: string }) => Promise<{ ok: boolean; error?: string }>
  sendSignupOtp?: (payload: {
    email: string
  }) => Promise<{ ok: boolean; error?: string; devCode?: string }>
  verifySignupOtp?: (payload: {
    email: string
    otp: string
  }) => Promise<{ ok: boolean; error?: string }>
  registerAccount?: (payload: {
    email: string
    password: string
    username: string
  }) => Promise<{ ok: boolean; error?: string }>
  openAppPath?: (pathname: string) => Promise<{ ok: boolean }>
  submitQuickAsk?: (prompt: string) => Promise<{ ok: boolean }>
  openQuickAskChat?: () => Promise<{ ok: boolean }>
  hideQuickAsk?: () => Promise<{ ok: boolean }>
  onQuickAskFocus?: (callback: () => void) => () => void
  getVersion?: () => Promise<{ current: string; packaged: boolean }>
  getUpdateState?: () => Promise<DesktopUpdateState | null>
  checkForUpdate?: () => Promise<DesktopUpdateState | null>
  startUpdate?: () => Promise<DesktopUpdateState | null>
  relaunchUpdate?: () => Promise<{ ok: boolean; error?: string }>
  onUpdateState?: (callback: (state: DesktopUpdateState) => void) => () => void
}

declare global {
  interface Window {
    masternodeDesktop?: MasterNodeDesktopBridge
  }
}

export {}
