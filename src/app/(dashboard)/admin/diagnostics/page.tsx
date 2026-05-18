import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"

export default async function DiagnosticsPage() {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const status = {
    database: "checking",
    redis: redis ? "checking" : "not_configured",
    stripe: !!process.env.STRIPE_SECRET_KEY ? "configured" : "missing",
    resend: !!process.env.RESEND_API_KEY ? "configured" : "missing",
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    status.database = "healthy"
  } catch {
    status.database = "error"
  }

  if (redis) {
    try {
      await redis.ping()
      status.redis = "healthy"
    } catch {
      status.redis = "error"
    }
  }

  const badgeVariant = (val: string): "default" | "destructive" | "secondary" | "outline" => {
    if (val === "healthy" || val === "configured") return "default"
    if (val === "not_configured" || val === "missing") return "secondary"
    return "destructive"
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Diagnostics</h2>
        <p className="text-muted-foreground">Service health and configuration status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(status).map(([key, val]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={badgeVariant(val)}>{val}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
