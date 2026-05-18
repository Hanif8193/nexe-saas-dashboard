"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  CreditCard,
  Activity,
  BarChart2,
  Key,
  ChevronsUpDown,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOutAction } from "@/app/actions/auth"

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] ?? "U").toUpperCase()
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
    { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
    { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
    { title: "Activity Logs", url: "/dashboard/logs", icon: History },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ]

  const adminItems = [
    { title: "Admin Panel", url: "/dashboard/admin", icon: ShieldCheck },
    { title: "Diagnostics", url: "/dashboard/admin/diagnostics", icon: Activity },
  ]

  const user = session?.user
  const initials = getInitials(user?.name, user?.email)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">SaaS Dash</span>
                <span className="text-xs text-sidebar-foreground/70">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {session?.user?.role === "ADMIN" && (
          <>
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
              Admin
            </div>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }>
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                  <span className="truncate font-medium text-sm">
                    {user?.name || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{user?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => (window.location.href = "/dashboard/settings")}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => signOutAction()}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
