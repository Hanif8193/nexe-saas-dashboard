import type { NextAuthConfig } from "next-auth"

export type UserRole = "ADMIN" | "USER"
export type OrgRole = "OWNER" | "ADMIN" | "MEMBER"

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.orgId = (user as { orgId?: string }).orgId
        token.orgRole = (user as { orgRole?: string }).orgRole
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name
      }

      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }
      if (token.orgId && session.user) {
        session.user.orgId = token.orgId as string
        session.user.orgRole = token.orgRole as OrgRole
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig
