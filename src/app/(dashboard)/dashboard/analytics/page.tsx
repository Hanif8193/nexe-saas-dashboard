import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AnalyticsCharts } from "@/components/analytics/charts"

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Gather data for the last 7 days
  const days = 7
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  let apiUsage: Awaited<ReturnType<typeof prisma.apiUsage.findMany>> = []
  let auditLogs: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = []

  try {
    ;[apiUsage, auditLogs] = await Promise.all([
      session.user.orgId
        ? prisma.apiUsage.findMany({
            where: { organizationId: session.user.orgId, timestamp: { gte: since } },
            orderBy: { timestamp: "asc" },
          })
        : Promise.resolve([]),
      prisma.auditLog.findMany({
        where: {
          ...(session.user.orgId ? { organizationId: session.user.orgId } : { userId: session.user.id }),
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "asc" },
      }),
    ])
  } catch (error) {
    console.error("[analytics] Failed to fetch data:", error)
  }

  // Group by day
  const groupByDay = (items: { timestamp?: Date; createdAt?: Date }[]) => {
    const map: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      map[key] = 0
    }
    for (const item of items) {
      const date = item.timestamp ?? item.createdAt
      if (!date) continue
      const key = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (key in map) map[key]++
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }))
  }

  const apiData = groupByDay(apiUsage.map((u) => ({ timestamp: u.timestamp })))
  const activityData = groupByDay(auditLogs.map((l) => ({ createdAt: l.createdAt })))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Usage and activity over the last 7 days.</p>
      </div>
      <AnalyticsCharts apiData={apiData} activityData={activityData} />
    </div>
  )
}
