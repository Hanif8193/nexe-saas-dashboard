import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig, UserRole, OrgRole } from "./auth.config"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      orgId?: string
      orgRole?: OrgRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    orgId?: string
    orgRole?: OrgRole
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: { organization: true },
              take: 1,
            },
          },
        })

        if (!user) {
          console.log("[auth] user not found:", credentials.email)
          return null
        }
        if (!user.password) {
          console.log("[auth] user has no password:", credentials.email)
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        console.log("[auth] password check for", credentials.email, "→", isValid ? "VALID" : "INVALID")
        if (!isValid) return null

        const firstMembership = user.memberships[0]

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: firstMembership?.organizationId,
          orgRole: firstMembership?.role,
        }
      },
    }),
  ],
})
