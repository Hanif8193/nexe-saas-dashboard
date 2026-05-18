import { auth } from "@/lib/auth"
import { deleteApiKey } from "@/services/api-key.service"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({ orgId: z.string() })

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { orgId } = result.data

  if (session.user.orgId !== orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await deleteApiKey(id, orgId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}
