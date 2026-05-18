"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface DataPoint {
  date: string
  count: number
}

interface AnalyticsChartsProps {
  apiData: DataPoint[]
  activityData: DataPoint[]
}

export function AnalyticsCharts({ apiData, activityData }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={apiData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Requests"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
