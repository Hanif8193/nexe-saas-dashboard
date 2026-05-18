"use client"

import { usePathname } from "next/navigation"

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/api-keys": "API Keys",
  "/dashboard/billing": "Billing",
  "/dashboard/logs": "Activity Logs",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin Panel",
  "/dashboard/admin/diagnostics": "Diagnostics",
}

export function PageTitle() {
  const pathname = usePathname()
  const title = ROUTE_TITLES[pathname] ?? "Dashboard"
  return <h1 className="text-lg font-semibold">{title}</h1>
}
