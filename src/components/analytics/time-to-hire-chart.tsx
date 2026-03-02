"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { month: "Jan", days: 42 },
    { month: "Feb", days: 38 },
    { month: "Mar", days: 45 },
    { month: "Apr", days: 35 },
    { month: "May", days: 32 },
    { month: "Jun", days: 28 },
    { month: "Jul", days: 25 },
    { month: "Aug", days: 27 },
    { month: "Sep", days: 24 },
    { month: "Oct", days: 22 },
    { month: "Nov", days: 19 },
    { month: "Dec", days: 18 },
]

export function TimeToHireChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary, #6366f1)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--theme-primary, #6366f1)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={10}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}d`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Area
                    type="monotone"
                    dataKey="days"
                    stroke="var(--theme-primary, #6366f1)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDays)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
