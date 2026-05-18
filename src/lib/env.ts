import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Redis (optional — rate limiting degrades gracefully if missing)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRO_PRICE_ID: z.string().min(1).optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().min(1).optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional().default("onboarding@resend.dev"),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

export const env = envSchema.parse(process.env)

if (!process.env.AUTH_SECRET) {
  console.error("[env] AUTH_SECRET is not set — NextAuth cannot sign tokens. Set it in .env")
}
if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
  console.error("[env] NEXTAUTH_URL is not set — set it to your production URL in .env")
}
