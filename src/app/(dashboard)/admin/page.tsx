import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
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

export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  let allLogs: Prisma.AuditLogGetPayload<{ include: { user: true } }>[] = []
  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = []

  try {
    ;[allLogs, users] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.user.findMany({
        orderBy: { role: "asc" },
      }),
    ])
  } catch (error) {
    console.error("[admin] Failed to fetch data:", error)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-muted-foreground">Manage users and view system-wide activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System-wide Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.user?.name || log.user?.email || "System"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.details || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {allLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No logs found.
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
