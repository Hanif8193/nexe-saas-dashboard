import { auth } from "@/lib/auth"
import { getSubscriptionStatus } from "@/services/billing.service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { redirect } from "next/navigation"
import { UpgradeButton } from "@/components/billing/upgrade-button"
import { ManageButton } from "@/components/billing/manage-button"
import { env } from "@/lib/env"

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user?.orgId) {
    redirect("/dashboard")
  }

  const subscription = await getSubscriptionStatus(session.user.orgId)
  const stripeEnabled = !!env.STRIPE_SECRET_KEY
  const proPriceId = env.STRIPE_PRO_PRICE_ID ?? ""

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For small projects and hobbies.",
      features: ["5 API Keys", "1,000 requests/mo", "Community support"],
      current: !subscription?.isPro,
      priceId: null,
    },
    {
      name: "Pro",
      price: "$29",
      description: "For startups and growing teams.",
      features: ["Unlimited API Keys", "100,000 requests/mo", "Priority support", "Audit logs"],
      current: !!subscription?.isPro,
      priceId: proPriceId,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground">Manage your subscription and billing details.</p>
        </div>
        {subscription?.isPro && stripeEnabled && <ManageButton />}
      </div>

      {subscription?.isPro && subscription.stripeCurrentPeriodEnd && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Badge>Pro</Badge>
              <span className="text-sm text-muted-foreground">
                Renews {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.current && <Badge variant="secondary">Current Plan</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">
                {plan.price}
                <span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="grid gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.current ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : stripeEnabled && plan.priceId ? (
                <UpgradeButton
                  priceId={plan.priceId}
                  label="Upgrade to Pro"
                  className="w-full"
                />
              ) : (
                <Button className="w-full" disabled>
                  {stripeEnabled ? "Upgrade" : "Stripe not configured"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
