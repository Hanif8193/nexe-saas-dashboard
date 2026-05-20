"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { registerAction } from "./actions"

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  password_mismatch: "Passwords do not match.",
  password_too_short: "Password must be at least 8 characters.",
  email_taken: "An account with this email already exists.",
}

export function RegisterForm({ errorKey }: { errorKey: string | null }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const errorMsg = errorKey ? (ERROR_MESSAGES[errorKey] ?? "Something went wrong.") : null

  return (
    <form action={registerAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" type="submit">
          Create Account
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-foreground">
            Sign in
          </a>
        </p>
      </CardFooter>
    </form>
  )
}
