import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createLog } from "@/lib/logs"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Record API usage — non-fatal if it fails
  if (session.user.orgId) {
    try {
      await prisma.apiUsage.create({
        data: {
          organizationId: session.user.orgId,
          endpoint: "/api/data",
        },
      })
    } catch (error) {
      console.error("[api/data] Failed to record usage:", error)
    }
  }

  // Audit log — non-fatal
  try {
    await createLog(session.user.id, "API_CALL", "Accessed /api/data")
  } catch (error) {
    console.error("[api/data] Failed to create log:", error)
  }

  return NextResponse.json({
    message: "Success",
    data: {
      timestamp: new Date().toISOString(),
      status: "active",
      usage: "tracked",
    },
  })
}
