import { describe, it, expect, vi, beforeEach } from "vitest"
import { createApiKey, verifyApiKey } from "@/services/api-key.service"
import { prisma } from "@/lib/prisma"

describe("ApiKey Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a hashed API key and return raw key", async () => {
    const orgId = "org_123"
    const name = "Test Key"
    
    const rawKey = await createApiKey(orgId, name)
    
    expect(rawKey).toMatch(/^sk_/)
    expect(prisma.apiKey.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name,
        organizationId: orgId,
      })
    }))
  })

  it("should verify a valid API key", async () => {
    const rawKey = "sk_test_key"
    // Mock successful findUnique
    ;(prisma.apiKey.findUnique as any).mockResolvedValue({
      id: "key_123",
      organization: { id: "org_123" }
    })

    const result = await verifyApiKey(rawKey)
    
    expect(result).toBeDefined()
    expect(prisma.apiKey.update).toHaveBeenCalled()
  })
})
