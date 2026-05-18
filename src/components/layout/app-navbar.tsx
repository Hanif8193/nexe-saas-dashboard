"use client"

import * as React from "react"
import {
  LayoutDashboard, Settings, ShieldCheck, History,
  LogOut, CreditCard, BarChart2, Key, Menu, Activity,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { signOutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { OrgSwitcher } from "@/components/organization/org-switcher"
import { Separator } from "@/components/ui/separator"

interface Organization {
  id: string
  name: string
  slug: string
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (email?.[0] ?? "U").toUpperCase()
}

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
  { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Logs", url: "/dashboard/logs", icon: History },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

const adminItems = [
  { title: "Admin", url: "/dashboard/admin", icon: ShieldCheck },
  { title: "Diagnostics", url: "/dashboard/admin/diagnostics", icon: Activity },
]

export function AppNavbar({ organizations, isAdmin }: { organizations: Organization[]; isAdmin: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const initials = getInitials(user?.name, user?.email)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-semibold text-sm hidden sm:block">SaaS Dash</span>
        </Link>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                pathname === item.url
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="size-3.5 shrink-0" />
              {item.title}
            </Link>
          ))}

          {isAdmin && (
            <>
              <Separator orientation="vertical" className="h-4 mx-1" />
              {adminItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    pathname === item.url
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-3.5 shrink-0" />
                  {item.title}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="hidden lg:block">
            <OrgSwitcher organizations={organizations} />
          </div>

          <ModeToggle />

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="rounded-full size-8 p-0" />
            }>
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => (window.location.href = "/dashboard/settings")}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => signOutAction()}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }>
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Sheet header */}
                <div className="flex items-center gap-2 px-4 h-14 border-b shrink-0">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span className="font-semibold">SaaS Dash</span>
                </div>

                {/* Org switcher */}
                <div className="px-4 pt-4">
                  <OrgSwitcher organizations={organizations} />
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.url
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.title}
                    </Link>
                  ))}

                  {isAdmin && (
                    <>
                      <div className="mx-2 my-2 text-xs font-medium text-muted-foreground">Admin</div>
                      {adminItems.map((item) => (
                        <Link
                          key={item.url}
                          href={item.url}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === item.url
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          {item.title}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>

                {/* Sheet footer — user info */}
                <div className="border-t px-4 py-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user?.name || "User"}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => signOutAction()}
                      title="Log out"
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
