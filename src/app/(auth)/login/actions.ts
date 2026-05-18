"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      redirect("/login?error=CredentialsFailed")
    }
    throw error
  }
}

export async function demoLoginAction() {
  try {
    await signIn("credentials", {
      email: "admin@example.com",
      password: "admin123",
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      redirect("/login?error=CredentialsFailed")
    }
    throw error
  }
}
