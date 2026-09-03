import { NextResponse } from "next/server"
import { buildDesktopLatestManifest } from "@/lib/desktop-version"

export const runtime = "nodejs"

/** Public latest-desktop catalog used by the native app’s version manager. */
export async function GET() {
  return NextResponse.json(buildDesktopLatestManifest(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  })
}
