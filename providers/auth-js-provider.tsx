"use client"

import { SessionProvider } from "next-auth/react"

export function AuthJsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/oauth" refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}
