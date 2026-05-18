"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface UpgradeButtonProps {
  priceId: string
  label?: string
  variant?: "default" | "outline"
  className?: string
}

export function UpgradeButton({ priceId, label = "Upgrade", variant = "default", className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to start checkout")
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("No redirect URL returned. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button className={className} variant={variant} onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting..." : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
