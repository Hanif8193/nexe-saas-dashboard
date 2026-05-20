"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import bcrypt from "bcryptjs"

export async function registerAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!name || !email || !password) {
    redirect("/register?error=missing_fields")
  }

  if (password !== confirm) {
    redirect("/register?error=password_mismatch")
  }

  if (password.length < 8) {
    redirect("/register?error=password_too_short")
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    redirect("/register?error=email_taken")
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { name, email, password: hashed },
  })

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" })
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      redirect("/login?error=CredentialsFailed")
    }
    throw error
  }
}
