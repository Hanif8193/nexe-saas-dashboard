import "server-only"
import { prisma } from "@/lib/prisma"
import { OrgRole } from "@prisma/client"

export async function createOrganization(userId: string, name: string) {
  const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7)

  try {
    return await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: OrgRole.OWNER,
          },
        },
      },
    })
  } catch (error) {
    console.error("[org.service] Failed to create organization:", error)
    throw error
  }
}

export async function getUserOrganizations(userId: string) {
  try {
    return await prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
        },
      },
    })
  } catch (error) {
    console.error("[org.service] Failed to fetch organizations for user:", userId, error)
    return []
  }
}

export async function isOrgMember(userId: string, orgId: string) {
  try {
    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId: orgId },
    })
    return !!membership
  } catch (error) {
    console.error("[org.service] Failed to check membership:", error)
    return false
  }
}
