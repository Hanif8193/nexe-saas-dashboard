import { AppNavbar } from "@/components/layout/app-navbar"
import { auth } from "@/lib/auth"
import { getUserOrganizations } from "@/services/org.service"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const organizations = await getUserOrganizations(session.user.id)
  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar organizations={organizations} isAdmin={isAdmin} />
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
