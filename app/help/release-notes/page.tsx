import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"

/** Legacy help URL — canonical release notes live at `/release-notes`. */
export default function HelpReleaseNotesRedirect() {
  redirect(ROUTES.helpReleaseNotes)
}
