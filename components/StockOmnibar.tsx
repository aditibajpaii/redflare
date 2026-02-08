"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchSm, ArrowRight, TrendUp01, Building07, AlertTriangle, Stars01 } from "@untitledui/icons"
import { searchStocks, parseNLPQuery, type Stock } from "@/lib/algolia-client"
import { cn } from "@/lib/utils"


type StockOmnibarProps = {
    onSelectStock: (symbol: string, name: string) => void
    isAnalyzing?: boolean
}

const sampleQueries = [
    { label: "high debt banks", icon: AlertTriangle },
    { label: "RELIANCE", icon: Building07 },
    { label: "tech with low PE", icon: TrendUp01 },
    { label: "ADANI", icon: Stars01 },
    { label: "banking sector", icon: Building07 },
    { label: "insider selling", icon: AlertTriangle },
]



export function StockOmnibar({ onSelectStock, isAnalyzing = false }: StockOmnibarProps) {
    const [query, setQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [results, setResults] = useState<Stock[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isSearching, setIsSearching] = useState(false)
    const [useAlgolia, setUseAlgolia] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                if (useAlgolia) {
                    const algoliaResults = await searchStocks(query)
                    setResults(algoliaResults)
                }
            } catch {
                setResults([])
            }
            setIsSearching(false)
        }, 150)

        return () => clearTimeout(timer)
    }, [query, useAlgolia])

    const handleSelect = useCallback((symbol: string, name: string) => {
        setQuery("")
        setIsOpen(false)
        setResults([])
        onSelectStock(symbol, name)
    }, [onSelectStock])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault()
            handleSelect(results[selectedIndex].symbol, results[selectedIndex].name)
        } else if (e.key === "Escape") {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener("keydown", handleGlobalKeyDown)
        return () => document.removeEventListener("keydown", handleGlobalKeyDown)
    }, [])

    const { filters } = query ? parseNLPQuery(query) : { filters: "" }

    return (
        <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
            <div className="relative group">
                <div className="relative flex items-center">
                    <SearchSm className="absolute left-5 w-5 h-5 text-muted-foreground z-10" />

                    <input
                        ref={inputRef}
                        type="text"
                        aria-label="Search for stocks"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setSelectedIndex(0)
                        }}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        onKeyDown={handleKeyDown}
                        disabled={isAnalyzing}
                        placeholder="Search NIFTY 50... Try 'high debt banks' or 'RELIANCE'"
                        className={cn(
                            "w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-16 sm:pr-20 rounded-xl",
                            "bg-card/40 backdrop-blur-xl",
                            "border-b border-border/50",
                            "shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]",
                            "text-foreground text-base sm:text-lg placeholder:text-muted-foreground/50",
                            "focus:outline-none focus:bg-card/60 transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        style={{
                            boxShadow: isOpen ? "0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px -10px rgba(255,255,255,0.05)" : undefined
                        }}
                    />

                    {query && !isAnalyzing && (
                        <button
                            onClick={() => {
                                const match = results[0]
                                if (match) handleSelect(match.symbol, match.name)
                            }}
                            className="absolute right-4 p-2 rounded-lg bg-accent-growth/10 hover:bg-accent-growth/20 text-accent-growth transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {!query && (
                        <div className="absolute right-4 sm:right-5 flex items-center gap-2 pointer-events-none">
                            <span className="hidden sm:inline text-xs text-muted-foreground/50">Command Palette</span>
                            <kbd className="px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/20 rounded border border-border/30">
                                ⌘K
                            </kbd>
                        </div>
                    )}
                </div>
            </div>

            {filters && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 -bottom-7 flex items-center justify-center gap-2"
                >
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-growth/10 border border-accent-growth/20 text-xs text-accent-growth font-medium">
                        <Stars01 className="w-3 h-3" />
                        NLP Filter: {filters}
                    </span>
                </motion.div>
            )}

            <AnimatePresence>
                {isOpen && (results.length > 0 || query) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-background/90 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <div className="py-2 max-h-[60vh] sm:max-h-80 overflow-y-auto overscroll-contain">
                                {results.map((stock, i) => (
                                    <button
                                        key={stock.objectID || stock.symbol}
                                        onClick={() => handleSelect(stock.symbol, stock.name)}
                                        className={cn(
                                            "w-full px-4 py-3 flex items-center gap-4 text-left transition-colors",
                                            i === selectedIndex ? "bg-brand-algolia/10" : "hover:bg-secondary/50"
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                                            <span className="font-pixel text-sm text-brand-algolia">
                                                {stock.symbol.slice(0, 3)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground truncate">
                                                    {stock.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {stock.symbol}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {stock.sector}
                                                </span>
                                                {stock.marketCap && (
                                                    <span className="text-xs text-muted-foreground">
                                                        • ₹{(stock.marketCap / 10000000).toFixed(0)} Cr
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {stock.riskFactors?.length > 0 && (
                                            <div className="flex gap-1">
                                                {stock.riskFactors.slice(0, 2).map((rf) => (
                                                    <span
                                                        key={rf}
                                                        className="px-2 py-0.5 text-xs rounded-full bg-accent-warning/10 text-accent-warning"
                                                    >
                                                        {rf}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : query && !isSearching ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No stocks found for "{query}"
                            </div>
                        ) : isSearching ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    Searching...
                                </motion.span>
                            </div>
                        ) : null}

                        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Powered by Algolia InstantSearch
                            </span>
                            <span className="text-xs text-brand-algolia font-pixel">
                                {results.length} results
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!query && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-2 mt-4"
                >
                    {sampleQueries.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => setQuery(label)}
                            disabled={isAnalyzing}
                            className={cn(
                                "px-3 py-1.5 rounded-md border border-border/40 bg-secondary/30",
                                "text-xs text-muted-foreground font-medium",
                                "hover:bg-secondary/60 hover:text-foreground",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-all duration-200 flex items-center gap-1.5"
                            )}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
