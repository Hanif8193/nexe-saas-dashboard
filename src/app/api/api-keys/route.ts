import { auth } from "@/lib/auth"
import { createApiKey } from "@/services/api-key.service"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  orgId: z.string(),
  name: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { orgId, name } = result.data

  if (session.user.orgId !== orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const rawKey = await createApiKey(orgId, name)
    return NextResponse.json({ key: rawKey })
  } catch {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
