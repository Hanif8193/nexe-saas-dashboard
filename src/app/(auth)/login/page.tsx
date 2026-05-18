import { auth } from "@/lib/auth"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect("/dashboard")

  const { error } = await searchParams
  const errorMsg = error ? "Invalid email or password." : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access the dashboard.
          </CardDescription>
        </CardHeader>
        <LoginForm errorMsg={errorMsg} />
      </Card>
    </div>
  )
}
