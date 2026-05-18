import { prisma } from "@/lib/prisma"

export async function createLog(userId: string, action: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    })
  } catch (error) {
    console.error("Failed to create log:", error)
  }
}
