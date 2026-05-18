import { auth } from "@/lib/auth"
import { createPortalSession } from "@/services/billing.service"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const portalSession = await createPortalSession(session.user.orgId)
    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create portal session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
