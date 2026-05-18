import "server-only"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

function getAppUrl(): string {
  return (
    env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

export async function createCheckoutSession(orgId: string, priceId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org) throw new Error("Organization not found")

  let customerId = org.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      metadata: {
        organizationId: orgId,
      },
    })
    customerId = customer.id
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId: customerId },
    })
  }

  const appUrl = getAppUrl()

  return await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: {
      organizationId: orgId,
    },
  })
}

export async function createPortalSession(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org?.stripeCustomerId) throw new Error("Stripe customer not found")

  return await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${getAppUrl()}/dashboard/billing`,
  })
}

export async function getSubscriptionStatus(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      stripeSubscriptionId: true,
    },
  })

  if (!org) return null

  const isPro = !!(
    org.stripePriceId &&
    org.stripeCurrentPeriodEnd &&
    org.stripeCurrentPeriodEnd.getTime() > Date.now()
  )

  return {
    ...org,
    isPro,
    plan: isPro ? "Pro" : "Free",
  }
}
