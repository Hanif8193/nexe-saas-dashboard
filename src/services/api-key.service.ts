import "server-only"
import { prisma } from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"

export async function createApiKey(orgId: string, name: string) {
  const rawKey = `sk_${randomBytes(24).toString("hex")}`
  const hashedKey = createHash("sha256").update(rawKey).digest("hex")
  const displayKey = `${rawKey.substring(0, 7)}...${rawKey.slice(-4)}`

  try {
    await prisma.apiKey.create({
      data: {
        name,
        key: hashedKey,
        displayKey,
        organizationId: orgId,
      },
    })
    return rawKey
  } catch (error) {
    console.error("[api-key.service] Failed to create API key:", error)
    throw error
  }
}

export async function verifyApiKey(rawKey: string) {
  const hashedKey = createHash("sha256").update(rawKey).digest("hex")

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { organization: true },
    })

    if (apiKey) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      }).catch((err) => console.error("[api-key.service] Failed to update lastUsedAt:", err))
    }

    return apiKey
  } catch (error) {
    console.error("[api-key.service] Failed to verify API key:", error)
    return null
  }
}

export async function getApiKeys(orgId: string) {
  try {
    return await prisma.apiKey.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("[api-key.service] Failed to fetch API keys:", error)
    return []
  }
}

export async function deleteApiKey(id: string, orgId: string) {
  try {
    return await prisma.apiKey.delete({
      where: { id, organizationId: orgId },
    })
  } catch (error) {
    console.error("[api-key.service] Failed to delete API key:", error)
    throw error
  }
}
