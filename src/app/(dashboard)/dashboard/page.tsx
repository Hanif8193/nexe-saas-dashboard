import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Users, Building2, Key, Activity,
  ArrowRight, Zap, CreditCard, History, Settings,
  ShieldCheck, BarChart2, Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function getInitials(name?: string | null, email?: string | null) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (email?.[0] ?? "U").toUpperCase()
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = session.user.role === "ADMIN"

  let userCount = 0, orgCount = 0, apiKeyCount = 0
  let recentLogs: Awaited<ReturnType<typeof prisma.auditLog.findMany<{ include: { user: { select: { name: true; email: true } } } }>>> = []

  try {
    ;[userCount, orgCount, apiKeyCount, recentLogs] = await Promise.all([
      isAdmin
        ? prisma.user.count()
        : session.user.orgId
          ? prisma.membership.count({ where: { organizationId: session.user.orgId } })
          : Promise.resolve(1),
      isAdmin
        ? prisma.organization.count()
        : Promise.resolve(session.user.orgId ? 1 : 0),
      session.user.orgId
        ? prisma.apiKey.count({ where: { organizationId: session.user.orgId } })
        : isAdmin
          ? prisma.apiKey.count()
          : Promise.resolve(0),
      prisma.auditLog.findMany({
        where: isAdmin
          ? {}
          : session.user.orgId
            ? { organizationId: session.user.orgId }
            : { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } },
      }),
    ])
  } catch (error) {
    console.error("[dashboard] Failed to fetch stats:", error)
  }

  const stats = isAdmin
    ? [
        {
          title: "Total Users",
          value: userCount,
          icon: Users,
          description: "All registered accounts",
          accent: "border-l-blue-500",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        },
        {
          title: "Organizations",
          value: orgCount,
          icon: Building2,
          description: "All active workspaces",
          accent: "border-l-violet-500",
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
        {
          title: "API Keys",
          value: apiKeyCount,
          icon: Key,
          description: "Keys across all orgs",
          accent: "border-l-amber-500",
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        {
          title: "System Activity",
          value: recentLogs.length,
          icon: Activity,
          description: "Recent system events",
          accent: "border-l-emerald-500",
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        },
      ]
    : [
        {
          title: "Team Members",
          value: userCount,
          icon: Users,
          description: "Members in your org",
          accent: "border-l-blue-500",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        },
        {
          title: "Organization",
          value: orgCount,
          icon: Building2,
          description: "Your workspace",
          accent: "border-l-violet-500",
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
        {
          title: "API Keys",
          value: apiKeyCount,
          icon: Key,
          description: "Keys in your org",
          accent: "border-l-amber-500",
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        {
          title: "Activity",
          value: recentLogs.length,
          icon: Activity,
          description: "Recent events",
          accent: "border-l-emerald-500",
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        },
      ]

  const quickActions = isAdmin
    ? [
        {
          title: "Admin Panel",
          description: "Manage users & logs",
          href: "/dashboard/admin",
          icon: ShieldCheck,
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
        },
        {
          title: "Diagnostics",
          description: "System health check",
          href: "/dashboard/admin/diagnostics",
          icon: BarChart2,
          iconBg: "bg-orange-500/10",
          iconColor: "text-orange-500",
        },
        {
          title: "API Keys",
          description: "Manage access keys",
          href: "/dashboard/api-keys",
          icon: Key,
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        {
          title: "Activity Logs",
          description: "Monitor all events",
          href: "/dashboard/logs",
          icon: History,
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
      ]
    : [
        {
          title: "API Keys",
          description: "Manage access keys",
          href: "/dashboard/api-keys",
          icon: Key,
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        {
          title: "Billing",
          description: "Plans & invoices",
          href: "/dashboard/billing",
          icon: CreditCard,
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        },
        {
          title: "Activity Logs",
          description: "Monitor events",
          href: "/dashboard/logs",
          icon: History,
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
        {
          title: "Settings",
          description: "Account preferences",
          href: "/dashboard/settings",
          icon: Settings,
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        },
      ]

  const initials = getInitials(session.user.name, session.user.email)
  const displayName = session.user.name || session.user.email?.split("@")[0] || "User"

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm",
            isAdmin
              ? "bg-amber-500 text-white"
              : "bg-primary text-primary-foreground"
          )}>
            {initials}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-0.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                <ShieldCheck className="size-3" />
                Admin
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Badge className="gap-1.5 px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
              <ShieldCheck className="size-3" />
              Administrator
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              Free Plan
            </Badge>
          )}
        </div>
      </div>

      {/* Admin-only banner */}
      {isAdmin && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <ShieldCheck className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">You have full system access. Manage users, view all logs, and monitor system health.</p>
            </div>
          </div>
          <Link
            href="/dashboard/admin"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
          >
            Admin Panel <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={cn(
              "flex flex-col gap-4 rounded-xl border border-l-4 bg-card px-5 py-4",
              "shadow-sm ring-1 ring-foreground/5",
              "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
              stat.accent
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className={cn("flex size-8 items-center justify-center rounded-lg", stat.iconBg)}>
                <stat.icon className={cn("size-4", stat.iconColor)} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm font-semibold">
              {isAdmin ? "System Activity" : "Recent Activity"}
            </CardTitle>
            <Link
              href="/dashboard/logs"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Activity className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No activity yet</p>
                <p className="max-w-48 text-xs text-muted-foreground">
                  Events will appear here as you use the dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="size-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{log.action}</p>
                      {log.user && (
                        <p className="truncate text-xs text-muted-foreground">
                          {log.user.name || log.user.email}
                        </p>
                      )}
                      {log.details && !log.user && (
                        <p className="truncate text-xs text-muted-foreground">{log.details}</p>
                      )}
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm"
                >
                  <div className={cn("flex size-9 items-center justify-center rounded-lg", action.iconBg)}>
                    <action.icon className={cn("size-4", action.iconColor)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
