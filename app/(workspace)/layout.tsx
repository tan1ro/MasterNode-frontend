import type { ReactNode } from "react"
import { ClearStaleServerSession } from "@/components/auth/clear-stale-server-session"
import { RequireAuthenticatedRoute } from "@/components/auth/require-authenticated-route"
import { AppShellLayout } from "@/components/layout/app-shell-layout"
import { AppShellPageFrame } from "@/components/layout/app-shell-page-frame"

/** Shared sidebar shell for creator, business, and superuser app routes. */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClearStaleServerSession />
      <RequireAuthenticatedRoute />
      <AppShellLayout>
        <AppShellPageFrame>{children}</AppShellPageFrame>
      </AppShellLayout>
    </>
  )
}
