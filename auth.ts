import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Apple from "next-auth/providers/apple"
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id"
import {
  getConfiguredOAuthProviders,
  type OAuthProviderId,
} from "@/lib/oauth-config"
import type { Provider } from "next-auth/providers"

function buildProvider(id: OAuthProviderId): Provider {
  switch (id) {
    case "google":
      return Google({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      })
    case "github":
      return GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        authorization: { params: { scope: "read:user user:email" } },
      })
    case "microsoft":
      return MicrosoftEntraId({
        id: "microsoft",
        clientId: process.env.AUTH_MICROSOFT_ID!,
        clientSecret: process.env.AUTH_MICROSOFT_SECRET!,
      })
    case "apple":
      return Apple({
        clientId: process.env.AUTH_APPLE_ID!,
        clientSecret: process.env.AUTH_APPLE_SECRET!,
      })
  }
}

const providers = getConfiguredOAuthProviders().map(buildProvider)

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/oauth",
  secret: process.env.AUTH_SECRET?.trim() || process.env.AUTH_SESSION_SECRET?.trim(),
  trustHost: true,
  providers,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider) token.provider = account.provider
      if (account?.providerAccountId) token.providerAccountId = account.providerAccountId
      return token
    },
    async session({ session, token }) {
      session.provider = typeof token.provider === "string" ? token.provider : undefined
      session.providerAccountId =
        typeof token.providerAccountId === "string" ? token.providerAccountId : undefined
      return session
    },
    async signIn({ account, profile }) {
      if (!account?.provider || !account.providerAccountId) return false
      const email = String(profile?.email || "").trim()
      if (!email) return false
      if (account.provider === "google") {
        return profile?.email_verified !== false
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
})
