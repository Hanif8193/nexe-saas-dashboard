import { auth } from "@/lib/auth"
import { getApiKeys } from "@/services/api-key.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { ApiKeyActions } from "@/components/api-keys/actions"

export default async function ApiKeysPage() {
  const session = await auth()

  if (!session?.user?.orgId) {
    redirect("/dashboard")
  }

  const apiKeys = await getApiKeys(session.user.orgId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for your organization.</p>
        </div>
        <ApiKeyActions orgId={session.user.orgId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Keys</CardTitle>
          <CardDescription>
            Your API keys grant programmatic access. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {key.displayKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <ApiKeyActions orgId={session.user.orgId!} keyId={key.id} mode="delete" />
                  </TableCell>
                </TableRow>
              ))}
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
