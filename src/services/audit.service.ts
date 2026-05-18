import "server-only"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

interface AuditLogOptions {
  action: string
  details?: string
  metadata?: Record<string, unknown>
  userId?: string
  organizationId?: string
}

export async function createAuditLog(options: AuditLogOptions) {
  const headersList = await headers()
  const ipAddress = headersList.get("x-forwarded-for") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  try {
    return await prisma.auditLog.create({
      data: {
        action: options.action,
        details: options.details,
        metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : undefined,
        userId: options.userId,
        organizationId: options.organizationId,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
