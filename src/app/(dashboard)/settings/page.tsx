"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await update({ name })
        showMsg("success", "Profile updated successfully.")
        router.refresh()
      } else {
        showMsg("error", "Failed to update profile.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return
    setSaving(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setCurrentPassword("")
        setNewPassword("")
        showMsg("success", "Password changed successfully.")
      } else {
        const data = await res.json()
        showMsg("error", data.error || "Failed to change password.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {msg && (
        <div className={`rounded-md px-4 py-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session?.user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <Button onClick={handleProfileSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-pass">New Password</Label>
                <Input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={saving || !currentPassword || !newPassword}
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
