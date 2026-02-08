"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"

import { StockOmnibar } from "@/components/StockOmnibar"
import { VerdictCard } from "@/components/VerdictCard"
import { DivergenceIndicator } from "@/components/DivergenceIndicator"
import { LiveChart } from "@/components/LiveChart"
import { MatrixLoader } from "@/components/MatrixLoader"
import { ShareModal } from "@/components/ShareModal"
import { Header } from "@/components/Header"

type StockData = {
    symbol: string
    name: string
    sector: string
    price: number
    priceChange?: number
    priceChangePercent?: number
    pe: number | null
    debtEquity: number | null
    marketCap: number
    riskFactors?: string[]
    sectorBenchmark?: { avgPE: number; avgDebtEquity: number } | null
    history?: { date: string; price: number; volume: number }[]
}

type AnalysisResult = {
    verdict: string
    riskScore: number
    divergences: string[]
    patterns?: string[]
}

export default function StockPage() {
    const params = useParams()
    const router = useRouter()
    const symbol = params.symbol as string

    const [isAnalyzing, setIsAnalyzing] = useState(true)
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [streamingText, setStreamingText] = useState("")
    const [loadingPhase, setLoadingPhase] = useState("INITIALIZING")
    const [isShareOpen, setShareOpen] = useState(false)

    useEffect(() => {
        if (symbol) {
            analyzeStock(symbol)
        }
    }, [symbol])

    const analyzeStock = async (sym: string) => {
        setIsAnalyzing(true)
        setAnalysis(null)
        setStreamingText("")
        setStockData(null)
        setLoadingPhase("FETCHING STOCK DATA")

        try {
            const stockRes = await fetch(`/api/stock?symbol=${sym}&history=true`)
            const stockJson = await stockRes.json()

            if (stockJson.error) {
                throw new Error(stockJson.error)
            }

            setStockData({
                ...stockJson,
            })
            setLoadingPhase("FETCHING NEWS")

            const newsRes = await fetch(`/api/news?symbol=${sym}&name=${encodeURIComponent(stockJson.name)}`)
            const newsJson = await newsRes.json()
            setLoadingPhase("ANALYZING DIVERGENCES")

            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stockData: stockJson, newsData: newsJson }),
            })

            if (!analyzeRes.ok) {
                throw new Error("Analysis failed")
            }

            const reader = analyzeRes.body?.getReader()
            const decoder = new TextDecoder()
            let fullText = ""
            let pending = ""
            let finalRiskScore = 5
            let finalDivergences: string[] = []
            let patterns: string[] = []

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    pending += decoder.decode(value, { stream: true })
                    const lines = pending.split("\n")
                    pending = lines.pop() || ""

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line)

                            if (data.type === "metadata") {
                                finalRiskScore = data.riskScore
                                finalDivergences = data.divergences || []
                                patterns = data.patterns || []
                                setAnalysis({
                                    verdict: "",
                                    riskScore: finalRiskScore,
                                    divergences: finalDivergences,
                                    patterns,
                                })
                            } else if (data.type === "text") {
                                fullText += data.content
                                setStreamingText(fullText)
                            }
                        } catch {
                        }
                    }
                }

                const tail = pending.trim()
                if (tail) {
                    try {
                        const data = JSON.parse(tail)
                        if (data.type === "metadata") {
                            finalRiskScore = data.riskScore
                            finalDivergences = data.divergences || []
                            patterns = data.patterns || []
                        } else if (data.type === "text") {
                            fullText += data.content
                            setStreamingText(fullText)
                        }
                    } catch {
                    }
                }
            }

            setAnalysis({
                verdict: fullText,
                riskScore: finalRiskScore,
                divergences: finalDivergences,
                patterns,
            })
        } catch (error) {
            console.error("Analysis failed:", error)
            setStreamingText("Analysis failed. Please check the symbol or try again.")
        } finally {
            setIsAnalyzing(false)
            setLoadingPhase("")
        }
    }

    const handleSelectStock = (newSymbol: string) => {
        router.push(`/stock/${newSymbol}`)
    }

    const getIndicators = () => {
        if (!stockData) return []
        const priceChange = stockData.priceChangePercent ?? stockData.priceChange ?? 0

        return [
            {
                type: "price" as const,
                label: "Price",
                value: `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`,
                status: priceChange > 0 ? "bullish" as const : priceChange < 0 ? "bearish" as const : "neutral" as const,
                divergent: analysis?.divergences.some((d) => d.toLowerCase().includes("price")) || false,
            },
            {
                type: "pe" as const,
                label: "P/E",
                value: stockData.pe?.toFixed(1) || "N/A",
                status: stockData.pe && stockData.sectorBenchmark && stockData.pe > stockData.sectorBenchmark.avgPE * 1.3
                    ? "warning" as const
                    : "neutral" as const,
                divergent: analysis?.divergences.some((d) => d.toLowerCase().includes("pe") || d.toLowerCase().includes("p/e")) || false,
            },
            {
                type: "debt" as const,
                label: "D/E",
                value: stockData.debtEquity?.toFixed(2) || "N/A",
                status: stockData.debtEquity && stockData.debtEquity > 1.5 ? "warning" as const : "neutral" as const,
                divergent: analysis?.divergences.some((d) => d.toLowerCase().includes("debt")) || false,
            },
            {
                type: "sentiment" as const,
                label: "Risk",
                value: analysis?.riskScore.toFixed(1) || "–",
                status: analysis ? (
                    analysis.riskScore >= 8 ? "bearish" as const :
                        analysis.riskScore >= 5 ? "warning" as const :
                            "bullish" as const
                ) : "neutral" as const,
            },
        ]
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent-growth selection:text-white overflow-x-hidden">
            <Header />

            <main className="pt-20 sm:pt-24 pb-14 sm:pb-16 px-3 sm:px-6 relative min-h-screen">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] z-0" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-8">
                        <StockOmnibar onSelectStock={handleSelectStock} isAnalyzing={isAnalyzing} />
                    </div>

                    <AnimatePresence mode="wait">
                        {isAnalyzing && !stockData && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <MatrixLoader text={loadingPhase || "ANALYZING"} isLoading />
                            </motion.div>
                        )}

                        {stockData && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <LiveChart
                                    data={stockData.history}
                                    priceChange={stockData.priceChangePercent ?? stockData.priceChange ?? 0}
                                    symbol={stockData.symbol}
                                />

                                {analysis && <DivergenceIndicator indicators={getIndicators()} />}

                                <VerdictCard
                                    stockSymbol={stockData.symbol}
                                    stockName={stockData.name}
                                    riskScore={analysis?.riskScore || 5}
                                    verdict={streamingText || "Analyzing..."}
                                    divergences={analysis?.divergences || []}
                                    priceChange={stockData.priceChangePercent ?? stockData.priceChange ?? 0}
                                    pe={stockData.pe}
                                    debtEquity={stockData.debtEquity}
                                    marketCap={stockData.marketCap}
                                    isStreaming={isAnalyzing}
                                    onShareClick={() => setShareOpen(true)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {stockData && analysis && (
                        <ShareModal
                            isOpen={isShareOpen}
                            onClose={() => setShareOpen(false)}
                            data={{
                                symbol: stockData.symbol,
                                name: stockData.name,
                                price: stockData.price,
                                priceChange: stockData.priceChangePercent ?? stockData.priceChange ?? 0,
                                score: analysis.riskScore,
                                verdict: analysis.verdict,
                                divergences: analysis.divergences,
                            }}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}
