/** Session flags for empty-chat greeting copy (per login session). */

const WELCOME_AFTER_LOGIN_KEY = "mn_chat_welcome_after_login_done"

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined"
}

/** First empty chat after sign-in: "Welcome back, {name}." */
export function shouldShowWelcomeBackAfterLogin(): boolean {
  if (!canUseSessionStorage()) return false
  try {
    return sessionStorage.getItem(WELCOME_AFTER_LOGIN_KEY) !== "1"
  } catch {
    return true
  }
}

export function markWelcomeBackAfterLoginShown(): void {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.setItem(WELCOME_AFTER_LOGIN_KEY, "1")
  } catch {
    // Private mode / blocked storage — ignore.
  }
}

/** Call on sign-in, sign-up, and sign-out so the next login gets the welcome headline once. */
export function resetChatGreetingSession(): void {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.removeItem(WELCOME_AFTER_LOGIN_KEY)
  } catch {
    // ignore
  }
}

/** Later new chats in the same session (after welcome was shown). */
export function shouldShowTimeOfDayGreeting(): boolean {
  if (!canUseSessionStorage()) return false
  try {
    return sessionStorage.getItem(WELCOME_AFTER_LOGIN_KEY) === "1"
  } catch {
    return false
  }
}
