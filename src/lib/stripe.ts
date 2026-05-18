import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured")
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" })
  }
  return _stripe
}

// Backward-compatible export for files that use stripe directly
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})
