"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Trash2, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApiKeyActionsProps {
  orgId: string
  keyId?: string
  mode?: "create" | "delete"
}

export function ApiKeyActions({ orgId, keyId, mode = "create" }: ApiKeyActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, name }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to create API key")
        return
      }
      if (data.key) {
        setNewKey(data.key)
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!keyId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to delete API key")
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (mode === "delete") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}>
          <Trash2 className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setName(""); setNewKey(null); setError(null) } }}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" /> Create API Key
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>Give your API key a descriptive name.</DialogDescription>
        </DialogHeader>
        {!newKey ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Production key"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button onClick={handleCreate} disabled={loading || !name.trim()}>
                {loading ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy your new API key now. You won&apos;t be able to see it again.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">
                {newKey}
              </code>
              <Button variant="outline" size="sm" onClick={copyKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
