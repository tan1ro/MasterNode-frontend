import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_COOKIE } from "@/lib/server/auth-cookies"
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/auth-session"

export async function GET() {
  const access = cookies().get(ACCESS_COOKIE)?.value?.trim()
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value
  const session = await verifySessionToken(sessionToken)
  if (!access && !session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({
    authenticated: Boolean(session),
    access_token: access ?? null,
    session,
  })
}
