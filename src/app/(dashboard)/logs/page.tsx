import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"

export default async function LogsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  let logs: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = []
  try {
    logs = await prisma.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  } catch (error) {
    console.error("[logs] Failed to fetch audit logs:", error)
  }

  const actionColor = (action: string) => {
    if (action.includes("LOGIN")) return "default"
    if (action.includes("DELETE") || action.includes("ERROR")) return "destructive"
    if (action.includes("UPDATE") || action.includes("CHANGE")) return "secondary"
    return "outline"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
        <p className="text-muted-foreground">A record of actions performed on your account.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={actionColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.details || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No activity logs found.
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
