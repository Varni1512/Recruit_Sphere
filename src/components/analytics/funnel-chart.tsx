"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { stage: "Applied", count: 1250, dropoff: 0 },
    { stage: "Screened", count: 850, dropoff: 400 },
    { stage: "Shortlisted", count: 420, dropoff: 430 },
    { stage: "Interviewed", count: 150, dropoff: 270 },
    { stage: "Offered", count: 45, dropoff: 105 },
    { stage: "Hired", count: 32, dropoff: 13 },
]

export function FunnelChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={10}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar
                    dataKey="count"
                    fill="var(--theme-primary, #6366f1)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
