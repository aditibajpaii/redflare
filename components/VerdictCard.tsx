"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { AlertCircle, TrendUp01, TrendDown01, ShieldTick, Activity, Share07, Stars01 } from "@untitledui/icons"
import { cn } from "@/lib/utils"


type VerdictCardProps = {
    stockSymbol: string
    stockName: string
    riskScore: number
    verdict: string
    divergences: string[]
    priceChange?: number
    pe?: number | null
    debtEquity?: number | null
    marketCap?: number
    isStreaming?: boolean
    onShareClick?: () => void
}

export function VerdictCard({
    stockSymbol,
    stockName,
    riskScore,
    verdict,
    divergences,
    priceChange = 0,
    pe,
    debtEquity,
    marketCap,
    isStreaming = false,
    onShareClick,
}: VerdictCardProps) {
    const isCritical = riskScore >= 8
    const isWarning = riskScore >= 5 && riskScore < 8

    const getStatusConfig = () => {
        if (isCritical) return {
            label: "CRITICAL RISK",
            icon: AlertCircle,
            color: "text-accent-decay",
            border: "border-accent-decay/30",
            bg: "bg-accent-decay/5"
        }
        if (isWarning) return {
            label: "ELEVATED RISK",
            icon: Activity,
            color: "text-accent-warning",
            border: "border-accent-warning/30",
            bg: "bg-accent-warning/5"
        }
        return {
            label: "LOW RISK",
            icon: ShieldTick,
            color: "text-accent-growth",
            border: "border-accent-growth/30",
            bg: "bg-accent-growth/5"
        }
    }

    const status = getStatusConfig()
    const StatusIcon = status.icon

    return (
        <div className={cn(
            "w-full max-w-4xl mx-auto rounded-xl border bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500",
            status.border
        )}>
            <div className="p-4 sm:p-6 border-b border-border/50">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-all">
                                {stockSymbol}
                            </span>
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium",
                                priceChange >= 0 ? "bg-accent-growth/10 text-accent-growth" : "bg-accent-decay/10 text-accent-decay"
                            )}>
                                {priceChange >= 0 ? <TrendUp01 className="w-3 h-3" /> : <TrendDown01 className="w-3 h-3" />}
                                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                            </div>
                        </div>
                        <h3 className="text-sm text-muted-foreground font-medium">{stockName}</h3>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">P/E Ratio</span>
                                <span className="font-mono text-sm text-foreground">{pe ? pe.toFixed(1) : "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Debt/Eq</span>
                                <span className="font-mono text-sm text-foreground">{debtEquity ? debtEquity.toFixed(2) : "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Mkt Cap</span>
                                <span className="font-mono text-sm text-foreground">
                                    {marketCap ? `₹${(marketCap / 10000000).toFixed(0)}Cr` : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6">
                        <div className="text-left sm:text-right">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                                Risk Score
                            </div>
                            <div className={cn(
                                "text-3xl sm:text-4xl font-mono font-bold tracking-tighter",
                                isCritical ? "text-accent-decay" : isWarning ? "text-accent-warning" : "text-accent-growth"
                            )}>
                                {riskScore.toFixed(1)}<span className="text-lg text-muted-foreground/50">/10</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                            status.bg,
                            status.border,
                            status.color
                        )}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold tracking-wide">
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {divergences.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {divergences.map((d, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5",
                                    isCritical
                                        ? "bg-accent-decay/5 border-accent-decay/20 text-accent-decay"
                                        : isWarning
                                            ? "bg-accent-warning/5 border-accent-warning/20 text-accent-warning"
                                            : "bg-secondary text-muted-foreground border-border"
                                )}
                            >
                                <AlertCircle className="w-3 h-3" />
                                {d}
                            </motion.span>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Stars01 className="w-3 h-3" />
                        AI Analysis
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-growth animate-pulse ml-1" />
                        )}
                    </h4>

                    <div className="text-foreground leading-relaxed font-sans text-sm max-w-none prose prose-invert prose-p:my-1 prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-li:my-0.5">
                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-brand-algolia uppercase tracking-wide border-b border-border/40 pb-1 mt-4 mb-2" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="text-muted-foreground pl-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />
                            }}
                        >
                            {verdict}
                        </ReactMarkdown>
                        {isStreaming && (
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="ml-1 inline-block w-2 h-4 bg-accent-growth align-middle"
                            />
                        )}
                    </div>
                </div>

                <div className="mt-5 rounded-lg border border-border/70 bg-background/40 p-3">
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Educational analysis only. Not financial advice. Verify from official sources and consult a
                        SEBI-registered adviser before making investment decisions.
                    </p>
                    <div className="mt-2 text-[11px] sm:text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground/80">Data Sources</p>
                        <p>• Market/fundamental data: Yahoo Finance (may be delayed)</p>
                        <p>• Search context: Algolia indices and configured rules/synonyms</p>
                        <p>• Sentiment: Public news headline aggregation</p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex gap-4">
                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                            Copy Analysis
                        </button>
                    </div>

                    {onShareClick && (
                        <button
                            onClick={onShareClick}
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Share07 className="w-3.5 h-3.5" />
                            Share
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
