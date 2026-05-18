"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function demoLoginAction() {
  try {
    await signIn("credentials", {
      email: "admin@example.com",
      password: "password",
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1")
    }
    throw error
  }
}
