"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ManageButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to open billing portal")
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
      <Button variant="outline" onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting..." : "Manage Subscription"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
