import { auth } from "@/lib/auth"
import { createCheckoutSession } from "@/services/billing.service"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  priceId: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const checkoutSession = await createCheckoutSession(session.user.orgId, result.data.priceId)
    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
