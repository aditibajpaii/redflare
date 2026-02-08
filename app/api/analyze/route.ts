import { NextRequest } from "next/server"
import { searchClient, INDICES, isAlgoliaConfigured } from "@/lib/algolia-client"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/redis-cache"
import patterns from "@/data/patterns.json"
import scandals from "@/data/sebi_scandals.json"

export const dynamic = "force-dynamic"
export const maxDuration = 30

type StockData = {
    symbol: string
    name: string
    sector: string
    price: number
    priceChange: number
    priceChangePercent: number
    pe: number | null
    debtEquity: number | null
    marketCap: number
    riskFactors?: string[]
    sectorBenchmark?: {
        avgPE: number
        avgDebtEquity: number
        avgPb?: number
        avgRoe?: number
    } | null
    bookValue?: number
    roe?: number
}

type NewsData = {
    news: { title: string; sentiment: number }[]
    avgSentiment: number
}

function isQuotaOrRateError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error)
    const lower = message.toLowerCase()
    return lower.includes("quota") ||
        lower.includes("resource_exhausted") ||
        lower.includes("status: 429") ||
        lower.includes("code: 429")
}

function buildDeterministicFallback(
    stockData: StockData,
    newsData: NewsData | undefined,
    riskScore: number,
    divergences: string[],
    matchedPatterns: { name: string; description: string }[],
    matchedScandals: { name: string; year: number; description: string }[],
): string {
    const priceChange = stockData.priceChangePercent ?? 0
    const sentiment = newsData?.avgSentiment ?? 0
    const valuationGap = stockData.pe && stockData.sectorBenchmark?.avgPE
        ? ((stockData.pe / stockData.sectorBenchmark.avgPE - 1) * 100).toFixed(0)
        : null

    const lines = [
        "## Quick Risk Summary",
        `- **Risk Score:** ${riskScore.toFixed(1)}/10`,
        `- **Price Move:** ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`,
        `- **News Sentiment:** ${sentiment.toFixed(2)}`,
        `- **P/E:** ${stockData.pe?.toFixed(1) || "N/A"}${valuationGap ? ` (${valuationGap}% vs sector)` : ""}`,
        `- **Debt/Equity:** ${stockData.debtEquity?.toFixed(2) || "N/A"}`,
    ]

    if (divergences.length > 0) {
        lines.push("", "## Key Divergences")
        for (const d of divergences.slice(0, 5)) lines.push(`- ${d}`)
    }

    if (stockData.riskFactors && stockData.riskFactors.length > 0) {
        lines.push("", "## Flagged Risk Factors")
        for (const rf of stockData.riskFactors.slice(0, 5)) lines.push(`- ${rf}`)
    }

    if (matchedPatterns.length > 0) {
        lines.push("", "## Similar Historical Patterns")
        for (const p of matchedPatterns.slice(0, 3)) lines.push(`- **${p.name}**: ${p.description}`)
    }

    if (matchedScandals.length > 0) {
        lines.push("", "## Relevant Case Studies")
        for (const s of matchedScandals.slice(0, 2)) lines.push(`- **${s.name} (${s.year})**: ${s.description}`)
    }

    lines.push(
        "",
        "## Operational Note",
        "- Live AI provider was unavailable, so this is a deterministic fallback generated from current market, sentiment, and risk signals."
    )

    return lines.join("\n")
}

function detectDivergences(stock: StockData, news: NewsData): string[] {
    const divergences: string[] = []

    const priceChange = stock.priceChangePercent ?? 0
    const priceUp = priceChange > 1
    const priceDown = priceChange < -1
    const sentimentNegative = news.avgSentiment < -0.2
    const sentimentPositive = news.avgSentiment > 0.2

    if (priceUp && sentimentNegative) {
        divergences.push("Price rising despite negative news sentiment")
    }
    if (priceDown && sentimentPositive) {
        divergences.push("Price falling despite positive news coverage")
    }

    if (stock.pe && stock.sectorBenchmark?.avgPE) {
        const peRatio = stock.pe / stock.sectorBenchmark.avgPE
        if (peRatio > 1.5) {
            divergences.push(`P/E ${stock.pe.toFixed(1)} is ${((peRatio - 1) * 100).toFixed(0)}% above sector average`)
        }
        if (peRatio < 0.5) {
            divergences.push(`P/E significantly below sector average - potential value trap`)
        }
    }

    if (stock.debtEquity && stock.sectorBenchmark?.avgDebtEquity) {
        const debtRatio = stock.debtEquity / stock.sectorBenchmark.avgDebtEquity
        if (debtRatio > 2) {
            divergences.push(`Debt/Equity ${stock.debtEquity.toFixed(2)} is ${((debtRatio - 1) * 100).toFixed(0)}% above sector norm`)
        }
    }

    if (stock.riskFactors?.includes("High Debt") && priceUp) {
        divergences.push("Price rising despite high debt warning")
    }
    if (stock.riskFactors?.includes("Promoter Pledge")) {
        divergences.push("Promoter shares are pledged - governance risk")
    }

    return divergences
}

function calculateRiskScore(stock: StockData, news: NewsData, divergences: string[]): number {
    let score = 3

    score += divergences.length * 1.2

    if (news.avgSentiment < -0.3) score += 1.5
    if (news.avgSentiment < -0.5) score += 1

    if (stock.pe && stock.pe > 50) score += 1
    if (stock.pe && stock.pe > 80) score += 1.5

    if (stock.debtEquity && stock.debtEquity > 2) score += 1.5
    if (stock.debtEquity && stock.debtEquity > 3) score += 1

    if (stock.riskFactors?.includes("High Debt")) score += 1
    if (stock.riskFactors?.includes("Promoter Pledge")) score += 1.5
    if (stock.riskFactors?.includes("Governance")) score += 1

    return Math.max(1, Math.min(10, score))
}

export async function POST(request: NextRequest) {
    const { stockData, newsData } = await request.json() as {
        stockData: StockData
        newsData: NewsData
    }

    if (!stockData) {
        return new Response(JSON.stringify({ error: "Missing stock data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    const divergences = detectDivergences(stockData, newsData || { news: [], avgSentiment: 0 })
    const riskScore = calculateRiskScore(stockData, newsData || { news: [], avgSentiment: 0 }, divergences)

    let matchedPatterns: { name: string; description: string }[] = []
    if (isAlgoliaConfigured && searchClient) {
        try {
            const { results } = await searchClient.search({
                requests: [{
                    indexName: INDICES.PATTERNS,
                    query: divergences.join(" "),
                    hitsPerPage: 3,
                }],
            })
            const searchResult = results[0]
            if ("hits" in searchResult) {
                matchedPatterns = searchResult.hits as unknown as typeof matchedPatterns
            }
        } catch {
        }
    }

    if (matchedPatterns.length === 0) {
        const divergenceText = divergences.join(" ").toLowerCase()
        matchedPatterns = (patterns as { name: string; description: string; indicators: string[] }[])
            .filter(p => p.indicators.some(ind => divergenceText.includes(ind.toLowerCase())))
            .slice(0, 3)
    }

    let matchedScandals: { name: string; year: number; description: string }[] = []
    if (isAlgoliaConfigured && searchClient) {
        try {
            const { results } = await searchClient.search({
                requests: [{
                    indexName: INDICES.SCANDALS,
                    query: stockData.sector + " " + divergences.slice(0, 2).join(" "),
                    hitsPerPage: 2,
                }],
            })
            const searchResult = results[0]
            if ("hits" in searchResult) {
                matchedScandals = searchResult.hits as unknown as typeof matchedScandals
            }
        } catch {
        }
    }

    if (matchedScandals.length === 0) {
        const sectorLower = stockData.sector.toLowerCase()
        matchedScandals = (scandals as unknown as typeof matchedScandals)
            .filter(s => s.description.toLowerCase().includes(sectorLower) ||
                divergences.some(d => s.description.toLowerCase().includes(d.toLowerCase().split(" ")[0])))
            .slice(0, 2)
    }

    const context = `
STOCK: ${stockData.name} (${stockData.symbol})
SECTOR: ${stockData.sector}
PRICE: ₹${stockData.price.toLocaleString("en-IN")} (${stockData.priceChangePercent >= 0 ? "+" : ""}${stockData.priceChangePercent.toFixed(2)}%)
P/E RATIO: ${stockData.pe?.toFixed(1) || "N/A"} (Sector Avg: ${stockData.sectorBenchmark?.avgPE.toFixed(1) || "N/A"})
DEBT/EQUITY: ${stockData.debtEquity?.toFixed(2) || "N/A"} (Sector Avg: ${stockData.sectorBenchmark?.avgDebtEquity.toFixed(2) || "N/A"})
NEWS SENTIMENT: ${newsData?.avgSentiment.toFixed(2) || "Neutral"}
RISK FACTORS: ${stockData.riskFactors?.join(", ") || "None identified"}

DETECTED DIVERGENCES:
${divergences.length > 0 ? divergences.map((d, i) => `${i + 1}. ${d}`).join("\n") : "No significant divergences detected"}

${matchedPatterns.length > 0 ? `\nMATCHING PATTERNS:\n${matchedPatterns.map(p => `- ${p.name}: ${p.description}`).join("\n")}` : ""}

RISK SCORE: ${riskScore.toFixed(1)}/10
`

    const agentUrl = process.env.ALGOLIA_AGENT_URL
    const appId = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    const apiKey = process.env.ALGOLIA_AGENT_API_KEY || process.env.ALGOLIA_ADMIN_KEY

    if (!agentUrl) {
        return new Response(JSON.stringify({ error: "Agent Studio not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }

    if (!appId || !apiKey) {
        return new Response(JSON.stringify({ error: "Private Algolia Agent credentials are not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }

    const symbol = stockData.symbol
    const cached = await getCachedAnalysis(symbol)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(encoder.encode(
                JSON.stringify({
                    type: "metadata",
                    riskScore,
                    divergences,
                    patterns: matchedPatterns.map(p => p.name),
                    cached: Boolean(cached),
                }) + "\n"
            ))

            if (cached) {
                controller.enqueue(encoder.encode(
                    JSON.stringify({ type: "text", content: cached.aiAnalysis }) + "\n"
                ))
                controller.enqueue(encoder.encode(
                    JSON.stringify({ type: "done" }) + "\n"
                ))
                controller.close()
                return
            }

            let aiAnalysisText = ""

            try {
                const MAX_RETRIES = 1
                let agentResponse: Response | null = null
                let lastError: Error | null = null

                for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                    try {
                        const controller = new AbortController()
                        const timeoutId = setTimeout(() => controller.abort(), 10000)

                        agentResponse = await fetch(agentUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-algolia-application-id": appId,
                                "x-algolia-api-key": apiKey,
                            },
                            body: JSON.stringify({
                                messages: [
                                    {
                                        role: "user",
                                        parts: [{ type: "text", text: `Analyze this stock:\n${context}` }]
                                    }
                                ],
                                stream: true,
                            }),
                            signal: controller.signal,
                        })

                        clearTimeout(timeoutId)

                        if (agentResponse.ok) break
                        throw new Error(`Agent API error: ${agentResponse.status}`)
                    } catch (err: any) {
                        lastError = err
                        if (attempt < MAX_RETRIES - 1) {
                            console.log(`Agent Studio retry ${attempt + 1}/${MAX_RETRIES}...`)
                            await new Promise(r => setTimeout(r, 1000))
                        }
                    }
                }

                if (!agentResponse || !agentResponse.ok) {
                    throw lastError || new Error("Agent Studio unavailable")
                }

                const reader = agentResponse.body?.getReader()
                if (!reader) throw new Error("No response body")

                const decoder = new TextDecoder()
                let buffer = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n")
                    buffer = lines.pop() || ""

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6)
                            if (data === "[DONE]") continue

                            try {
                                const parsed = JSON.parse(data)
                                if (parsed.type === "text-delta" && parsed.delta) {
                                    aiAnalysisText += parsed.delta
                                    controller.enqueue(encoder.encode(
                                        JSON.stringify({ type: "text", content: parsed.delta }) + "\n"
                                    ))
                                }
                            } catch {
                            }
                        }
                    }
                }
            } catch (agentError) {
                console.error("Agent Studio Error:", agentError)
                const canUseGemini = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY) && !isQuotaOrRateError(agentError)

                if (canUseGemini) {
                    console.log("Falling back to Gemini API...")
                    try {
                        const { createGoogleGenerativeAI } = await import("@ai-sdk/google")
                        const { streamText } = await import("ai")

                        const google = createGoogleGenerativeAI({
                            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
                        })

                        const geminiAbort = new AbortController()
                        const geminiTimeout = setTimeout(() => geminiAbort.abort(), 8000)
                        const systemPrompt = `You are a stock analyst AI. Analyze stocks for divergence patterns and risks.
                        Be concise but thorough. Focus on:
                        1. Valuation vs sector benchmarks
                        2. Debt levels and financial health
                        3. Risk factors and warning signs
                        4. Historical scandal patterns
                        Format: Use markdown with bullet points.`

                        const result = streamText({
                            model: google("gemini-2.0-flash"),
                            system: systemPrompt,
                            prompt: `Analyze this stock:\n${context}`,
                            maxRetries: 0,
                            abortSignal: geminiAbort.signal,
                        })

                        for await (const chunk of (await result).textStream) {
                            aiAnalysisText += chunk
                            controller.enqueue(encoder.encode(
                                JSON.stringify({ type: "text", content: chunk }) + "\n"
                            ))
                        }

                        clearTimeout(geminiTimeout)
                    } catch (geminiError) {
                        console.error("Gemini fallback also failed:", geminiError)
                    }
                }

                if (!aiAnalysisText) {
                    aiAnalysisText = buildDeterministicFallback(
                        stockData,
                        newsData,
                        riskScore,
                        divergences,
                        matchedPatterns,
                        matchedScandals,
                    )
                    controller.enqueue(encoder.encode(
                        JSON.stringify({ type: "text", content: aiAnalysisText }) + "\n"
                    ))
                }
            }

            if (aiAnalysisText && aiAnalysisText.length > 50) {
                await setCachedAnalysis(symbol, {
                    riskScore,
                    divergences,
                    patterns: matchedPatterns.map(p => p.name),
                    aiAnalysis: aiAnalysisText,
                    cachedAt: Date.now(),
                })
            }

            controller.enqueue(encoder.encode(
                JSON.stringify({ type: "done" }) + "\n"
            ))

            controller.close()
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
        },
    })
}
