"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ color: "#666", fontSize: "0.875rem" }}>{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={reset}
            style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
