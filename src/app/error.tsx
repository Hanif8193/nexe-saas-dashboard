"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[RootError]", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
