import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(100),
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

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: result.data.name },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[settings/profile] Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
