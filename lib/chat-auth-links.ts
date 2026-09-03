import { ROUTES } from "@/lib/routes"

/** Path to return to after auth when leaving chat (defaults to draft `/chat`). */
export function chatAuthReturnTo(pathname: string | null | undefined): string {
  const path = pathname?.trim()
  return path && path.startsWith("/") ? path : ROUTES.chat
}

export function chatSignInHref(pathname: string | null | undefined): string {
  return `${ROUTES.signIn}?redirect_url=${encodeURIComponent(chatAuthReturnTo(pathname))}`
}

export function chatSignUpHref(pathname: string | null | undefined): string {
  return `${ROUTES.signUp}?redirect_url=${encodeURIComponent(chatAuthReturnTo(pathname))}`
}
