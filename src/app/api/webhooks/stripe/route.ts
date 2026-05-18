import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") ?? ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  try {
    // Idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    })
    if (existingEvent) {
      return new NextResponse("Event already processed", { status: 200 })
    }

    await prisma.webhookEvent.create({
      data: { eventId: event.id, provider: "stripe" },
    })

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session

      if (!checkoutSession.metadata?.organizationId) {
        return new NextResponse("Org ID is required", { status: 400 })
      }

      if (!checkoutSession.subscription) {
        console.warn("[webhook/stripe] checkout.session.completed has no subscription")
        return new NextResponse(null, { status: 200 })
      }

      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription.id

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const item = subscription.items.data[0]

      if (!item) {
        console.error("[webhook/stripe] Subscription has no line items:", subscription.id)
        return new NextResponse("Invalid subscription", { status: 400 })
      }

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id

      await prisma.organization.update({
        where: { id: checkoutSession.metadata.organizationId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          stripePriceId: item.price.id,
          stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
        },
      })
    }

    if (event.type === "invoice.payment_succeeded") {
      // Stripe v22 types may not expose .subscription directly; access via data object
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null
      }

      if (!invoice.subscription) {
        return new NextResponse(null, { status: 200 })
      }

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const item = subscription.items.data[0]

      if (!item) {
        return new NextResponse(null, { status: 200 })
      }

      await prisma.organization.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: item.price.id,
          stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
        },
      })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[webhook/stripe] Error processing event:", event.type, error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
