"use client"

import { useMemo, useState } from "react"
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type LiveChartProps = {
    data?: { date: string; price: number; volume: number }[]
    priceChange: number
    symbol: string
}

export function LiveChart({ data, priceChange, symbol }: LiveChartProps) {
    const [timeRange, setTimeRange] = useState("30D")

    const isPositive = priceChange >= 0

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return []

        const now = new Date()
        const cutoff = new Date()

        switch (timeRange) {
            case "1D":
                cutoff.setDate(now.getDate() - 1)
                break
            case "1W":
                cutoff.setDate(now.getDate() - 7)
                break
            case "1M":
                cutoff.setMonth(now.getMonth() - 1)
                break
            case "3M":
                cutoff.setMonth(now.getMonth() - 3)
                break
            case "YTD":
                cutoff.setMonth(0, 1)
                break
            case "1Y":
                cutoff.setFullYear(now.getFullYear() - 1)
                break
            default:
                cutoff.setMonth(now.getMonth() - 1)
        }

        let filtered = data.filter(d => new Date(d.date) >= cutoff)

        if (filtered.length < 2) {
            if (timeRange === "1D") filtered = data.slice(-5)
            else if (timeRange === "1W") filtered = data.slice(-10)
            else if (timeRange === "1M") filtered = data.slice(-30)
        }

        return filtered.map((d) => ({
            ...d,
            displayDate: new Date(d.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: ["1Y", "YTD"].includes(timeRange) ? "2-digit" : undefined
            }),
        }))
    }, [data, timeRange])

    const { minPrice, maxPrice, avgPrice } = useMemo(() => {
        if (!chartData.length) return { minPrice: 0, maxPrice: 0, avgPrice: 0 }
        const prices = chartData.map((d) => d.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        return {
            minPrice: min,
            maxPrice: max,
            avgPrice: (min + max) / 2,
        }
    }, [chartData])

    if (!chartData.length) {
        return (
            <div className="w-full max-w-3xl mx-auto h-64 rounded-2xl bg-card/50 border border-border flex items-center justify-center">
                <span className="text-muted-foreground">No chart data available</span>
            </div>
        )
    }

    const priceColor = isPositive ? "#10B981" : "#EF4444"
    const volumeColor = isPositive ? "#10B981" : "#EF4444"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="p-4 sm:p-6 rounded-xl border bg-card/60 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">{symbol}</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-mono font-medium",
                                isPositive ? "bg-accent-growth/10 text-accent-growth" : "bg-accent-decay/10 text-accent-decay"
                            )}>
                                {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                            NIFTY 50 • REAL-TIME DATA
                        </div>
                    </div>

                    <div className="flex flex-wrap p-0.5 rounded-lg bg-secondary/30 border border-border/50">
                        {["1D", "1W", "1M", "3M", "YTD", "1Y"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-medium transition-all",
                                    timeRange === range
                                        ? "bg-muted text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[280px] sm:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={priceColor} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={priceColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2} />

                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#666", fontSize: 10, fontFamily: "var(--font-mono)" }}
                                minTickGap={30}
                            />

                            <YAxis
                                yAxisId="price"
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#666", fontSize: 10, fontFamily: "var(--font-mono)" }}
                                tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                                width={60}
                                orientation="right"
                            />

                            <YAxis
                                yAxisId="volume"
                                orientation="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#666", fontSize: 10, fontFamily: "var(--font-mono)" }}
                                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                                width={40}
                            />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    padding: "12px",
                                }}
                                itemStyle={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                                labelStyle={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#888", marginBottom: "4px" }}
                                formatter={(value: number, name: string) => [
                                    name === "price" ? `₹${value.toLocaleString("en-IN")}` : value.toLocaleString("en-IN"),
                                    name === "price" ? "Price" : "Volume"
                                ]}
                            />

                            <Area
                                yAxisId="price"
                                type="monotone"
                                dataKey="price"
                                stroke={priceColor}
                                strokeWidth={2}
                                fill="url(#chartGradient)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />

                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill={volumeColor}
                                opacity={0.15}
                                barSize={4}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    )
}
