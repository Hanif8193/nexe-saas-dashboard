"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { loginAction } from "./actions"

export function LoginForm({ errorMsg }: { errorMsg: string | null }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={loginAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
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
        {errorMsg && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" type="submit">
          Sign In
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <a href="/register" className="underline hover:text-foreground">
            Sign up
          </a>
        </p>
      </CardFooter>
    </form>
  )
}
