"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Organization {
  id: string
  name: string
  slug: string
}

export function OrgSwitcher({ organizations }: { organizations: Organization[] }) {
  const { data: session, update } = useSession()
  const router = useRouter()
  
  const currentOrg = organizations.find((org) => org.id === session?.user?.orgId) || organizations[0]

  const onOrgSelect = async (org: Organization) => {
    await update({
      orgId: org.id,
      // In a real app, you'd fetch the user's role in this specific org too
    })
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" role="combobox" aria-label="Select an organization" className="w-[200px] justify-between" />}>
        <span className="truncate font-medium">
          {currentOrg?.name || "Select Organization"}
        </span>
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => onOrgSelect(org)}
              className="text-sm"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentOrg?.id === org.id ? "opacity-100" : "opacity-0"
                )}
              />
              {org.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/organizations/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
