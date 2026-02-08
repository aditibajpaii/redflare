"use client"

import { motion } from "framer-motion"
import { TrendUp01, TrendDown01, Activity, CurrencyDollarCircle } from "@untitledui/icons"
import { cn } from "@/lib/utils"

type Indicator = {
    type: "price" | "pe" | "debt" | "sentiment" | "news"
    label: string
    value: string
    status: "bullish" | "bearish" | "neutral" | "warning"
    divergent?: boolean
}

type DivergenceIndicatorProps = {
    indicators: Indicator[]
}

const statusConfig = {
    bullish: { color: "text-accent-growth", bg: "bg-accent-growth/10", icon: TrendUp01 },
    bearish: { color: "text-accent-decay", bg: "bg-accent-decay/10", icon: TrendDown01 },
    warning: { color: "text-accent-warning", bg: "bg-accent-warning/10", icon: Activity },
    neutral: { color: "text-muted-foreground", bg: "bg-muted/30", icon: CurrencyDollarCircle },
}

export function DivergenceIndicator({ indicators }: DivergenceIndicatorProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
                {indicators.map((indicator, i) => {
                    const config = statusConfig[indicator.status]
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={indicator.type}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "relative px-4 py-3 rounded-xl border backdrop-blur-sm",
                                indicator.divergent
                                    ? "border-accent-decay bg-accent-decay/5 animate-pulse"
                                    : "border-border bg-card/50"
                            )}
                        >
                            {indicator.divergent && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-decay animate-ping" />
                            )}

                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", config.bg)}>
                                    <Icon className={cn("w-4 h-4", config.color)} />
                                </div>

                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                        {indicator.label}
                                    </div>
                                    <div className={cn("font-pixel text-lg", config.color)}>
                                        {indicator.value}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
