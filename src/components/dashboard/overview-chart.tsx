"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { name: "Jan", total: 104 },
    { name: "Feb", total: 120 },
    { name: "Mar", total: 154 },
    { name: "Apr", total: 180 },
    { name: "May", total: 150 },
    { name: "Jun", total: 210 },
    { name: "Jul", total: 240 },
    { name: "Aug", total: 190 },
    { name: "Sep", total: 220 },
    { name: "Oct", total: 270 },
    { name: "Nov", total: 310 },
    { name: "Dec", total: 340 },
]

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none" }}
                    labelStyle={{ fontWeight: "bold", color: "#333" }}
                />
                <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--theme-primary, #6366f1)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
