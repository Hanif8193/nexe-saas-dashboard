import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock server-only
vi.mock("server-only", () => ({}))

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    organization: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    membership: { findFirst: vi.fn(), create: vi.fn() },
    apiKey: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), delete: vi.fn(), update: vi.fn() },
  },
}))

// Mock Redis
vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn() },
  ratelimit: { limit: vi.fn(() => ({ success: true })) },
}))

// Mock Stripe
vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  },
}))
