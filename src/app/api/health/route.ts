import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"

export async function GET() {
  const status: Record<string, string> = {
    database: "down",
    redis: redis ? "down" : "not_configured",
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    status.database = "up"
  } catch {
    status.database = "down"
  }

  if (redis) {
    try {
      await redis.ping()
      status.redis = "up"
    } catch {
      status.redis = "down"
    }
  }

  const isUp = status.database === "up"

  return NextResponse.json(
    { status: isUp ? "healthy" : "unhealthy", details: status },
    { status: isUp ? 200 : 503 }
  )
}
