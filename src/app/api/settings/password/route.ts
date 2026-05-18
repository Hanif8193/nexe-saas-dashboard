import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { currentPassword, newPassword } = result.data

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) {
      return NextResponse.json({ error: "No password set for this account" }, { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[settings/password] Failed to update password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
