"use client"

import { useEffect, useState } from "react"
import {
    TrendUp01,
    TrendDown01,
    Activity as ActivityIcon,
    BarChartSquare02,
    Zap as ZapIcon
} from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { getMarketMovers } from "@/app/actions/market"
import { BentoCard } from "./BentoCard"

type MarketData = Awaited<ReturnType<typeof getMarketMovers>>

export function BentoGrid() {
    const [marketData, setMarketData] = useState<MarketData>({
        trending: [],
        topGainers: [],
        topLosers: [],
        mostActive: []
    })

    useEffect(() => {
        getMarketMovers().then(setMarketData)
    }, [])

    const { topGainers, topLosers, mostActive } = marketData

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto md:h-[400px]">
            <BentoCard title="Market Heartbeat" icon={ActivityIcon} className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                    <div className="flex flex-col justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                        <div>
                            <div className="text-xs text-muted-foreground">NIFTY 50</div>
                            <div className="text-lg font-mono font-medium mt-1">
                                {marketData.indexData?.regularMarketPrice
                                    ? `₹${marketData.indexData.regularMarketPrice.toLocaleString("en-IN")}`
                                    : "Loading..."}
                            </div>
                        </div>
                        <div className={cn("text-xs flex items-center gap-1",
                            (marketData.indexData?.regularMarketChangePercent || 0) >= 0 ? "text-accent-growth" : "text-accent-decay"
                        )}>
                            {(marketData.indexData?.regularMarketChangePercent || 0) >= 0 ? <TrendUp01 className="w-3 h-3" /> : <TrendDown01 className="w-3 h-3" />}
                            {marketData.indexData?.regularMarketChangePercent
                                ? `${marketData.indexData.regularMarketChangePercent > 0 ? "+" : ""}${marketData.indexData.regularMarketChangePercent.toFixed(2)}%`
                                : "0.00%"}
                        </div>
                        <div className="h-8 mt-2 flex items-end gap-0.5 opacity-50">
                            {[...Array(20)].map((_, j) => (
                                <div
                                    key={j}
                                    className="w-full rounded-sm bg-accent-growth"
                                    style={{ height: `${Math.random() * 60 + 20}%` }}
                                    suppressHydrationWarning
                                />
                            ))}
                        </div>
                    </div>

                    {(topGainers.slice(0, 2) || []).map((stock, i) => (
                        <div key={stock.symbol} className="flex flex-col justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                            <div>
                                <div className="text-xs text-muted-foreground truncate" title={stock.shortName}>{stock.symbol}</div>
                                <div className="text-lg font-mono font-medium mt-1">₹{stock.regularMarketPrice?.toFixed(1)}</div>
                            </div>
                            <div className="text-xs flex items-center gap-1 text-accent-growth">
                                <TrendUp01 className="w-3 h-3" />
                                +{stock.regularMarketChangePercent?.toFixed(2)}%
                            </div>
                            <div className="h-8 mt-2 flex items-end gap-0.5 opacity-50">
                                {[...Array(20)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="w-full rounded-sm bg-accent-growth"
                                        style={{ height: `${Math.random() * 60 + 20}%` }}
                                        suppressHydrationWarning
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </BentoCard>

            <BentoCard title="Most Active" icon={BarChartSquare02} className="md:row-span-2">
                <div className="space-y-3">
                    {mostActive.length > 0 ? mostActive.map((item) => (
                        <div key={item.symbol} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors">
                            <span className="font-mono text-muted-foreground group-hover:text-foreground">{item.symbol.replace(".NS", "")}</span>
                            <div className="text-right">
                                <div className="text-xs font-mono text-foreground">{(item.regularMarketVolume / 1000000).toFixed(1)}M</div>
                                <div className={cn("text-[10px]", item.regularMarketChangePercent >= 0 ? "text-accent-growth" : "text-accent-decay")}>
                                    {item.regularMarketChangePercent > 0 ? "+" : ""}{item.regularMarketChangePercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-muted-foreground text-xs text-center py-10">Data Unavailable</div>
                    )}
                </div>
            </BentoCard>

            <BentoCard title="Top Losers" icon={ZapIcon} className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topLosers.slice(0, 2).map((item) => (
                        <div key={item.symbol} className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm tracking-tight">{item.symbol.replace(".NS", "")}</span>
                                    <span className="px-1.5 py-0.5 text-[10px] bg-accent-decay/10 text-accent-decay border border-accent-decay/20 rounded">
                                        BEARISH
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 max-w-[150px] leading-tight truncate">
                                    {item.shortName}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-mono text-foreground">{item.regularMarketChangePercent?.toFixed(2)}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Change</span>
                            </div>
                        </div>
                    ))}
                </div>
            </BentoCard>
        </div>
    )
}
